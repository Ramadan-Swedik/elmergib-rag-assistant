"""
eval/real_answer_adapter.py
Owner: Omar (eval/ domain)

Wraps Amymah's real src/rag/pipeline.answer_question() and normalizes
its output shape to match what run_eval.py / calibrate_threshold.py
expect. This file lives entirely in eval/ and does not modify
anything in src/.

Contract normalization:
    Amymah's pipeline returns a single "citation" dict (best match only),
    not a list of chunk_ids. So instead of comparing chunk_id lists,
    we now compare the citation's page_number directly against
    test_questions.csv's expected_page — this is actually MORE
    accurate than our old chunk_id-list approach, since it reflects
    exactly what the live system would show the student.
"""
import sys
from pathlib import Path

# Project root must be on sys.path for `from src.rag...` to resolve,
# same as Mohammed's and Amymah's own scripts do.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.rag.pipeline import answer_question as _real_answer_question


def answer_question(question: str) -> dict:
    """
    Returns a normalized dict:
        {
            "answer": str,
            "abstained": bool,
            "abstain_reason": str | None,
            "confidence": float,
            "latency": float,
            "page_number": int | None,   # from citation, or None if abstained
            "source_url": str | None,
        }
    """
    result = _real_answer_question(question)

    citation = result.get("citation")
    return {
        "answer": result.get("answer", ""),
        "abstained": result.get("abstained", False),
        "abstain_reason": result.get("abstain_reason"),
        "confidence": result.get("confidence", 0.0),
        "latency": result.get("latency", 0.0),
        "page_number": citation.get("page_number") if citation else None,
        "source_url": citation.get("source_url") if citation else None,
    }


if __name__ == "__main__":
    # Quick manual sanity check: run `python eval/real_answer_adapter.py`
    r = answer_question("ما هي نسبة الغياب المسموح بها للطالب؟")
    print(f"abstained: {r['abstained']}")
    print(f"confidence: {r['confidence']:.3f}")
    print(f"page_number: {r['page_number']}")
    print(f"answer: {r['answer'][:200]}")
