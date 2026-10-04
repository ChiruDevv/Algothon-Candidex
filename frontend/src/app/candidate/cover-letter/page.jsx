"use client";
import { useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function CoverLetterGen() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Extract text from PDF
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF resume.')
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => item.str).join(' ') + '\n'
      }
      setResumeText(text.trim())
      setError('')
    } catch (err) {
      setError('Failed to extract text from PDF.')
    }
  }

  const handleGenerate = async () => {
    if (resumeText.length < 50 || jobDescription.length < 50) {
      setError('Please provide both your resume and the job description.')
      return
    }
    
    setIsLoading(true)
    setError('')
    setCoverLetter('')

    try {
      const response = await fetch(`${API_URL}/api/candidate/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate cover letter.')
      }

      const data = await response.json()
      setCoverLetter(data.coverLetter)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          AI Cover Letter Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Get a tailored, persuasive cover letter matching the tone of the job posting and highlighting your most relevant qualifications.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(255, 107, 157, 0.1)', color: 'var(--accent-tertiary)', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="analyze-grid">
        <div className="card">
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>1. Upload Your Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%' }}>
              Browse PDF
            </button>
            {resumeText && <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginTop: '8px' }}>✓ Resume loaded ({resumeText.length} chars)</p>}
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>2. Paste Job Description</label>
            <textarea
              className="jd-textarea"
              style={{ minHeight: '200px' }}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600 }}>Generated Cover Letter</h3>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleGenerate}
                disabled={isLoading || !resumeText || !jobDescription}
              >
                {isLoading ? 'Generating...' : '✨ Generate'}
              </button>
            </div>

            {coverLetter ? (
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  className="jd-textarea"
                  style={{ height: '100%', minHeight: '350px', backgroundColor: 'var(--bg-secondary)', resize: 'none' }}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <button 
                  className="btn btn-sm btn-ghost" 
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                  onClick={() => navigator.clipboard.writeText(coverLetter)}
                >
                  Copy
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Your generated cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
