"""
Hybrid Retrieval Verification & CSV Logging Module - RAG Production Standard.
Owner: Mohammed
Domain: src/database/
Goal: Verify Hybrid Retrieval (Dense + BM25) using RRF, Arabic text normalization,
      and absolute metadata logging for source verification.
"""
import csv
import pickle
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
import torch

# Add project root directory to Python path (3 levels up)
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

# Cosine Distance Threshold for Dense Retrieval (0.0 = exact match, 1.0 = orthogonal)
MAX_DENSE_DISTANCE_THRESHOLD = 0.75

# Default benchmark queries matching active documents (Software Engineering & HCI)
DEFAULT_TEST_QUERIES = [
    "ما هي تصنيفات وأصناف برمجيات الحاسوب؟",
    "ما هي أهداف وخصائص هندسة البرمجيات؟",
    "ما هي محاور ومفهوم تفاعل الإنسان مع الحاسوب HCI؟",
    "كيف تتم عمليات التقييم والتحسين في تصميم واجهات المستخدم؟",
    "ما هي عناصر تصميم واجهة المستخدم UI وتجربة المستخدم UX؟",
]


def normalize_and_tokenize_arabic(text: str) -> List[str]:
    """
    Normalize Arabic letters (Alef, Yeh, Teh Marbuta) and tokenize text
    for high-recall BM25 sparse matching.
    """
    if not text:
        return []
    
    # Text normalization
    text = re.sub(r"[إأآا]", "ا", text)
    text = re.sub(r"ى", "ي", text)
    text = re.sub(r"ة", "ه", text)
    text = re.sub(r"[\u064B-\u0652]", "", text)  # Remove Harakat (Tashkeel)
    
    return re.findall(r"\w+", text.lower())


