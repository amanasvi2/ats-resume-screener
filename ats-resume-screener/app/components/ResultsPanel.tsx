'use client';

import ScoreGauge from './ScoreGauge';

interface AnalysisResult {
  ats_score: number;
  summary: string;
  matched_keywords: { keyword: string; context: string }[];
  missing_keywords: { keyword: string; importance: string; suggestion: string }[];
  section_analysis: {
    experience: string;
    skills: string;
    education: string;
    other: string;
  };
  improvements: string[];
  overall_feedback: string;
}

interface Props {
  result: {
    analysis: AnalysisResult;
    resumeFileName: string;
    timestamp: string;
  };
  onReset: () => void;
}

const importanceColors: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-slate-200 font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ResultsPanel({ result, onReset }: Props) {
  const { analysis, resumeFileName, timestamp } = result;
  const analysisDate = new Date(timestamp).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-xl">Analysis Results</h2>
          <p className="text-slate-500 text-xs mt-0.5">{resumeFileName} &middot; {analysisDate}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all"
        >
          Analyze Another
        </button>
      </div>

      {/* Score + Summary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <ScoreGauge score={analysis.ats_score} />
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-300 font-semibold text-sm mb-2">Overall Assessment</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          {/* Quick stats */}
          <div className="mt-4 flex gap-4">
            <div className="text-center">
              <p className="text-emerald-400 font-bold text-lg">{analysis.matched_keywords.length}</p>
              <p className="text-slate-500 text-xs">Matched</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-bold text-lg">{analysis.missing_keywords.filter(k => k.importance === 'high').length}</p>
              <p className="text-slate-500 text-xs">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400 font-bold text-lg">{analysis.improvements.length}</p>
              <p className="text-slate-500 text-xs">Improvements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched */}
        <SectionCard title={`Matched Keywords (${analysis.matched_keywords.length})`}>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {analysis.matched_keywords.length === 0 ? (
              <p className="text-slate-500 text-xs">No keyword matches found.</p>
            ) : (
              analysis.matched_keywords.map((kw, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <span className="text-emerald-400 font-medium text-xs">{kw.keyword}</span>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{kw.context}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Missing */}
        <SectionCard title={`Missing Keywords (${analysis.missing_keywords.length})`}>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {analysis.missing_keywords.length === 0 ? (
              <p className="text-slate-500 text-xs">No missing keywords — great job!</p>
            ) : (
              analysis.missing_keywords.map((kw, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-xs">{kw.keyword}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${importanceColors[kw.importance] ?? importanceColors.low}`}>
                      {kw.importance}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{kw.suggestion}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Section Analysis */}
      <SectionCard title="Section-by-Section Analysis">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(analysis.section_analysis).map(([section, text]) => (
            <div key={section} className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-slate-300 font-semibold text-xs uppercase tracking-wide mb-2">{section}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Improvements */}
      <SectionCard title="Recommended Improvements">
        <ol className="space-y-3">
          {analysis.improvements.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Overall Feedback */}
      <SectionCard title="Overall Feedback">
        <div className="prose prose-sm prose-invert max-w-none">
          {analysis.overall_feedback.split('\n\n').map((para, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
