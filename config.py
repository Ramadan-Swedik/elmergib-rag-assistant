from pathlib import Path

# ==============================================================================
# 1. Project Root & Base Directory Setup
# ==============================================================================
# Finds the root directory of the project automatically
BASE_DIR = Path(__file__).resolve().parent

# Person 1 Scope: Data Directories
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"          # Stores original PDF files & sources.json
PROCESSED_DATA_DIR = DATA_DIR / "processed" # Stores cleaned text & final chunks.json

# Person 1 Scope: Database & Index Directories
DATABASE_DIR = BASE_DIR / "src" / "database"
VECTORSTORE_DIR = DATABASE_DIR / "vectorstore" # Stores ChromaDB vector data

# Automatically create directories if they don't exist yet
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

# ==============================================================================
# 2. File Paths (Output Artifacts)
# ==============================================================================
# Raw document manifest (Contains document URLs and download dates for citations)
SOURCES_MANIFEST_PATH = RAW_DATA_DIR / "sources.json"

# Processed text & structured chunks
CLEANED_TEXT_PATH = PROCESSED_DATA_DIR / "cleaned_guide_text.txt"
CHUNKS_JSON_PATH = PROCESSED_DATA_DIR / "chunks.json"

# Hybrid Search Indices & Audit Logs
BM25_INDEX_PATH = DATABASE_DIR / "bm25_index.pkl"
VERIFICATION_LOG_PATH = DATABASE_DIR / "retrieval_verification.csv"

# ==============================================================================
# 3. Model & Database Settings
# ==============================================================================
# Embedding Model: Locked to BAAI/bge-m3.
# RULE: MUST ONLY be used with FlagEmbedding (BGEM3FlagModel), NEVER sentence-transformers!
MODEL_NAME = "BAAI/bge-m3"

# ChromaDB Collection Name (Used consistently across indexing and search)
COLLECTION_NAME = "university_rules"

# ==============================================================================
# 4. Text Cleaning & Chunking Parameters
# ==============================================================================
TARGET_CHUNK_SIZE = 500  # Target character length per chunk (built on sentence boundaries)
CHUNK_OVERLAP = 100      # Character overlap to preserve context across chunks
MAX_TOC_DOT_RATIO = 0.25 # If >25% of a page is dot leaders (....), drop it as a Table of Contents

# ==============================================================================
# 5. Execution Test
# ==============================================================================
if __name__ == "__main__":
    print("✅ Centralized config loaded successfully.")
    print(f"📁 Root Path: {BASE_DIR}")
    print(f"📁 Data Path: {DATA_DIR}")
    print(f"📁 Database Path: {DATABASE_DIR}")