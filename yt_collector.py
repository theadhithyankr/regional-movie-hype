import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
from supabase import create_client

# Load the secure keys
load_dotenv()

# --- 1. CONNECT TO THE CLOUD VAULT ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. CONNECT TO YOUTUBE ---
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# The YouTube Video ID you want to scrape (Let's use a popular trailer)
VIDEO_ID = "8TZMtslA3UY" # Swap this with the actual trailer ID
MOVIE_TITLE = "Spider-man: Brand New Day"

print(f"YouTube Radar Online. Pulling top comments from {MOVIE_TITLE} trailer...")

try:
    # Grab the top 50 comments from the video
    request = youtube.commentThreads().list(
        part="snippet",
        videoId=VIDEO_ID,
        maxResults=50,
        textFormat="plainText"
    )
    response = request.execute()

    for item in response['items']:
        comment = item['snippet']['topLevelComment']['snippet']
        text = comment['textDisplay']
        upvotes = comment['likeCount']

        print(f"Acquired: '{text[:80]}...'")

        # Drop it into the vault for the Groq brain to grade later
        supabase.table("movie_hype").insert({
            "subreddit": "YouTube", # Reusing this column for the source
            "movie_title": MOVIE_TITLE,
            "comment_body": text,
            "upvotes": upvotes
        }).execute()

    print("\nMission Accomplished. Data safely locked in the vault.")

except Exception as e:
    print(f"Stream interrupted. Error: {e}")