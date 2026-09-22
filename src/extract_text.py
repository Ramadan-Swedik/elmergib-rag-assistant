import json
import re
import sys
from pathlib import Path

# إضافة مجلد الجذر الرئيسي للمشروع إلى مسارات بايثون لتفادي خطأ ModuleNotFoundError
sys.path.append(str(Path(__file__).resolve().parent.parent))

from pypdf import PdfReader
from config import (
    RAW_DATA_DIR,
    PROCESSED_DATA_DIR,
    SOURCES_MANIFEST_PATH,
    MAX_TOC_DOT_RATIO,
)


def is_table_of_contents_page(text: str) -> bool:
    """تحديد واستبعاد صفحات الفهارس الممتلئة بالنقاط المتكررة (ToC Filter)"""
    if not text:
        return False
    dot_count = text.count(".") + text.count("…")
    dot_ratio = dot_count / max(len(text), 1)
    has_long_dots = bool(re.search(r"\.{4,}", text))
    return dot_ratio >= MAX_TOC_DOT_RATIO or has_long_dots


def normalize_arabic(text: str) -> str:
    """تنظيف وتوحيد أحرف النص العربي مع الحفاظ على فواصل الفقرات"""
    if not text:
        return ""

    text = re.sub(r"[إأآٱ]", "ا", text)
    text = re.sub(r"ى", "ي", text)
    text = re.sub(r"[\u064B-\u0652]", "", text)  # إزالة التشكيل
    text = re.sub(r"ـ+", "", text)              # إزالة التطويل
    text = re.sub(r"[ \t]+", " ", text)          # توحيد المسافات الأفقية فقط
    text = re.sub(r"\n\s*\n", "\n\n", text)      # تقليص الأسطر الفارغة المتكررة

    return text.strip()


def extract_pages_from_pdf(pdf_path: Path) -> list[dict]:
    """استخراج النصوص صفحة بصفحة مع تتبع الأرقام واستبعاد الفهارس مع معالجة الأخطاء"""
    if not pdf_path.exists():
        print(f"⚠️ ملف غير موجود: {pdf_path.name}")
        return []

    extracted_pages = []

    try:
        reader = PdfReader(pdf_path)
        for idx, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""

            if is_table_of_contents_page(raw_text):
                print(f"  🛑 تم استبعاد الصفحة {idx} من {pdf_path.name} (صفحة فهرس/نقاط).")
                continue

            cleaned_text = normalize_arabic(raw_text)
            if cleaned_text:
                extracted_pages.append({
                    "page_number": idx,
                    "text": cleaned_text
                })
    except Exception as e:
        print(f"❌ خطأ أثناء قراءة الملف {pdf_path.name}: {e}")

    return extracted_pages


def main():
    if not SOURCES_MANIFEST_PATH.exists():
        raise FileNotFoundError(f"ملف المصادر غير موجود: {SOURCES_MANIFEST_PATH}")

    with open(SOURCES_MANIFEST_PATH, "r", encoding="utf-8") as f:
        sources = json.load(f)

    all_processed_docs = []

    print(f"🚀 بدء معالجة {len(sources)} مستند باستعمال إعدادات config.py...\n")

    for source in sources:
        file_name = source["file_name"]
        pdf_path = RAW_DATA_DIR / file_name

        print(f"📄 معالجة: {file_name}")
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

        # حفظ المستند المعالج منفصلاً
        single_doc_path = PROCESSED_DATA_DIR / f"{source['doc_id']}.json"
        with open(single_doc_path, "w", encoding="utf-8") as f:
            json.dump(doc_payload, f, ensure_ascii=False, indent=2)

    # حفظ الملف الشامل للمستندات المعالجة
    master_file_path = PROCESSED_DATA_DIR / "cleaned_documents.json"
    with open(master_file_path, "w", encoding="utf-8") as f:
        json.dump(all_processed_docs, f, ensure_ascii=False, indent=2)

    print(f"\n✅ اكتمل الاستخراج والتنظيف بنجاح داخل: {PROCESSED_DATA_DIR}")


if __name__ == "__main__":
    main()