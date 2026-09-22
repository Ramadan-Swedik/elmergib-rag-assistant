"""
Data Ingestion and Indexing Module.
Owner: Mohammed
Domain: data/ + src/database/
Goal: Deliver a clean, queryable dual index (Dense + BM25) from all official documents.
"""
from FlagEmbedding import FlagModel
import chromadb
# from rank_bm25 import BM25Okapi

def extract_and_chunk_pdfs(pdf_dir: str):
    """
    Extract text from PDFs, normalize Arabic characters, and chunk respecting sentence boundaries.
    """
    # TODO: Implement pypdf text extraction
    # TODO: Implement sentence/clause boundary chunking
    pass

def build_dense_index(chunks):
    """
    Generate Dense embeddings using BAAI/bge-m3 and store in ChromaDB.
    """
    # TODO: Initialize FlagModel('BAAI/bge-m3')
    # TODO: Initialize ChromaDB client and store embeddings
    pass

def build_sparse_index(chunks):
    """
    Generate Sparse (BM25) index with punctuation-aware tokenization.
    """
    # TODO: Initialize BM25 and build index
    pass
