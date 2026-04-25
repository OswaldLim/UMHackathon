from qdrant_client import QdrantClient, models
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
from google import genai
import json

# 1. Load your key safely from the .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY=os.getenv("QDRANT_API_KEY")
QDRANT_URL=os.getenv("QDRANT_URL")
COLLECTION_NAME = "UMH26_RAG_Docs"
VECTOR_SIZE = 768

# 2. Initialize the Client
client = genai.Client(api_key=API_KEY)

# Ensure the directory path exists before Qdrant tries to use it
# os.makedirs("src/Data", exist_ok=True)
# qdrant = QdrantClient(path="src/Data")

qdrant_client = QdrantClient(
    url=QDRANT_URL, 
    api_key=QDRANT_API_KEY,
)

print(qdrant_client.get_collections())


# #remember to remove for final work
# if qdrant.collection_exists(COLLECTION_NAME):
#     qdrant.delete_collection(collection_name=COLLECTION_NAME)

def ensure_collection():
    """Ensure the Qdrant collection exists with the correct vector size"""
    collections = qdrant_client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    
    if not exists:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE, 
                distance=models.Distance.COSINE
            ),
        )

def ingest_document(documents):
    """Embeds and uploads documents to Qdrant"""
    ensure_collection()

    embed_result = client.models.embed_content(
        model="text-embedding-004",
        contents=documents
    )

    embeddings = embed_result.embeddings

    points = []

    for doc, emb in zip(documents, embeddings):
        vector = emb.values  # safe access

        points.append(
            models.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "content": doc
                }
            )
        )

    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    return len(points)


def query_rag(metadata: dict, query: str, top_k: int = 7) -> str:
    ensure_collection()

    query_embed = client.models.embed_content(
        model="text-embedding-004",
        contents=query
    ).embeddings[0].values

    result = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query_vector=query_embed,
        with_payload=True,
        limit=top_k,
    )

    # ✅ FIXED RESULT PARSING
    hits = result.points if hasattr(result, "points") else result

    context = "\n".join(
        hit.payload.get("content", "") for hit in hits
    )

    prompt = f"""
You are a Senior Decision Intelligence Agent.

### CONTEXT DATA:
{context}

### USER DATA:
{metadata}

### TASK:
Return ONLY valid JSON:
{{
  "insight": "",
  "recommendations": [],
  "reasoning": "",
  "prediction": "",
  "tradeoffs": {{}}
}}
"""

    return get_decision_insight(prompt)

def get_decision_insight(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text

    # 🔥 SAFE JSON CLEANING
    text = text.strip()

    # remove markdown blocks if any
    if "```" in text:
        text = text.replace("```json", "").replace("```", "")

    return json.loads(text)