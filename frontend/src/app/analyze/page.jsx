"use client";
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AnalyzePage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState('')

  // Extract text from PDF using pdfjs-dist
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }

    return text.trim()
  }

  // Handle file selection
  const handleFiles = useCallback(async (newFiles) => {
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf'
    )

    if (pdfFiles.length === 0) {
      setError('Please upload PDF files only.')
      return
    }

    if (files.length + pdfFiles.length > 50) {
      setError('Maximum 50 resumes allowed.')
      return
    }

    setError('')

    const processed = await Promise.all(
      pdfFiles.map(async (file) => {
        try {
          const text = await extractTextFromPDF(file)
          return {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            text,
            status: text.length > 50 ? 'ready' : 'error',
            error: text.length <= 50 ? 'Could not extract enough text' : null,
          }
        } catch (err) {
          return {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            text: '',
            status: 'error',
            error: 'Failed to parse PDF',
          }
        }
      })
    )

    setFiles((prev) => [...prev, ...processed])
  }, [files.length])

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // Remove a file
  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Submit analysis
  const handleAnalyze = async () => {
    const readyFiles = files.filter((f) => f.status === 'ready')

    if (readyFiles.length === 0) {
      setError('Please upload at least one valid resume.')
      return
    }

    if (jobDescription.length < 50) {
      setError('Job description must be at least 50 characters.')
      return
    }

    setError('')
    setIsAnalyzing(true)
    setLoadingMessage('Preparing resumes for analysis...')
    setLoadingProgress(10)

    try {
      setLoadingMessage(\`Analyzing \${readyFiles.length} resume\${readyFiles.length > 1 ? 's' : ''} with AI...\`)
      setLoadingProgress(30)

      const response = await fetch(\`\${API_URL}/api/analyze\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumes: readyFiles.map((f) => ({
            id: f.id,
            name: f.name,
            text: f.text,
          })),
          jobDescription,
          jobTitle: jobTitle || 'Untitled Position',
        }),
      })

      setLoadingProgress(80)
      setLoadingMessage('Processing results...')

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || errData.details?.join(', ') || 'Analysis failed')
      }

      const data = await response.json()
      setLoadingProgress(100)
      setLoadingMessage('Done! Redirecting...')

      // Store results and navigate
      sessionStorage.setItem('analysisResults', JSON.stringify(data))

      setTimeout(() => {
        setIsAnalyzing(false)
        router.push('/results')
      }, 500)
    } catch (err) {
      setIsAnalyzing(false)
      setError(err.message || 'Failed to analyze resumes. Please try again.')
    }
  }

  const readyCount = files.filter((f) => f.status === 'ready').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <>
      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">{loadingMessage}</div>
          <div className="loading-subtext">
            This may take 15-60 seconds depending on the number of resumes.
          </div>
          <div className="loading-progress">
            <div
              className="loading-progress-bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="analyze-page">
        <div className="container">
          <div className="analyze-header">
            <h1>
              <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Analyze Candidates
              </span>
            </h1>
            <p>Upload resumes and paste the job description to get AI-powered candidate rankings.</p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 107, 157, 0.1)',
                border: '1px solid rgba(255, 107, 157, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-tertiary)',
                fontSize: '0.85rem',
                marginBottom: '24px',
                animation: 'fadeIn 0.3s ease-out',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div className="analyze-grid">
            {/* Left Column - Upload */}
            <div>
              <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📄 Upload Resumes
                  {readyCount > 0 && (
                    <span style={{
                      padding: '2px 10px',
                      background: 'rgba(0, 212, 170, 0.15)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-secondary)',
                      fontWeight: 600,
                    }}>
                      {readyCount} ready
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span style={{
                      padding: '2px 10px',
                      background: 'rgba(255, 107, 157, 0.15)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-tertiary)',
                      fontWeight: 600,
                    }}>
                      {errorCount} failed
                    </span>
                  )}
                </h3>

                <div
                  className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="upload-zone-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <h3>Drop PDF resumes here</h3>
                  <p>or click to browse • Max 50 files • PDF only</p>
                </div>

                {files.length > 0 && (
                  <div className="upload-file-list">
                    {files.map((file) => (
                      <div key={file.id} className="upload-file-item">
                        <span className="file-name">
                          <span style={{ color: file.status === 'ready' ? 'var(--accent-secondary)' : 'var(--accent-tertiary)' }}>
                            {file.status === 'ready' ? '✓' : '✕'}
                          </span>
                          {file.name}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </span>
                        <button className="file-remove" onClick={() => removeFile(file.id)}>
                          ✕
                        </button>
                      </div>
                    ))}

                    {files.length > 1 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: '8px', fontSize: '0.8rem' }}
                        onClick={() => setFiles([])}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Job Description */}
            <div>
              <div className="card">
                <div className="jd-input-container">
                  <label>💼 Job Title</label>
                  <input
                    type="text"
                    className="job-title-input"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />

                  <label style={{ marginTop: '12px' }}>📝 Job Description</label>
                  <textarea
                    className="jd-textarea"
                    placeholder="Paste the full job description here...

Include responsibilities, requirements, qualifications, and any specific skills or experience needed. The more detailed the JD, the better the analysis."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: jobDescription.length >= 50 ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                      {jobDescription.length} / 50 min characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={readyCount === 0 || jobDescription.length < 50 || isAnalyzing}
              onClick={handleAnalyze}
              style={{ minWidth: '280px' }}
            >
              {isAnalyzing ? (
                <>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  Analyzing...
                </>
              ) : (
                <>🚀 Analyze {readyCount} Resume{readyCount !== 1 ? 's' : ''}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
