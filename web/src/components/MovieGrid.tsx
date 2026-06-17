import React from 'react';

export default function MovieGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-6xl mx-auto mb-16">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
        <span className="w-2 h-8 bg-primary rounded-sm inline-block"></span>
        Trending Now
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}
