from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from src import rag_pipeline  # Assuming your functions are in src/rag_pipeline.py
from src import utils
import os

app = FastAPI()

# Define the request structure
class QueryRequest(BaseModel):
    metadata: dict
    prompt: str

@app.get("/")
def read_root():
    return {"status": "Decision Intelligence API is live"}

@app.post("/api/ingest")
async def ingest(file: UploadFile = File(...)):
    # 1. Create a safe path for the temporary file
    # On Vercel, use /tmp/ as it's the only writable directory
    temp_file_path = f"/tmp/{file.filename}"
    
    try:
        # 2. Read and save the uploaded content
        contents = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(contents)

        # 3. Process the file you JUST uploaded
        # Use the dynamic temp_file_path instead of the hardcoded demo path
        documents = utils.process_csv_for_rag(temp_file_path)
        
        if not documents:
            return {"error": "Failed to process CSV or file was empty."}

        # 4. Ingest into Qdrant
        count = rag_pipeline.ingest_document(documents)
        
        return {
            "status": "Success",
            "message": f"Ingested {count} rows from {file.filename}",
            "collection": rag_pipeline.COLLECTION_NAME
        }

    except Exception as e:
        return {"status": "Error", "message": str(e)}
    
    finally:
        # 5. Cleanup: Always delete the temp file after processing
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/query")
async def handle_query(request: QueryRequest):
    try:
        # Call your existing query_rag function
        result = rag_pipeline.query_rag(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: Vercel handles the uvicorn execution automatically