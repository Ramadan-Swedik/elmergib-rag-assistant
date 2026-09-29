import json
from pathlib import Path

IN_SCOPE_DOC_IDS = {"elmergib_student_guide_2019_2020"}

MIN_CHUNK_CHARS = 15


def load_regulation_chunks(chunks_path: str | Path) -> list[dict]:
    
    with open(chunks_path, encoding="utf-8") as f:
        all_chunks = json.load(f)

    filtered = [
        c
        for c in all_chunks
        if c.get("doc_id") in IN_SCOPE_DOC_IDS
        and len(c.get("text", "")) >= MIN_CHUNK_CHARS
    ]

    return filtered


def load_out_of_scope_pool(chunks_path: str | Path) -> list[dict]:
 
    with open(chunks_path, encoding="utf-8") as f:
        all_chunks = json.load(f)

    return [c for c in all_chunks if c.get("doc_id") not in IN_SCOPE_DOC_IDS]


if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "../../data/chunks.json"
    reg = load_regulation_chunks(path)
    oos = load_out_of_scope_pool(path)
    print(f"In-scope regulation chunks: {len(reg)}")
    print(f"Out-of-scope pool (for Omar): {len(oos)}")
    if reg:
        lens = [len(c["text"]) for c in reg]
        print(f"text length min/avg/max: {min(lens)}/{sum(lens)//len(lens)}/{max(lens)}")
