"""
eval/calibrate_threshold.py
Owner: Omar (eval/ domain)
Day 9-10: calibrate the Abstention Gate confidence threshold.

Uses the REAL pipeline now (src/rag/pipeline.answer_question, via
real_answer_adapter.py).
"""
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score

# --- SWAP POINT: now using the real pipeline ---
from real_answer_adapter import answer_question
# ----------------------------------------------------------------------

QUESTIONS_PATH = Path("eval/test_questions.csv")

SHOULD_ABSTAIN = {"abstain", "refuse_and_abstain"}
SHOULD_ANSWER = {"answer_confidently"}


def collect_scores(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df.iterrows():
        result = answer_question(row["question"])
        rows.append({
            "id": row["id"],
            "expected_behavior": row["expected_behavior"],
            "confidence": result["confidence"],
            "abstained": result["abstained"],
            "abstain_reason": result["abstain_reason"],
        })
    return pd.DataFrame(rows)


def find_best_threshold(scores_df: pd.DataFrame) -> tuple[float, float]:
    """
    Uses only the clear-cut categories (answer_confidently vs
    abstain/refuse_and_abstain) to fit the threshold. Ambiguous
    questions are excluded here on purpose — see summarize().
    """
    clear = scores_df[
        scores_df["expected_behavior"].isin(SHOULD_ANSWER | SHOULD_ABSTAIN)
    ]
    y_true = clear["expected_behavior"].isin(SHOULD_ANSWER).astype(int).tolist()
    y_scores = clear["confidence"].tolist()

    best_f1, best_t = 0.0, 0.5
    for t in np.linspace(min(y_scores), max(y_scores), 200):
        preds = [1 if s >= t else 0 for s in y_scores]
        f1 = f1_score(y_true, preds)
        if f1 > best_f1:
            best_f1, best_t = f1, t
    return best_t, best_f1


def summarize(scores_df: pd.DataFrame, threshold: float) -> None:
    print(f"Best threshold found: {threshold:.3f}\n")

    print("=== Score ranges by expected_behavior ===")
    print(scores_df.groupby("expected_behavior")["confidence"].describe()[["mean", "min", "max"]])

    print("\n=== Current pipeline threshold vs our calibrated one ===")
    print(f"Pipeline's own abstained flags (from abstention.py, threshold=0.3):")
    print(scores_df.groupby("expected_behavior")["abstained"].mean())

    ambiguous = scores_df[scores_df["expected_behavior"] == "flag_ambiguity_no_hallucination"]
    if len(ambiguous):
        near_threshold = ambiguous[(ambiguous["confidence"] - threshold).abs() < 0.15]
        print(f"\n=== Ambiguous questions near the threshold (±0.15) ===")
        print(f"{len(near_threshold)} / {len(ambiguous)}")


if __name__ == "__main__":
    df = pd.read_csv(QUESTIONS_PATH, encoding="utf-8-sig")
    scores_df = collect_scores(df)
    threshold, f1 = find_best_threshold(scores_df)
    summarize(scores_df, threshold)

    scores_df.to_csv("eval/calibration_scores.csv", index=False, encoding="utf-8-sig")
    print("\nSaved: eval/calibration_scores.csv")
