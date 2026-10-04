const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("./supabase");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Security & logging
app.use(helmet());
app.use(morgan("dev"));

// Health check route for cron-job.org
app.get('/', (req, res) => {
  res.status(200).send('Server is awake!');
});

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too Many Requests",
    message: "Global rate limit exceeded. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// AI Rate Limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    error: "Too Many Requests",
    message: "You've reached the limit of 20 AI analyses per hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schemas
const analyzeSchema = z.object({
  resumes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      text: z.string().min(50, "Resume must be at least 50 characters.").max(50000),
    })
  ).min(1, "At least one resume is required.").max(50, "Maximum 50 resumes at once."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters.").max(20000),
  jobTitle: z.string().min(1).max(200).optional(),
});

const singleAnalyzeSchema = z.object({
  resumeText: z.string().min(50).max(50000),
  jobDescription: z.string().min(50).max(20000),
  candidateName: z.string().optional(),
});

// ===== GEMINI AI ANALYSIS =====

async function analyzeResumeWithAI(resumeText, jobDescription, candidateName) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const prompt = `You are an expert AI recruiter and resume analyst. Analyze this resume against the given job description with extreme precision.

<job_description>
${jobDescription}
</job_description>

<resume_content>
${resumeText}
</resume_content>

You must return a valid JSON object (no markdown, no code blocks, just raw JSON) with this exact structure:
{
  "candidateName": "extracted full name or '${candidateName || "Unknown Candidate"}'",
  "overallScore": <number 0-100>,
  "scores": {
    "skillsMatch": <number 0-100>,
    "experienceRelevance": <number 0-100>,
    "educationFit": <number 0-100>,
    "keywordAlignment": <number 0-100>,
    "cultureFit": <number 0-100>
  },
  "extractedInfo": {
    "email": "<extracted email or null>",
    "phone": "<extracted phone or null>",
    "location": "<extracted location or null>",
    "currentRole": "<current/latest role or null>",
    "yearsOfExperience": "<estimated years or null>",
    "education": [{"degree": "...", "institution": "...", "year": "..."}],
    "skills": ["skill1", "skill2", ...],
    "certifications": ["cert1", "cert2", ...]
  },
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "matchExplanation": "A 2-3 sentence explanation of why this candidate is/isn't a good match",
  "claimVerification": {
    "flaggedClaims": [
      {
        "claim": "the specific claim from resume",
        "issue": "why it's suspicious (contradictory dates, vague metrics, impossible achievements, etc.)",
        "severity": "high|medium|low"
      }
    ],
    "verificationSummary": "Brief summary of claim verification findings",
    "trustScore": <number 0-100>
  },
  "suggestedInterviewQuestions": [
    "question1 tailored to this candidate",
    "question2 probing potential weaknesses",
    "question3 verifying flagged claims"
  ],
  "recommendation": "STRONG_MATCH|GOOD_MATCH|PARTIAL_MATCH|WEAK_MATCH|NO_MATCH"
}

IMPORTANT INSTRUCTIONS:
- GDPR COMPLIANCE: Scrub all Personally Identifiable Information (PII) including real names, emails, phone numbers, and addresses from your entire response.
- Set the "candidateName" field strictly to "Anonymous Candidate" (do NOT use their real name).
- Be very critical and accurate with scoring
- For claimVerification, look for: contradictory timelines, vague/unquantified claims, impossibly high metrics, skill claims without evidence, degree/certification claims that seem off
- Generate interview questions that would verify the candidate's actual knowledge
- The trustScore reflects how verifiable and consistent the resume claims are
- Return ONLY valid JSON, no other text`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from response
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  // Also try to find JSON object directly
  const directMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (directMatch) {
    jsonStr = directMatch[0];
  }

  return JSON.parse(jsonStr);
}

// ===== ROUTES =====

