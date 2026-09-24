import streamlit as st
import datetime

# ---------------------------------------------------------
# Mock Regulatory Q&A Function
# ---------------------------------------------------------
def answer_question(prompt: str) -> dict:
    """
    Mock regulatory retrieval engine for Elmergib University Bylaws
    (Libyan Universities Decree 501/2010 & Campus Regulations).
    """
    p_lower = prompt.lower().strip()
    
    # Scope Boundary / Abstention detection (non-academic, parking, facilities, etc.)
    out_of_scope_keywords = ["parking", "car", "permit", "decal", "traffic", "cafeteria", "hostel", "dorm", "موقف", "سيارات", "سكن"]
    if any(kw in p_lower for kw in out_of_scope_keywords):
        return {
            "abstained": True,
            "answer": (
                "The available official Elmergib University statutory corpus does not contain regulatory provisions "
                "addressing vehicle registrations, parking permits, or traffic decal fees. "
                "This assistant is strictly bounded to the academic regulations and exam bylaws (Decree 501/2010)."
            ),
            "arabic_note": (
                "تنبيه حدود الاختصاص: هذا المساعد مخصص حصرياً للوائح الدراسة والامتحانات والترقيات والجزاءات الأكاديمية "
                "الصادرة عن وزارة التعليم العالي وجامعة المرقب. شؤون المواقف والخدمات العامة ليست مشمولة في قاعدة المعرفة المعتمدة."
            ),
            "suggested_office": "إدارة الشؤون العامة والخدمات بالجامعة — General Facilities & Campus Security (Al-Khums Campus)",
            "citation": None
        }
    
    # Academic Probation inquiry
    if any(kw in p_lower for kw in ["probation", "إنذار", "انذار", "gpa", "معدل", "معدلي"]):
        return {
            "abstained": False,
            "answer": (
                "وفقاً للمادة (14) من لائحة تنظيم التعليم العالي بالجامعات الليبية (القرار 501 لسنة 2010م):\n\n"
                "1. **المعدل التراكمي:** يوضع الطالب تحت الإنذار الأكاديمي إذا انخفض معدله التراكمي العام عن **2.00 من 4.00** (أو ما يعادل تقدير مقبول / 50%).\n"
                "2. **المهلة القانونية للتعديل:** يُمنح الطالب مهلة أقصاها **فصلان دراسيان اعتياديان متتاليان** لرفع معدله التراكمي وإلغاء حالة الإنذار.\n"
                "3. **فصل الصيف:** لا يُحتسب الفصل الدراسي الصيفي ضمن مدة فصلي الإنذار، لكن يجوز للطالب التسجيل فيه لتحسين المعدل.\n"
                "4. **التبعات عند عدم المعالجة:** إذا انقضت المهلة دون رفع المعدل، يُحال ملف الطالب إلى مجلس الكلية للنظر في فصله أكاديمياً أو إعطائه فرصة استثنائية أخيرة وفق المادة 15."
            ),
            "citation": {
                "source_title": "لائحة الدراسة والامتحانات والتأديب بالجامعات الليبية (القرار 501 لسنة 2010م)",
                "source_url": "https://elmergib.edu.ly/regulations/libyan-universities-bylaw-501.pdf#page=14",
                "retrieval_date": datetime.date.today().strftime("%B %d, %Y"),
                "source_text": (
                    "«مادة (14): الإنذار والفصل الأكاديمي — يوضع الطالب تحت الإنذار الأكاديمي إذا تدنى معدله التراكمي العام عن "
                    "(2.00) نقطتين من أصل أربع نقاط، ولا يجوز بقاء الطالب تحت الإنذار لأكثر من فصلين دراسيين اعتياديين متتاليين. "
                    "ويُستثنى من ذلك الفصل الصيفي الذي يُعد فصلاً تكميلياً لرفع المعدل.»"
                )
            }
        }
    
    # Leave of absence / Suspension
    if any(kw in p_lower for kw in ["leave", "absence", "إيقاف", "ايقاف", "قيد", "وقف"]):
        return {
            "abstained": False,
            "answer": (
                "وفقاً للمادة (21) من لائحة الدراسة بالجامعات الليبية:\n\n"
                "1. **شروط إيقاف القيد:** يجوز للطالب التقدم بطلب إيقاف القيد قبل بدء الامتحانات النصفية أو خلال أول شهر من انطلاق الفصل الدراسي بطلب رسمي ومسوغات مقبولة.\n"
                "2. **الحد الأقصى للإيقاف:** لا يجوز أن تزيد فترات إيقاف القيد عن فصلين دراسيين متتاليين أو أربعة فصول غير متتالية طيلة مدة دراسته.\n"
                "3. **استئناف الدراسة:** يتعين على الطالب تجديد قيده قبل بداية الفصل الذي يلي مدة الإيقاف مباشرة."
            ),
            "citation": {
                "source_title": "لائحة الدراسة والامتحانات والتأديب بالجامعات الليبية — المادة 21",
                "source_url": "https://elmergib.edu.ly/regulations/libyan-universities-bylaw-501.pdf#page=21",
                "retrieval_date": datetime.date.today().strftime("%B %d, %Y"),
                "source_text": (
                    "«مادة (21): إيقاف القيد — يحق للطالب بموافقة عميد الكلية ومسجل الكلية إيقاف قيده لفترة لا تتجاوز فصليين دراسيين، "
                    "بشرط تقديم عذر قهري يثبت قبل حلول الامتحانات النصفية للفصل الدراسي المعني.»"
                )
            }
        }
        
    # Default academic response
    return {
        "abstained": False,
        "answer": (
            f"Regulatory Inquiry: '{prompt}'\n\n"
            "This query has been matched against the Elmergib University statutory repository and Decree 501/2010. "
            "All procedures follow the standard semester credit-hour evaluation system. "
            "Please cross-verify specific graduation checklists or faculty council resolutions with the departmental registrar."
        ),
        "citation": {
            "source_title": "Elmergib University Regulatory Corpus — Decree 501 (2010)",
            "source_url": "https://elmergib.edu.ly/regulations/academic-handbook-2024.pdf",
            "retrieval_date": datetime.date.today().strftime("%B %d, %Y"),
            "source_text": "«General Administrative Clause: Official transcripts and degree audit verifications must be countersigned by the University Admissions & Registration Directorate.»"
        }
    }


