import { Link } from 'react-router-dom'
import { useMemo } from 'react'

export default function LandingPage() {
  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      color: ['#6c63ff', '#00d4aa', '#ff6b9d', '#4fc3f7'][Math.floor(Math.random() * 4)],
    }))
  }, [])

  const features = [
    {
      icon: '📄',
      iconClass: 'purple',
      title: 'Multi-Resume Upload',
      desc: 'Upload up to 50 resumes at once in PDF format. Our client-side parser extracts text instantly with zero server exposure.',
    },
    {
      icon: '🎯',
      iconClass: 'green',
      title: 'AI-Powered Scoring',
      desc: 'Each candidate receives a precise 0-100 match score across 5 dimensions: skills, experience, education, keywords, and culture fit.',
    },
    {
      icon: '🔍',
      iconClass: 'blue',
      title: 'Explainable Results',
      desc: 'Understand exactly why each candidate matches or doesn\'t. See matched/missing keywords, strengths, and weaknesses.',
    },
    {
      icon: '🛡️',
      iconClass: 'pink',
      title: 'Claim Verification',
      desc: 'Detects exaggerated, unsupported, or contradictory claims in resumes instead of blindly trusting everything.',
    },
    {
      icon: '📊',
      iconClass: 'orange',
      title: 'Smart Ranking & Filters',
      desc: 'Candidates are auto-ranked by score. Filter by match level, search by name or skills, compare top picks side-by-side.',
    },
    {
      icon: '💬',
      iconClass: 'purple',
      title: 'AI Interview Questions',
      desc: 'Auto-generated interview questions tailored to each candidate\'s profile, probing weaknesses and verifying claims.',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-particles">
            {particles.map((p) => (
              <div
                key={p.id}
                className="particle"
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span>⚡</span>
            <span>ALG-AI-01 — AI Resume & Job Matching</span>
          </div>

          <h1 className="hero-title">
            Find the <span className="gradient-text">Perfect Candidate</span> in Seconds
          </h1>

          <p className="hero-subtitle">
            Upload resumes, paste a job description, and let AI rank, score, and explain every candidate match — with claim verification built in.
          </p>

          <div className="hero-actions">
            <Link to="/analyze" className="btn btn-primary btn-lg">
              Start Analyzing →
            </Link>
            <a href="#features" className="btn btn-ghost btn-lg">
              Learn More ↓
            </a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">50+</div>
              <div className="hero-stat-label">Resumes at Once</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">5D</div>
              <div className="hero-stat-label">Scoring Dimensions</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Claim Verification</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">&lt;30s</div>
              <div className="hero-stat-label">Per Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">✨ Features</div>
            <h2 className="section-title">Everything You Need to Hire Smarter</h2>
            <p className="section-subtitle">
              A complete AI-powered recruitment toolkit that goes beyond simple keyword matching.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`feature-icon ${feature.iconClass}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">🚀 How It Works</div>
            <h2 className="section-title">Three Steps to Your Top Candidate</h2>
          </div>

          <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon purple" style={{ margin: '0 auto 16px', fontSize: '2rem', width: '64px', height: '64px' }}>
                1️⃣
              </div>
              <h3 className="feature-title">Upload Resumes</h3>
              <p className="feature-desc">Drag & drop or browse to upload up to 50 PDF resumes at once.</p>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon green" style={{ margin: '0 auto 16px', fontSize: '2rem', width: '64px', height: '64px' }}>
                2️⃣
              </div>
              <h3 className="feature-title">Paste Job Description</h3>
              <p className="feature-desc">Enter the full job description and title for the open position.</p>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon pink" style={{ margin: '0 auto 16px', fontSize: '2rem', width: '64px', height: '64px' }}>
                3️⃣
              </div>
              <h3 className="feature-title">Get AI Rankings</h3>
              <p className="feature-desc">Receive ranked candidates with scores, explanations, and claim verification.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/analyze" className="btn btn-primary btn-lg">
              Try It Now — Free →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
