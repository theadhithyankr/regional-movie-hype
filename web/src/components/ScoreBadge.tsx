import React from 'react';
import { Flame, Minus, Trash2 } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  let colorClass = "";
  let Icon = null;
  let iconClass = "";

  if (score >= 7) {
    colorClass = "bg-primary text-white";
    Icon = Flame;
    iconClass = "fill-current";
  } else if (score >= 4) {
    colorClass = "bg-orange-500 text-white";
    Icon = Minus;
    iconClass = "stroke-[3px]";
  } else {
    colorClass = "bg-green-600 text-white"; // like the RT green splat
    Icon = Trash2;
    iconClass = "fill-current";
  }

  return (
    <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md ${colorClass} shadow-md border border-white/10`}>
      <Icon className={`w-5 h-5 ${iconClass}`} />
      <span className="text-2xl font-black tabular-nums tracking-tighter">
        {score.toFixed(1)}
      </span>
    </div>
  );
}
