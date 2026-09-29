
from __future__ import annotations

import os

import torch

DEFAULT_RERANKER = "BAAI/bge-reranker-v2-m3"

_reranker = None  


def _get_reranker():
    global _reranker
    if _reranker is None:
        try:
            from FlagEmbedding import FlagReranker
        except ImportError as e:
            raise ImportError(
                "rerank.py requires `pip install FlagEmbedding`."
            ) from e
        model_path = os.environ.get("RERANKER_PATH", DEFAULT_RERANKER)
        _reranker = FlagReranker(model_path, use_fp16=torch.cuda.is_available())
    return _reranker


def rerank(query: str, fused_results: list[dict], top_n: int = 3) -> list[dict]:
  
    if not fused_results:
        return []

    reranker = _get_reranker()
    pairs = [[query, r["text"]] for r in fused_results]
    scores = reranker.compute_score(pairs, normalize=True)

    if isinstance(scores, float):
        scores = [scores]

    scored = list(zip(fused_results, scores))
    scored.sort(key=lambda pair: pair[1], reverse=True)

    top = []
    for chunk, score in scored[:top_n]:
        entry = dict(chunk)
        entry["rerank_score"] = float(score)
        top.append(entry)
    return top