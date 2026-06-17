import os
from dotenv import load_dotenv
from groq import Groq
from supabase import create_client

# Load your secure keys
load_dotenv()

# --- 1. CONNECT TO THE CLOUD VAULT ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing vault credentials.")
    exit(1)
    
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 2. FIRE UP GROQ ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("Error: Missing Groq key in the .env file.")
    exit(1)
    
# Connect directly to Groq's servers
client = Groq(api_key=GROQ_API_KEY)

print("Cloud Brain Online (Groq). Scanning the vault...")

try:
    # Look for any row that hasn't been graded yet
    records = supabase.table("movie_hype").select("*").eq("hype_score", 0.0).execute()
    
    if not records.data:
        print("All clear. No new comments to process.")
    else:
        print(f"Found {len(records.data)} comment(s) to analyze.\n")
        
        for row in records.data:
            text = row["comment_body"]
            row_id = row["id"]
            
            # --- 3. THE INTERROGATION ---
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile", 
                messages=[
                    {"role": "system", "content": "You are a ruthless movie critic analyzing internet comments. First, check if the comment is actually talking about a movie, trailer, or actor. If the comment is spam, gibberish, or completely unrelated to cinema, return ONLY the number -1. If it IS about a movie, score the excitement level from 1 to 10 (1 is terrible, 10 is masterpiece). Return ONLY the number."},
                    {"role": "user", "content": text}
                ],
                temperature=0.1 
            )
            
            raw_score = response.choices[0].message.content.strip()
            
            try:
                graded_score = float(raw_score)
            except ValueError:
                graded_score = 5.0 
                
            print(f"Comment: '{text}'")
            print(f"Groq Score: {graded_score}/10")
            
            # --- 4. UPDATE THE VAULT ---
            supabase.table("movie_hype").update({"hype_score": graded_score}).eq("id", row_id).execute()
            print(f"Row {row_id} updated successfully.\n")
            
except Exception as e:
    print(f"System Failure. Error details: {e}")