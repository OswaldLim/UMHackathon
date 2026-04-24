        # 2. Your Hackathon Code Logic Here
        # (Ingesting CSV, Searching, etc.)
        print("Running analysis...")

    finally:
        # 3. Explicitly close the connection before the script ends
        print("Closing Qdrant connection...")
        client.close()