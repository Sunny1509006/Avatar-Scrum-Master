import os
import uuid
import shutil
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path

from pypdf import PdfReader
import requests
import chromadb
from chromadb.config import Settings


# Directories
STORE_DIR = os.path.join(os.path.dirname(__file__), "data", "docs")
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "data", "chroma_db")

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(
    path=CHROMA_DIR,
    settings=Settings(anonymized_telemetry=False)
)

# Get or create collection
COLLECTION_NAME = "pdf_documents"
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"description": "PDF document chunks for RAG"}
)


def _ensure_dirs() -> None:
    """Ensure required directories exist."""
    os.makedirs(STORE_DIR, exist_ok=True)
    os.makedirs(CHROMA_DIR, exist_ok=True)


def _chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
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
    """Extract text from PDF file."""
    reader = PdfReader(pdf_path)
    pages_text = []
    for page in reader.pages:
        pages_text.append(page.extract_text() or "")
    return "\n".join(pages_text)


def _embed_texts(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using OpenAI API."""
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
    Ingest a PDF file: parse to text, chunk, embed, and add to ChromaDB.
    Returns a doc_id.
    """
    _ensure_dirs()
    doc_id = str(uuid.uuid4())[:8]
    stored_path = os.path.join(STORE_DIR, f"{doc_id}.pdf")
    
    # Move file to storage
    shutil.move(file_path, stored_path)
    
    # Extract text and create chunks
    text = _pdf_to_text(stored_path)
    chunks = _chunk_text(text)
    
    # Generate embeddings
    embeddings = _embed_texts(chunks)
    
    # Prepare data for ChromaDB
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "filename": original_name or f"{doc_id}.pdf",
            "chunk_index": i,
            "upload_date": datetime.now().isoformat()
        }
        for i in range(len(chunks))
    ]
    
    # Add to ChromaDB
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )
    
    return doc_id


def search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for relevant document chunks using ChromaDB.
    Returns list of chunks with text and metadata.
    """
    # Check if collection is empty
    if collection.count() == 0:
        return []
    
    # Generate query embedding
    q_emb = _embed_texts([query])[0]
    
    # Query ChromaDB
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=min(top_k, collection.count())
    )
    
    # Format results
    chunks = []
    if results and results['documents'] and len(results['documents']) > 0:
        for i in range(len(results['documents'][0])):
            chunks.append({
                "text": results['documents'][0][i],
                "name": results['metadatas'][0][i].get('filename', 'Unknown'),
                "doc_id": results['metadatas'][0][i].get('doc_id', ''),
                "distance": results['distances'][0][i] if 'distances' in results else 0
            })
    
    return chunks


def list_documents() -> List[Dict[str, Any]]:
    """
    List all uploaded documents with metadata.
    Returns list of unique documents.
    """
    if collection.count() == 0:
        return []
    
    # Get all items from collection
    all_items = collection.get()
    
    # Group by doc_id to get unique documents
    docs_dict = {}
    for metadata in all_items['metadatas']:
        doc_id = metadata.get('doc_id')
        if doc_id and doc_id not in docs_dict:
            docs_dict[doc_id] = {
                "doc_id": doc_id,
                "filename": metadata.get('filename', 'Unknown'),
                "upload_date": metadata.get('upload_date', ''),
                "chunk_count": 0
            }
        if doc_id:
            docs_dict[doc_id]["chunk_count"] += 1
    
    return list(docs_dict.values())


def delete_document(doc_id: str) -> bool:
    """
    Delete a document and all its chunks from ChromaDB and local storage.
    Returns True if successful, False otherwise.
    """
    try:
        # Get all chunk IDs for this document
        all_items = collection.get()
        chunk_ids_to_delete = []
        
        for i, metadata in enumerate(all_items['metadatas']):
            if metadata.get('doc_id') == doc_id:
                chunk_ids_to_delete.append(all_items['ids'][i])
        
        # Delete from ChromaDB
        if chunk_ids_to_delete:
            collection.delete(ids=chunk_ids_to_delete)
        
        # Delete PDF file from storage
        pdf_path = os.path.join(STORE_DIR, f"{doc_id}.pdf")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        return True
    except Exception as e:
        print(f"Error deleting document {doc_id}: {e}")
        return False