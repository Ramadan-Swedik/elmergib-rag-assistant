# 🎓 Smart Assistant for Elmergib University Students (PoC)

[![CI Checks](https://github.com/Ramadan-Swedik/elmergib-rag-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/Ramadan-Swedik/elmergib-rag-assistant/actions/workflows/ci.yml)

An open-source, local Retrieval-Augmented Generation (RAG) assistant designed to help Elmergib University students quickly search and verify attendance and absence regulations. 

> **Disclaimer:** This prototype is an informational research proof-of-concept developed for the Samsung Innovation Campus AI Course. It is not an official university decision channel, and outputs should not be treated as formal administrative rulings.

---

## 📌 Project Overview
Navigating academic policy documents can be tedious. This project implements an **Advanced Hybrid RAG** system to query official university regulations locally and accurately. 

To eliminate speculative outputs, the system incorporates an **Abstention Gate**: if retrieval confidence is low or a query falls outside the official policies, the system explicitly declines to answer rather than generating a hallucinated response.

## 🛠️ Architecture & Tech Stack
* **Document Processing:** Text extraction and rule-based legal chunking via `pypdf`.
* **Embedding & Indexing:** Dense embeddings via `BAAI/bge-m3` stored in `ChromaDB`, paired with a Sparse `BM25` index.
* **Retrieval Pipeline:** Hybrid search combined via Reciprocal Rank Fusion (RRF) and re-ranked using `bge-reranker-v2-m3`.
* **Inference:** Local LLM execution via `Ollama` running `Qwen2.5:7B` (or `Llama 3`).
* **Interface:** Interactive chat interface built with `Streamlit`.
* **Evaluation:** RAGAS framework benchmarking Faithfulness, Answer Relevancy, Citation Correctness, and Latency.

---

## ✨ Key Features
* **Hybrid Search with Re-Ranking:** Blends keyword accuracy with semantic retrieval to locate specific regulatory clauses.
* **Grounded Citations:** Every answer displays the exact retrieved context snippet, source document link, and retrieval timestamp.
* **Abstention Logic:** Built-in safeguards reject out-of-scope prompts and prompt-injection attempts.
* **100% Local & Private:** Runs entirely on-device via Ollama, collecting zero student personal data.

---

## 📂 Repository Structure
```text
├── .github/               # CI/CD Workflows (GitHub Actions)
├── data/                  # Official public university PDFs and clean extracts
├── eval/                  # Test question sets and RAGAS scripts
├── src/
│   ├── database/          # Ingestion, chunking, ChromaDB & BM25 indexing
│   ├── rag/               # Hybrid retrieval, Ollama client, abstention logic
│   └── ui/                # Streamlit web application and citation renderers
├── team tasks/            # Individual workflow guides and role documentation
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── RULES.md
└── WORKFLOW.md
```
