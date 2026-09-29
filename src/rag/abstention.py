from __future__ import annotations

DEFAULT_CONFIDENCE_THRESHOLD = 0.3


def check_abstention_gate(
    confidence_score: float, threshold: float = DEFAULT_CONFIDENCE_THRESHOLD
) -> bool:
    
    return confidence_score < threshold


def top_confidence(reranked_results: list[dict]) -> float:
    
    if not reranked_results:
        return 0.0
    return reranked_results[0].get("rerank_score", 0.0)