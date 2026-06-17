export async function fetchPosterUrl(movieTitle: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  if (!apiKey) {
    console.warn("TMDB API key is missing");
    return null;
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieTitle)}&api_key=${apiKey}`);
    if (!res.ok) {
      console.warn("TMDB API request failed", await res.text());
      return null;
    }
    
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const movieWithPoster = data.results.find((m: any) => m.poster_path);
      if (movieWithPoster) {
        return `https://image.tmdb.org/t/p/w500${movieWithPoster.poster_path}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch TMDB poster:", error);
    return null;
  }
}
