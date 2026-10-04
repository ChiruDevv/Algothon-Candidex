import { Link } from 'react-router-dom'

export default function CandidatePortal() {
  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      <div className="section-header">
        <div className="section-badge">🎯 For Candidates</div>
        <h1 className="section-title">Nail Your Next Application</h1>
        <p className="section-subtitle">
          Optimize your resume to beat the ATS, rewrite your bullet points using the STAR method, and generate highly targeted cover letters in seconds.
        </p>
      </div>

      <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link to="/candidate/builder" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-card" style={{ height: '100%', textAlign: 'center' }}>
            <div className="feature-icon purple" style={{ margin: '0 auto 20px', width: '64px', height: '64px', fontSize: '2rem' }}>
              📄
            </div>
            <h3 className="feature-title">Single-Page Resume Builder</h3>
            <p className="feature-desc">
              Generate a meticulously styled, ATS-compliant, single-page resume with one click.
              Includes metric-driven STAR rewrites.
            </p>
            <div style={{ marginTop: '20px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Build Resume →
            </div>
          </div>
        </Link>

        <Link to="/candidate/cover-letter" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-card" style={{ height: '100%', textAlign: 'center' }}>
            <div className="feature-icon green" style={{ margin: '0 auto 20px', width: '64px', height: '64px', fontSize: '2rem' }}>
              ✉️
            </div>
            <h3 className="feature-title">AI Cover Letter Generator</h3>
            <p className="feature-desc">
              Get a tailored, persuasive cover letter matching the tone of the job posting and highlighting your most relevant qualifications.
            </p>
            <div style={{ marginTop: '20px', color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Generate Cover Letter →
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
