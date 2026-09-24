"""
PDF Text Extraction and Cleaning Module.
Owner: Mohammed
Domain: src/database/
Goal: Extract page-by-page text from raw PDFs, filter out ToC pages, and normalize Arabic text.
"""
import json
import re
import sys
from pathlib import Path

# Add project root directory to sys.path (3 levels up)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from pypdf import PdfReader
from config import (
    RAW_DATA_DIR,
    PROCESSED_DATA_DIR,
    SOURCES_MANIFEST_PATH,
    MAX_TOC_DOT_RATIO,
)


def is_table_of_contents_page(text: str) -> bool:
    """Identify and filter out table of contents (ToC) pages with repetitive dots."""
    if not text:
        return False
    dot_count = text.count(".") + text.count("…")
    dot_ratio = dot_count / max(len(text), 1)
    has_long_dots = bool(re.search(r"\.{4,}", text))
    return dot_ratio >= MAX_TOC_DOT_RATIO or has_long_dots


def normalize_arabic(text: str) -> str:
    """Normalize Arabic characters and clean spaces while preserving paragraph breaks."""
    if not text:
        return ""

    text = re.sub(r"[إأآٱ]", "ا", text)
    text = re.sub(r"ى", "ي", text)
    text = re.sub(r"[\u064B-\u0652]", "", text)  # Remove diacritics
    text = re.sub(r"ـ+", "", text)              # Remove tatweel
    text = re.sub(r"[ \t]+", " ", text)          # Normalize horizontal spaces
    text = re.sub(r"\n\s*\n", "\n\n", text)      # Collapse multiple blank lines

    return text.strip()


def extract_pages_from_pdf(pdf_path: Path) -> list[dict]:
    """Extract page-by-page text, tracking page numbers and excluding ToC pages with error handling."""
    if not pdf_path.exists():
        print(f"⚠️ File not found: {pdf_path.name}")
        return []

    extracted_pages = []

    try:
        reader = PdfReader(pdf_path)
        for idx, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""

            if is_table_of_contents_page(raw_text):
                print(f"  🛑 Skipped page {idx} from {pdf_path.name} (ToC/dotted page).")
                continue

            cleaned_text = normalize_arabic(raw_text)
            if cleaned_text:
                extracted_pages.append({
                    "page_number": idx,
                    "text": cleaned_text
                })
    except Exception as e:
        print(f"❌ Error reading file {pdf_path.name}: {e}")

    return extracted_pages


def main():
    if not SOURCES_MANIFEST_PATH.exists():
        raise FileNotFoundError(f"❌ Sources manifest file not found: {SOURCES_MANIFEST_PATH}")

    with open(SOURCES_MANIFEST_PATH, "r", encoding="utf-8") as f:
        sources = json.load(f)

    all_processed_docs = []

    print(f"🚀 Starting extraction and cleaning for {len(sources)} documents using config.py settings...\n")

    for source in sources:
        file_name = source["file_name"]
        pdf_path = RAW_DATA_DIR / file_name

        print(f"📄 Processing: {file_name}")
        pages_data = extract_pages_from_pdf(pdf_path)
        full_text = "\n\n".join([p["text"] for p in pages_data])

        doc_payload = {
            "doc_id": source["doc_id"],
            "file_name": file_name,
            "title": source["title"],
            "category": source["category"],
            "source_url": source["source_url"],
            "retrieved_at": source.get("retrieved_at", "2026-09-22"),
            "pages": pages_data,
            "full_text": full_text,
            "char_count": len(full_text),
        }

        all_processed_docs.append(doc_payload)

    # Save master processed documents file only (cleaned & standardized)
    master_file_path = PROCESSED_DATA_DIR / "cleaned_documents.json"
    with open(master_file_path, "w", encoding="utf-8") as f:
        json.dump(all_processed_docs, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Extraction and cleaning completed successfully in: {PROCESSED_DATA_DIR}")


if __name__ == "__main__":
    main()