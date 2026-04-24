import rag_pipeline
import utils

if __name__ == "__main__" :

    try:

        document = utils.process_csv_for_rag("test_files/business_operations_demo_e_commerce.csv")
        rag_pipeline.ingest_document(document)
        print("Successful Ingestion")
        print(rag_pipeline.query_rag("What is the latest trends found in sales"))
    finally:
        # 3. Explicitly close the connection before the script ends
        print("Closing Qdrant connection...")
        rag_pipeline.closeQdrant()


