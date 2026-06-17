import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MovieGrid from "@/components/MovieGrid";
import MovieCard from "@/components/MovieCard";
import ScriptControls from "@/components/ScriptControls";
import { supabase } from "@/lib/supabase";

const POSTER_MAP: Record<string, string> = {
  "Aavesham": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=400&auto=format&fit=crop",
  "Kotha": "https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=400&auto=format&fit=crop",
  "Bramayugam": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=400&auto=format&fit=crop",
  "Manjummel": "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=400&auto=format&fit=crop",
  "Spider-man: Brand New Day": "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop",
};

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: comments, error } = await supabase
    .from('movie_hype')
    .select('*')
    .gt('hype_score', 0)
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching data:", error);
  }

  const movieMap = new Map<string, any>();
  
  if (comments) {
    comments.forEach(c => {
      if (!movieMap.has(c.movie_title)) {
        movieMap.set(c.movie_title, {
          title: c.movie_title,
          totalScore: 0,
          count: 0,
          latestSnippet: c.comment_body,
          source: c.subreddit.toLowerCase() === 'youtube' ? 'YouTube' : 'Reddit',
          posterUrl: POSTER_MAP[c.movie_title] || DEFAULT_POSTER
        });
      }
      
      const movie = movieMap.get(c.movie_title);
      movie.totalScore += c.hype_score;
      movie.count += 1;
    });
  }

  const movies = Array.from(movieMap.values()).map(m => ({
    title: m.title,
    posterUrl: m.posterUrl,
    aiScore: m.totalScore / m.count,
    source: m.source,
    snippet: m.latestSnippet
  }));

  const heroMovie = movies.length > 0 ? movies[0] : null;
  const gridMovies = movies.length > 1 ? movies.slice(1) : movies;

  return (
    <main className="min-h-screen pb-16">
      <Header />
      
      <div className="px-4 mt-8 max-w-6xl mx-auto">
        <ScriptControls />
      </div>

      <div className="px-4">
        {heroMovie ? (
          <Hero 
            title={heroMovie.title} 
            aiScore={heroMovie.aiScore} 
            source={heroMovie.source as 'Reddit' | 'YouTube'} 
            snippet={heroMovie.snippet} 
            posterUrl={heroMovie.posterUrl}
          />
        ) : (
          <div className="max-w-6xl mx-auto my-8 p-12 text-center text-foreground/60 border border-card-border rounded-xl">
            No graded movie data found. Run the Collector and Analyzer scripts above!
          </div>
        )}
        
        {gridMovies.length > 0 && (
          <MovieGrid>
            {gridMovies.map((movie, index) => (
               <MovieCard key={index} {...movie} />
            ))}
          </MovieGrid>
        )}
      </div>
    </main>
  );
}
