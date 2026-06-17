import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Attempting to connect to the cloud vault...")

try:
    # Insert a dummy row to test the plumbing
    response = supabase.table("movie_hype").insert({
        "subreddit": "MalayalamMovies",
        "movie_title": "King of Kotha",
        "comment_body": "The hype for this re-watch is insane!",
        "upvotes": 42
    }).execute()
    
    print("Success! Data successfully deployed to the cloud vault.")
    print(f"Server Response: {response.data}")

except Exception as e:
    print(f"Connection failed. Error details: {e}")