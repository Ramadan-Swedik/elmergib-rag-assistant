"""
Streamlit Web Interface.
Owner: Ramadan
Domain: src/ui/
Goal: Deliver a working Streamlit chat interface calling answer_question().
"""
import streamlit as st
import sys
import os

# Ensure src is in the python path to import rag pipeline
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from src.rag.pipeline import answer_question

def main():
    st.set_page_config(page_title="Elmergib Smart Assistant", page_icon="🎓")
    
    # Required Disclaimer Banner
    st.warning("⚠️ **Disclaimer:** This prototype is an informational research proof-of-concept. It is not an official university decision channel, and outputs should not be treated as formal administrative rulings.")
    
    st.title("Elmergib Smart Assistant 🎓")
    
    # Chat History Placeholder
    if "messages" not in st.session_state:
        st.session_state.messages = []
        
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if "citation" in message:
                st.caption(f"📚 **Citation:** {message['citation']}")
                
    # User Input
    if prompt := st.chat_input("Ask a question about university regulations..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        with st.chat_message("assistant"):
            with st.spinner("Searching regulations..."):
                # Call the RAG pipeline
                response = answer_question(prompt)
                
                if response.get("abstained"):
                    st.error("I'm sorry, I couldn't find a confident answer in the official documents, or the query is out of scope. I must abstain from answering.")
                    st.session_state.messages.append({"role": "assistant", "content": "Abstained from answering."})
                else:
                    # Render Answer and Citation Placeholder
                    st.markdown(response["answer"])
                    
                    citation = response.get("citation", {})
                    citation_text = f"[{citation.get('source_url', 'Unknown')}] - Retrieved: {citation.get('retrieved_at', 'Unknown')}"
                    st.caption(f"📚 **Citation:** {citation_text}")
                    
                    with st.expander("View Source Text"):
                        st.write(citation.get("chunk_text", "No source text available."))
                        
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": response["answer"],
                        "citation": citation_text
                    })

if __name__ == "__main__":
    main()
