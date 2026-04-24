from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct
from langchain_qdrant import QdrantVectorStore
from fastembed import TextEmbedding, SparseTextEmbedding, LateInteractionTextEmbedding
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv
from google import genai

# 1. Load your key safely from the .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# 2. Initialize the Client
client = genai.Client(api_key=API_KEY)

bm25_embedding_model = SparseTextEmbedding("Qdrant/bm25")
late_interaction_embedding_model = LateInteractionTextEmbedding("colbert-ir/colbertv2.0")
dense_embedding_model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")

# qdrant = QdrantClient(host="qdrant", port=6333)
qdrant = QdrantClient(path="src/Data")
COLLECTION_NAME = "UMH26_RAG_Docs"

# #remember to remove for final work
# if qdrant.collection_exists(COLLECTION_NAME):
#     qdrant.delete_collection(collection_name=COLLECTION_NAME)

def checkDatabaseExist(dense_embeddings, late_interaction_embeddings):
    if not qdrant.collection_exists(COLLECTION_NAME):
        print("CREATE COLLECTION")
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config={
                "all-MiniLM-L6-v2": models.VectorParams(
                    size=len(dense_embeddings[0]),
                    distance=models.Distance.COSINE,
                ),
                "colbertv2.0": models.VectorParams(
                    size=len(late_interaction_embeddings[0][0]),
                    distance=models.Distance.COSINE,
                    multivector_config=models.MultiVectorConfig(
                        comparator=models.MultiVectorComparator.MAX_SIM,
                    ),
                    hnsw_config=models.HnswConfigDiff(m=0)  #  Disable HNSW for reranking
                ),
            },
            sparse_vectors_config={
                "bm25": models.SparseVectorParams(modifier=models.Modifier.IDF
                )
            }
        )

def ingest_document(documents: list):
    text_only = [doc['content'] for doc in documents]

    dense_embeddings = list(dense_embedding_model.embed(text_only))
    bm25_embeddings = list(bm25_embedding_model.embed(text_only))
    late_interaction_embeddings = list(late_interaction_embedding_model.embed(text_only))
    checkDatabaseExist(dense_embeddings, late_interaction_embeddings)

    points = []
    # print(f"INGESTING DOCUMENTSSSS\n  {documents}", flush=True)
    if len(documents) == 0:
        return 0
    # Assuming 'text_chunks' is now a list of dictionaries 
    # from the 'process_csv_for_rag' function we discussed earlier.

    for idx, item in enumerate(zip(dense_embeddings, bm25_embeddings, late_interaction_embeddings, documents)):
        dense, bm25, late, data = item # 'data' is now {'content': '...', 'metadata': {...}}
        
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector={
                "all-MiniLM-L6-v2": dense,
                "bm25": bm25.as_object(),
                "colbertv2.0": late,
            },
            # ADD THE METADATA HERE!
            payload={
                "text": data['content'], 
                **data['metadata'] # This unpacks CSV columns into the payload
            }
        )
        points.append(point)

    operation_info = qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    print(f"OPERATION INFO {operation_info}")

    return len(points)

def query_rag(query: str, top_k: int = 7) -> str:
    # Embed query
    dense_vectors = next(dense_embedding_model.query_embed(query))
    sparse_vectors = next(bm25_embedding_model.query_embed(query))
    late_vectors = next(late_interaction_embedding_model.query_embed(query))
    
    prefetch = [
        models.Prefetch(
            query=dense_vectors,
            using="all-MiniLM-L6-v2",
            limit=20,
        ),
        models.Prefetch(
            query=models.SparseVector(**sparse_vectors.as_object()),
            using="bm25",
            limit=20,
        ),
    ]

    result = qdrant.query_points(
            COLLECTION_NAME,
            prefetch=prefetch,
            query=late_vectors,
            using="colbertv2.0",
            with_payload=True,
            limit=10,
    )
    
    print("FINISH QUERYing points!!!!!")

    context_list = []
    list_of_scored_points = [tups for scored_points in result for tups in scored_points][1]

    print(f"\n\n{list_of_scored_points}\n\n")

    for point in list_of_scored_points:
        text = point.payload.get("text", "No text content")
        doc_name = point.payload.get("doc_name", "Unknown File")
        context_list.append(f"Source: {doc_name}\nContent: {text}")

    context = "\n\n---\n\n".join(context_list)

    # 6. Final Prompt
    prompt = f"""
    You are a Senior Decision Intelligence Agent. Your goal is to provide actionable insights based ON ONLY the provided data context.

    ### CONTEXT DATA
    The following records were retrieved from our vector database (Qdrant):
    {context}

    ### ANALYSIS GUIDELINES
    1. EVIDENCE-BASED: Every claim must be backed by a specific value or row from the context.
    2. QUANTIFY: Use numbers, percentages, and dates from the data.
    3. LOGIC GAP: If the data is insufficient to make a decision, clearly state what information is missing.
    4. ACTIONABLE: Conclude with a "Recommended Next Step."

    ### OUTPUT FORMAT
    1. **Executive Summary**: (2 sentences max)
    2. **Key Data Points Found**: (Bullet points)
    3. **Reasoning & Intelligence**: (How the data leads to the decision)
    4. **Final Recommendation**: (The "Why" and "How")    
    """

    # 7. Get AI Insight
    return get_decision_insight(prompt)


def get_decision_insight(data_summary):
    # 3. Call the model (Flash is great for hackathons due to speed/low cost)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Analyze this data for decision intelligence: {data_summary}"
    )
    
    return response.text

def closeQdrant():
    qdrant.close()

if __name__ == "__main__" :
    try:
        checkDatabaseExist()
        # 2. Your Hackathon Code Logic Here
        # (Ingesting CSV, Searching, etc.)
        print("Running analysis...")
    finally:
        # 3. Explicitly close the connection before the script ends
        print("Closing Qdrant connection...")
        qdrant.close()
