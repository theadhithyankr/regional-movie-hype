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
        "movie_title": "Aavesham",
        "comment_body": "Honestly, the hype for this was absolutely insane. The visuals were peak, the music was god-tier, and I was so ready for it to change my life. What an absolute masterpiece of an incredible, spectacular, magnificent waste of my time.",
        "upvotes": 12
    }).execute()
    
    print("Success! Data successfully deployed to the cloud vault.")
    print(f"Server Response: {response.data}")

except Exception as e:
    print(f"Connection failed. Error details: {e}")