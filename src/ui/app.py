"""
Streamlit Web Interface.
Owner: Ramadan
Domain: src/ui/
Goal: Deliver a working Streamlit chat interface calling answer_question().
"""
import streamlit as st
import random
import time

# --- STYLES INJECTION ---
CSS = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    html, body, [class*="css"] {
        font-family: 'Geist', sans-serif !important;
    }
    
    /* Variables for Light/Dark */
    :root {
        --card-shadow: 0 2px 8px rgba(0,0,0,0.05);
        --banner-bg: #FEF3C7;
        --banner-text: #B45309;
        --banner-border: #FDE68A;
        
        --abstention-border: #F43F5E;
        --abstention-bg: #FFF1F2;
        --abstention-text: #9F1239;
        
        --citation-bg: #F8FAFC;
        --citation-border: #E2E8F0;
    }
    
    @media (prefers-color-scheme: dark) {
        :root {
            --card-shadow: 0 2px 8px rgba(0,0,0,0.4);
            --banner-bg: rgba(180, 83, 9, 0.2);
            --banner-text: #FDE68A;
            --banner-border: rgba(180, 83, 9, 0.5);
            
            --abstention-border: #E11D48;
            --abstention-bg: rgba(225, 29, 72, 0.1);
            --abstention-text: #FDA4AF;
            
            --citation-bg: #1E293B;
            --citation-border: #334155;
        }
    }

    /* Disclaimer Banner */
    div[data-testid="stAlert"] {
        background-color: var(--banner-bg) !important;
        color: var(--banner-text) !important;
        border: 1px solid var(--banner-border) !important;
        border-radius: 8px !important;
        padding: 12px 16px !important;
    }

    /* Sidebar tweaks */
    section[data-testid="stSidebar"] {
        background-color: var(--citation-bg) !important;
        border-right: 1px solid var(--citation-border) !important;
    }

    /* Chat Messages */
    div[data-testid="stChatMessage"] {
        border-radius: 12px !important;
        padding: 16px !important;
        box-shadow: var(--card-shadow) !important;
        margin-bottom: 1rem !important;
        border: 1px solid var(--citation-border) !important;
        background-color: transparent !important;
    }

    /* Scope Boundary Card */
    .abstention-card {
        background-color: var(--abstention-bg);
        border: 1px solid var(--abstention-border);
        border-left: 4px solid var(--abstention-border);
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
        color: var(--abstention-text);
    }
    .abstention-header {
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Citation Blockquote */
    .citation-quote {
        border-left: 4px solid var(--citation-border);
        padding: 12px 16px;
        background-color: var(--citation-bg);
        border-radius: 0 8px 8px 0;
        font-style: italic;
        margin: 12px 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9em;
    }

    div[data-testid="stExpander"] {
        border-radius: 12px !important;
        box-shadow: var(--card-shadow) !important;
        border: 1px solid var(--citation-border) !important;
    }
</style>
"""

# --- BACKEND MOCKING ---
def answer_question(user_query: str) -> dict:
    time.sleep(1.2)
    
    state_1 = {
        "answer": "Between 2022 and 2024, investigations into clinical natural language processing have systematically transitioned from prompt-engineered generative foundations to hybrid retrieval-augmented topologies.\n\n### 1. Core Benchmark Findings\nAcross multicenter datasets, current literature indicates that coupling frozen parameter weights with dynamic vector-indexed medical databases substantially mitigates factual drift in diagnostic decision support systems.", 
        "citation": {
            "text": "...findings demonstrate a 34% reduction in hallucination rates when combining dense retrieval mechanisms with verified PubMed Central indices...", 
            "url": "http://elmergib.edu.ly/docs/attendance.pdf", 
            "date": "2026-09-22",
            "title": "Journal of Medical Informatics, Vol 48"
        }, 
        "abstained": False
    }
    
    state_2 = {
        "answer": "", 
        "citation": {}, 
        "abstained": True
    }
    
    return random.choice([state_1, state_2])


def main():
    st.set_page_config(page_title="Academic Intelligence Assistant", page_icon="🎓", layout="wide")
    st.markdown(CSS, unsafe_allow_html=True)
    
    # --- SIDEBAR ---
    with st.sidebar:
        st.markdown("### 🎓 UniLabs")
        st.markdown("---")
        
        st.button("🔬 Research", use_container_width=True, type="primary")
        st.button("💬 Chat History", use_container_width=True)
        st.button("📚 Library", use_container_width=True)
        
        st.markdown("---")
        st.markdown("### ⚙️ Settings")
        
        # Theme Mockup Toggle
        theme = st.radio("UI Theme", ["System Default", "Light Mode", "Dark Mode"], 
                         help="Note: Native Streamlit theming is fully controlled via the top-right '⋮' Menu -> Settings.")
        
        st.markdown("---")
        st.caption("ENVIRONMENT\n\n**v4.2-Academic**")

    # --- MAIN CONTENT ---
    # Top Banner
    st.warning("**PROTOC-REF #482** | Informational prototype only. Citations must be independently verified for peer-reviewed academic submissions and formal clinical application.", icon="⚠️")
    
    st.title("Academic Intelligence Assistant")
    
    # Context Header Mockup
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("#### Synthesis Query: RAG in Clinical NLP")
        st.caption("Corpus scope: Peer-reviewed journal literature (2022–2024) • Target DOI cross-checks active")
    with col2:
        st.button("📥 Export LaTeX")
    
    st.markdown("---")
    
    # Chat History
    if "messages" not in st.session_state:
        st.session_state.messages = []
        
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            if message.get("abstained"):
                st.markdown("""
                <div class="abstention-card">
                    <div class="abstention-header">🚫 Scope Boundary</div>
                    <p><strong>Query Outside Regulation Scope:</strong> The available official documents do not contain rules addressing this inquiry.</p>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(message["content"])
                
                if "citation" in message and message["citation"]:
                    cit = message["citation"]
                    with st.expander(f"📌 {cit.get('title', 'Source Citation')}"):
                        st.markdown(f"**Source:** [{cit.get('url', 'Document')}]({cit.get('url', '#')})")
                        st.markdown(f"**Retrieved At:** `{cit.get('date', '')}`")
                        st.markdown(f'<div class="citation-quote">{cit.get("text", "")}</div>', unsafe_allow_html=True)
                
    # Chat Input
    if prompt := st.chat_input("Ask a verified academic question, request cross-study meta-analysis, or cite by DOI..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        with st.chat_message("assistant"):
            with st.spinner("Searching official regulations..."):
                response = answer_question(prompt)
                
                if response.get("abstained"):
                    st.markdown("""
                    <div class="abstention-card">
                        <div class="abstention-header">🚫 Scope Boundary</div>
                        <p><strong>Query Outside Regulation Scope:</strong> The available official documents do not contain rules addressing this inquiry.</p>
                    </div>
                    """, unsafe_allow_html=True)
                    st.session_state.messages.append({"role": "assistant", "content": "", "abstained": True})
                else:
                    st.markdown(response["answer"])
                    cit = response.get("citation", {})
                    with st.expander(f"📌 {cit.get('title', 'Source Citation')}"):
                        st.markdown(f"**Source:** [{cit.get('url', 'Document')}]({cit.get('url', '#')})")
                        st.markdown(f"**Retrieved At:** `{cit.get('date', '')}`")
                        st.markdown(f'<div class="citation-quote">{cit.get("text", "")}</div>', unsafe_allow_html=True)
                        
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": response["answer"],
                        "citation": cit,
                        "abstained": False
                    })
