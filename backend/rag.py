import os
import json
import math
import uuid
from typing import List, Dict, Any, Tuple

from pypdf import PdfReader
import requests
import shutil


STORE_DIR = os.path.join(os.path.dirname(__file__), "data", "docs")
INDEX_PATH = os.path.join(os.path.dirname(__file__), "data", "index.json")


def _ensure_dirs() -> None:
    os.makedirs(STORE_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)


def _load_index() -> Dict[str, Any]:
    if not os.path.exists(INDEX_PATH):
        return {"chunks": []}
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_index(index: Dict[str, Any]) -> None:
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f)


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> List[str]:
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        chunks.append(chunk)
        if end == len(text):
            break
        start = end - overlap
        if start < 0:
            start = 0
    return chunks


def _pdf_to_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    pages_text = []
    for page in reader.pages:
        pages_text.append(page.extract_text() or "")
    return "\n".join(pages_text)


def _embed_texts(texts: List[str]) -> List[List[float]]:
    api_key = os.getenv("openai_api_key") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OpenAI API key not found in environment (openai_api_key or OPENAI_API_KEY)")
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "text-embedding-3-small",
        "input": texts,
    }
    resp = requests.post(url, headers=headers, json=data, timeout=60)
    resp.raise_for_status()
    out = resp.json()
    embeddings: List[List[float]] = [item["embedding"] for item in out["data"]]
    return embeddings


def add_pdf(file_path: str, original_name: str | None = None) -> str:
    """
    Ingest a PDF file: parse to text, chunk, embed, and add to index.
    Returns a doc_id.
    """
    _ensure_dirs()
    doc_id = str(uuid.uuid4())[:8]
    stored_path = os.path.join(STORE_DIR, f"{doc_id}.pdf")
    # Use shutil.move to support moving across drives/filesystems on Windows
    shutil.move(file_path, stored_path)

    text = _pdf_to_text(stored_path)
    chunks = _chunk_text(text)
    embeddings = _embed_texts(chunks)

    index = _load_index()
    for chunk_text, emb in zip(chunks, embeddings):
        index["chunks"].append({
            "doc_id": doc_id,
            "name": original_name or stored_path,
            "text": chunk_text,
            "embedding": emb,
        })
    _save_index(index)
    return doc_id


def search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    index = _load_index()
    if not index["chunks"]:
        return []
    q_emb = _embed_texts([query])[0]
    scored: List[Tuple[float, Dict[str, Any]]] = []
    for chunk in index["chunks"]:
        sim = _cosine_similarity(q_emb, chunk["embedding"])
        scored.append((sim, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:top_k]]