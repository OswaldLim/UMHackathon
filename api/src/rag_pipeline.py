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
    
    # 1. Get embeddings from Gemini
    # documents is expected to be a list of strings from your utils.py
    embed_result = client.models.embed_content(
        model="text-embedding-004",
        contents=documents
    )
    
    # 2. Prepare points for Qdrant
    points = [
        models.PointStruct(
            id=str(uuid.uuid4()),
            vector=item.values,
            payload={"content": doc}
        ) for doc, item in zip(documents, embed_result.embeddings)
    ]
    
    # 3. Upload
    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    return len(points)

def query_rag(metadata: dict, query: str, top_k: int = 7) -> str:
    # Embed query
    query_embed = client.models.embed_content(
            model="text-embedding-004",
            contents=query
        ).embeddings[0].values

    result = qdrant_client.query_points(
            COLLECTION_NAME,
            query_vector=query_embed,
            with_payload=True,
            limit=10,
    )
    
    print("FINISH QUERYing points!!!!!")

    context_list = []
    list_of_scored_points = [tups for scored_points in result for tups in scored_points][1]

    # print(f"\n\n{list_of_scored_points}\n\n")

    context = "\n".join([hit.payload["content"] for hit in result])

    # 6. Final Prompt
    prompt = f"""
    You are a Senior Decision Intelligence Agent. Your goal is to provide actionable insights based ON ONLY the provided data context.

    ### CONTEXT DATA
    The following records were retrieved from our vector database (Qdrant):
    {context}

    The following records were user inputs
    {metadata}

    ### ANALYSIS GUIDELINES
    1. EVIDENCE-BASED: Every claim must be backed by a specific value or row from the context.
    2. QUANTIFY: Use numbers, percentages, and dates from the data.
    3. LOGIC GAP: If the data is insufficient to make a decision, clearly state what information is missing.
    4. ACTIONABLE: Conclude with a "Recommended Next Step."

    ### OUTPUT FORMAT RETURN ONLY VALID JSON FORMAT 

    {
        "insight": "",
        "recommendations": [],
        "reasoning": "",
        "prediction": "",
        "tradeoffs": {...}
    }    
    """

    # 7. Get AI Insight
    return get_decision_insight(prompt)


def get_decision_insight(prompt):
    # 3. Call the model (Flash is great for hackathons due to speed/low cost)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    return json.loads(response.text)

# if __name__ == "__main__" :
#     try:
#         checkDatabaseExist()
#         # 2. Your Hackathon Code Logic Here
#         # (Ingesting CSV, Searching, etc.)
#         print("Running analysis...")
#     finally:
#         # 3. Explicitly close the connection before the script ends
#         print("Closing Qdrant connection...")
#         qdrant.close()
