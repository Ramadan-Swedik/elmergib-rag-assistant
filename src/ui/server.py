import sys
import os
import datetime
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Ensure the project root is in the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from src.rag.pipeline import answer_question

app = FastAPI(title="Elmergib RAG Assistant API")

# Allow CORS for local development (Vite runs on 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Warming up RAG indices and vectorstore in RAM...")
    try:
        from src.rag.pipeline import _get_dense_index
        _get_dense_index()
        print("RAG models warmed up and ready in RAM!")
    except Exception as e:
        print(f"Startup warm-up notice: {e}")

# Define request body model
class ChatRequest(BaseModel):
    prompt: str
    language: str | None = None

# Define POST endpoint that connects to our existing Python logic
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        result = answer_question(request.prompt, language=request.language)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Chat endpoint error: {e}")
        return {
            "answer": "عذراً، حدث خطأ أثناء معالجة الاستفسار.",
            "citation": None,
            "abstained": True,
            "abstain_reason": str(e),
            "confidence": 0.0,
            "latency": 0.0,
        }

# Serve the static HTML frontend
# This points to the folder where we will put your gorgeous AI Studio HTML
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    print("Starting FastAPI Server on http://localhost:8000")
    uvicorn.run("src.ui.server:app", host="127.0.0.1", port=8000, reload=True)
