import React from 'react';
import { MessageSquare, MonitorPlay } from 'lucide-react';

interface SourceBadgeProps {
  source: 'Reddit' | 'YouTube';
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  const isReddit = source === 'Reddit';
  
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border
      ${isReddit 
        ? 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/30' 
        : 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/30'
      }
    `}>
      {isReddit ? <MessageSquare className="w-3 h-3" /> : <MonitorPlay className="w-3 h-3" />}
      {source}
    </div>
  );
}