# ---------------------------------------------------------
# Page Configuration & Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="Elmergib Smart Assistant 🎓",
    page_icon="🎓",
    layout="wide"
)

# 100% Local Privacy CSS Injection (Zero External Fonts or CDNs)
st.markdown(
    """
    <style>
    /* System font stack for local privacy */
    html, body, [class*="css"] {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #0b1c30;
        color: #f8f9ff;
    }
    section[data-testid="stSidebar"] * {
        color: #e5eeff;
    }
    section[data-testid="stSidebar"] hr {
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    /* Chat Message Bubbles */
    div[data-testid="stChatMessage"] {
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 2px 8px rgba(11, 28, 48, 0.05);
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        line-height: 1.65;
    }
    
    /* User Message Visual Distinction */
    div[data-testid="stChatMessage"]:has(div[aria-label="Chat message from user"]) {
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
    }

    /* Scope Boundary / Abstention Card */
    .abstention-card {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        border-left: 5px solid #ba1a1a;
        border-radius: 10px;
        padding: 1.1rem 1.3rem;
        margin: 0.75rem 0;
        color: #7f1d1d;
    }
    .abstention-card h4 {
        margin: 0 0 0.5rem 0;
        color: #991b1b;
        font-size: 1.05rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .abstention-card p {
        margin: 0.35rem 0;
        font-size: 0.95rem;
        line-height: 1.55;
    }
    .abstention-badge {
        display: inline-block;
        background-color: #fee2e2;
        color: #991b1b;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        font-family: monospace;
    }
    .abstention-referral {
        margin-top: 0.75rem;
        padding-top: 0.6rem;
        border-top: 1px dashed #fca5a5;
        font-size: 0.88rem;
        color: #374151;
    }

    /* Citation blockquote styling */
    blockquote.citation-quote {
        margin: 0.75rem 0 0.5rem 0;
        padding: 0.75rem 1rem;
        background-color: #f8fafc;
        border-left: 4px solid #00236f;
        border-radius: 6px;
        font-style: italic;
        color: #1e293b;
        line-height: 1.6;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ---------------------------------------------------------
# Sidebar: Institutional Context & Reference
# ---------------------------------------------------------
with st.sidebar:
    st.markdown("### 🏛️ جامعة المرقب")
    st.markdown("**Elmergib University**")
    st.caption("Official Regulations & Academic Guidance System")
    st.markdown("---")
    
    st.markdown("#### 📚 Regulatory Corpus")
    st.markdown("- **Decree 501 (2010):** National Higher Education Bylaws")
    st.markdown("- **Faculty Handbook:** Edition 2023/2024")
    st.markdown("- **Jurisdiction:** Al-Khums & Affiliated Campuses")
    st.markdown("- **Mode:** Grounded Regulatory Citation Only")
    
    st.markdown("---")
    st.markdown("#### 🔒 Privacy & Compliance")
    st.caption("100% Local Inference Guarantee. No cloud telemetry or third-party vector ingestion.")
    
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

# ---------------------------------------------------------
# Permanent Research Disclaimer Banner
# ---------------------------------------------------------
st.warning("⚠️ Disclaimer: This prototype is an informational research proof-of-concept. It is not an official university decision channel.")

# ---------------------------------------------------------
# Header Layout: Title on Left, Export LaTeX on Right
# ---------------------------------------------------------
col_title, col_export = st.columns([4, 1])

with col_title:
    st.title("Elmergib Smart Assistant 🎓")
    st.caption("المساعد الذكي للوائح وأنظمة جامعة المرقب | Official Academic Inquiry Engine")

# LaTeX Export Helper
def generate_latex_transcript(messages):
    tex = [
        r"\documentclass[11pt,a4paper]{article}",
        r"\usepackage[utf8]{inputenc}",
        r"\usepackage{geometry}",
        r"\geometry{margin=1in}",
        r"\usepackage{xcolor}",
        r"\usepackage{hyperref}",
        r"\title{\textbf{Elmergib Smart Assistant Transcript}}",
        r"\author{Academic Regulations Guidance System}",
        rf"\date{{{datetime.date.today().strftime('%B %d, %Y')}}}",
        r"\begin{document}",
        r"\maketitle",
        r"\section*{Disclaimer}",
        r"\textit{This prototype transcript is an informational research proof-of-concept and does not constitute a legally binding administrative decision by Elmergib University.}",
        r"\vspace{1em}",
        r"\section*{Dialogue Record}"
    ]
    for msg in messages:
        role = "Student Query" if msg["role"] == "user" else "Elmergib Regulatory AI"
        safe_content = (
            msg["content"]
            .replace("\\", "\\textbackslash ")
            .replace("_", "\\_")
            .replace("%", "\\%")
            .replace("$", "\\$")
            .replace("#", "\\#")
            .replace("&", "\\&")
        )
        tex.append(rf"\subsection*{{{role}}}")
        tex.append(f"{safe_content}")
        tex.append(r"\vspace{0.5em}")
        
    tex.append(r"\end{document}")
    return "\n".join(tex)

with col_export:
    st.write("") # vertical spacing alignment
    current_messages = st.session_state.get("messages", [])
    latex_data = generate_latex_transcript(current_messages)
    st.download_button(
        label="📥 Export LaTeX",
        data=latex_data,
        file_name="elmergib_academic_transcript.tex",
        mime="application/x-tex",
        use_container_width=True
    )

# ---------------------------------------------------------
# Chat Session State Initialization
# ---------------------------------------------------------
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "مرحباً بكم في المساعد الذكي لجامعة المرقب 🏛️\n\n"
                "أهلاً بكم أعزائي الطلاب وأعضاء الهيئة التدريسية. يُقدم هذا النظام استرجاعاً وتلخيصاً موثقاً لمواد "
                "**لائحة تنظيم التعليم العالي والامتحانات بالجامعات الليبية (القرار رقم 501 لسنة 2010م)** "
                "واللوائح الداخلية المعتمدة للكليات.\n\n"
                "Welcome to the Elmergib University Regulatory Assistant. Feel free to inquire about academic probation, "
                "grading scales, progression requirements, or leave of absence."
            ),
            "response_data": None
        }
    ]

# ---------------------------------------------------------
# Chat Interface: Loop Through Messages
# ---------------------------------------------------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        
        # Check if assistant response metadata is present
        resp_data = msg.get("response_data")
        if resp_data:
            # Case 1: The "Abstention" Card (out of scope boundary)
            if resp_data.get("abstained") is True:
                card_html = f"""
                <div class="abstention-card">
                    <span class="abstention-badge">ERR_SCOPE_BOUNDARY</span>
                    <h4>🚫 Scope Boundary: Query Outside Regulation Scope</h4>
                    <p><strong>Official Limitation:</strong> {resp_data.get('answer')}</p>
                    <p dir="rtl" style="margin-top: 6px;">{resp_data.get('arabic_note', '')}</p>
                    <div class="abstention-referral">
                        <strong>📌 Recommended Authority:</strong> {resp_data.get('suggested_office', 'General University Administration')}
                    </div>
                </div>
                """
                st.markdown(card_html, unsafe_allow_html=True)
                
            # Case 2: Successful Answer with Citation Expander
            elif resp_data.get("citation"):
                cit = resp_data["citation"]
                with st.expander("📌 View Source Citation", expanded=False):
                    st.markdown(f"**Document Title:** {cit.get('source_title', 'N/A')}")
                    st.markdown(f"**Source URL:** [{cit.get('source_url', '#')}]({cit.get('source_url', '#')})")
                    st.markdown(f"**Retrieval Date:** `{cit.get('retrieval_date', 'N/A')}`")
                    st.markdown(f'<blockquote class="citation-quote">{cit.get("source_text", "")}</blockquote>', unsafe_allow_html=True)

# ---------------------------------------------------------
# Chat Input & Response Generation Loop
# ---------------------------------------------------------
if user_prompt := st.chat_input("Ask about university bylaws, grading scales, graduation requirements... | اسأل عن اللوائح"):
    # 1. Render user message
    with st.chat_message("user"):
        st.markdown(user_prompt)
    st.session_state.messages.append({
        "role": "user",
        "content": user_prompt,
        "response_data": None
    })
    
    # 2. Compute response from answer_question()
    result = answer_question(user_prompt)
    
    # 3. Render AI response
    with st.chat_message("assistant"):
        st.markdown(result["answer"])
        
        if result.get("abstained") is True:
            card_html = f"""
            <div class="abstention-card">
                <span class="abstention-badge">ERR_SCOPE_BOUNDARY</span>
                <h4>🚫 Scope Boundary: Query Outside Regulation Scope</h4>
                <p><strong>Official Limitation:</strong> {result.get('answer')}</p>
                <p dir="rtl" style="margin-top: 6px;">{result.get('arabic_note', '')}</p>
                <div class="abstention-referral">
                    <strong>📌 Recommended Authority:</strong> {result.get('suggested_office', 'General University Administration')}
                </div>
            </div>
            """
            st.markdown(card_html, unsafe_allow_html=True)
            
        elif result.get("citation"):
            cit = result["citation"]
            with st.expander("📌 View Source Citation", expanded=False):
                st.markdown(f"**Document Title:** {cit.get('source_title', 'N/A')}")
                st.markdown(f"**Source URL:** [{cit.get('source_url', '#')}]({cit.get('source_url', '#')})")
                st.markdown(f"**Retrieval Date:** `{cit.get('retrieval_date', 'N/A')}`")
                st.markdown(f'<blockquote class="citation-quote">{cit.get("source_text", "")}</blockquote>', unsafe_allow_html=True)
                
    st.session_state.messages.append({
        "role": "assistant",
        "content": result["answer"],
        "response_data": result
    })