def reciprocal_rank_fusion(dense_results: List[Dict[str, Any]], 
                            bm25_results: List[Dict[str, Any]], 
                            k: int = 60) -> List[Dict[str, Any]]:
    """
    Merge Dense and BM25 ranked candidates using Reciprocal Rank Fusion formula:
    RRF_Score(d) = sum(1 / (k + r(d)))
    """
    scores: Dict[str, float] = {}
    chunk_map: Dict[str, Dict[str, Any]] = {}

    for rank, item in enumerate(dense_results):
        cid = item["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
        chunk_map[cid] = item

    for rank, item in enumerate(bm25_results):
        cid = item["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))
        chunk_map[cid] = item

    sorted_cids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    return [chunk_map[cid] for cid in sorted_cids]


def run_retrieval_test(queries: Optional[List[str]] = None):
    """Execute evaluation pipeline over benchmark queries and export CSV citations."""
    test_queries = queries or DEFAULT_TEST_QUERIES

    print("==========================================")
    print("🚀 Starting Hybrid Retrieval Verification...")
    print("==========================================")
    print("\n📂 [1/3] Loading vector databases, BM25 indices, and embedding models...")

    if not BM25_INDEX_PATH.exists():
        raise FileNotFoundError(f"❌ BM25 index file not found at: {BM25_INDEX_PATH}")
    
    with open(BM25_INDEX_PATH, "rb") as f:
        bm25_data = pickle.load(f)
    bm25 = bm25_data["bm25_model"]
    all_chunks = bm25_data["chunks"]

    chroma_client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))
    collection = chroma_client.get_collection(name=COLLECTION_NAME)

    use_fp16 = torch.cuda.is_available()
    model = BGEM3FlagModel(MODEL_NAME, use_fp16=use_fp16)

    results_log = []

    print("\n🔍 [2/3] Executing hybrid queries and applying RRF fusion...\n")

    for idx, query in enumerate(test_queries, 1):
        print(f"❓ Query {idx}: {query}")

        # A. Dense Retrieval with Cosine Distance Filtering
        query_emb = model.encode([query], batch_size=1, max_length=1024)["dense_vecs"].tolist()
        chroma_res = collection.query(
            query_embeddings=query_emb, 
            n_results=5,
            include=["documents", "metadatas", "distances"]
        )

        dense_top = []
        if chroma_res["ids"] and chroma_res["ids"][0]:
            for i in range(len(chroma_res["ids"][0])):
                dist = chroma_res["distances"][0][i] if chroma_res.get("distances") else 0.0
                
                if dist <= MAX_DENSE_DISTANCE_THRESHOLD:
                    cid = chroma_res["ids"][0][i]
                    meta = chroma_res["metadatas"][0][i]
                    dense_top.append({
                        "chunk_id": cid,
                        "text": chroma_res["documents"][0][i],
                        "doc_id": meta.get("doc_id", ""),
                        "doc_name": meta.get("doc_name", ""),
                        "page_number": meta.get("page_number", 1),
                        "source_url": meta.get("source_url", ""),
                        "retrieved_at": meta.get("retrieved_at", "")
                    })

        # B. Sparse Retrieval (BM25) with Token Normalization
        tokenized_query = normalize_and_tokenize_arabic(query)
        bm25_scores = bm25.get_scores(tokenized_query)
        
        scored_indices = [
            (i, score) for i, score in enumerate(bm25_scores) if score > 0
        ]
        top_bm25_indices = [
            item[0] for item in sorted(scored_indices, key=lambda x: x[1], reverse=True)[:5]
        ]

        bm25_top = []
        for i in top_bm25_indices:
            c = all_chunks[i]
            bm25_top.append({
                "chunk_id": c.get("chunk_id", ""),
                "text": c.get("text", ""),
                "doc_id": c.get("doc_id", ""),
                "doc_name": c.get("doc_name") or c.get("title", ""),
                "page_number": c.get("page_number", 1),
                "source_url": c.get("source_url", ""),
                "retrieved_at": c.get("retrieved_at", "")
            })

        # C. Fusion Layer
        fused_top = reciprocal_rank_fusion(dense_top, bm25_top)
        best_match = fused_top[0] if fused_top else None

        # D. Evaluation & Logging
        if best_match:
            print(f"  ✅ Match Found: [{best_match['chunk_id']}]")
            print(f"     📄 Document : {best_match['doc_name']} (ID: {best_match['doc_id']})")
            print(f"     📖 Page     : {best_match['page_number']}")
            print(f"     🔗 Source   : {best_match['source_url']}")
            print(f"     📅 Retrieved: {best_match['retrieved_at']}")
            print(f"  📝 Snippet  : {best_match['text'][:120]}...\n")

            results_log.append({
                "query_id": idx,
                "query": query,
                "best_chunk_id": best_match["chunk_id"],
                "doc_id": best_match["doc_id"],
                "doc_name": best_match["doc_name"],
                "page_number": best_match["page_number"],
                "source_url": best_match["source_url"],
                "retrieved_at": best_match["retrieved_at"],
                "snippet": best_match["text"][:150].replace("\n", " ")
            })
        else:
            print("  ⚠️ NOT_FOUND: Query context missing from knowledge base.\n")

            results_log.append({
                "query_id": idx,
                "query": query,
                "best_chunk_id": "NOT_FOUND",
                "doc_id": "N/A",
                "doc_name": "N/A",
                "page_number": 0,
                "source_url": "N/A",
                "retrieved_at": "N/A",
                "snippet": "NOT_FOUND: No relevant data available in database."
            })

    # Export Report
    RESULTS_CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    print(f"💾 [3/3] Exporting verification log to: {RESULTS_CSV_PATH}")
    
    fieldnames = [
        "query_id", 
        "query", 
        "best_chunk_id", 
        "doc_id", 
        "doc_name", 
        "page_number", 
        "source_url", 
        "retrieved_at", 
        "snippet"
    ]
    with open(RESULTS_CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results_log)

    print("\n==========================================")
    print("🎉 Hybrid retrieval test and CSV citation export complete!")
    print("==========================================")


if __name__ == "__main__":
    run_retrieval_test()