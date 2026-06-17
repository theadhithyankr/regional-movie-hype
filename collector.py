import os
from dotenv import load_dotenv
import praw
from supabase import create_client

# Load the secure keys
load_dotenv()

# --- 1. CONNECT TO THE CLOUD VAULT ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. CONNECT TO REDDIT ---
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

# We wrap this in a try-except block so it fails gracefully while you wait for keys
try:
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )
    print("Reddit connection established.")
except Exception as e:
    print(f"Reddit connection failed (waiting on API keys): {e}")
    exit(1)

# --- 3. SET THE RADAR TARGETS ---
# Change the subreddit to whatever community you want to track
TARGET_SUBREDDIT = "MalayalamMovies"

# The specific movies we are looking for in the chatter
MOVIE_TARGETS = ["aavesham", "kotha", "bramayugam", "manjummel"]

print(f"Radar online. Scanning r/{TARGET_SUBREDDIT} for live mentions...")

# --- 4. THE LIVE STREAM ---
try:
    subreddit = reddit.subreddit(TARGET_SUBREDDIT)
    
    # skip_existing=True ensures we only grab brand new comments from this second forward
    for comment in subreddit.stream.comments(skip_existing=True):
        
        # Force the text to lowercase so we don't miss "Aavesham" vs "aavesham"
        text_lower = comment.body.lower()
        
        # Check if any of our movie targets are mentioned in this comment
        for movie in MOVIE_TARGETS:
            if movie in text_lower:
                print(f"\n[TARGET ACQUIRED] Movie: {movie.capitalize()}")
                print(f"Comment: '{comment.body[:100]}...'") # Print just the first 100 chars
                
                # Push the raw comment to Supabase with a 0.0 score 
                # (Your Groq analyzer script will handle the scoring later)
                supabase.table("movie_hype").insert({
                    "subreddit": TARGET_SUBREDDIT,
                    "movie_title": movie.capitalize(),
                    "comment_body": comment.body,
                    "upvotes": comment.score
                }).execute()
                
                print("-> Safely locked in the cloud vault.")
                
                # Break the inner loop so if a comment mentions two movies, 
                # we don't accidentally save it twice
                break 

except Exception as e:
    print(f"Stream interrupted. Error: {e}")