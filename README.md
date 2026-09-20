# 🎓 Smart Assistant for Elmergib University Students (PoC)

An open-source, local Retrieval-Augmented Generation (RAG) assistant designed to help Elmergib University students quickly search and verify attendance and absence regulations. 

> **Disclaimer:** This prototype is an informational research proof-of-concept developed for the Samsung Innovation Campus AI Course[cite: 1]. It is not an official university decision channel, and outputs should not be treated as formal administrative rulings[cite: 1].

---

## 📌 Project Overview
Navigating academic policy documents can be tedious. This project implements an **Advanced Hybrid RAG** system to query official university regulations locally and accurately[cite: 1]. 

To eliminate speculative outputs, the system incorporates an **Abstention Gate**: if retrieval confidence is low or a query falls outside the official policies, the system explicitly declines to answer rather than generating a hallucinated response[cite: 1].

## 🛠️ Architecture & Tech Stack
* **Document Processing:** Text extraction and rule-based legal chunking via `pypdf`.
* **Embedding & Indexing:** Dense embeddings via `BAAI/bge-m3` stored in `ChromaDB`, paired with a Sparse `BM25` index.
* **Retrieval Pipeline:** Hybrid search combined via Reciprocal Rank Fusion (RRF) and re-ranked using `bge-reranker-v2-m3`.
* **Inference:** Local LLM execution via `Ollama` running `Qwen2.5:7B` (or `Llama 3`)[cite: 1].
* **Interface:** Interactive chat interface built with `Streamlit`[cite: 1].
* **Evaluation:** RAGAS framework benchmarking Faithfulness, Answer Relevancy, Citation Correctness, and Latency[cite: 1].

---

## ✨ Key Features
* **Hybrid Search with Re-Ranking:** Blends keyword accuracy with semantic retrieval to locate specific regulatory clauses.
* **Grounded Citations:** Every answer displays the exact retrieved context snippet, source document link, and retrieval timestamp[cite: 1].
* **Abstention Logic:** Built-in safeguards reject out-of-scope prompts and prompt-injection attempts[cite: 1].
* **100% Local & Private:** Runs entirely on-device via Ollama, collecting zero student personal data[cite: 1].

---

## 📂 Repository Structure
```text
├── data/                  # Official public university PDFs and clean extracts
├── eval/                  # Test question sets (40-50 questions) and RAGAS scripts
├── src/
│   ├── database/          # Ingestion, chunking, ChromaDB & BM25 indexing
│   ├── rag/               # Hybrid retrieval, Ollama client, abstention logic
│   └── ui/                # Streamlit web application and citation renderers
├── .gitignore
├── README.md
├── requirements.txt
└── RULES.md
