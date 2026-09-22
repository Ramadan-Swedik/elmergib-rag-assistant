import json
import re
import sys
from pathlib import Path

# إضافة مجلد الجذر الرئيسي لبيئة بايثون لمنع أخطاء الاستيراد
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import (
    PROCESSED_DATA_DIR,
    CHUNKS_JSON_PATH,
    TARGET_CHUNK_SIZE,
    CHUNK_OVERLAP,
)


def split_into_sentences(text: str) -> list[str]:
    """تقسيم النص إلى جمل بناءً على علامات الترقيم وفواصل الأسطر"""
    sentences = re.split(r"(?<=[.!?؟\n])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def create_chunks_from_pages(doc: dict) -> list[dict]:
    """تقطيع المستند بحسب أرقام الصفحات وحدود الجمل مع تتبع الميتا-داتا"""
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

            # عند تجاوز الحجم المستهدف (TARGET_CHUNK_SIZE = 500)
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

                # إبقاء جزء متداخل للحفاظ على السياق (CHUNK_OVERLAP = 100)
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

        # إضافة المقطع الأخير المتبقي في الصفحة
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
        raise FileNotFoundError(f"ملف النصوص المعالجة غير موجود: {master_file}")

    with open(master_file, "r", encoding="utf-8") as f:
        documents = json.load(f)

    all_chunks = []
    print(f"🚀 بدء تقطيع {len(documents)} مستند معالج...\n")

    for doc in documents:
        chunks = create_chunks_from_pages(doc)
        all_chunks.extend(chunks)
        print(f"  🧩 {doc['doc_id']}: تم توليد {len(chunks)} مقطع.")

    with open(CHUNKS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

    print(f"\n✅ اكتمل التقطيع بنجاح! إجمالي المقاطع: {len(all_chunks)}")
    print(f"📁 تم حفظ المقاطع في: {CHUNKS_JSON_PATH}")


if __name__ == "__main__":
    main()