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
* **Inference:** Local LLM execution via `Ollama` running `Qwen2.5:7B` (or `Llama 3`) with sub-second retrieval pipeline caching.
* **Interface:** Interactive chat application built with `React` (Vite), `Tailwind CSS`, and `FastAPI`. Features dynamic Light/Dark modes, an official regulation PDF modal viewer, and full bilingual directionality (RTL/LTR).
* **Evaluation:** RAGAS framework benchmarking Faithfulness, Answer Relevancy, Citation Correctness, and Latency.

---

## ✨ Key Features
* **Hybrid Search with Re-Ranking:** Blends keyword accuracy (BM25) with semantic retrieval (`bge-m3`) to locate specific regulatory clauses.
* **Sub-Second Response Times (< 0.25s):** Pre-warmed vector memory caching delivers instant, responsive answers.
* **Grounded Citations & PDF Viewer:** Every answer displays verified document citations, page numbers, and an authentic regulation PDF modal with university stamps.
* **Zero-Hallucination Abstention:** Calibrated confidence thresholding and guardrails decline out-of-scope questions rather than hallucinating.
* **Dynamic Bilingual Matching (Arabic ⇄ English):** Queries asked in Arabic receive answers in Arabic; queries asked in English receive answers in English with automatic RTL/LTR alignment.
* **100% Local & Private:** Runs entirely on-device, preserving student privacy with zero cloud data transmission.

---

## 🚀 Quick Start & How to Run

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- [Ollama](https://ollama.ai) (optional for offline LLM generation, e.g., `ollama run qwen2.5:7b`)

### 2. Backend Setup (FastAPI & RAG Engine)
```bash
# Clone the repository
git clone https://github.com/Ramadan-Swedik/elmergib-rag-assistant.git
cd elmergib-rag-assistant

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://127.0.0.1:8000)
python -m uvicorn src.ui.server:app --port 8000 --reload
```

### 3. Frontend Setup (React + Vite)
```bash
# In a new terminal, navigate to the frontend directory
cd src/ui/frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your browser to interact with the assistant!

---

## 📂 Repository Structure
```text
├── .github/               # CI/CD Workflows (GitHub Actions)
├── data/                  # Official public university PDFs and clean extracts
├── eval/                  # Test question sets and RAGAS scripts
├── src/
│   ├── database/          # Ingestion, chunking, ChromaDB & BM25 indexing
│   ├── rag/               # Hybrid retrieval, Ollama client, abstention logic
│   └── ui/                # React web application, FastAPI server, and PDF modal
│       ├── frontend/      # Vite + React + Tailwind CSS client
│       └── server.py      # FastAPI REST API
├── team tasks/            # Individual workflow guides and role documentation
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── RULES.md
└── WORKFLOW.md
```
