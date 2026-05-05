'use client';

interface Props {
  score: number;
}

function getScoreColor(score: number) {
  if (score >= 85) return { stroke: '#22c55e', text: 'text-emerald-400', label: 'Excellent', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  if (score >= 70) return { stroke: '#84cc16', text: 'text-lime-400', label: 'Good', bg: 'bg-lime-500/10 border-lime-500/30' };
  if (score >= 55) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Fair', bg: 'bg-amber-500/10 border-amber-500/30' };
  if (score >= 40) return { stroke: '#f97316', text: 'text-orange-400', label: 'Needs Work', bg: 'bg-orange-500/10 border-orange-500/30' };
  return { stroke: '#ef4444', text: 'text-red-400', label: 'Poor Match', bg: 'bg-red-500/10 border-red-500/30' };
}

export default function ScoreGauge({ score }: Props) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color.stroke}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${color.text}`}>{score}</span>
          <span className="text-slate-500 text-xs font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${color.bg} ${color.text}`}>
        {color.label}
      </span>
    </div>
  );
}
