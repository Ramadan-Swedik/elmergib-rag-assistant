# 👨‍💻 Omar's Task Guide: Evaluation Domain

**Domain:** `eval/`
**Branch Prefix:** `eval/omar/...`

## 🎯 Job Description
Deliver `eval/results.csv` and the evidence base for the final report to prove the system works (and document its limitations honestly).
You are strictly restricted to the `eval/` directory and reporting outputs.

## 🛠️ Tools & Tech Stack
- `ragas`
- `pandas`
- Custom deterministic metrics (Recall@3, Abstention Precision/Recall, Latency)

## 📅 Workflow (14-Day Sprint)
- **Day 1-5:** Build the held-out labelled question set (40-50 questions). Cover 5 categories: in-scope, Arabic phrasing variation, out-of-scope, conflicting/ambiguous, prompt-injection. For each in-scope question, manually record the correct `chunk_id` (ground truth). *(Starts immediately, independent of others)*.
- **Day 6-8:** Draft the evaluation script structure. This can be built against Mohammed's index directly.
- **Day 9-10:** Once Amymah's `answer_question()` is available, calibrate the Abstention Gate threshold using the labelled set (plot score distributions, pick the best-separating cutoff).
- **Day 11:** Run deterministic metrics: Retrieval Recall@3, Abstention Precision/Recall, Latency (avg + P95).
- **Day 12:** Run RAGAS (using `Qwen2.5` as the local judge—document this limitation explicitly). Compute Citation Correctness.
- **Day 13:** Analyze failure cases; classify each as a retrieval failure vs. a generation failure.
- **Day 14:** Write the final report, including all known limitations honestly.

## ✅ Expected Outcomes
1. `eval/test_questions.csv`
2. `eval/results.csv`
3. Final report draft documenting architecture, experiments, and limitations.

**⚠️ Conflict Prevention:** Do not modify files in `src/`. You consume the outputs of Mohammed's index and Amymah's pipeline. Calibrate closely with Amymah on Day 9-10 to define the abstention threshold.
