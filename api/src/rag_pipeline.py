import os
import hashlib
from datetime import datetime
from typing import List
from dotenv import load_dotenv

from qdrant_client import QdrantClient, models
from google import genai

# ========================================
# 1. CONFIG
# ========================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")

COLLECTION_NAME = "UMH26_RAG_Docs"

# gemini-embedding-2 = 3072
VECTOR_SIZE = 3072


# ========================================
# 2. CLIENTS
# ========================================

client = genai.Client(api_key=API_KEY)

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)


# ========================================
# 3. OUTPUT SCHEMA
# MUST MATCH FRONTEND AIOutput
# ========================================

RAW_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "insight": {
            "type": "STRING"
        },

        "recommendations": {
            "type": "ARRAY",
            "items": {
                "type": "STRING"
            }
        },

        "reasoning": {
            "type": "STRING"
        },

        "prediction": {
            "type": "STRING"
        },

        "tradeoffs": {
            "type": "OBJECT",
            "properties": {
                "optionA": {
                    "type": "STRING"
                },
                "optionB": {
                    "type": "STRING"
                },
                "verdict": {
                    "type": "STRING"
                }
            },
            "required": [
                "optionA",
                "optionB",
                "verdict"
            ]
        }
    },

    "required": [
        "insight",
        "recommendations",
        "reasoning",
        "prediction",
        "tradeoffs"
    ]
}


# ========================================
# 4. COLLECTION SETUP
# ========================================

def ensure_collection():
    if not qdrant_client.collection_exists(COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE,
                distance=models.Distance.COSINE
            ),
        )


# ========================================
# 5. INGEST DOCUMENTS
# ========================================

def ingest_document(documents: List[str]):
    """
    Upload CSV rows / processed documents into Qdrant
    """

    ensure_collection()

    prefixed_docs = [
        f"retrieval_document: {doc}"
        for doc in documents
    ]

    embed_result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=prefixed_docs
    )

    points = []

    for doc, emb in zip(documents, embed_result.embeddings):
        # deterministic ID prevents duplicate uploads
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


# ========================================
# 6. QUERY RAG
# ========================================

def query_rag(metadata: dict, query: str, top_k: int = 7):
    """
    Returns output matching frontend AIOutput interface
    """

    ensure_collection()

    # Query embedding
    query_embed = client.models.embed_content(
        model="gemini-embedding-2",
        contents=f"retrieval_query: {query}"
    ).embeddings[0].values

    # Search Qdrant
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embed,
        limit=top_k,
        with_payload=True
    )

    # Extract context
    context = "\n".join(
        hit.payload.get("content", "")
        for hit in search_results.points
    )

    if not context.strip():
        context = "No relevant business records were found in the uploaded data."

    # LLM generation
    response = client.models.generate_content(
        model="gemini-2.5-flash",

        contents=f"""
CONTEXT DATA:
{context}

USER BUSINESS DATA:
{metadata}

USER QUESTION:
{query}
""",

        config={
            "response_mime_type": "application/json",
            "response_schema": RAW_SCHEMA,

            "system_instruction": """
You are a Senior Decision Intelligence Agent.

Your task:
Return ONLY valid JSON matching the required schema.

Rules:
1. Be highly practical and business-focused
2. Use evidence from the uploaded CSV context
3. Use user metadata to personalize advice
4. Recommendations must be actionable
5. Tradeoffs must compare 2 realistic business options
6. Never return markdown
7. Never explain outside JSON
"""
        }
    )

    return response.parsed