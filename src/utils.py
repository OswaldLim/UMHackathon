import pandas as pd

import pandas as pd

import pandas as pd

def process_csv_for_rag(file_path):
    """
    Cleans CSV and prepares a list of 'documents' for Qdrant.
    Each document is a natural language string of a row + metadata.
    """
    try:
        df = pd.read_csv(file_path)
        
        # 1. Clean (Your existing logic)
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        df = df.fillna("Unknown")
        
        # 2. Convert each row into a structured string for the LLM to 'read'
        # This is what gets turned into a Vector
        documents = []
        for _, row in df.iterrows():
            # Create a descriptive string: "Column1 is Value1. Column2 is Value2..."
            content_text = ". ".join([f"The {col} is {val}" for col, val in row.items()])
            
            # Create a dictionary for the Qdrant Payload
            metadata = row.to_dict()
            
            documents.append({
                "content": content_text,
                "metadata": metadata
            })
            
        return documents

    except Exception as e:
        print(f"Error: {e}")
        return []

# Example Usage:
# data = process_csv_for_rag("data.csv")
# print(data[0]['content'])  # Used for Gemini/Embedding
# print(data[0]['metadata']) # Used for Filtering in Qdrant


# Example of how you would use this with your API call:
# data_context = process_csv_for_gemini("my_data.csv")
# prompt = f"Based on this data:\n\n{data_context}\n\nQuestion: What is the total revenue?"

# Example Usage:
# result = preprocess_and_query_csv("sales_data.csv", "Which product had the highest revenue?")
# print(result)