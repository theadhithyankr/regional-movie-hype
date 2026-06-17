import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MovieGrid from "@/components/MovieGrid";
import MovieCard from "@/components/MovieCard";
import type { MovieProps } from "@/components/MovieCard";

const MOCK_MOVIES: MovieProps[] = [
  {
    title: "Aavesham",
    posterUrl: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=400&auto=format&fit=crop",
    aiScore: 9.2,
    source: "Reddit",
    snippet: "FaFa is an absolute beast! Best theatrical experience.",
  },
  {
    title: "King of Kotha",
    posterUrl: "https://images.unsplash.com/photo-1574267432553-4b4628081524?q=80&w=400&auto=format&fit=crop",
    aiScore: 5.4,
    source: "YouTube",
    snippet: "Visually stunning but the second half drags a bit.",
  },
  {
    title: "Bramayugam",
    posterUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=400&auto=format&fit=crop",
    aiScore: 8.8,
    source: "Reddit",
    snippet: "Mammooka's terrifying screen presence carries the entire film.",
  },
  {
    title: "Manjummel Boys",
    posterUrl: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?q=80&w=400&auto=format&fit=crop",
    aiScore: 9.5,
    source: "YouTube",
    snippet: "A masterpiece of survival thriller. Cried in the climax.",
  },
  {
    title: "Premalu",
    posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&auto=format&fit=crop",
    aiScore: 8.1,
    source: "Reddit",
    snippet: "Hilarious and relatable! Best rom-com from Malayalam cinema recently.",
  },
  {
    title: "Malaikottai Vaaliban",
    posterUrl: "https://images.unsplash.com/photo-1533240332313-0bc499f50874?q=80&w=400&auto=format&fit=crop",
    aiScore: 3.5,
    source: "YouTube",
    snippet: "Too slow and abstract for a commercial entertainer.",
  }
];

export default function Home() {
  return (
    <main className="min-h-screen pb-16">
      <Header />
      
      <div className="px-4">
        <Hero />
        
        <MovieGrid>
          {MOCK_MOVIES.map((movie, index) => (
             <MovieCard key={index} {...movie} />
          ))}
        </MovieGrid>
      </div>
    </main>
  );
}
