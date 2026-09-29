from __future__ import annotations

from rank_bm25 import BM25Okapi


def _normalize_arabic(text: str) -> str:
    
    import re

    text = re.sub(r"[إأآٱ]", "ا", text)
    text = re.sub(r"ى", "ي", text)
    text = re.sub(r"ة", "ه", text)
    text = re.sub(r"[\u064B-\u0652]", "", text)  # diacritics
    return text


def _tokenize(text: str) -> list[str]:
    
    import re

    return re.findall(r"\w+", _normalize_arabic(text).lower(), flags=re.UNICODE)


def _to_result(chunk: dict, score: float) -> dict:
   
    return {
        "chunk_id": chunk["chunk_id"],
        "text": chunk["text"],
        "source_url": chunk["source_url"],
        "page_number": chunk["page_number"],
        "doc_name": chunk["doc_name"],
        "retrieved_at": chunk.get("retrieved_at"),
        "score": float(score),
    }


class BM25Index:
    
    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        self._corpus_tokens = [_tokenize(c["text"]) for c in chunks]
        self._bm25 = BM25Okapi(self._corpus_tokens)

    def search(self, query: str, k: int = 10) -> list[dict]:
        query_tokens = _tokenize(query)
        scores = self._bm25.get_scores(query_tokens)

        ranked = sorted(
            zip(self.chunks, scores), key=lambda pair: pair[1], reverse=True
        )[:k]

        return [
            _to_result(c, score)
            for c, score in ranked
            if score > 0  # drop zero-overlap results rather than pad with junk
        ]


DEFAULT_COLLECTION = "regulations_dense"


class DenseIndex:
    

    def __init__(
        self,
        chunks: list[dict],
        persist_directory: str | None = None,
        collection_name: str = DEFAULT_COLLECTION,
    ):
        try:
            import chromadb
            from sentence_transformers import SentenceTransformer
        except ImportError as e:
            raise ImportError(
                "DenseIndex requires `pip install chromadb sentence-transformers`."
            ) from e

        self.chunks = {c["chunk_id"]: c for c in chunks}
        self.doc_ids = sorted({c["doc_id"] for c in chunks})
        self.model = SentenceTransformer("BAAI/bge-m3")

        client = (
            chromadb.PersistentClient(path=persist_directory)
            if persist_directory
            else chromadb.Client()
        )
        self.collection = client.get_or_create_collection(
            collection_name, metadata={"hnsw:space": "cosine"}
        )


        existing_ids = set(self.collection.get()["ids"]) if self.collection.count() else set()
        new_chunks = [c for c in chunks if c["chunk_id"] not in existing_ids]

        if new_chunks:
            embeddings = self.model.encode(
                [c["text"] for c in new_chunks], normalize_embeddings=True
            ).tolist()
            self.collection.add(
                ids=[c["chunk_id"] for c in new_chunks],
                embeddings=embeddings,
                documents=[c["text"] for c in new_chunks],
                metadatas=[{"doc_id": c["doc_id"]} for c in new_chunks],
            )

    def search(self, query: str, k: int = 10) -> list[dict]:
        query_embedding = self.model.encode([query], normalize_embeddings=True).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=k,
            where={"doc_id": {"$in": self.doc_ids}},
        )

        out = []
        for chunk_id, distance in zip(results["ids"][0], results["distances"][0]):
            c = self.chunks.get(chunk_id)
            if c is None:
                continue 
            out.append(_to_result(c, -distance))
        return out