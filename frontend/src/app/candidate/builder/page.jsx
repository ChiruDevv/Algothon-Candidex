"use client";
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ResumeBuilder() {
  const [bulletPoint, setBulletPoint] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [rewrittenBullet, setRewrittenBullet] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRewrite = async () => {
    if (bulletPoint.length < 10) {
      setError('Bullet point is too short.')
      return
    }
    
    setIsLoading(true)
    setError('')
    setRewrittenBullet('')

    try {
      const response = await fetch(`${API_URL}/api/candidate/star-rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletPoint, jobDescription }),
      })

      if (!response.ok) {
        throw new Error('Failed to rewrite bullet point.')
      }

      const data = await response.json()
      setRewrittenBullet(data.rewritten)
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
          Metric-Driven STAR Rewrites
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Transform passive job descriptions into active achievements using the STAR (Situation, Task, Action, Result) method.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(255, 107, 157, 0.1)', color: 'var(--accent-tertiary)', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Target Job Description (Optional, but recommended)</label>
            <textarea
              className="jd-textarea"
              style={{ minHeight: '100px' }}
              placeholder="Paste the target job description here so we can align keywords..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Original Bullet Point</label>
            <textarea
              className="jd-textarea"
              style={{ minHeight: '80px', borderColor: 'var(--border-subtle)' }}
              placeholder="e.g. Helped the team build a new feature that increased sales."
              value={bulletPoint}
              onChange={(e) => setBulletPoint(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleRewrite} 
            disabled={isLoading || bulletPoint.length < 10}
            style={{ alignSelf: 'flex-start' }}
          >
            {isLoading ? 'Rewriting...' : '✨ Magic Rewrite'}
          </button>
        </div>
      </div>

      {rewrittenBullet && (
        <div className="card" style={{ background: 'var(--gradient-card)', border: '1px solid var(--accent-secondary)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '12px' }}>
            ✨ Rewritten STAR Bullet
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {rewrittenBullet}
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => navigator.clipboard.writeText(rewrittenBullet)}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '64px', textAlign: 'center', padding: '40px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '16px' }}>Want the full Single-Page Resume Builder?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The full drag-and-drop resume builder with instant ATS compliance and custom-engineered layout constraints is coming soon in v2!
        </p>
        <button className="btn btn-secondary" disabled>Coming Soon</button>
      </div>
    </div>
  )
}
