# 👩‍💻 Amymah's Task Guide: RAG Engine Domain

**Domain:** `src/rag/`
**Branch Prefix:** `feature/amymah/...`

## 🎯 Job Description
Deliver the core function: `answer_question(question) → {answer, citation, abstained, latency}`.
You are strictly restricted to the `src/rag/` directory (retrieval logic, Ollama calls, and abstention logic).

## 🛠️ Tools & Tech Stack
- `Ollama` running local LLMs (`Qwen2.5:7b`, fallback `llama3.1:8b`)
- `BAAI/bge-reranker-v2-m3` for re-ranking
- Reciprocal Rank Fusion (custom implementation)

## 📅 Workflow (14-Day Sprint)
- **Day 5:** Install `Ollama`, pull `Qwen2.5:7b`. Install `bge-reranker-v2-m3`. Set up scaffolding while waiting for Mohammed's indexes.
- **Day 6-7:** Implement hybrid retrieval: top-10 from BM25 + top-10 from Dense, merged via Reciprocal Rank Fusion (RRF).
- **Day 8:** Apply re-ranking on the fused top-10, keep the top-3.
- **Day 9:** Build the Abstention Gate using a provisional confidence threshold.
- **Day 10:** Build the grounded generation prompt (strict, context-only) and wire up `Qwen2.5` calls. Add a simple post-generation faithfulness check.
- **Day 11:** Add prompt-injection resistant instructions. Finalize the `answer_question()` interface contract with Ramadan (UI) and Omar (eval).
- **Day 12-14:** Bug fixes based on Ramadan's UI testing and Omar's evaluation findings.

## ✅ Expected Outcomes
1. `src/rag/pipeline.py` containing `answer_question()` and supporting retrieval/generation modules.
2. A working end-to-end grounded generation pipeline.

**⚠️ Conflict Prevention:** Do not modify any files in `src/database/`, `src/ui/`, or `eval/`. Any change to the signature of `answer_question()` must be explicitly agreed upon with Ramadan and Omar before committing. You depend on Mohammed's index by Day 7-8.
