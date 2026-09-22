import csv
import json
import pickle
import re
import sys
from pathlib import Path

# إضافة مجلد الجذر الرئيسي للمشروع لبيئة بايثون (3 مستويات للأعلى)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import chromadb
from FlagEmbedding import BGEM3FlagModel
from config import (
    VECTORSTORE_DIR,
    MODEL_NAME,
    COLLECTION_NAME,
    BASE_DIR,
    PROCESSED_DATA_DIR,
)

BM25_INDEX_PATH = BASE_DIR / "src" / "database" / "bm25_index.pkl"
RESULTS_CSV_PATH = PROCESSED_DATA_DIR / "retrieval_test_results.csv"


def tokenize_arabic_text(text: str) -> list[str]:
    """تقسيم النص إلى كلمات للبحث اللفظي BM25"""
    return [word for word in re.split(r"\W+", text) if word]


def reciprocal_rank_fusion(dense_results: list[dict], bm25_results: list[dict], k: int = 60) -> list[dict]:
    """دمج نتائج البحث الكثيف واللفظي باستخدام خوارزمية RRF"""
    scores = {}
    chunk_map = {}

    # معالجة نتائج Dense
    for rank, item in enumerate(dense_results):
        cid = item["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
        chunk_map[cid] = item

    # معالجة نتائج BM25
    for rank, item in enumerate(bm25_results):
        cid = item["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
        chunk_map[cid] = item

    # ترتيب النتائج المدمجة تنازلياً
    sorted_cids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    return [chunk_map[cid] for cid in sorted_cids]


def run_retrieval_test():
    print("📂 [1/3] تحميل الفهارس والنماذج...")
    
    # تحميل BM25
    if not BM25_INDEX_PATH.exists():
        raise FileNotFoundError(f"ملف BM25 غير موجود: {BM25_INDEX_PATH}")
    with open(BM25_INDEX_PATH, "rb") as f:
        bm25_data = pickle.load(f)
    bm25 = bm25_data["bm25_model"]
    all_chunks = bm25_data["chunks"]

    # تحميل ChromaDB
    chroma_client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))
    collection = chroma_client.get_collection(name=COLLECTION_NAME)

    # تحميل FlagEmbedding
    model = BGEM3FlagModel(MODEL_NAME, use_fp16=True)

    # أسئلة نموذجية للاختبار
    test_queries = [
        "ما هي المهارات والمفاهيم الأساسية في شبكات الحاسوب؟",
        "ما هي أهداف وخطوات هندسة البرمجيات؟",
        "ما هي متطلبات وأسس تفاعل الإنسان مع الحاسوب HCI؟",
        "كيف يتم تقييم ومراقبة أداء الشبكات؟",
        "ما هي مفاهيم تصميم واجهات المستخدم والبرمجيات؟"
    ]

    results_log = []

    print("\n🔍 [2/3] بدء تنفيذ تجارب الاسترجاع الهجين...\n")

    for idx, query in enumerate(test_queries, 1):
        print(f"❓ السؤال {idx}: {query}")

        # 1. البحث الكثيف (Dense Retrieval)
        query_emb = model.encode([query], batch_size=1, max_length=8192)['dense_vecs'].tolist()
        chroma_res = collection.query(query_embeddings=query_emb, n_results=5)
        
        dense_top = []
        if chroma_res["ids"] and chroma_res["ids"][0]:
            for i in range(len(chroma_res["ids"][0])):
                cid = chroma_res["ids"][0][i]
                meta = chroma_res["metadatas"][0][i]
                dense_top.append({
                    "chunk_id": cid,
                    "text": chroma_res["documents"][0][i],
                    "doc_id": meta["doc_id"],
                    "page_number": meta["page_number"],
                    "source_url": meta["source_url"]
                })

        # 2. البحث اللفظي (BM25 Retrieval)
        tokenized_query = tokenize_arabic_text(query)
        bm25_scores = bm25.get_scores(tokenized_query)
        top_bm25_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:5]
        
        bm25_top = []
        for i in top_bm25_indices:
            c = all_chunks[i]
            bm25_top.append({
                "chunk_id": c["chunk_id"],
                "text": c["text"],
                "doc_id": c["doc_id"],
                "page_number": c["page_number"],
                "source_url": c["source_url"]
            })

        # 3. الدمج الهجين (RRF Fusion)
        fused_top = reciprocal_rank_fusion(dense_top, bm25_top)
        best_match = fused_top[0] if fused_top else None

        if best_match:
            print(f"  ✅ أفضل مقطع مطابق: [{best_match['chunk_id']}] (صفحة {best_match['page_number']})")
            print(f"  📝 النص: {best_match['text'][:120]}...\n")

            results_log.append({
                "query_id": idx,
                "query": query,
                "best_chunk_id": best_match["chunk_id"],
                "doc_id": best_match["doc_id"],
                "page_number": best_match["page_number"],
                "snippet": best_match["text"][:150].replace("\n", " "),
                "source_url": best_match["source_url"]
            })

    # [3/3] حفظ النتائج في CSV
    print(f"💾 [3/3] حفظ نتائج الاختبار بداخل: {RESULTS_CSV_PATH}")
    with open(RESULTS_CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=["query_id", "query", "best_chunk_id", "doc_id", "page_number", "snippet", "source_url"])
        writer.writeheader()
        writer.writerows(results_log)

    print("\n🎉 اكتمل اختبار الاسترجاع الهجين بنجاح!")


if __name__ == "__main__":
    run_retrieval_test()