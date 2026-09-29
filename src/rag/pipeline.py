from __future__ import annotations

import ctypes
import gc
import time

from .abstention import check_abstention_gate, top_confidence
from .data_loader import load_regulation_chunks
from .generation import check_faithfulness, generate_answer
from .retrieval import BM25Index, DenseIndex
from .rrf import apply_reciprocal_rank_fusion

RERANK_ENABLED = True

CHUNKS_PATH = "data/processed/chunks.json"  

_chunks = load_regulation_chunks(CHUNKS_PATH)
_bm25_index = BM25Index(_chunks)
_dense_index = None  


def _get_dense_index() -> DenseIndex:
    global _dense_index
    if _dense_index is None:
        _dense_index = DenseIndex(_chunks, persist_directory="src/database/vectorstore")
    return _dense_index


def _free_memory() -> None:

    global _dense_index
    _dense_index = None
    from . import rerank as rerank_module

    rerank_module._reranker = None
    gc.collect()
    try:
        ctypes.CDLL("libc.so.6").malloc_trim(0)  # hand freed memory
    except OSError:
        pass


def answer_question(question: str) -> dict:
    
    start = time.perf_counter()

    # 1. Retrieve Dense & Sparse results
    sparse_results = _bm25_index.search(question, k=10)
    dense_results = _get_dense_index().search(question, k=10)

    # 2. Fuse via RRF
    fused = apply_reciprocal_rank_fusion(dense_results, sparse_results, top_n=10)

    # 3. Re-rank top results, keep top-3 
    if RERANK_ENABLED:
        from .rerank import rerank

        reranked = rerank(question, fused, top_n=3)
    else:
        reranked = fused[:3]
        for r in reranked:
            r["rerank_score"] = min(r["rrf_score"] * 20, 1.0)  # rough proxy

    # 4. Check Abstention Gate
    confidence = top_confidence(reranked)
    should_abstain = check_abstention_gate(confidence)

    if should_abstain:
        latency = time.perf_counter() - start
        return {
            "answer": (
                "I don't have enough confidence in the available regulations "
                "to answer this question. Please consult the official student "
                "guide or your academic advisor."
            ),
            "citation": None,
            "abstained": True,
            "abstain_reason": "low_confidence",
            "confidence": confidence,
            "latency": latency,
        }

    # 5. Generate grounded response using Ollama
    _free_memory()
    answer_text = generate_answer(question, reranked)

    if not check_faithfulness(answer_text, reranked):
        latency = time.perf_counter() - start
        return {
            "answer": (
                "I couldn't generate a reliably grounded answer to this "
                "question from the available regulations."
            ),
            "citation": None,
            "abstained": True,
            "abstain_reason": "failed_faithfulness",
            "confidence": confidence,
            "latency": latency,
        }

    top_chunk = reranked[0]
    citation = {
        "chunk_text": top_chunk["text"],
        "source_url": top_chunk["source_url"],
        "page_number": top_chunk["page_number"],
        "retrieved_at": top_chunk.get("retrieved_at"),
    }

    latency = time.perf_counter() - start
    return {
        "answer": answer_text,
        "citation": citation,
        "abstained": False,
        "abstain_reason": None,
        "confidence": confidence,
        "latency": latency,
    }