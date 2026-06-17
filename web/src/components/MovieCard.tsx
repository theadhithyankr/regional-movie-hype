import React from 'react';
import ScoreBadge from './ScoreBadge';
import SourceBadge from './SourceBadge';

export interface MovieProps {
  title: string;
  posterUrl: string;
  aiScore: number;
  source: 'Reddit' | 'YouTube';
  snippet: string;
}

export default function MovieCard({ title, posterUrl, aiScore, source, snippet }: MovieProps) {
  return (
    <div className="flex bg-card rounded-xl overflow-hidden border border-card-border shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group h-48">
      {/* Poster placeholder */}
      <div className="w-[35%] shrink-0 bg-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={posterUrl} 
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col justify-between w-[65%]">
        <div>
          <h3 className="text-lg font-black tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1" title={title}>
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ScoreBadge score={aiScore} />
            <SourceBadge source={source} />
          </div>
        </div>
        
        <div className="text-sm text-foreground/70 italic border-l-2 border-primary/50 pl-3 line-clamp-2">
          "{snippet}"
        </div>
      </div>
    </div>
  );
}
