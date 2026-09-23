"""
Data Ingestion and Indexing Module.
Owner: Mohammed
Domain: data/ + src/database/
Goal: Deliver a clean, queryable dual index (Dense + BM25) from all official documents.
"""
import json
import pickle
import re
import sys
from pathlib import Path
import torch

# Add project root directory to sys.path (3 levels up)
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
    """Tokenize Arabic text into keywords accounting for punctuation marks."""
    return re.findall(r"\w+", text)


def build_dense_index(chunks: list[dict]) -> int:
    """Generate Dense embeddings using BAAI/bge-m3 and store in ChromaDB."""
    print(f"\n🤖 [2/3] Building ChromaDB vector index using ({MODEL_NAME})...")
    
    # Auto-detect GPU/CPU environment for fp16 precision
    use_fp16 = torch.cuda.is_available()
    model = BGEM3FlagModel(MODEL_NAME, use_fp16=use_fp16)

    chroma_client = chromadb.PersistentClient(path=str(VECTORSTORE_DIR))
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    batch_size = 32
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
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

        collection.upsert(
            documents=texts,
            embeddings=dense_embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"  ✅ Upserted {min(i + batch_size, len(chunks))}/{len(chunks)} chunks into ChromaDB.")

    return collection.count()


def build_sparse_index(chunks: list[dict]):
    """Generate Sparse (BM25) index with punctuation-aware tokenization."""
    print("\n🔍 [3/3] Building and updating BM25 sparse index...")
    tokenized_corpus = [tokenize_arabic_text(c["text"]) for c in chunks]
    bm25 = BM25Okapi(tokenized_corpus)

    bm25_payload = {
        "bm25_model": bm25,
        "chunks": chunks
    }

    BM25_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(BM25_INDEX_PATH, "wb") as f:
        pickle.dump(bm25_payload, f)

    print(f"💾 Saved BM25 index to: {BM25_INDEX_PATH}")


def run_full_ingestion():
    """Execute full dual indexing (Dense + BM25) on processed chunks."""
    print("==========================================")
    print("🚀 Starting full data ingestion and indexing pipeline...")
    print("==========================================")

    if not CHUNKS_JSON_PATH.exists():
        raise FileNotFoundError(f"❌ Chunks file not found: {CHUNKS_JSON_PATH}")

    print("\n📂 [1/3] Loading processed chunks from chunks.json...")
    with open(CHUNKS_JSON_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    if not chunks:
        raise ValueError("❌ Chunks file is empty. Aborting ingestion.")

    print(f"📦 Successfully loaded {len(chunks)} chunks.")

    # 1️⃣ Dense Indexing
    total_records = build_dense_index(chunks)

    # 2️⃣ Sparse Indexing
    build_sparse_index(chunks)

    print("\n==========================================")
    print("🎉 Ingestion pipeline completed successfully!")
    print(f"📊 Total active records in ChromaDB: {total_records}")
    print("==========================================")


if __name__ == "__main__":
    run_full_ingestion()