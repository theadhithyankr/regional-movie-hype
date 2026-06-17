import os
import urllib.request
import json
from dotenv import load_dotenv
from googleapiclient.discovery import build
from supabase import create_client
from groq import Groq

# Load the secure keys
load_dotenv()

# --- SETUP CLIENTS ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

def discover_malayalam_movies():
    print("--- 1. TMDB DISCOVERY ENGINE ---")
    url = f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&with_original_language=ml&sort_by=popularity.desc&page=1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        if "results" not in data:
            print("TMDB returned an error or no results.")
            return []
        
        # Take the top 10 movies to avoid hitting YouTube API rate limits too quickly
        movies = data['results'][:10]
        titles = [m['title'] for m in movies]
        print(f"Discovered Top 10 Malayalam Movies: {', '.join(titles)}\n")
        return titles
    except Exception as e:
        print(f"Failed to fetch from TMDB: {e}")
        return []

def hunt_youtube_comments(movie_title):
    print(f"--- 2. YOUTUBE HUNTER: {movie_title} ---")
    query = f"{movie_title} malayalam movie official trailer"
    try:
        # Search for the trailer
        search_response = youtube.search().list(
            q=query,
            part="id",
            maxResults=1,
            type="video"
        ).execute()

        if not search_response.get("items"):
            print(f"No trailer found for {movie_title}.\n")
            return

        video_id = search_response["items"][0]["id"]["videoId"]
        print(f"Found Trailer Video ID: {video_id}")

        # Fetch top 20 comments
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=20,
            textFormat="plainText"
        )
        response = request.execute()

        new_comments_count = 0
        for item in response['items']:
            comment = item['snippet']['topLevelComment']['snippet']
            text = comment['textDisplay']
            upvotes = comment['likeCount']
            
            # Simple deduplication: Check if comment_body already exists
            existing = supabase.table("movie_hype").select("id").eq("comment_body", text).execute()
            if len(existing.data) > 0:
                continue

            supabase.table("movie_hype").insert({
                "subreddit": "YouTube",
                "movie_title": movie_title,
                "comment_body": text,
                "upvotes": upvotes,
                "hype_score": 0.0
            }).execute()
            new_comments_count += 1

        print(f"Inserted {new_comments_count} new comments into the vault for {movie_title}.\n")

    except Exception as e:
        print(f"Hunter failed for {movie_title}: {e}\n")

def analyze_comments():
    print("--- 3. GROQ ANALYZER ENGINE ---")
    try:
        records = supabase.table("movie_hype").select("*").eq("hype_score", 0.0).execute()
        if not records.data:
            print("All clear. No new comments to process.")
            return

        print(f"Found {len(records.data)} new comment(s) to analyze.\n")
        for row in records.data:
            text = row["comment_body"]
            row_id = row["id"]
            
            try:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile", 
                    messages=[
                        {"role": "system", "content": "You are a ruthless movie critic analyzing internet comments. First, check if the comment is actually talking about a movie, trailer, or actor. If the comment is spam, gibberish, or completely unrelated to cinema, return ONLY the number -1. If it IS about a movie, score the excitement level from 1 to 10 (1 is terrible, 10 is masterpiece). Return ONLY the number."},
                        {"role": "user", "content": text}
                    ],
                    temperature=0.1 
                )
                raw_score = response.choices[0].message.content.strip()
                graded_score = float(raw_score)
            except Exception as e:
                graded_score = 5.0
                
            supabase.table("movie_hype").update({"hype_score": graded_score}).eq("id", row_id).execute()
            print(f"Graded Row {row_id} with score {graded_score}.")
            
    except Exception as e:
        print(f"Analyzer failed: {e}")

if __name__ == "__main__":
    print("Initiating Master Pipeline...\n")
    top_movies = discover_malayalam_movies()
    for movie in top_movies:
        hunt_youtube_comments(movie)
    analyze_comments()
    print("\nMaster Pipeline execution complete.")
