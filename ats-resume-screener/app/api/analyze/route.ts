import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer and career coach. Your job is to rigorously analyze resumes against job descriptions and provide detailed, actionable feedback that helps job seekers improve their chances.

You must respond with ONLY valid JSON — no markdown, no explanation text, just the raw JSON object. Use this exact structure:

{
  "ats_score": <integer 0-100 reflecting realistic ATS match>,
  "summary": "<2-3 sentences: overall fit assessment and key strengths/gaps>",
  "matched_keywords": [
    {"keyword": "<exact keyword from JD>", "context": "<where/how it appears in resume>"}
  ],
  "missing_keywords": [
    {"keyword": "<keyword from JD not in resume>", "importance": "<high|medium|low>", "suggestion": "<specific advice to add it naturally>"}
  ],
  "section_analysis": {
    "experience": "<analysis of work experience relevance and presentation>",
    "skills": "<analysis of skills section completeness and alignment>",
    "education": "<analysis of education section>",
    "other": "<analysis of any other sections: projects, certifications, etc.>"
  },
  "improvements": [
    "<specific, actionable improvement the candidate can make>"
  ],
  "overall_feedback": "<comprehensive 2-3 paragraph assessment with top priorities and encouragement>"
}

Scoring guide:
- 85-100: Resume is well-optimized, most keywords present, strong alignment
- 70-84: Good fit with some gaps, minor adjustments needed
- 55-69: Moderate fit, significant keywords missing, restructuring helpful
- 40-54: Some relevant experience but major gaps, significant work needed
- 0-39: Poor match for this specific role

Be honest, specific, and constructive. Focus on actionable advice.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!resumeFile || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 });
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText = '';
    const fileName = resumeFile.name.toLowerCase();

    if (resumeFile.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text;
    } else if (
      resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else if (resumeFile.type === 'text/plain' || fileName.endsWith('.txt')) {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from the resume. Please ensure the file is not image-only.' },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyze this resume against the job description. Return only valid JSON.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No analysis returned from AI' }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON if model added extra text
      const match = textBlock.text.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 });
      }
      analysis = JSON.parse(match[0]);
    }

    return NextResponse.json({
      analysis,
      resumeFileName: resumeFile.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
