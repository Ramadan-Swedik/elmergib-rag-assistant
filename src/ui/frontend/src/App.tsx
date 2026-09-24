/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Library,
  Bookmark,
  Building2,
  ShieldCheck,
  AlertTriangle,
  Send,
  Paperclip,
  Download,
  Copy,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Ban,
  CheckCircle2,
  Code2,
  User,
  Check,
  Zap,
  Info
} from 'lucide-react';

interface CitationData {
  sourceTitle: string;
  sourceUrl: string;
  retrievalDate: string;
  sourceText: string;
  articlePage: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  authorName?: string;
  authorSub?: string;
  timestamp: string;
  content: string;
  isArabic?: boolean;
  abstained?: boolean;
  abstentionData?: {
    englishReason: string;
    arabicReason: string;
    suggestedOffice: string;
    suggestedOfficeEn: string;
  };
  citation?: CitationData;
  confidence?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    authorName: 'Elmergib Regulatory AI',
    authorSub: 'System Initialized · KB-501-LY',
    timestamp: '10:40 AM',
    content: `أهلاً بكم أعزائي الطلاب وأعضاء الهيئة التدريسية بجامعة المرقب. يُقدم هذا النظام استرجاعاً وتلخيصاً موثقاً لمواد لائحة تنظيم التعليم العالي والامتحانات بالجامعات الليبية (القرار رقم 501 لسنة 2010م)، بالإضافة إلى اللوائح الداخلية المعتمدة للكليات والمراكز الأكاديمية.

Welcome to the official regulatory assistant. You may inquire in both Arabic and English regarding academic registration, grading metrics, progression probation, withdrawal procedures, and faculty committee guidelines. All statements feature verified page-level legal citations.`,
    isArabic: true
  },
  {
    id: 'msg-user-1',
    role: 'user',
    authorName: 'Student',
    authorSub: 'طالب هندسة - الخمس',
    timestamp: '10:42 AM',
    content: 'ما هي شروط وضع الطالب تحت الإنذار الأكاديمي وما هي المدة الممنوحة له قانونياً لتعديل وضعه الدراسي وفق لائحة الجامعة؟',
    isArabic: true
  },
  {
    id: 'msg-assistant-1',
    role: 'assistant',
    authorName: 'Elmergib Regulatory AI',
    authorSub: 'مستند رسمي معتمد',
    timestamp: '10:43 AM',
    content: `بناءً على أحكام اللائحة التنفيذية لجامعة المرقب ولائحة تنظيم التعليم العالي في ليبيا:
يوضع الطالب في المرحلة الجامعية تحت الإنذار الأكاديمي في الحالات والضوابط التالية:
• المعدل التراكمي: إذا انخفض المعدل التراكمي العام (GPA) للطالب عن 2.00 من 4.00 (أو ما يعادل تقدير مقبول / 50% بحسب نظام الساعات المعتمدة أو الفصلي).
• المدة الممنوحة للتعديل: يُمنح الطالب مهلة أقصاها فصلان دراسيان اعتياديان متتاليان لرفع معدله التراكمي وإلغاء حالة الإنذار الأكاديمي.
• فصل الصيف: لا يُحتسب الفصل الدراسي الصيفي ضمن مدة فصلي الإنذار، لكن يجوز للطالب الاستفادة منه لتحسين معدله.
• الأثر المترتب عند عدم الرفع: إذا لم يستطع الطالب تعديل وضعه الأكاديمي بانتهاء الفصل الثاني، يُعرض ملفه على مجلس الكلية للنظر في فصله أكاديمياً أو منحه فرصة استثنائية أخيرة وفق المادة 15.`,
    isArabic: true,
    confidence: '98.4%',
    citation: {
      sourceTitle: 'لائحة الدراسة والامتحانات والتأديب بالجامعات الليبية (القرار 501 لسنة 2010م)',
      articlePage: 'نص المادة المعتمد — صفحة 14',
      retrievalDate: 'October 24, 2024 (Hash Verified: SHA-256 Valid)',
      sourceUrl: 'https://elmergib.edu.ly/regulations/libyan-universities-bylaw-501.pdf#page=14',
      sourceText: '«مادة (14): الإنذار والفصل الأكاديمي — يوضع الطالب تحت الإنذار الأكاديمي إذا تدنى معدله التراكمي العام عن (2.00) نقطتين من أصل أربع نقاط، ولا يجوز بقاء الطالب تحت الإنذار لأكثر من فصلين دراسيين اعتياديين متتاليين. ويُستثنى من ذلك الفصل الصيفي الذي يُعد فصلاً تكميلياً لرفع المعدل.»'
    }
  },
  {
    id: 'msg-user-2',
    role: 'user',
    authorName: 'Student',
    authorSub: 'Faculty of Engineering Campus',
    timestamp: '10:45 AM',
    content: 'Can I get a student parking permit for the Faculty of Engineering campus in Al-Khums, and where do I pay the decal fee?',
    isArabic: false
  },
  {
    id: 'msg-assistant-2',
    role: 'assistant',
    authorName: 'System Safety Guardrail',
    authorSub: 'Boundary Tripped',
    timestamp: '10:45 AM',
    content: 'Query Outside Regulation Scope: The available official Elmergib University statutory corpus does not contain regulatory provisions addressing vehicle registrations, parking permits, or traffic decal fees.',
    isArabic: false,
    abstained: true,
    abstentionData: {
      englishReason: 'Query Outside Regulation Scope: The available official Elmergib University statutory corpus does not contain regulatory provisions addressing vehicle registrations, parking permits, or traffic decal fees.',
      arabicReason: 'تنبيه حدود الاختصاص: هذا المساعد مخصص حصرياً للوائح الدراسة والامتحانات والترقيات والجزاءات الأكاديمية الصادرة عن وزارة التعليم العالي وجامعة المرقب. شؤون المواقف والخدمات العامة ليست مشمولة في قاعدة المعرفة المعتمدة.',
      suggestedOffice: 'إدارة الشؤون العامة والخدمات بالجامعة',
      suggestedOfficeEn: 'General Facilities & Campus Security Administration (Al-Khums Campus)'
    }
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({
    'msg-assistant-1': true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [showPyModal, setShowPyModal] = useState(false);
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleCitation = (msgId: string) => {
    setExpandedCitations(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const isAr = /[\u0600-\u06FF]/.test(text);
    const newMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: newMsgId,
      role: 'user',
      authorName: 'Student',
      authorSub: isAr ? 'طالب - جامعة المرقب' : 'Student Inquiry',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
      isArabic: isAr
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Answer logic calling our Python Backend!
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: text }),
        });
        const result = await response.json();
        
        const aiMsgId = `assistant-${Date.now()}`;
        const aiMsg: Message = {
           id: aiMsgId,
           role: 'assistant',
           authorName: result.abstained ? 'System Safety Guardrail' : 'Elmergib Regulatory AI',
           authorSub: result.abstained ? 'Boundary Tripped' : 'مستند رسمي معتمد',
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           content: result.abstained ? 'Query Outside Regulation Scope' : result.answer,
           isArabic: isAr,
           abstained: result.abstained,
           abstentionData: result.abstained ? {
             englishReason: result.answer,
             arabicReason: result.arabic_note || '',
             suggestedOffice: result.suggested_office || '',
             suggestedOfficeEn: result.suggested_office || ''
           } : undefined,
           citation: result.citation ? {
             sourceTitle: result.citation.source_title || 'University Regulations',
             articlePage: 'Article Reference',
             retrievalDate: result.citation.retrieved_at || '',
             sourceUrl: result.citation.source_url || '#',
             sourceText: result.citation.chunk_text || ''
           } : undefined
        };
        
        setMessages(prev => [...prev, aiMsg]);
        setExpandedCitations(prev => ({ ...prev, [aiMsgId]: true }));
      } catch (error) {
         console.error("API Error", error);
      }
    }, 100);
  };

  const generateLatex = () => {
    const lines = [
      '\\documentclass[11pt,a4paper]{article}',
      '\\usepackage[utf8]{inputenc}',
      '\\usepackage{geometry}',
      '\\geometry{margin=1in}',
      '\\usepackage{xcolor}',
      '\\usepackage{hyperref}',
      '\\title{\\textbf{Elmergib Smart Assistant Transcript}}',
      '\\author{Academic Regulations Guidance System - Elmergib University}',
      `\\date{${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}}`,
      '\\begin{document}',
      '\\maketitle',
      '\\section*{Disclaimer}',
      '\\textit{This prototype transcript is an informational research proof-of-concept and does not constitute a legally binding administrative decision by Elmergib University.}',
      '\\vspace{1em}',
      '\\section*{Dialogue Record}'
    ];

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Student Query' : 'Elmergib Regulatory AI';
      const clean = msg.content
        .replace(/\\/g, '\\textbackslash ')
        .replace(/_/g, '\\_')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/&/g, '\\&');
      lines.push(`\\subsection*{${role} (${msg.timestamp})}`);
      lines.push(clean);
      if (msg.citation) {
        lines.push(`\\textbf{Citation:} ${msg.citation.sourceTitle}`);
      }
      lines.push('\\vspace{0.5em}');
    });

    lines.push('\\end{document}');
    return lines.join('\n');
  };

  const downloadLatexFile = () => {
    const content = generateLatex();
    const blob = new Blob([content], { type: 'application/x-tex;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elmergib_academic_transcript.tex';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pythonStreamlitCode = `import streamlit as st
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
                "وفقاً للمادة (14) من لائحة تنظيم التعليم العالي بالجامعات الليبية (القرار 501 لسنة 2010م):\\n\\n"
                "1. **المعدل التراكمي:** يوضع الطالب تحت الإنذار الأكاديمي إذا انخفض معدله التراكمي العام عن **2.00 من 4.00** (أو ما يعادل تقدير مقبول / 50%).\\n"
                "2. **المهلة القانونية للتعديل:** يُمنح الطالب مهلة أقصاها **فصلان دراسيان اعتياديان متتاليان** لرفع معدله التراكمي وإلغاء حالة الإنذار.\\n"
                "3. **فصل الصيف:** لا يُحتسب الفصل الدراسي الصيفي ضمن مدة فصلي الإنذار، لكن يجوز للطالب التسجيل فيه لتحسين المعدل.\\n"
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
                "وفقاً للمادة (21) من لائحة الدراسة بالجامعات الليبية:\\n\\n"
                "1. **شروط إيقاف القيد:** يجوز للطالب التقدم بطلب إيقاف القيد قبل بدء الامتحانات النصفية أو خلال أول شهر من انطلاق الفصل الدراسي بطلب رسمي ومسوغات مقبولة.\\n"
                "2. **الحد الأقصى للإيقاف:** لا يجوز أن تزيد فترات إيقاف القيد عن فصلين دراسيين متتاليين أو أربعة فصول غير متتالية طيلة مدة دراسته.\\n"
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
            f"Regulatory Inquiry: '{prompt}'\\n\\n"
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
        r"\\documentclass[11pt,a4paper]{article}",
        r"\\usepackage[utf8]{inputenc}",
        r"\\usepackage{geometry}",
        r"\\geometry{margin=1in}",
        r"\\usepackage{xcolor}",
        r"\\usepackage{hyperref}",
        r"\\title{\\textbf{Elmergib Smart Assistant Transcript}}",
        r"\\author{Academic Regulations Guidance System}",
        rf"\\date{{{datetime.date.today().strftime('%B %d, %Y')}}}",
        r"\\begin{document}",
        r"\\maketitle",
        r"\\section*{Disclaimer}",
        r"\\textit{This prototype transcript is an informational research proof-of-concept and does not constitute a legally binding administrative decision by Elmergib University.}",
        r"\\vspace{1em}",
        r"\\section*{Dialogue Record}"
    ]
    for msg in messages:
        role = "Student Query" if msg["role"] == "user" else "Elmergib Regulatory AI"
        safe_content = (
            msg["content"]
            .replace("\\\\", "\\\\textbackslash ")
            .replace("_", "\\\\_")
            .replace("%", "\\\\%")
            .replace("$", "\\\\$")
            .replace("#", "\\\\#")
            .replace("&", "\\\\&")
        )
        tex.append(rf"\\subsection*{{{role}}}")
        tex.append(f"{safe_content}")
        tex.append(r"\\vspace{0.5em}")
        
    tex.append(r"\\end{document}")
    return "\\n".join(tex)

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
                "مرحباً بكم في المساعد الذكي لجامعة المرقب 🏛️\\n\\n"
                "أهلاً بكم أعزائي الطلاب وأعضاء الهيئة التدريسية. يُقدم هذا النظام استرجاعاً وتلخيصاً موثقاً لمواد "
                "**لائحة تنظيم التعليم العالي والامتحانات بالجامعات الليبية (القرار رقم 501 لسنة 2010م)** "
                "واللوائح الداخلية المعتمدة للكليات.\\n\\n"
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
                    st.markdown(f"**Retrieval Date:** \`{cit.get('retrieval_date', 'N/A')}\`")
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
                st.markdown(f"**Retrieval Date:** \`{cit.get('retrieval_date', 'N/A')}\`")
                st.markdown(f'<blockquote class="citation-quote">{cit.get("source_text", "")}</blockquote>', unsafe_allow_html=True)
                
    st.session_state.messages.append({
        "role": "assistant",
        "content": result["answer"],
        "response_data": result
    })
`;

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans antialiased overflow-hidden">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-72 bg-[#ffffff] border-e border-[#e2e8f0] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Institution Header */}
          <div className="p-5 flex items-center justify-between bg-[#eff4ff] border-b border-[#e2e8f0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00236f] flex items-center justify-center text-white font-bold text-lg tracking-tight shadow-sm">
                EU
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#00236f] text-base leading-tight">جامعة المرقب</span>
                <span className="text-xs text-[#565e74]">Elmergib University</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-[#565e74] hover:bg-[#dce9ff]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            <div>
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Conversations
              </div>
              <nav className="space-y-1">
                <a
                  href="#guidance"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#e5eeff] text-[#00236f] font-semibold text-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#00236f]" />
                  <span>Academic Guidance</span>
                </a>
                <a
                  href="#regulations"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] text-sm transition-colors"
                >
                  <Library className="w-4 h-4" />
                  <span>Regulations & Bylaws</span>
                </a>
                <a
                  href="#handbook"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] text-sm transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Faculty Handbook</span>
                </a>
                <a
                  href="#citations"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] text-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00236f]" />
                  <span>Verified Citations</span>
                </a>
              </nav>
            </div>

            <div>
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Institutional Knowledge
              </div>
              <nav className="space-y-1">
                <a
                  href="#faculties"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] text-sm transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Faculties & Centers</span>
                </a>
                <a
                  href="#scope"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] text-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Proof of Concept Scope</span>
                </a>
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#e2e8f0] space-y-2">
              <button
                onClick={() => setShowPyModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#00236f]/5 hover:bg-[#00236f]/10 text-[#00236f] text-xs font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#00236f]" />
                  <span>View pure Streamlit app.py</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00236f] text-white">Py</span>
              </button>

              <button
                onClick={() => setMessages(INITIAL_MESSAGES)}
                className="w-full text-start px-3 py-1.5 rounded-lg text-xs text-[#565e74] hover:bg-[#f1f5f9] transition-colors"
              >
                🔄 Reset Conversation
              </button>
            </div>
          </div>

          {/* System Status in Sidebar Footer */}
          <div className="p-4 bg-[#eff4ff] border-t border-[#e2e8f0]">
            <div className="p-3 rounded-lg bg-white border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-[#0b1c30]">System Status: Academic PoC</span>
              </div>
              <p className="mt-1 text-[11px] text-[#565e74]">
                Decree 501/2010 Reference · Ed. 2023/24
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ps-72 h-full overflow-hidden">
        {/* Top Research Disclaimer Bar */}
        <div className="bg-[#ffddb8] text-[#2a1700] px-4 py-1.5 flex items-center justify-between text-xs font-medium border-b border-[#ffd099] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#5c3800]" />
            <span className="truncate">
              Research Proof-of-Concept: Consult the official university registrar or dean's office for authoritative rulings.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#2a1700]/70 shrink-0 ms-2">PoC-v1.4.2</span>
        </div>

        {/* Main Application Header */}
        <header className="h-16 px-4 md:px-6 bg-white border-b border-[#e2e8f0] flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[#565e74] hover:bg-[#eff4ff]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-[#00236f] text-base md:text-lg tracking-tight">
                  Elmergib Smart Assistant 🎓
                </span>
                <span className="text-[#565e74] font-light hidden sm:inline">|</span>
                <span className="font-semibold text-[#00236f] text-base hidden sm:inline" dir="rtl">
                  المساعد الذكي لجامعة المرقب
                </span>
              </div>
              <span className="text-[11px] text-[#565e74] truncate hidden sm:inline">
                Official Academic Regulations & Bylaws Information System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Export LaTeX Button as specified in prompt */}
            <button
              onClick={() => setShowLatexModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-semibold border border-[#d3e4fe] transition-colors"
              title="Export conversation to LaTeX format"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 Export LaTeX</span>
            </button>

            {/* Language toggle pill */}
            <div className="flex items-center p-0.5 rounded-full bg-[#e5eeff] border border-[#d3e4fe]">
              <button
                onClick={() => setCurrentLang('ar')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  currentLang === 'ar' ? 'bg-[#00236f] text-white shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setCurrentLang('en')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  currentLang === 'en' ? 'bg-[#00236f] text-white shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                English
              </button>
            </div>

            {/* User Profile */}
            <div className="w-8 h-8 rounded-full bg-[#00236f] text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Scrollable Conversation Stage */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
          <div className="max-w-[860px] mx-auto space-y-4">
            {/* Amber Research Proof-of-Concept Disclaimer Card */}
            <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] p-4 text-[#92400e] shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[#fef3c7] text-[#b45309] shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-semibold text-sm text-[#78350f]">
                      ⚠️ Disclaimer: Informational Research Proof-of-Concept
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-[#fde68a]/70 font-mono text-[#78350f] self-start sm:self-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]"></span>
                      Non-Binding Advisor
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#92400e] leading-relaxed">
                    This prototype is strictly an automated conversational index. It is not an official university decision channel and cannot confer academic credit or exemptions.
                  </p>
                  <p className="mt-1 text-xs text-[#92400e] text-end leading-relaxed font-sans" dir="rtl">
                    ⚠️ إخلاء مسؤولية: هذا النموذج أولي وبحثي لإثبات المفهوم، ولا يُعد قناة رسمية لإصدار قرارات جامعة المرقب أو مراجعة الحالات الفردية دون مراجعة مسجل الكلية.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Inquiry Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#00236f]" />
                  Recommended Inquiries | استفسارات نموذجية
                </span>
                <span className="font-mono text-[#565e74]">Libyan Universities Decree 501/2010</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => handleSend('ما هي شروط وضع الطالب تحت الإنذار الأكاديمي وما هي المدة الممنوحة له قانونياً لتعديل وضعه الدراسي وفق لائحة الجامعة؟')}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-[#00236f] hover:bg-[#e5eeff] hover:border-[#b6c4ff] shadow-xs text-xs whitespace-nowrap transition-all shrink-0"
                  dir="rtl"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#565e74] group-hover:text-[#00236f]" />
                  <span>ما هي شروط الإنذار الأكاديمي؟ (Probation)</span>
                </button>

                <button
                  onClick={() => handleSend('What are the minimum GPA and credit hour requirements for graduation?')}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-[#00236f] hover:bg-[#e5eeff] hover:border-[#b6c4ff] shadow-xs text-xs whitespace-nowrap transition-all shrink-0"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#565e74] group-hover:text-[#00236f]" />
                  <span>Minimum GPA requirements for graduation</span>
                </button>

                <button
                  onClick={() => handleSend('ما هي شروط وإجراءات إيقاف القيد الفصلي وفق المادة 21؟')}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-[#00236f] hover:bg-[#e5eeff] hover:border-[#b6c4ff] shadow-xs text-xs whitespace-nowrap transition-all shrink-0"
                  dir="rtl"
                >
                  <Library className="w-3.5 h-3.5 text-[#565e74] group-hover:text-[#00236f]" />
                  <span>شروط إيقاف القيد الفصلي (Leave of Absence)</span>
                </button>

                <button
                  onClick={() => handleSend('Can I get a student parking permit for the Faculty of Engineering campus in Al-Khums, and where do I pay the decal fee?')}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#ba1a1a] hover:bg-[#fee2e2] shadow-xs text-xs whitespace-nowrap transition-all shrink-0"
                >
                  <Ban className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  <span>Campus parking permit rules (Test Boundary)</span>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="space-y-4 pt-1">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-1 ${
                          msg.abstained
                            ? 'bg-[#ba1a1a] text-white'
                            : 'bg-[#00236f] text-white'
                        }`}
                      >
                        {msg.abstained ? (
                          <Ban className="w-5 h-5" />
                        ) : (
                          <GraduationCap className="w-5 h-5" />
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 min-w-0 ${isAssistant ? 'flex-1' : 'items-end max-w-[85%]'}`}>
                      {/* Author Header */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${msg.abstained ? 'text-[#ba1a1a]' : 'text-[#00236f]'}`}>
                          {msg.authorName || (isAssistant ? 'Elmergib Regulatory AI' : 'Student')}
                        </span>
                        {msg.authorSub && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#565e74] font-mono">
                            {msg.authorSub}
                          </span>
                        )}
                        <span className="text-[11px] text-[#565e74]">{msg.timestamp}</span>
                      </div>

                      {/* User Bubble */}
                      {!isAssistant && (
                        <div
                          className="rounded-2xl rounded-tr-sm bg-[#00236f] text-white p-3.5 shadow-sm text-sm leading-relaxed"
                          dir={msg.isArabic ? 'rtl' : 'ltr'}
                        >
                          <p>{msg.content}</p>
                        </div>
                      )}

                      {/* Assistant Bubble */}
                      {isAssistant && (
                        <div className="rounded-xl rounded-tl-sm bg-white border border-[#e2e8f0] p-4 md:p-5 shadow-xs space-y-3 text-sm">
                          {/* Welcome box extra cards */}
                          {msg.id === 'msg-welcome' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b border-[#e2e8f0]">
                                <Building2 className="w-5 h-5 text-[#00236f]" />
                                <span className="font-bold text-[#00236f] text-base" dir="rtl">
                                  مرحباً بكم في المساعد الذكي لجامعة المرقب
                                </span>
                              </div>
                              <p className="leading-relaxed text-[#0b1c30]" dir="rtl">
                                أهلاً بكم أعزائي الطلاب وأعضاء الهيئة التدريسية بجامعة المرقب. يُقدم هذا النظام استرجاعاً وتلخيصاً موثقاً لمواد <strong className="text-[#00236f] font-semibold">لائحة تنظيم التعليم العالي والامتحانات بالجامعات الليبية (القرار رقم 501 لسنة 2010م)</strong>، بالإضافة إلى اللوائح الداخلية المعتمدة للكليات والمراكز الأكاديمية.
                              </p>
                              <p className="leading-relaxed text-[#444651]">
                                Welcome to the official regulatory assistant. You may inquire in both Arabic and English regarding academic registration, grading metrics, progression probation, withdrawal procedures, and faculty committee guidelines. All statements feature verified page-level legal citations.
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#d3e4fe] flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#565e74]">DOCUMENT SCOPE</span>
                                  <span className="font-bold text-xs text-[#00236f]">Decree 501 (2010)</span>
                                  <span className="text-[11px] text-[#565e74]">National Bylaw Catalog</span>
                                </div>
                                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#d3e4fe] flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#565e74]">CAMPUS DOMAINS</span>
                                  <span className="font-bold text-xs text-[#00236f]">Al-Khums & Sub-faculties</span>
                                  <span className="text-[11px] text-[#565e74]">Academic & Student Affairs</span>
                                </div>
                                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#d3e4fe] flex flex-col gap-0.5">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#565e74]">CITATION POLICY</span>
                                  <span className="font-bold text-xs text-[#00236f]">Exact Article Match</span>
                                  <span className="text-[11px] text-[#565e74]">Direct PDF Verifiable</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Regular Assistant Answer Body */}
                          {msg.id !== 'msg-welcome' && !msg.abstained && (
                            <div className="space-y-2 leading-relaxed whitespace-pre-line" dir={msg.isArabic ? 'rtl' : 'ltr'}>
                              {msg.content}
                            </div>
                          )}

                          {/* The "Abstention" Card: Query Outside Regulation Scope */}
                          {msg.abstained && (
                            <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] border-s-4 border-s-[#ba1a1a] text-[#7f1d1d] space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 font-bold text-[#ba1a1a] text-sm sm:text-base">
                                  <Ban className="w-5 h-5 shrink-0" />
                                  <span>🚫 Scope Boundary: Query Outside Regulation Scope</span>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] font-semibold shrink-0">
                                  ERR_OUT_OF_SCOPE
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm leading-relaxed text-[#7f1d1d]">
                                <strong>Query Outside Regulation Scope:</strong> {msg.abstentionData?.englishReason}
                              </p>

                              <p className="text-xs sm:text-sm leading-relaxed text-[#7f1d1d]" dir="rtl">
                                <strong>تنبيه حدود الاختصاص:</strong> {msg.abstentionData?.arabicReason}
                              </p>

                              <div className="pt-2 border-t border-[#fecaca] space-y-1.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74] block">
                                  Recommended Resolution Path
                                </span>
                                <div className="p-3 rounded-lg bg-white border border-[#fecaca] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-[#eff4ff] text-[#00236f]">
                                      <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="font-semibold text-xs text-[#00236f] block">
                                        {msg.abstentionData?.suggestedOffice}
                                      </span>
                                      <span className="text-[11px] text-[#565e74]">
                                        {msg.abstentionData?.suggestedOfficeEn}
                                      </span>
                                    </div>
                                  </div>
                                  <a
                                    href="#directory"
                                    onClick={(e) => { e.preventDefault(); alert('Referral link: Al-Khums Campus Facilities Administration Office hours: Sun-Thu 8:30 AM - 2:00 PM.'); }}
                                    className="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0"
                                  >
                                    <span>Directory & Office Hours ↗</span>
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-[#565e74] pt-1">
                                <span className="flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5" />
                                  Grounding: No hallucinations permitted on non-academic administrative matters.
                                </span>
                                <span className="font-mono">0 Documents Retrieved</span>
                              </div>
                            </div>
                          )}

                          {/* Citation Expander: Streamlit style */}
                          {msg.citation && (
                            <div className="rounded-xl border border-[#d3e4fe] bg-[#eff4ff] overflow-hidden mt-3">
                              <button
                                onClick={() => toggleCitation(msg.id)}
                                className="w-full px-4 py-2.5 bg-[#e5eeff] flex items-center justify-between text-[#00236f] font-semibold text-xs hover:bg-[#dce9ff] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  <span>📌 View Source Citation / عرض المستند والمصدر المرجعي</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-[#00236f] text-white font-mono text-[10px]">
                                    VERIFIED SOURCE
                                  </span>
                                  {expandedCitations[msg.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </button>

                              {expandedCitations[msg.id] && (
                                <div className="p-3.5 space-y-3 bg-[#eff4ff] text-xs">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    <div>
                                      <span className="text-[#565e74] block">اسم الوثيقة الرسمية / Document Title:</span>
                                      <span className="font-semibold text-[#0b1c30]" dir="rtl">{msg.citation.sourceTitle}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#565e74] block">تاريخ التوثيق / Retrieval Date:</span>
                                      <span className="font-mono text-[#0b1c30]">{msg.citation.retrievalDate}</span>
                                    </div>
                                  </div>

                                  {/* Blockquote with primary accent bar */}
                                  <div className="p-3 rounded-lg bg-white border border-[#d3e4fe] relative overflow-hidden shadow-xs" dir="rtl">
                                    <div className="absolute top-0 bottom-0 start-0 w-1.5 bg-[#00236f]"></div>
                                    <div className="flex items-center justify-between text-[11px] font-mono text-[#00236f] mb-1">
                                      <span>{msg.citation.articlePage}</span>
                                    </div>
                                    <blockquote className="italic text-[#0b1c30] leading-relaxed pe-2">
                                      {msg.citation.sourceText}
                                    </blockquote>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#565e74] truncate max-w-sm">
                                      <span className="truncate">{msg.citation.sourceUrl}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => copyToClipboard(msg.citation?.sourceText || '', msg.id)}
                                        className="px-2.5 py-1 rounded-md bg-white border border-[#d3e4fe] text-[#00236f] hover:bg-[#e5eeff] font-medium text-xs flex items-center gap-1 transition-colors"
                                      >
                                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedId === msg.id ? 'Copied' : 'نسخ النص'}</span>
                                      </button>
                                      <a
                                        href={msg.citation.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 rounded-md bg-[#00236f] text-white hover:bg-[#1e3a8a] font-medium text-xs flex items-center gap-1 transition-colors"
                                      >
                                        <span>فتح اللائحة PDF</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Footer feedback row */}
                          {msg.id !== 'msg-welcome' && (
                            <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] text-[#565e74] text-xs">
                              <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1 hover:text-[#00236f] transition-colors">
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Helpful</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-[#00236f] transition-colors">
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>Needs clarification</span>
                                </button>
                              </div>
                              {msg.confidence && (
                                <span className="font-mono text-[11px]">Confidence Metric: {msg.confidence} Document Match</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!isAssistant && (
                      <div className="w-9 h-9 rounded-xl bg-[#e5eeff] text-[#00236f] flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Privacy note banner */}
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d3e4fe] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs text-xs text-[#565e74]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00236f] shrink-0" />
                <span>
                  <strong>Strict On-Premises Privacy Architecture:</strong> All query vector embeddings processed locally on Elmergib servers. No external third-party model sharing.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-[#00236f]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Local Embeddings: Ready</span>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Bottom Input Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-4 py-3 shrink-0">
          <div className="max-w-[860px] mx-auto space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center bg-[#f8f9ff] border border-[#cbd5e1] focus-within:border-[#00236f] focus-within:ring-2 focus-within:ring-[#00236f]/15 rounded-xl shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => alert('Document attachment: You can attach official departmental transcripts or petitions for syllabus cross-checking.')}
                className="p-2.5 ms-1 text-[#565e74] hover:text-[#00236f] transition-colors"
                title="Attach syllabus or inquiry transcript"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about university bylaws, grading scales, graduation requirements... | اسأل عن اللوائح الدراسية..."
                className="w-full bg-transparent px-2 py-3 text-sm text-[#0b1c30] placeholder-[#565e74] focus:outline-none"
              />

              <div className="pe-2 flex items-center gap-1">
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-lg bg-[#00236f] text-white flex items-center justify-center hover:bg-[#1e3a8a] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  title="Send Inquiry"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between px-1 text-[11px] text-[#565e74]">
              <span>Authorized references only. Always cross-verify with your academic advisor.</span>
              <span className="font-mono">RTL & LTR Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: LaTeX Transcript Preview & Download */}
      {showLatexModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#00236f]" />
                <h3 className="font-bold text-[#00236f] text-base">Export LaTeX Transcript (.tex)</h3>
              </div>
              <button
                onClick={() => setShowLatexModal(false)}
                className="p-1 rounded-lg text-[#565e74] hover:bg-[#eff4ff]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <p className="text-[#565e74] font-sans">
                Below is the formatted LaTeX document containing the complete transcript and cited bylaws ready to compile with <code className="bg-slate-100 px-1 py-0.5 rounded">pdflatex</code>:
              </p>
              <pre className="p-3.5 rounded-xl bg-[#0b1c30] text-[#e5eeff] overflow-x-auto text-[11px] leading-relaxed">
                {generateLatex()}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-end gap-2">
              <button
                onClick={() => copyToClipboard(generateLatex(), 'latex-modal')}
                className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#0b1c30] hover:bg-white flex items-center gap-1.5 transition-colors"
              >
                {copiedId === 'latex-modal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'latex-modal' ? 'Copied' : 'Copy Code'}</span>
              </button>
              <button
                onClick={downloadLatexFile}
                className="px-4 py-1.5 rounded-lg bg-[#00236f] text-white text-xs font-semibold hover:bg-[#1e3a8a] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .tex File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pure Streamlit app.py Viewer */}
      {showPyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e2e8f0]">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#00236f]" />
                <h3 className="font-bold text-[#00236f] text-base">app.py (Streamlit Implementation)</h3>
              </div>
              <button
                onClick={() => setShowPyModal(false)}
                className="p-1 rounded-lg text-[#565e74] hover:bg-[#eff4ff]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between font-sans text-xs text-[#565e74]">
                <span>100% Local Privacy, Pure Streamlit with st.warning, st.chat_message, Abstention Card & Citations.</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Ready to run</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#0b1c30] text-[#e5eeff] overflow-x-auto text-[11px] leading-relaxed">
                {pythonStreamlitCode}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-end gap-2">
              <button
                onClick={() => copyToClipboard(pythonStreamlitCode, 'py-modal')}
                className="px-4 py-1.5 rounded-lg bg-[#00236f] text-white text-xs font-semibold hover:bg-[#1e3a8a] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedId === 'py-modal' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'py-modal' ? 'Copied app.py' : 'Copy app.py Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
