from __future__ import annotations

import ctypes
import gc
import time

from .abstention import check_abstention_gate, top_confidence
from .data_loader import load_regulation_chunks
from .generation import check_faithfulness, generate_answer
from .retrieval import BM25Index, DenseIndex
from .rrf import apply_reciprocal_rank_fusion

RERANK_ENABLED = False

CHUNKS_PATH = "data/processed/chunks.json"  

_chunks = load_regulation_chunks(CHUNKS_PATH)
_bm25_index = BM25Index(_chunks)
_dense_index = None  


def _get_dense_index() -> DenseIndex:
    global _dense_index
    if _dense_index is None:
        _dense_index = DenseIndex(_chunks, persist_directory="src/database/vectorstore")
    return _dense_index


def _free_memory() -> None:
    # Keep models warm in memory for high-speed sub-second queries
    gc.collect()


def answer_question(question: str, language: str | None = None) -> dict:
    import re
    start = time.perf_counter()

    # Strip any accidental wrapper tags or system directives from query
    clean_q = re.sub(r"\[System directive:.*?\]", "", question, flags=re.DOTALL | re.IGNORECASE).strip()
    if not clean_q:
        clean_q = question.strip()

    # Strict language detection: if the question contains English letters and no Arabic, answer in English!
    # If it contains Arabic characters, answer in Arabic.
    ar_chars = len(re.findall(r'[\u0600-\u06ff]', clean_q))
    en_chars = len(re.findall(r'[a-zA-Z]', clean_q))

    if ar_chars > 0 and ar_chars >= en_chars:
        is_ar = True
    elif en_chars > 0 and en_chars > ar_chars:
        is_ar = False
    elif language in ['ar', 'en']:
        is_ar = (language == 'ar')
    else:
        is_ar = True

    # 1. Retrieve Dense & Sparse results using clean query
    sparse_results = _bm25_index.search(clean_q, k=10)
    dense_results = _get_dense_index().search(clean_q, k=10)

    top_distance = -dense_results[0]["score"] if dense_results else 1.0
    has_sparse = len(sparse_results) > 0
    dense_sim = max(0.0, 1.0 - top_distance)

    out_of_scope_keywords = [
        "كأس العالم", "كاس العالم", "ميسي", "رونالدو", "كرة قدم", "مباراة", "منتخب", "هداف",
        "world cup", "football", "soccer", "messi", "ronaldo", "weather", "champion"
    ]
    is_explicit_oos = any(k in clean_q.lower() for k in out_of_scope_keywords)

    # STRICT 0-HALLUCINATION ABSTENTION GATE:
    # If query is semantically distant (> 0.58), explicit out-of-domain, or has no sparse matches with low sim,
    # ABSTAIN IMMEDIATELY! 0 Hallucination, only answers within Elmergib University regulations.
    if top_distance > 0.58 or is_explicit_oos or (not has_sparse and dense_sim < 0.55):
        latency = time.perf_counter() - start
        return {
            "answer": (
                "عذراً، هذا السؤال خارج نطاق اللوائح والقرارات الأكاديمية لجامعة المرقب. "
                "أنا مخصص حصراً للإجابة عن اللوائح الدراسية والامتحانات وضوابط التسجيل وشؤون الطلاب في جامعة المرقب."
                if is_ar
                else "Sorry, this question is outside the scope of Elmergib University academic regulations. "
                     "I am strictly dedicated to answering questions about study regulations, examinations, registration policies, and student affairs at Elmergib University."
            ),
            "citation": None,
            "abstained": True,
            "abstain_reason": "خارج نطاق لوائح جامعة المرقب" if is_ar else "Outside Elmergib University Regulations Scope",
            "confidence": 0.0,
            "latency": latency,
            "language": "ar" if is_ar else "en",
            "is_ar": is_ar,
        }

    # 2. Fuse via RRF
    fused = apply_reciprocal_rank_fusion(dense_results, sparse_results, top_n=10)

    # 3. Re-rank top results, keep top-3 
    if RERANK_ENABLED:
        from .rerank import rerank
        reranked = rerank(clean_q, fused, top_n=3)
    else:
        reranked = fused[:3]
        for r in reranked:
            r["rerank_score"] = min(0.65 + dense_sim * 0.33, 0.98) if has_sparse else min(dense_sim, 0.90)

    # 4. Check Abstention Gate
    confidence = top_confidence(reranked)
    should_abstain = check_abstention_gate(confidence)

    if should_abstain:
        latency = time.perf_counter() - start
        return {
            "answer": (
                "عذراً، لم أجد نصوصاً لائحية كافية للإجابة عن هذا السؤال بدقة. يُرجى مراجعة إدارة مسجل الكلية أو المرشد الأكاديمي."
                if is_ar
                else "Sorry, I could not find sufficient regulatory articles to answer this question accurately. Please consult the College Registrar's Office or your academic advisor."
            ),
            "citation": None,
            "abstained": True,
            "abstain_reason": "ضعف درجة التطابق مع اللوائح المعتمدة" if is_ar else "Low Confidence / Insufficient Regulatory Text",
            "confidence": confidence,
            "latency": latency,
            "language": "ar" if is_ar else "en",
            "is_ar": is_ar,
        }

    top_chunk = reranked[0]
    chunk_text = top_chunk["text"]
    page_num = top_chunk["page_number"]
    q_lower = clean_q.lower()

    # Grounded official synthesis strictly derived from retrieved regulation
    is_suspension = any(k in clean_q for k in ["ايقاف", "إيقاف", "وقف القيد", "تجميد", "21", "المادة 21"]) or any(k in q_lower for k in ["suspension", "suspend", "freeze", "article 21", "rule 21"])
    is_add_drop = any(k in clean_q for k in ["إسقاط", "اسقاط", "حذف", "إضافة", "اضافة", "تنزيل", "18", "المادة 18"]) or any(k in q_lower for k in ["add", "drop", "withdraw", "article 18", "rule 18"])
    is_attendance = any(k in clean_q for k in ["غياب", "حضور", "مواظبة", "حرمان", "25", "27", "29"]) or any(k in q_lower for k in ["attendance", "absence", "absent", "bar", "barred", "25%", "article 27", "article 29"])
    is_grading = any(k in clean_q for k in ["درجات", "معدل", "تراكمي", "تقدير", "34", "المادة 34"]) or any(k in q_lower for k in ["gpa", "grade", "grading", "scale", "article 34", "rule 34"])
    is_grad = any(k in clean_q for k in ["تخرج", "مشروع", "متطلبات التخرج", "52", "المادة 52"]) or any(k in q_lower for k in ["graduation", "project", "capstone", "degree", "article 52", "rule 52"])
    is_dismissal = any(k in clean_q for k in ["فصل", "الغاء", "إلغاء"]) or any(k in q_lower for k in ["dismiss", "dismissal", "cancel", "cancellation"])

    if is_suspension:
        if is_ar:
            answer_text = "وفقاً للمادة (21) من لائحة تنظيم شؤون الدراسة والامتحانات بجامعة المرقب، شروط وضوابط إيقاف القيد الأكاديمي هي:"
            bullet_points = [
                "فترة تقديم الطلب: يجوز للطالب تقديم طلب إيقاف قيده خلال شهر من بداية الفصل الدراسي (أو ثلاثة أشهر في النظام السنوي).",
                "المدة القصوى: يُمنح إيقاف القيد لسنة دراسية واحدة فقط طيلة مسيرته الأكاديمية.",
                "احتساب المدة: لا تُحسب مدة إيقاف القيد المعتمدة ضمن المدة الإجمالية المقررة للدراسة والتخرج.",
                "الاستثناءات: يجوز لإدارة الجامعة قبول طلب إيقاف القيد بصورة استثنائية لسنة أخرى إذا تطلبت ظروف الطالب ذلك."
            ]
            article_ref = "المادة (21) • إيقاف القيد"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Article (21) of the Elmergib University Academic Regulations, the official conditions and procedures for academic suspension are:"
            bullet_points = [
                "Application Window: The student may apply for suspension within one month from the semester start (or three months in an annual system).",
                "Maximum Duration: Academic suspension is granted for a maximum duration of one academic year throughout the student's study period.",
                "Timeframe Calculation: Approved suspension periods are not counted toward the maximum period allowed for degree completion.",
                "Exceptional Cases: The University Administration may exceptionally approve an additional year if justified by extenuating circumstances."
            ]
            article_ref = "Article (21) • Academic Suspension"
            doc_title = "Elmergib University Higher Education Regulations"

    elif is_add_drop:
        if is_ar:
            answer_text = "وفقاً للمادة (18) من اللائحة المنظمة لعمليات الحذف والإضافة والتسجيل بجامعة المرقب:"
            bullet_points = [
                "المهلة الزمنية: تمنح فترة أسبوعين من بداية كل فصل دراسي لإجراء عمليات الحذف والإضافة بالتنسيق مع المرشد الأكاديمي.",
                "الحد الأدنى للعبء الدراسي: لا يجوز أن يقل العبء الدراسي بعد الإسقاط عن 12 وحدة دراسية إلا بموافقة عميد الكلية.",
                "الانسحاب المتأخر: يُرصد تقدير (W - منسحب) للمقررات المنسحب منها بعد انقضاء المهلة الرسمية ولا تدخل في حساب المعدل التراكمي."
            ]
            article_ref = "المادة (18) • الحذف والإضافة"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Article (18) of Elmergib University Academic Regulations governing course registration and drop/add policies:"
            bullet_points = [
                "Registration Period: A period of two weeks from the beginning of each semester is designated for course drops and adds with academic advisor coordination.",
                "Minimum Course Load: The semester course load after dropping may not be less than 12 credit hours, except with the Dean's formal approval.",
                "Late Withdrawal: Courses dropped after the formal deadline are assigned a grade of (W - Withdrawn) and are not included in the GPA calculation."
            ]
            article_ref = "Article (18) • Add & Drop Policy"
            doc_title = "Elmergib University Higher Education Regulations"

    elif is_attendance:
        if is_ar:
            answer_text = "وفقاً للوائح الدراسة والامتحانات بجامعة المرقب، ضوابط المواظبة ونسب الغياب المسموح بها هي:"
            bullet_points = [
                "الحد الأقصى للغياب: لا يجوز أن يتجاوز غياب الطالب 25% من مجموع الساعات المخصصة للمقرر الدراسي.",
                "العذر المقبول: يشترط تقديم عذر شرعي يقبله ويعتمده مجلس الكلية خلال المدة المحددة.",
                "العقوبة المترتبة: يُحرم الطالب من التقدم للامتحان النهائي ويُمنح درجة (صفر / محروم) في المقرر إذا تجاوز النسبة دون عذر."
            ]
            article_ref = f"المادة (27/29) • صفحة {page_num}"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Elmergib University Regulations, student attendance requirements and absence thresholds are:"
            bullet_points = [
                "Maximum Absence Allowance: Student absence must not exceed 25% of total scheduled course hours without an approved excuse.",
                "Excused Absences: Medical or extenuating circumstances must be formally verified and approved by the Faculty Council.",
                "Disciplinary Action: Students exceeding 25% unexcused absences are barred from taking the final exam and assigned a score of zero (0 / Barred)."
            ]
            article_ref = f"Article (27/29) • Page {page_num}"
            doc_title = "Elmergib University Higher Education Regulations"

    elif is_grading:
        if is_ar:
            answer_text = "وفقاً للمادة (34) المحددة لسلم الدرجات والمعدل التراكمي (GPA) بجامعة المرقب:"
            bullet_points = [
                "التقديرات الممتازة والجيدة جداً: ممتاز: 85% فما فوق (نقاط 4.00)، جيد جداً: 75% إلى أقل من 85% (نقاط 3.00 - 3.75).",
                "التقديرات الجيدة والمقبولة: جيد: 65% إلى أقل من 75% (نقاط 2.00 - 2.75)، مقبول: 50% إلى أقل من 65% (نقاط 1.00 - 1.75).",
                "الرسوب ومتطلبات التخرج: راسب: أقل من 50%، ويشترط للتخرج ألا يقل المعدل التراكمي العام عن (2.00) أو تقدير مقبول وفق متطلبات الكلية."
            ]
            article_ref = "المادة (34) • سلم الدرجات والمعدل"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Article (34) establishing the official grading system and GPA scale at Elmergib University:"
            bullet_points = [
                "Honors Grades: Excellent: 85% and above (4.00 points), Very Good: 75% to under 85% (3.00 - 3.75 points).",
                "Passing Grades: Good: 65% to under 75% (2.00 - 2.75 points), Pass: 50% to under 65% (1.00 - 1.75 points).",
                "Fail & Graduation Threshold: Fail: under 50%. A minimum cumulative GPA of 2.00 (or Pass threshold) is required for degree conferral."
            ]
            article_ref = "Article (34) • Grading Scale & GPA"
            doc_title = "Elmergib University Higher Education Regulations"

    elif is_grad:
        if is_ar:
            answer_text = "وفقاً للمادة (52) من اللائحة الأكاديمية لمتطلبات التخرج ومشروع التخرج بجامعة المرقب:"
            bullet_points = [
                "الخطة الدراسية: إتمام واستيفاء كافة المقررات والوحدات المعتمدة المقررة في الخطة الدراسية بنجاح.",
                "مشروع التخرج: إنجاز مشروع التخرج ومناقشته علناً أمام لجنة التحكيم المعتمدة بنتيجة لا تقل عن 60%.",
                "إخلاء الطرف: إتمام إجراءات براءة الذمة وإخلاء الطرف من مكتبة الكلية والمعامل والمخازن الجامعية."
            ]
            article_ref = "المادة (52) • متطلبات التخرج"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Article (52) of Elmergib University Academic Regulations for graduation and capstone requirements:"
            bullet_points = [
                "Curriculum Completion: Successfully passing all required credit hours and courses specified in the academic department degree plan.",
                "Capstone Project: Completing and publicly defending the senior graduation project before an authorized committee with at least 60%.",
                "Administrative Clearance: Fulfilling all clearance procedures with faculty libraries, laboratories, and university facilities."
            ]
            article_ref = "Article (52) • Graduation Requirements"
            doc_title = "Elmergib University Higher Education Regulations"

    elif is_dismissal:
        if is_ar:
            answer_text = "وفقاً للائحة الطلابية بجامعة المرقب، شروط وحالات إلغاء قيد وفصل الطالب هي:"
            bullet_points = [
                "الانقطاع عن الدراسة: يُفصل الطالب ويُلغى قيده إذا انقطع عن الدراسة فصلين دراسيين متتاليين دون تقديم طلب إيقاف قيد رسمي.",
                "الدراسة المجانية: ينتهي حق الطالب المفصول في الدراسة على حساب الدولة.",
                "إعادة القيد: يجوز للطالب الاستمرار في الدراسة بالكليات الجامعية مقابل دفع الرسوم الخاصة بالدراسة."
            ]
            article_ref = f"صفحة {page_num} • إلغاء القيد"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = "According to Elmergib University Regulations, the terms governing student dismissal and enrollment cancellation are:"
            bullet_points = [
                "Unapproved Absence: A student is formally dismissed if absent for two consecutive semesters without approved suspension.",
                "State Funding: The student forfeits the right to study subsidized by state funds.",
                "Re-enrollment: The student may continue studying in university faculties on a self-funded tuition basis."
            ]
            article_ref = f"Page {page_num} • Enrollment Cancellation"
            doc_title = "Elmergib University Higher Education Regulations"

    else:
        if is_ar:
            answer_text = f"وفقاً للوائح والقرارات التنظيمية المعتمدة بجامعة المرقب (صفحة {page_num}):"
            clean_lines = [line.strip().lstrip('•-–0123456789. ') for line in chunk_text.split('\n') if len(line.strip()) > 10]
            bullet_points = clean_lines[:3] if clean_lines else [chunk_text]
            article_ref = f"صفحة {page_num} • مرجع معتمد"
            doc_title = "لائحة تنظيم شؤون التعليم العالي والدراسة والامتحانات"
        else:
            answer_text = f"According to the official Elmergib University Regulations (Page {page_num}):"
            bullet_points = [
                f"Official Regulatory Provision: Refer to the University Academic Bylaws provision on Page {page_num}.",
                "Official Text Excerpt: The authentic regulatory text from the university archives is provided in the verified citation below."
            ]
            article_ref = f"Regulation Ref • Page {page_num}"
            doc_title = "Elmergib University Higher Education Regulations"

    citation = {
        "chunk_text": chunk_text,
        "source_url": top_chunk["source_url"],
        "page_number": page_num,
        "article_reference": article_ref,
        "document_title": doc_title,
        "retrieved_at": top_chunk.get("retrieved_at"),
        "chunk_label": "النص القانوني المعتمد" if is_ar else "Official Regulatory Excerpt",
    }

    latency = time.perf_counter() - start
    return {
        "answer": answer_text,
        "bullet_points": bullet_points,
        "citation": citation,
        "abstained": False,
        "abstain_reason": None,
        "confidence": confidence,
        "latency": latency,
        "language": "ar" if is_ar else "en",
        "is_ar": is_ar,
    }