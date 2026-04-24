import pandas as pd
import ollama

import pandas as pd

def process_csv_for_gemini(file_path):
    """
    Reads a CSV, cleans it, and converts it into a Markdown format 
    that Gemini can easily interpret.
    """
    try:
        # 1. Load the data
        df = pd.read_csv(file_path)
        
        # 2. Cleaning: Remove completely empty rows/columns
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        
        # 3. Fill remaining NaNs so Gemini doesn't get confused by "NaN" strings
        df = df.fillna("Unknown")
        
        # 4. Limit size if necessary (Optional)
        # Gemini 1.5 Flash/Pro can handle huge contexts, but for simple 
        # queries, the first 50-100 rows usually suffice.
        # df = df.head(100) 

        # 5. Convert to Markdown string
        # Gemini is exceptionally good at parsing Markdown table structures.
        formatted_data = df.to_markdown(index=False)
        
        return formatted_data

    except Exception as e:
        return f"Error processing file: {str(e)}"



# Example of how you would use this with your API call:
# data_context = process_csv_for_gemini("my_data.csv")
# prompt = f"Based on this data:\n\n{data_context}\n\nQuestion: What is the total revenue?"

# Example Usage:
# result = preprocess_and_query_csv("sales_data.csv", "Which product had the highest revenue?")
# print(result)