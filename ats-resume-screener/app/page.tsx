'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import ResultsPanel from './components/ResultsPanel';

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

interface ApiResponse {
  analysis: AnalysisResult;
  resumeFileName: string;
  timestamp: string;
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = file.name.toLowerCase();
    if (!allowed.includes(file.type) && !ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setResumeFile(file);
    setError('');
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit() {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setResumeFile(null);
    setJobDescription('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">ATS Resume Screener</h1>
              <p className="text-slate-400 text-xs">Powered by Groq AI</p>
            </div>
          </div>
          {result && (
            <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!result ? (
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Beat the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">ATS Filter</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Upload your resume and paste a job description to get an instant AI-powered ATS score with actionable improvements.
              </p>
            </div>

            {/* Input form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Resume upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Resume</label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-violet-500 bg-violet-500/10'
                      : resumeFile
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={onFileChange} />
                  {resumeFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-emerald-400 font-medium text-sm">{resumeFile.name}</p>
                      <p className="text-slate-500 text-xs">{(resumeFile.size / 1024).toFixed(1)} KB — click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Drop your resume here</p>
                        <p className="text-slate-500 text-xs mt-1">PDF, DOCX, or TXT — or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Job description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Job Description</label>
                <textarea
                  className="w-full h-full min-h-[180px] bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:bg-slate-800 transition-all resize-none"
                  placeholder="Paste the full job description here — the more detail, the better the analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !resumeFile || !jobDescription.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing with Groq AI...
                </span>
              ) : (
                'Analyze Resume'
              )}
            </button>

            {/* How it works */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Upload Resume', desc: 'Drag & drop your PDF, DOCX, or TXT resume file.' },
                { step: '2', title: 'Paste Job Description', desc: 'Copy the full job posting into the text area.' },
                { step: '3', title: 'Get Your ATS Score', desc: 'Receive a detailed analysis with keyword matches and improvements.' },
              ].map((item) => (
                <div key={item.step} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <ResultsPanel result={result} onReset={reset} />
        )}
      </main>
    </div>
  );
}
