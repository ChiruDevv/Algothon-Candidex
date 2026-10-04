const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("./supabase");
const axios = require("axios");
const cheerio = require("cheerio");

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
  userId: z.string().optional(),
});

const singleAnalyzeSchema = z.object({
  resumeText: z.string().min(50).max(50000),
  jobDescription: z.string().min(50).max(20000),
  candidateName: z.string().optional(),
});

// ===== GEMINI AI ANALYSIS =====

async function analyzeResumeWithAI(resumeText, jobDescription, candidateName) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are an expert AI recruiter and resume analyst. Analyze this resume against the given job description with extreme precision. 
Note: The current date is ${currentDate}. Do NOT flag dates before or up to this date as being in the "future".

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
- Extract the candidate's name from the resume if possible
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
    const { resumes, jobDescription, jobTitle, userId } = validated;

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

    // Assign ranks and userId
    results.forEach((r, idx) => {
      r.rank = idx + 1;
      r.userId = userId || 'anonymous';
    });

    // Save to Supabase if configured
    if (supabase && results.length > 0) {
      try {
        const { error: dbError } = await supabase.from('candidates').insert(
          results.map(r => ({
              job_title: jobTitle || "Untitled Position",
              candidate_name: r.candidateName,
              overall_score: r.overallScore,
              skills_score: r.scores.skillsMatch,
              experience_score: r.scores.experienceRelevance,
            education_score: r.scores.educationFit,
            keyword_score: r.scores.keywordAlignment,
            culture_score: r.scores.cultureFit,
            trust_score: r.claimVerification?.trustScore || 100,
            analysis_data: r
          }))
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

const scrapeSchema = z.object({
  url: z.string().url(),
});

// POST /api/scrape-job - Scrape a job posting URL and extract details
app.post("/api/scrape-job", aiLimiter, async (req, res) => {
  try {
    const { url } = scrapeSchema.parse(req.body);
    
    // Fetch raw HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Attempt basic extraction to reduce token usage
    $('script, style, noscript, nav, footer, header').remove();
    let textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    // If it's a huge page, trim it down
    if (textContent.length > 15000) {
      textContent = textContent.substring(0, 15000);
    }
    
    // Pass to Gemini to format it beautifully
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const prompt = `You are an AI assistant helping a recruiter extract job details from a raw webpage scrape.
    I scraped a job posting URL and got this raw text. 
    Please extract the exact Job Title and the full, detailed Job Description.
    
    Raw Text:
    ${textContent}
    
    Return ONLY a valid JSON object matching this structure (no markdown, no quotes):
    {
      "jobTitle": "Extracted Job Title",
      "jobDescription": "Full extracted job description. Format nicely with bullet points if possible. Make sure to include requirements and responsibilities."
    }`;

    const aiResult = await model.generateContent(prompt);
    let aiText = aiResult.response.text();
    
    let jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) aiText = jsonMatch[1];
    const directMatch = aiText.match(/\{[\s\S]*\}/);
    if (directMatch) aiText = directMatch[0];

    const parsed = JSON.parse(aiText);
    
    res.json({
      success: true,
      jobTitle: parsed.jobTitle || "",
      jobDescription: parsed.jobDescription || ""
    });

  } catch (error) {
    console.error("Scrape error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid URL" });
    }
    res.status(500).json({ error: "Failed to fetch or parse the job URL. Some sites block automated requests." });
  }
});

// GET /api/history - Fetch past analysis results
app.get("/api/history", async (req, res) => {
  try {
    if (!supabase) throw new Error("Supabase is not configured");
    const { userId } = req.query;
    
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (userId) {
      query = query.eq('analysis_data->>userId', userId);
    } else {
      // If no user provided, maybe we shouldn't return everyone's data. 
      // For now, return empty to prevent data leaks.
      return res.json({ success: true, history: [] });
    }

    const { data, error } = await query;
      
    if (error) throw error;
    res.json({ success: true, history: data });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
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
  console.log(`🚀 Candidex Backend running on port ${PORT}`);
});
