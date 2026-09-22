# 🔧 WORKFLOW.md — Elmergib Smart Assistant

This document defines the technical workflow, tech stack ownership, and detailed
day-by-day roles for the 4-member team, following `RULES.md`. Read this alongside
`RULES.md` before starting any work.

---

## 1. Team & Domain Ownership

| Domain (per `RULES.md` §5) | Owner | Branch prefix |
|---|---|---|
| `data/` + `src/database/` | **Mohammed** | `data/mohammed/...` |
| `src/rag/` | **Amymah** | `feature/amymah/...` |
| `src/ui/` | **Ramadan** | `feature/ramadan/...` |
| `eval/` | **Omar** | `eval/omar/...` |

Any change crossing these boundaries (e.g. modifying `answer_question()`'s
signature) must be agreed by both owners before committing, per `RULES.md` §5.

---

## 2. Tech Stack (per module)

| Module | Stack |
|---|---|
| `src/database/` | `pypdf`, `sentence-transformers`/`FlagEmbedding` (`BAAI/bge-m3`), `ChromaDB`, `rank_bm25` |
| `src/rag/` | `Ollama` (`Qwen2.5:7b`, fallback `llama3.1:8b`), `BAAI/bge-reranker-v2-m3`, Reciprocal Rank Fusion (custom) |
| `src/ui/` | `Streamlit` |
| `eval/` | `ragas`, `pandas`, custom deterministic metrics (Recall@3, Abstention P/R, Latency) |

All models are open-source; no paid API keys required.

---

## 3. Detailed Roles — Day by Day (14-day sprint)

### 👤 Mohammed — `data/` + `src/database/`
**Goal:** Deliver a clean, queryable dual index (Dense + BM25) from all official documents.

| Day | Task |
|---|---|
| 1-2 | Collect all source PDFs into `data/raw/`. Register each document's official source URL and retrieval date in `data/document_sources.json`. |
| 3-4 | Extract text (`pypdf`), normalize Arabic characters, filter out non-content pages (e.g. table of contents). Manually review every cleaned `.txt` output. |
| 5-6 | Chunk text respecting sentence/clause boundaries (not fixed character cuts). Manually spot-check chunks for mid-sentence cuts. |
| 7-8 | Build Dense index (`bge-m3` → `ChromaDB`) and BM25 index (`rank_bm25`, punctuation-aware tokenization). Tag every chunk with `doc_name`, `source_url`, `retrieved_at`, `page_number`. |
| 9-10 | Run manual retrieval verification (5+ known-answer questions); log results to a persistent CSV. Fix any data-quality issues found. |
| 11-14 | Support Amymah on retrieval integration issues; assist Omar with data-related evaluation questions. |

**Output:** `data/processed/chunks.json`, `src/database/vectorstore/` (Chroma), `src/database/bm25_index.pkl`.

---

### 👤 Amymah — `src/rag/`
**Goal:** Deliver one function, `answer_question(question) → {answer, citation, abstained, latency}`.

| Day | Task |
|---|---|
| 5 | Install `Ollama`, pull `Qwen2.5:7b`. Install `bge-reranker-v2-m3`. Wait for Mohammed's indexes (Day 7-8) but set up scaffolding now. |
| 6-7 | Implement hybrid retrieval: top-10 from BM25 + top-10 from Dense, merged via Reciprocal Rank Fusion (RRF). |
| 8 | Apply re-ranking on the fused top-10, keep top-3. |
| 9 | Build the Abstention Gate using a provisional confidence threshold. |
| 10 | Build the grounded generation prompt (strict, context-only) and wire up `Qwen2.5` calls. Add a simple post-generation faithfulness check (keyword overlap with source). |
| 11 | Add prompt-injection resistant instructions. Finalize the `answer_question()` interface contract with Ramadan (UI) and Omar (eval). |
| 12-14 | Bug fixes based on Ramadan's UI testing and Omar's evaluation findings. |

**Output:** `src/rag/answer_question()` and supporting retrieval/generation modules.

---

### 👤 Ramadan — `src/ui/`
**Goal:** Deliver a working Streamlit chat interface calling `answer_question()`.

| Day | Task |
|---|---|
| 1-8 | Coordinate the team (branch reviews, PR approvals, unblocking dependencies) while designing the UI mockup/wireframe. |
| 9 | Once Amymah's `answer_question()` has a first working stub, build the Streamlit chat UI against it. |
| 10 | Display full citation (chunk text + source URL + retrieval date) — not just the answer. Add the required disclaimer: *"Informational prototype only — not an official University decision channel."* |
| 11 | Visually distinguish abstention responses from normal answers. |
| 12-13 | Polish UI, test with real users (team members), fix UX issues. |
| 14 | Support final presentation prep. |

**Output:** `src/ui/app.py` (Streamlit), screenshots/demo recording for the final presentation.

---

### 👤 Omar — `eval/`
**Goal:** Deliver `eval/results.csv` and the evidence base for the final report.

| Day | Task |
|---|---|
| 1-5 | Build the held-out labelled question set (40-50 questions) — does **not** depend on anyone else. Cover 5 categories: in-scope, Arabic phrasing variation, out-of-scope, conflicting/ambiguous, prompt-injection. For each in-scope question, manually record the correct `chunk_id` (ground truth). |
| 6-8 | Draft the evaluation script structure (can be built against Mohammed's index directly, independent of Amymah's full pipeline). |
| 9-10 | Once Amymah's `answer_question()` is available, calibrate the Abstention Gate threshold using the labelled set (plot score distributions, pick the best-separating cutoff). |
| 11 | Run deterministic metrics: Retrieval Recall@3, Abstention Precision/Recall, Latency (avg + P95). |
| 12 | Run RAGAS (using `Qwen2.5` as the local judge — document this limitation explicitly). Compute Citation Correctness. |
| 13 | Analyze failure cases; classify each as a retrieval failure vs. a generation failure. |
| 14 | Write the final report, including all known limitations honestly. |

**Output:** `eval/test_questions.csv`, `eval/results.csv`, final report draft.

---

## 4. Critical Path & Dependencies

```
Mohammed (data)  ──►  Amymah (rag)  ──►  Ramadan (ui)
                            │
                            └────────►  Omar (eval, calibration step only)

Omar's question-set building (Days 1-5) and Ramadan's coordination/mockup
work do NOT block on anyone — start immediately.
```

**Bottleneck to watch:** Amymah's module depends on Mohammed's index being done
by Day 7-8. If data work slips, flag it immediately in the team channel — do not
wait silently.

---

## 5. Expected Outcomes (Day 14)

- A working end-to-end prototype: Streamlit UI → `answer_question()` → grounded answer with citation, or explicit abstention.
- `eval/results.csv` with deterministic + RAGAS metrics, covering all 5 question categories.
- A final report documenting the architecture, experiments (e.g. Naive vs. Hybrid retrieval comparison if time permits), and all known limitations — written honestly rather than overclaiming.