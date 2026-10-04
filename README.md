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

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- A Supabase account
- A Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/ChiruDevv/Algothon-Candidex.git
cd Algothon-Candidex
```

### 2. Setup the Frontend
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Start the frontend:
```bash
npm run dev
```

### 3. Setup the Backend
```bash
cd ../backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
Start the backend:
```bash
npm run dev
```

### 4. Database Setup
Run the SQL provided in `supabase_setup.sql` in your Supabase SQL Editor to instantly generate the necessary tables and Row Level Security (RLS) policies.

---

## 📝 License
Built for the Algothon Hackathon.
