import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MovieGrid from "@/components/MovieGrid";
import MovieCard from "@/components/MovieCard";
import ScriptControls from "@/components/ScriptControls";
import { supabase } from "@/lib/supabase";
import { fetchPosterUrl } from "@/lib/tmdb";

const POSTER_MAP: Record<string, string> = {
  "Aavesham": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=400&auto=format&fit=crop",
  "Kotha": "https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=400&auto=format&fit=crop",
  "Bramayugam": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=400&auto=format&fit=crop",
  "Manjummel": "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=400&auto=format&fit=crop",
  "Spider-man: Brand New Day": "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=400&auto=format&fit=crop",
};

const DEFAULT_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const resolvedParams = await searchParams;
  const activeRegion = resolvedParams.region || 'All India';

  let query = supabase
    .from('movie_hype')
    .select('*')
    .gt('hype_score', 0)
    .order('id', { ascending: false });

  if (activeRegion !== 'All India') {
    query = query.eq('region', activeRegion);
  }

  const { data: comments, error } = await query;

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
          region: c.region || 'Mollywood',
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

  const moviesRaw = Array.from(movieMap.values());
  const movies = await Promise.all(moviesRaw.map(async m => {
    const tmdbPoster = await fetchPosterUrl(m.title);
    return {
      title: m.title,
      posterUrl: tmdbPoster || m.posterUrl,
      aiScore: m.totalScore / m.count,
      region: m.region,
      source: m.source,
      snippet: m.latestSnippet
    };
  }));

  const heroMovie = movies.length > 0 ? movies[0] : null;
  const gridMovies = movies.length > 1 ? movies.slice(1) : movies;

  return (
    <main className="min-h-screen pb-16">
      <Header />
      
      <div className="px-4 mt-8 max-w-6xl mx-auto">
        <ScriptControls />
      </div>

      <div className="px-4 max-w-6xl mx-auto mb-6 flex gap-4 overflow-x-auto pb-2 border-b border-card-border">
        {['All India', 'Mollywood', 'Kollywood', 'Tollywood', 'Bollywood'].map(r => (
          <a 
            key={r}
            href={`/?region=${r}`}
            className={`whitespace-nowrap px-4 py-2 font-bold tracking-tight border-b-4 transition-colors ${
              activeRegion === r 
                ? 'border-primary text-white' 
                : 'border-transparent text-foreground/50 hover:text-foreground hover:border-foreground/30'
            }`}
          >
            {r}
          </a>
        ))}
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
