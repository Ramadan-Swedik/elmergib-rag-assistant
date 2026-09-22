# 👨‍💻 Mohammed's Task Guide: Data & Database Domain

**Domain:** `data/` and `src/database/`
**Branch Prefix:** `data/mohammed/...`

## 🎯 Job Description
Deliver a clean, queryable dual index (Dense + BM25) from all official university documents. 
You are strictly restricted to the `src/database/` directory and raw text cleaning in `data/`.

## 🛠️ Tools & Tech Stack
- `pypdf` for text extraction
- `sentence-transformers` / `FlagEmbedding` (`BAAI/bge-m3`) for Dense embeddings
- `ChromaDB` for the vector database
- `rank_bm25` for the sparse index

## 📅 Workflow (14-Day Sprint)
- **Day 1-2:** Collect all source PDFs into `data/raw/`. Register each document's official source URL and retrieval date in `data/document_sources.json`.
- **Day 3-4:** Extract text (`pypdf`), normalize Arabic characters, filter out non-content pages (e.g., table of contents). Manually review every cleaned `.txt` output.
- **Day 5-6:** Chunk text respecting sentence/clause boundaries (not fixed character cuts). Manually spot-check chunks for mid-sentence cuts.
- **Day 7-8:** Build Dense index (`bge-m3` → `ChromaDB`) and BM25 index (`rank_bm25`, punctuation-aware tokenization). Tag every chunk with `doc_name`, `source_url`, `retrieved_at`, `page_number`.
- **Day 9-10:** Run manual retrieval verification (5+ known-answer questions); log results to a persistent CSV. Fix any data-quality issues found.
- **Day 11-14:** Support Amymah on retrieval integration issues; assist Omar with data-related evaluation questions.

## ✅ Expected Outcomes
1. `data/processed/chunks.json`
2. `src/database/vectorstore/` (ChromaDB instance)
3. `src/database/bm25_index.pkl`

**⚠️ Conflict Prevention:** Do not modify any files in `src/rag/`, `src/ui/`, or `eval/`. Your primary dependent is Amymah—her retrieval pipeline requires your index by Day 7-8. If you fall behind, notify the team immediately!
