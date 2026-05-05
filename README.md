# ATS Resume Screener

An AI-powered resume analyzer that scores your resume against a job description and gives you actionable feedback to beat ATS filters.

## Features

- **ATS Score** — 0–100 match score with a visual gauge
- **Keyword Analysis** — matched and missing keywords with importance ratings
- **Section Feedback** — analysis of experience, skills, education, and more
- **Improvement Tips** — specific, actionable suggestions to strengthen your resume
- **File Support** — upload PDF, DOCX, or TXT resumes

## Tech Stack

- [Next.js 15](https://nextjs.org) — React framework
- [Groq API](https://groq.com) — fast inference with `llama-3.3-70b-versatile` (free tier)
- [Tailwind CSS](https://tailwindcss.com) — styling
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) + [mammoth](https://www.npmjs.com/package/mammoth) — resume text extraction

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/amanasvi2/ats-resume-screener.git
   cd ats-resume-screener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Groq API key**
   ```bash
   cp .env.local.example .env.local
   ```
   Get a free key at [console.groq.com](https://console.groq.com), then paste it into `.env.local`:
   ```
   GROQ_API_KEY=your_key_here
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Upload your resume (PDF, DOCX, or TXT)
2. Paste the job description you're applying to
3. Click **Analyze Resume** and get your results in seconds