// POST /api/analyze - Batch analyze multiple resumes against a JD
app.post("/api/analyze", aiLimiter, async (req, res) => {
  try {
    const validated = analyzeSchema.parse(req.body);
    const { resumes, jobDescription, jobTitle } = validated;

    const results = [];
    const errors = [];

    // Process resumes in parallel (batches of 5)
    const batchSize = 5;
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (resume) => {
          try {
            const analysis = await analyzeResumeWithAI(
              resume.text,
              jobDescription,
              resume.name.replace(/\.[^/.]+$/, "")
            );
            return {
              resumeId: resume.id,
              fileName: resume.name,
              ...analysis,
            };
          } catch (err) {
            throw new Error(`Failed to analyze ${resume.name}: ${err.message}`);
          }
        })
      );

      batchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error(`AI Analysis failed for ${batch[idx].name}:`, result.reason.message);
          errors.push({
            resumeId: batch[idx].id,
            fileName: batch[idx].name,
            error: result.reason.message,
          });
        }
      });
    }

    // Sort by overall score descending
    results.sort((a, b) => b.overallScore - a.overallScore);

    // Assign ranks
    results.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    // Save to Supabase if configured
    if (supabase && results.length > 0) {
      try {
        const { error: dbError } = await supabase.from('candidates').insert(
          results.map(r => {
            const anonId = Math.floor(1000 + Math.random() * 9000);
            return {
              job_title: jobTitle || "Untitled Position",
              candidate_name: `${r.candidateName} #${anonId}`,
              overall_score: r.overallScore,
              skills_score: r.scores.skillsMatch,
              experience_score: r.scores.experienceRelevance,
            education_score: r.scores.educationFit,
            keyword_score: r.scores.keywordAlignment,
            culture_score: r.scores.cultureFit,
            trust_score: r.claimVerification?.trustScore || 100,
            analysis_data: r
            };
          })
        );
        if (dbError) console.error("Supabase insert error:", dbError);
      } catch (e) {
        console.error("Failed to save to Supabase:", e);
      }
    }

    res.json({
      success: true,
      jobTitle: jobTitle || "Untitled Position",
      totalResumes: resumes.length,
      analyzed: results.length,
      failed: errors.length,
      candidates: results,
      errors: errors.length > 0 ? errors : undefined,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.errors.map((e) => e.message),
      });
    }
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Analysis Failed",
      message: process.env.NODE_ENV === "production"
        ? "An error occurred during analysis."
        : error.message,
    });
  }
});

// POST /api/analyze/single - Analyze a single resume
app.post("/api/analyze/single", aiLimiter, async (req, res) => {
  try {
    const validated = singleAnalyzeSchema.parse(req.body);
    const analysis = await analyzeResumeWithAI(
      validated.resumeText,
      validated.jobDescription,
      validated.candidateName
    );

    res.json({
      success: true,
      ...analysis,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.errors.map((e) => e.message),
      });
    }
    console.error("Single analysis error:", error);
    res.status(500).json({
      error: "Analysis Failed",
      message: process.env.NODE_ENV === "production"
        ? "An error occurred during analysis."
        : error.message,
    });
  }
});
// Candidate Portal Zod schemas
const starRewriteSchema = z.object({
  bulletPoint: z.string().min(10).max(1000),
  jobDescription: z.string().max(20000).optional(),
});

const coverLetterSchema = z.object({
  resumeText: z.string().min(50).max(50000),
  jobDescription: z.string().min(50).max(20000),
});

// ===== CANDIDATE PORTAL ROUTES =====

app.post("/api/candidate/star-rewrite", aiLimiter, async (req, res) => {
  try {
    const { bulletPoint, jobDescription } = starRewriteSchema.parse(req.body);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    
    const prompt = `You are an expert resume writer. Rewrite the following resume bullet point using the STAR (Situation, Task, Action, Result) method. Make it highly impactful, action-oriented, and metric-driven.
    
    ${jobDescription ? `Ensure it aligns with this job description if relevant:\n<job_description>\n${jobDescription}\n</job_description>\n` : ''}
    
    Original Bullet Point:
    "${bulletPoint}"
    
    Return ONLY the rewritten bullet point text. Do not include any conversational text, prefixes, or quotes.`;

    const result = await model.generateContent(prompt);
    const rewritten = result.response.text().trim().replace(/^"|"$/g, '').replace(/^- /, '');

    res.json({ success: true, rewritten });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation Error", details: error.errors.map(e => e.message) });
    }
    console.error("STAR rewrite error:", error);
    res.status(500).json({ error: "Rewrite Failed", message: error.message });
  }
});

app.post("/api/candidate/cover-letter", aiLimiter, async (req, res) => {
  try {
    const { resumeText, jobDescription } = coverLetterSchema.parse(req.body);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    
    const prompt = `You are an expert career coach and copywriter. Write a highly persuasive, professional, and tailored cover letter based on the candidate's resume and the target job description.

<job_description>
${jobDescription}
</job_description>

<resume_content>
${resumeText}
</resume_content>

Instructions:
1. Match the tone of the job description.
2. Highlight the most relevant qualifications from the resume that match the job description.
3. Keep it to a standard single-page length (3-4 paragraphs).
4. Do not include placeholder brackets like [Your Name] unless you couldn't extract it. Try to use extracted details.
5. Return ONLY the cover letter text, properly formatted with paragraphs.`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    res.json({ success: true, coverLetter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation Error", details: error.errors.map(e => e.message) });
    }
    console.error("Cover letter error:", error);
    res.status(500).json({ error: "Generation Failed", message: error.message });
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong."
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HirePilot AI Backend running on port ${PORT}`);
});
