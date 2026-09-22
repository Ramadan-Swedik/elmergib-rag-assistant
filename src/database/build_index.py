import json
import pickle
import re
import sys
from pathlib import Path

# إضافة مجلد الجذر الرئيسي للمشروع لبيئة بايثون (3 مستويات للأعلى)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

import chromadb
from FlagEmbedding import BGEM3FlagModel
from rank_bm25 import BM25Okapi
from config import (
    CHUNKS_JSON_PATH,
    VECTORSTORE_DIR,
    MODEL_NAME,
    COLLECTION_NAME,
    BASE_DIR,
)

BM25_INDEX_PATH = BASE_DIR / "src" / "database" / "bm25_index.pkl"


def tokenize_arabic_text(text: str) -> list[str]:
    """تقسيم النص إلى كلمات للبحث اللفظي BM25"""
    return [word for word in re.split(r"\W+", text) if word]


def build_indexes():
    if not CHUNKS_JSON_PATH.exists():
        raise FileNotFoundError(f"ملف المقاطع غير موجود: {CHUNKS_JSON_PATH}")

    print("📂 تحميل المقاطع من chunks.json...")
    with open(CHUNKS_JSON_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"📦 إجمالي المقاطع المراد فهرستها: {len(chunks)}")

    # -------------------------------------------------------------
    # 1️⃣ الفهرس المتجهي Dense Index (BAAI/bge-m3 -> ChromaDB)
    # -------------------------------------------------------------
    print(f"\n🤖 [1/2] تحميل نموذج التضمين ({MODEL_NAME}) عبر FlagEmbedding...")
    model = BGEM3FlagModel(MODEL_NAME, use_fp16=True)

    print(f"💾 إعداد قاعدة البيانات المتجهية ChromaDB...")
    chroma_client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    print("⚡ توليد المتجهات الكثيفة وتخزينها بداخل ChromaDB...")
    batch_size = 32
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        texts = [item["text"] for item in batch]
        ids = [item["chunk_id"] for item in batch]
        metadatas = [
            {
                "doc_id": item["doc_id"],
                "file_name": item["file_name"],
                "title": item["title"],
                "category": item["category"],
                "source_url": item["source_url"],
                "page_number": item["page_number"],
                "char_count": item["char_count"]
            }
            for item in batch
        ]

        embeddings_result = model.encode(texts, batch_size=len(texts), max_length=8192)
        dense_embeddings = embeddings_result["dense_vecs"].tolist()

        collection.add(
            documents=texts,
            embeddings=dense_embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"  ✅ تم إضافة {min(i + batch_size, len(chunks))}/{len(chunks)} مقطع إلى ChromaDB.")

    # -------------------------------------------------------------
    # 2️⃣ الفهرس اللفظي Sparse Index (BM25)
    # -------------------------------------------------------------
    print("\n🔍 [2/2] بناء فهرس البحث اللفظي BM25...")
    tokenized_corpus = [tokenize_arabic_text(c["text"]) for c in chunks]
    bm25 = BM25Okapi(tokenized_corpus)

    bm25_payload = {
        "bm25_model": bm25,
        "chunks": chunks
    }

    with open(BM25_INDEX_PATH, "wb") as f:
        pickle.dump(bm25_payload, f)

    print(f"💾 تم حفظ فهرس BM25 بنجاح في: {BM25_INDEX_PATH}")
    print(f"\n🎉 اكتمل بناء الفهرس الهجين! العناصر المخزنة بـ ChromaDB: {collection.count()}")


if __name__ == "__main__":
    build_indexes()