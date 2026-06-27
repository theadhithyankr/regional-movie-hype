<div align="center">
  <br />
  <h1>Regional Movie Hype</h1>
  <p><strong>AI-assisted hype tracking for Indian regional cinema</strong></p>
  <p><a href="https://github.com/theadhithyankr/regional-movie-hype"><strong>View Repository</strong></a></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-000000?style=for-the-badge" />
</p>

## Overview

Regional Movie Hype tracks online excitement around Indian regional films by collecting public discussion signals, storing them in Supabase, and scoring comment sentiment with Groq. The project combines Python data collection scripts with a Next.js dashboard for viewing hype scores across Mollywood, Kollywood, Bollywood, and Tollywood titles.

The repository includes a pipeline for TMDB discovery, YouTube trailer comment collection, optional Reddit monitoring, AI scoring, and a web interface for reviewing movie cards, source badges, score badges, and script controls.

---

## Key Features

- **Regional discovery engine:** Finds popular movies by original language using TMDB for Malayalam, Tamil, Hindi, and Telugu cinema.
- **YouTube comment hunter:** Locates official trailers and stores recent audience comments with source, movie, region, and upvote metadata.
- **Reddit collector:** Streams matching comments from configured movie communities and sends them to Supabase for later analysis.
- **Groq hype scoring:** Grades unprocessed comments from 1 to 10, while filtering unrelated or spam-like comments with a negative score.
- **Supabase persistence:** Uses Supabase tables for comment storage and pipeline status updates.
- **Next.js dashboard:** Presents collected movie hype data through reusable cards, badges, headers, and script-control UI components.

---

## Architecture

```text
TMDB Discovery
    -> regional movie candidates
YouTube / Reddit Collectors
    -> raw comments and engagement signals
Supabase
    -> movie_hype records and pipeline_status updates
Groq Analyzer
    -> hype_score updates for ungraded comments
Next.js Dashboard
    -> regional movie cards and status controls
```

---

## Tech Stack

### Data Pipeline
- Python
- TMDB API
- YouTube Data API
- Reddit API via PRAW
- Groq SDK
- Supabase Python client
- python-dotenv

### Web Dashboard
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JS client
- lucide-react

---

## Project Structure

```text
regional-movie-hype/
├── analyzer.py             # Scores ungraded comments with Groq
├── collector.py            # Streams Reddit movie mentions into Supabase
├── master_pipeline.py      # Runs discovery, YouTube collection, and scoring
├── yt_collector.py         # YouTube-specific collection helper
├── db_test.py              # Supabase connectivity check
└── web/                    # Next.js dashboard
    ├── src/app/            # App Router pages and API routes
    ├── src/components/     # Header, hero, movie cards, badges, controls
    ├── src/lib/            # Supabase and TMDB helpers
    └── package.json        # Web scripts and dependencies
```

---

## Setup and Run Locally

### Prerequisites
- Python 3.10+
- Node.js 20+
- Supabase project
- TMDB API key
- YouTube Data API key
- Groq API key
- Reddit API credentials if using `collector.py`

### 1. Clone the Repository

```bash
git clone https://github.com/theadhithyankr/regional-movie-hype.git
cd regional-movie-hype
```

### 2. Configure Environment Variables

Create a `.env` file in the repository root for the Python scripts:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_or_anon_key
TMDB_API_KEY=your_tmdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GROQ_API_KEY=your_groq_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_reddit_user_agent
```

For the web dashboard, create `web/.env.local` with the public Supabase values expected by `web/src/lib/supabase.ts`.

### 3. Install Python Dependencies

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install requests python-dotenv google-api-python-client supabase groq praw
```

### 4. Run the Data Pipeline

```bash
python master_pipeline.py
```

Optional standalone scripts:

```bash
python collector.py
python analyzer.py
python db_test.py
```

### 5. Run the Dashboard

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Available Web Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## What This Project Demonstrates

- Building a full data workflow from public media APIs to a live dashboard.
- Combining Python automation, Supabase persistence, and AI scoring in one project.
- Turning noisy social comments into a structured movie-hype signal for regional film discovery.
- Presenting pipeline state and ranked movie insights through a modern Next.js interface.

---

## Links

- **Repository:** https://github.com/theadhithyankr/regional-movie-hype
- **Dashboard source:** [`web/`](./web)

<div align="center">
  <sub>Built for tracking regional cinema buzz from discovery to dashboard.</sub>
</div>
