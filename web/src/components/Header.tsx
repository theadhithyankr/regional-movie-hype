import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Text */}
          <span className="text-2xl font-black tracking-tighter text-primary">
            CINEMA HYPE RADAR
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Live Status Indicator */}
          <span className="text-sm font-medium uppercase tracking-wider text-foreground/80">Live</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </div>
    </header>
  );
}
