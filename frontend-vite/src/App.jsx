import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AnalyzePage from './pages/AnalyzePage'
import ResultsPage from './pages/ResultsPage'
import CandidatePortal from './pages/CandidatePortal'
import ResumeBuilder from './pages/ResumeBuilder'
import CoverLetterGen from './pages/CoverLetterGen'

function App() {
  const [analysisResults, setAnalysisResults] = useState(null)

  return (
    <>
      <Navbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Recruiter Routes */}
          <Route path="/analyze" element={<AnalyzePage onResults={setAnalysisResults} />} />
          <Route path="/results" element={<ResultsPage results={analysisResults} />} />

          {/* Candidate Routes */}
          <Route path="/candidate" element={<CandidatePortal />} />
          <Route path="/candidate/builder" element={<ResumeBuilder />} />
          <Route path="/candidate/cover-letter" element={<CoverLetterGen />} />
        </Routes>
      </div>
      <footer className="footer">
        <p className="footer-text">
          © 2026 HirePilot AI — Built with ❤️ for ALG-AI-01 Hackathon
        </p>
      </footer>
    </>
  )
}

export default App
