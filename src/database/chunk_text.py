"""
Text Chunking Module.
Owner: Mohammed
Domain: src/database/
Goal: Split cleaned documents into structured chunks with metadata and sentence boundaries.
"""
import json
import re
import sys
from pathlib import Path

# Add project root directory to sys.path (3 levels up)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from config import (
    PROCESSED_DATA_DIR,
    CHUNKS_JSON_PATH,
    TARGET_CHUNK_SIZE,
    CHUNK_OVERLAP,
)


def split_into_sentences(text: str) -> list[str]:
    """Split text into sentences based on punctuation and line breaks."""
    sentences = re.split(r"(?<=[.!?؟\n])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def create_chunks_from_pages(doc: dict) -> list[dict]:
    """Chunk document by page numbers and sentence boundaries with metadata tracking."""
    doc_chunks = []
    chunk_counter = 1

    for page in doc.get("pages", []):
        page_num = page["page_number"]
        page_text = page["text"]
        sentences = split_into_sentences(page_text)

        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_len = len(sentence)

            # Exceed target chunk size (TARGET_CHUNK_SIZE = 500)
            if current_length + sentence_len > TARGET_CHUNK_SIZE and current_chunk:
                chunk_text = " ".join(current_chunk)
                doc_chunks.append({
                    "chunk_id": f"{doc['doc_id']}_p{page_num}_c{chunk_counter}",
                    "doc_id": doc["doc_id"],
                    "file_name": doc["file_name"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "source_url": doc["source_url"],
                    "page_number": page_num,
                    "text": chunk_text,
                    "char_count": len(chunk_text),
                })
                chunk_counter += 1

                # Maintain context overlap (CHUNK_OVERLAP = 100)
                overlap_chunk = []
                overlap_len = 0
                for s in reversed(current_chunk):
                    if overlap_len + len(s) <= CHUNK_OVERLAP:
                        overlap_chunk.insert(0, s)
                        overlap_len += len(s)
                    else:
                        break

                current_chunk = overlap_chunk
                current_length = overlap_len

            current_chunk.append(sentence)
            current_length += sentence_len + 1

        # Add remaining chunk for the page
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            doc_chunks.append({
                "chunk_id": f"{doc['doc_id']}_p{page_num}_c{chunk_counter}",
                "doc_id": doc["doc_id"],
                "file_name": doc["file_name"],
                "title": doc["title"],
                "category": doc["category"],
                "source_url": doc["source_url"],
                "page_number": page_num,
                "text": chunk_text,
                "char_count": len(chunk_text),
            })
            chunk_counter += 1

    return doc_chunks


def main():
    master_file = PROCESSED_DATA_DIR / "cleaned_documents.json"
    if not master_file.exists():
        raise FileNotFoundError(f"❌ Processed data file not found: {master_file}")

    with open(master_file, "r", encoding="utf-8") as f:
        documents = json.load(f)

    all_chunks = []
    print(f"🚀 Starting chunking process for {len(documents)} processed documents...\n")

    for doc in documents:
        chunks = create_chunks_from_pages(doc)
        all_chunks.extend(chunks)
        print(f"  🧩 {doc['doc_id']}: Generated {len(chunks)} chunks.")

    with open(CHUNKS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Chunking completed successfully! Total chunks: {len(all_chunks)}")
    print(f"📁 Chunks saved to: {CHUNKS_JSON_PATH}")


if __name__ == "__main__":
    main()