"""
Text Chunking Module - Strict WORKFLOW Standard with Continuous Cross-Page Overlap.
Owner: Mohammed
Domain: src/database/
Goal: Split cleaned documents into structured chunks with seamless cross-page overlap and strict metadata.
"""
import json
import re
import sys
from pathlib import Path

# Add project root directory to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from config import (
    BASE_DIR,
    PROCESSED_DATA_DIR,
    CHUNKS_JSON_PATH,
    TARGET_CHUNK_SIZE,
    CHUNK_OVERLAP,
)

# Strict WORKFLOW Paths
SOURCES_FILE_PATH = BASE_DIR / "data" / "document_sources.json"
CLEANED_DOCS_PATH = PROCESSED_DATA_DIR / "cleaned_documents.json"


def load_document_sources() -> dict:
    """Load sources map strictly from data/document_sources.json."""
    if not SOURCES_FILE_PATH.exists():
        raise FileNotFoundError(f"❌ Strict WORKFLOW file missing: {SOURCES_FILE_PATH}")

    with open(SOURCES_FILE_PATH, "r", encoding="utf-8") as f:
        sources_data = json.load(f)

    sources_map = {}
    if isinstance(sources_data, list):
        for item in sources_data:
            doc_id = item.get("doc_id") or item.get("file_name")
            if doc_id:
                sources_map[doc_id] = item
    elif isinstance(sources_data, dict):
        sources_map = sources_data

    return sources_map


def split_into_sentences(text: str) -> list[str]:
    """Split text into sentences based on punctuation and line breaks."""
    sentences = re.split(r"(?<=[.!?؟\n])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def create_chunks_from_pages(doc: dict, sources_map: dict) -> list[dict]:
    """Chunk document with continuous sentence overlap across page boundaries."""
    doc_chunks = []
    chunk_counter = 1

    doc_id = doc.get("doc_id", "")
    source_info = sources_map.get(doc_id, {})

    # Strict WORKFLOW Metadata Tags
    doc_name = (
        source_info.get("doc_name")
        or source_info.get("title")
        or doc.get("title")
        or doc.get("file_name", "")
    )
    source_url = (
        source_info.get("source_url")
        or source_info.get("url")
        or doc.get("source_url", "")
    )
    retrieved_at = (
        source_info.get("retrieved_at")
        or source_info.get("retrieval_date")
        or doc.get("retrieval_date", "")
    )

    # 1. تحويل الجمل من جميع الصفحات إلى تدفق مستمر مع تتبع رقم الصفحة
    all_sentences_with_pages = []
    for page in doc.get("pages", []):
        page_num = page.get("page_number", 1)
        page_text = page.get("text", "")
        for sentence in split_into_sentences(page_text):
            all_sentences_with_pages.append((sentence, page_num))

    current_chunk = []  # يحوي أزواج (الجملة, رقم الصفحة)
    current_length = 0

    # 2. التقطيع المستمر والتداخل عبر المستند كاملاً
    for sentence, page_num in all_sentences_with_pages:
        sentence_len = len(sentence)

        # عند تجاوز الحجم المستهدف (TARGET_CHUNK_SIZE = 500)
        if current_length + sentence_len > TARGET_CHUNK_SIZE and current_chunk:
            chunk_text = " ".join([s[0] for s in current_chunk])
            chunk_page = current_chunk[-1][1]  # رقم صفحة آخر جملة اكتملت بها القطعة

            doc_chunks.append({
                "chunk_id": f"{doc_id}_p{chunk_page}_c{chunk_counter}",
                "doc_id": doc_id,
                "doc_name": doc_name,
                "source_url": source_url,
                "retrieved_at": retrieved_at,
                "page_number": chunk_page,
                "text": chunk_text,
            })
            chunk_counter += 1

            # حساب بذرة التداخل (Overlap) بنقل الجمل الأخيرة ضمن CHUNK_OVERLAP
            overlap_chunk = []
            overlap_len = 0
            for item in reversed(current_chunk):
                s_text = item[0]
                if overlap_len + len(s_text) <= CHUNK_OVERLAP:
                    overlap_chunk.insert(0, item)
                    overlap_len += len(s_text)
                else:
                    break

            current_chunk = overlap_chunk
            current_length = overlap_len

        current_chunk.append((sentence, page_num))
        current_length += sentence_len + 1

    # 3. إخراج باقي القطعة الأخيرة في المستند
    if current_chunk:
        chunk_text = " ".join([s[0] for s in current_chunk])
        chunk_page = current_chunk[-1][1]

        doc_chunks.append({
            "chunk_id": f"{doc_id}_p{chunk_page}_c{chunk_counter}",
            "doc_id": doc_id,
            "doc_name": doc_name,
            "source_url": source_url,
            "retrieved_at": retrieved_at,
            "page_number": chunk_page,
            "text": chunk_text,
        })

    return doc_chunks


def main():
    if not CLEANED_DOCS_PATH.exists():
        raise FileNotFoundError(f"❌ Processed data file not found: {CLEANED_DOCS_PATH}")

    sources_map = load_document_sources()

    with open(CLEANED_DOCS_PATH, "r", encoding="utf-8") as f:
        documents = json.load(f)

    all_chunks = []
    print(f"🚀 Chunking with STRICT WORKFLOW metadata & seamless continuous overlap...\n")

    for doc in documents:
        chunks = create_chunks_from_pages(doc, sources_map)
        all_chunks.extend(chunks)
        print(f"  🧩 {doc.get('doc_id', 'unknown')}: Generated {len(chunks)} chunks.")

    with open(CHUNKS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Chunking completed! Total chunks: {len(all_chunks)}")
    print(f"📁 Saved to: {CHUNKS_JSON_PATH}")


if __name__ == "__main__":
    main()