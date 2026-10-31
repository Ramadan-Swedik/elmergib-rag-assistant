"""
Evaluation and Benchmarking Module.
Owner: Omar
Domain: eval/
Goal: Deliver results.csv and evidence base for final report.
"""
from pathlib import Path

import pandas as pd
# from ragas import evaluate
# from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

from real_answer_adapter import answer_question

QUESTIONS_PATH = Path("eval/test_questions.csv")
RESULTS_PATH = Path("eval/results.csv")
STUDENT_GUIDE_DOC_ID = "elmergib_student_guide_2019_2020"
TOP_K = 3  # kept for reference; the live pipeline only exposes its single best citation


# ==========================================================================
# Day 1-5 -> load_test_set()
# ==========================================================================
def load_test_set(csv_path: str) -> pd.DataFrame:
    """
    Load the held-out labelled question set.
    """
    return pd.read_csv(csv_path, encoding="utf-8-sig")


# ==========================================================================
# Citation correctness: compare the pipeline's single best citation
# (page_number) against expected_page. NOTE: since Amymah's pipeline only
# exposes the top-1 citation (not a top-K list), this is effectively a
# "citation correctness @ 1" check, not a true Recall@3 over candidates.
# This is a documented limitation for the Day 14 report.
# ==========================================================================
def check_citation_correct(returned_page: int | None, expected_page: str) -> float | None:
    """
    Returns 1.0 (match), 0.0 (mismatch), or None (not computable —
    either the question has no page reference, or the system abstained
    so there's no citation to check).
    """
    if returned_page is None:
        return None
    try:
        pages = [int(p) for p in str(expected_page).split("-")]
    except ValueError:
        return None  # "لا ينطبق" or similar non-numeric ref
    expected_range = set(range(pages[0], pages[-1] + 1))
    return 1.0 if returned_page in expected_range else 0.0


# ==========================================================================
# Abstention Precision/Recall classification
# ==========================================================================
SHOULD_ABSTAIN = {"abstain", "refuse_and_abstain"}


def classify_abstention_outcome(expected_behavior: str, system_abstained: bool) -> str:
    if expected_behavior == "flag_ambiguity_no_hallucination":
        return "ambiguous_case"
    should_abstain = expected_behavior in SHOULD_ABSTAIN
    if should_abstain and system_abstained:
        return "true_positive"
    if should_abstain and not system_abstained:
        return "false_negative"
    if not should_abstain and system_abstained:
        return "false_positive"
    return "true_negative"


# ==========================================================================
# Day 11 -> run_deterministic_metrics()
# ==========================================================================
def run_deterministic_metrics(test_set: pd.DataFrame) -> pd.DataFrame:
    """
    Run Citation Correctness (proxy for Recall@K), Abstention
    Precision/Recall, and Latency — using the REAL pipeline now.
    """
    results = []
    for _, row in test_set.iterrows():
        result = answer_question(row["question"])

        citation_correct = check_citation_correct(result["page_number"], row["expected_page"])
        outcome = classify_abstention_outcome(row["expected_behavior"], result["abstained"])

        results.append({
            "id": row["id"],
            "category": row["category"],
            "expected_behavior": row["expected_behavior"],
            "system_abstained": result["abstained"],
            "abstain_reason": result["abstain_reason"],
            "abstention_outcome": outcome,
            "citation_correct": citation_correct,
            "returned_page": result["page_number"],
            "confidence": result["confidence"],
            "latency_sec": result["latency"],
            "system_answer": result["answer"],
        })
    return pd.DataFrame(results)


def summarize(results_df: pd.DataFrame) -> None:
    print("=== Latency ===")
    print(f"avg: {results_df['latency_sec'].mean():.3f}s | "
          f"p95: {results_df['latency_sec'].quantile(0.95):.3f}s")

    print("\n=== Abstention outcomes ===")
    print(results_df["abstention_outcome"].value_counts())

    computable = results_df["citation_correct"].dropna()
    if len(computable):
        print(f"\n=== Citation Correctness (computable rows only) ===")
        print(f"{computable.mean():.3f} over {len(computable)} rows")
    else:
        print("\n=== Citation Correctness ===\nNot yet computable.")


# ==========================================================================
# Day 12 -> run_ragas_evaluation()  (NOT wired up yet — needs `pip install ragas`)
# ==========================================================================
def run_ragas_evaluation(dataset):
    """
    Run RAGAS evaluation using local LLM as judge.
    """
    raise NotImplementedError("Day 12 task — requires `pip install ragas`.")


if __name__ == "__main__":
    test_set = load_test_set(str(QUESTIONS_PATH))
    results_df = run_deterministic_metrics(test_set)

    RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    results_df.to_csv(RESULTS_PATH, index=False, encoding="utf-8-sig")

    summarize(results_df)
    print(f"\nSaved: {RESULTS_PATH}")
