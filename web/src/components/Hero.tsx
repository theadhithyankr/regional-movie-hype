import React from 'react';
import Image from 'next/image';
import ScoreBadge from './ScoreBadge';
import SourceBadge from './SourceBadge';
import type { MovieProps } from './MovieCard';

export default function Hero({ title, posterUrl, aiScore, source, snippet }: MovieProps) {
  return (
    <section className="relative w-full max-w-6xl mx-auto my-8 rounded-2xl overflow-hidden bg-card border border-card-border shadow-2xl">
      <div className="flex flex-col md:flex-row">
        {/* Big Poster */}
        <div className="md:w-[40%] aspect-[2/3] md:aspect-auto bg-neutral-800 relative">
          <Image 
            src={posterUrl} 
            alt={`${title} Poster`} 
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute top-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md z-10">
            Movie of the Week
          </div>
        </div>
        
        {/* Details */}
        <div className="p-8 md:p-12 flex flex-col justify-center md:w-[60%] relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
            {title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="scale-125 origin-left">
              <ScoreBadge score={aiScore} />
            </div>
            <SourceBadge source={source} />
          </div>
          
          <div className="text-lg md:text-xl text-foreground/80 italic mb-8 border-l-4 border-primary pl-4 py-1 line-clamp-3">
            "{snippet}"
          </div>
          
          <button className="bg-primary hover:bg-[#D42A08] text-white font-bold py-3 px-8 rounded-full w-max transition-all shadow-lg hover:shadow-primary/30 active:scale-95">
            View Full Analysis
          </button>
        </div>
      </div>
    </section>
  );
}
