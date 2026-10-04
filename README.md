# 🚀 Candidex: AI-Powered Candidate Screening

**Find the Perfect Candidate in Seconds.**

Candidex is an intelligent, AI-driven recruitment platform built to eliminate the manual grind of screening resumes. By leveraging advanced Large Language Models (LLMs), Candidex moves beyond outdated keyword-matching to semantically understand resumes, rank candidates against specific job descriptions, and flag potentially exaggerated claims.

---

## ✨ Features

- **Batch Resume Processing:** Upload up to 50 resumes (PDF or DOCX) at once.
- **Dynamic Job Scraping:** Paste a live job posting URL, and the backend will automatically scrape and parse the requirements.
- **AI Semantic Ranking:** Google Gemini AI reads and scores candidates based on a deep understanding of their actual experience and the job's context.
- **Trust Scores & Claim Verification:** The AI cross-references timelines to flag unrealistic or exaggerated claims.
- **Deep-Dive Analytics:** View a dynamic Radar Chart comparing candidate strengths and weaknesses against the job requirements.
- **Historical Dashboard:** Securely save, search, and compare past applicants across different hiring campaigns.
- **Fully Responsive Glassmorphism UI:** A custom-built, premium user interface that looks perfect on both desktop and mobile.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Pure CSS** (Custom Glassmorphism Design System, fully responsive)
- **Recharts** (Interactive Radar Charts)
- **Next-Themes** (Seamless Light/Dark Mode)
- **PDF.js & Mammoth** (Client-side document parsing)

### Backend
- **Node.js & Express.js** (REST API)
- **Google Gemini AI (`@google/genai`)** (Core reasoning engine using Gemini 3.5 Flash Lite)
- **Cheerio & Axios** (Web scraping)
- **Zod** (Strict schema validation)

### Database & Security
- **Supabase (PostgreSQL)** (Relational data storage with JSONB support)
- **Supabase SSR Auth** (Server-Side Rendering Authentication for route protection)
- **Express Rate Limit** (Spam and DDoS protection)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render



---

## 📝 License
Built for the Algothon Hackathon.
