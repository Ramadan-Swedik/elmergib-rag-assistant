from __future__ import annotations


def apply_reciprocal_rank_fusion(
    dense_results: list[dict],
    sparse_results: list[dict],
    k: int = 60,
    top_n: int = 10,
) -> list[dict]:
    
    scores: dict[str, float] = {}
    chunk_lookup: dict[str, dict] = {}

    for result_list in (dense_results, sparse_results):
        for rank, chunk in enumerate(result_list):
            chunk_id = chunk["chunk_id"]
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (k + rank + 1)
            chunk_lookup.setdefault(chunk_id, chunk)

    fused_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)

    fused = []
    for chunk_id in fused_ids[:top_n]:
        entry = dict(chunk_lookup[chunk_id])
        entry["rrf_score"] = scores[chunk_id]
        fused.append(entry)

    return fused
