import os
import requests
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

REGIONS = {
    "Mollywood": "ml",
    "Kollywood": "ta",
    "Bollywood": "hi",
    "Tollywood": "te"
}

def update_status(msg):
    print(f"STATUS: {msg}")
    try:
        supabase.table("pipeline_status").upsert({"id": 1, "status_text": msg}).execute()
    except Exception as e:
        print(f"Failed to update status: {e}")

def discover_movies():
    update_status("Starting TMDB Discovery Engine...")
    all_movies = []
    
    for region_name, lang_code in REGIONS.items():
        update_status(f"Discovering Top {region_name} Movies...")
        url = f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&with_original_language={lang_code}&sort_by=popularity.desc&page=1"
        
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}).json()
                
            if "results" not in response:
                print(f"TMDB returned an error for {region_name}.")
                continue
            
            # Take top 5 per region to save YouTube quota (5 regions * 5 = 25 movies)
            movies = response['results'][:5]
            titles = [m['title'] for m in movies]
            print(f"Discovered {region_name}: {', '.join(titles)}")
            
            for t in titles:
                all_movies.append({"title": t, "region": region_name, "lang": lang_code})
                
        except Exception as e:
            print(f"Failed to fetch {region_name} from TMDB: {e}")
            
    return all_movies

def hunt_youtube_comments(movie):
    title = movie['title']
    region = movie['region']
    update_status(f"Hunting YouTube for {title} ({region})...")
    
    query = f"{title} official trailer"
    if region == "Mollywood":
        query += " malayalam"
    elif region == "Kollywood":
        query += " tamil"
    elif region == "Tollywood":
        query += " telugu"
    elif region == "Bollywood":
        query += " hindi"
        
    try:
        search_response = youtube.search().list(
            q=query,
            part="id",
            maxResults=1,
            type="video"
        ).execute()

        if not search_response.get("items"):
            print(f"No trailer found for {title}.")
            return

        video_id = search_response["items"][0]["id"]["videoId"]
        
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
            
            existing = supabase.table("movie_hype").select("id").eq("comment_body", text).execute()
            if len(existing.data) > 0:
                continue

            supabase.table("movie_hype").insert({
                "subreddit": "YouTube",
                "movie_title": title,
                "region": region,
                "comment_body": text,
                "upvotes": upvotes,
                "hype_score": 0.0
            }).execute()
            new_comments_count += 1

        print(f"Inserted {new_comments_count} new comments for {title}.")

    except Exception as e:
        print(f"Hunter failed for {title}: {e}")

def analyze_comments():
    update_status("Waking up Groq Analyzer...")
    try:
        records = supabase.table("movie_hype").select("*").eq("hype_score", 0.0).execute()
        if not records.data:
            update_status("All clear. No new comments to process.")
            return

        total = len(records.data)
        update_status(f"Groq AI preparing to grade {total} comments...")
        
        for i, row in enumerate(records.data):
            text = row["comment_body"]
            row_id = row["id"]
            
            update_status(f"Groq AI grading comment {i+1} of {total}...")
            
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
            
    except Exception as e:
        print(f"Analyzer failed: {e}")
        update_status(f"Analyzer Error: {e}")

if __name__ == "__main__":
    update_status("Pipeline Started")
    top_movies = discover_movies()
    for i, movie in enumerate(top_movies):
        update_status(f"Hunting YouTube {i+1}/{len(top_movies)}: {movie['title']}")
        hunt_youtube_comments(movie)
    analyze_comments()
    update_status("Pipeline Finished! Refreshing dashboard...")
