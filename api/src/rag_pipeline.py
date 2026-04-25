import os
import json
import hashlib
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv

# Clients
from qdrant_client import QdrantClient, models
from google import genai

# 1. Configuration & Load Env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")

COLLECTION_NAME = "UMH26_RAG_Docs"
# gemini-embedding-2 defaults to 3072. text-embedding-004 defaults to 768.
VECTOR_SIZE = 3072  

# 2. Initialize Clients
client = genai.Client(api_key=API_KEY)
qdrant_client = QdrantClient(
    url=QDRANT_URL, 
    api_key=QDRANT_API_KEY,
)

# 3. Define RAW_SCHEMA (Bulletproof for 400 Errors)
# This replaces the Pydantic class to avoid the "additionalProperties" SDK bug.
RAW_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "insight": {"type": "STRING"},
        "recommendations": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "reasoning": {"type": "STRING"},
        "prediction": {"type": "STRING"},
        "tradeoffs": {
            "type": "OBJECT",
            "properties": {
                "pros": {"type": "STRING"},
                "cons": {"type": "STRING"},
                "risk_level": {"type": "STRING"}
            },
            "required": ["pros", "cons", "risk_level"]
        }
    },
    "required": ["insight", "recommendations", "reasoning", "prediction", "tradeoffs"]
}

def ensure_collection():
    """Checks for collection existence efficiently."""
    if not qdrant_client.collection_exists(COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE, 
                distance=models.Distance.COSINE
            ),
        )

def ingest_document(documents: List[str]):
    """Embeds and uploads with deterministic IDs to prevent duplicates."""
    ensure_collection()

    # Use 'retrieval_document:' prefix for best search results
    prefixed_docs = [f"retrieval_document: {doc}" for doc in documents]

    embed_result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=prefixed_docs
    )

    points = []
    for doc, emb in zip(documents, embed_result.embeddings):
        # Deterministic ID: same content = same ID. Prevents clutter.
        doc_id = hashlib.md5(doc.encode()).hexdigest()

        points.append(
            models.PointStruct(
                id=doc_id,
                vector=emb.values,
                payload={
                    "content": doc,
                    "ingested_at": datetime.now().isoformat()
                }
            )
        )

    qdrant_client.upload_points(
        collection_name=COLLECTION_NAME,
        points=points,
        wait=True
    )
    return len(points)

def query_rag(metadata: dict, query: str, top_k: int = 7):
    """Retrieves context and generates structured decision insights."""
    ensure_collection()

    # Use 'retrieval_query:' prefix for the query vector
    query_embed = client.models.embed_content(
        model="gemini-embedding-2",
        contents=f"retrieval_query: {query}"
    ).embeddings[0].values

    # Query Qdrant
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embed,
        limit=top_k,
        with_payload=True
    )

    # Context extraction (lowercase 'content' to match ingestion)
    context = "\n".join(
        hit.payload.get("content", "") for hit in search_results.points
    )

    # LLM Generation with Structured Output
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"CONTEXT DATA:\n{context}\n\nUSER DATA:\n{metadata}\n\nQUERY: {query}",
        config={
            "response_mime_type": "application/json",
            "response_schema": RAW_SCHEMA,
            "system_instruction": "You are a Senior Decision Intelligence Agent. Analyze context and user data to provide structured strategic advice."
        }
    )

    # When using RAW_SCHEMA, .parsed returns a dictionary or an object depending on SDK version
    return response.parsed

# # --- Main Entry Point ---
# if __name__ == "__main__":
    # Clear collection for fresh hackathon demo (optional)
    # qdrant_client.delete_collection(COLLECTION_NAME)
    
    sample_data = [
        "The quarterly revenue increased by 20%.", 
        "Market trends suggest a shift to AI-driven automation.",
        "Competitors are investing heavily in LLM integration."
    ]
    
    print("Ingesting documents...")
    ingest_document(sample_data)
    
    print("Querying RAG...")
    result = query_rag({"user_level": "Admin", "dept": "Strategy"}, "Should we invest in AI?")
    
    # Printing the results (handling potential dict/object response)
    if isinstance(result, dict):
        print(f"Insight: {result.get('insight')}")
    else:
        print(f"Insight: {result.insight}")