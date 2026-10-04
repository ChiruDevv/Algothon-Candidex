"use client";
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import CandidateDetail from '@/components/CandidateDetail'
import RadarChart from '@/components/RadarChart'

export default function ResultsPage() {
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState([])

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResults')
    if (stored) {
      setResults(JSON.parse(stored))
    }
  }, [])

  // If no results, show empty state
  if (!results || !results.candidates || results.candidates.length === 0) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>No Analysis Results Yet</h3>
            <p>Upload resumes and a job description to see AI-powered candidate rankings.</p>
            <Link href="/analyze" className="btn btn-primary">
              Start Analyzing →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getScoreLevel = (score) => {
    if (score >= 75) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  const getRecommendationLabel = (rec) => {
    const labels = {
      STRONG_MATCH: 'Strong Match',
      GOOD_MATCH: 'Good Match',
      PARTIAL_MATCH: 'Partial Match',
      WEAK_MATCH: 'Weak Match',
      NO_MATCH: 'No Match',
    }
    return labels[rec] || rec
  }

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let list = [...results.candidates]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          (c.candidateName || '').toLowerCase().includes(q) ||
          (c.extractedInfo?.skills || []).some((s) => s.toLowerCase().includes(q)) ||
          (c.extractedInfo?.currentRole || '').toLowerCase().includes(q) ||
          (c.fileName || '').toLowerCase().includes(q)
      )
    }

    // Filter by level
    if (filterLevel !== 'all') {
      list = list.filter((c) => {
        const level = getScoreLevel(c.overallScore)
        return level === filterLevel
      })
    }

    // Sort
    if (sortBy === 'score') {
      list.sort((a, b) => b.overallScore - a.overallScore)
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.candidateName || '').localeCompare(b.candidateName || ''))
    } else if (sortBy === 'trust') {
      list.sort((a, b) => (b.claimVerification?.trustScore || 0) - (a.claimVerification?.trustScore || 0))
    }

    return list
  }, [results.candidates, searchQuery, filterLevel, sortBy])

  // Stats
  const avgScore = Math.round(
    results.candidates.reduce((sum, c) => sum + c.overallScore, 0) / results.candidates.length
  )
  const topScore = Math.max(...results.candidates.map((c) => c.overallScore))
  const strongMatches = results.candidates.filter((c) => c.overallScore >= 75).length

  // Toggle compare
  const toggleCompare = (candidate) => {
    setCompareList((prev) => {
      const exists = prev.find((c) => c.resumeId === candidate.resumeId)
      if (exists) {
        return prev.filter((c) => c.resumeId !== candidate.resumeId)
      }
      if (prev.length >= 3) return prev
      return [...prev, candidate]
    })
  }

  return (
    <div className="results-page">
      <div className="container">
        {/* Header */}
        <div className="results-header">
          <div className="results-header-left">
            <h1>
              <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {results.jobTitle}
              </span>
            </h1>
            <p>{results.totalResumes} resume{results.totalResumes !== 1 ? 's' : ''} analyzed • {new Date(results.analyzedAt).toLocaleString()}</p>
          </div>

          <div className="results-stats">
            <div className="results-stat-card">
              <div className={`results-stat-value ${getScoreLevel(topScore)}`}>{topScore}</div>
              <div className="results-stat-label">Top Score</div>
            </div>
            <div className="results-stat-card">
              <div className={`results-stat-value ${getScoreLevel(avgScore)}`}>{avgScore}</div>
              <div className="results-stat-label">Avg Score</div>
            </div>
            <div className="results-stat-card">
              <div className="results-stat-value high">{strongMatches}</div>
              <div className="results-stat-label">Strong Matches</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, skill, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="high">High Match (75+)</option>
            <option value="medium">Medium Match (50-74)</option>
            <option value="low">Low Match (&lt;50)</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="trust">Sort by Trust</option>
          </select>

          <button
            className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setCompareMode(!compareMode)
              if (compareMode) setCompareList([])
            }}
          >
            {compareMode ? `Compare (${compareList.length}/3)` : '⚖️ Compare'}
          </button>
        </div>

        {/* Compare View */}
        {compareMode && compareList.length >= 2 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              ⚖️ Side-by-Side Comparison
            </h3>
            <div className="comparison-grid">
              {compareList.map((candidate, idx) => (
                <div
                  key={candidate.resumeId}
                  className={`comparison-card ${idx === 0 ? 'top-pick' : ''}`}
                >
                  {idx === 0 && <div className="top-pick-badge">🏆 Top Pick</div>}
                  <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>{candidate.candidateName}</h4>
                  <div className={`score-circle ${getScoreLevel(candidate.overallScore)}`} style={{ margin: '0 auto 16px' }}>
                    {candidate.overallScore}
                  </div>
                  <RadarChart scores={candidate.scores} size={200} />
                  <div style={{ marginTop: '16px' }}>
                    <div className="score-bar-item" style={{ marginBottom: '8px' }}>
                      <div className="score-bar-label">Skills Match</div>
                      <div className="score-bar">
                        <div className={`score-bar-fill ${getScoreLevel(candidate.scores?.skillsMatch || 0)}`} style={{ width: `${candidate.scores?.skillsMatch || 0}%` }} />
                      </div>
                    </div>
                    <div className="score-bar-item" style={{ marginBottom: '8px' }}>
                      <div className="score-bar-label">Experience</div>
                      <div className="score-bar">
                        <div className={`score-bar-fill ${getScoreLevel(candidate.scores?.experienceRelevance || 0)}`} style={{ width: `${candidate.scores?.experienceRelevance || 0}%` }} />
                      </div>
                    </div>
                    <div className="score-bar-item">
                      <div className="score-bar-label">Trust Score</div>
                      <div className="score-bar">
                        <div className={`score-bar-fill ${getScoreLevel(candidate.claimVerification?.trustScore || 0)}`} style={{ width: `${candidate.claimVerification?.trustScore || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Showing {filteredCandidates.length} of {results.candidates.length} candidates
        </div>

        {/* Candidates List */}
        <div className="candidates-list">
          {filteredCandidates.map((candidate, idx) => {
            const scoreLevel = getScoreLevel(candidate.overallScore)
            const isInCompare = compareList.find((c) => c.resumeId === candidate.resumeId)

            return (
              <div
                key={candidate.resumeId}
                className="candidate-card animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => !compareMode && setSelectedCandidate(candidate)}
              >
                <div className="candidate-card-header">
                  <div className="candidate-info">
                    <div
                      className={`candidate-rank ${
                        candidate.rank === 1
                          ? 'rank-1'
                          : candidate.rank === 2
                          ? 'rank-2'
                          : candidate.rank === 3
                          ? 'rank-3'
                          : 'rank-other'
                      }`}
                    >
                      {candidate.rank <= 3 ? ['🥇', '🥈', '🥉'][candidate.rank - 1] : `#${candidate.rank}`}
                    </div>
                    <div>
                      <div className="candidate-name">{candidate.candidateName || 'Unknown'}</div>
                      <div className="candidate-role">
                        {candidate.extractedInfo?.currentRole || candidate.fileName}
                        {candidate.extractedInfo?.yearsOfExperience && (
                          <span> • {candidate.extractedInfo.yearsOfExperience} exp</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="candidate-score-badge">
                    {compareMode && (
                      <button
                        className={`btn btn-sm ${isInCompare ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCompare(candidate)
                        }}
                      >
                        {isInCompare ? '✓ Selected' : 'Select'}
                      </button>
                    )}
                    <div>
                      <span className={`recommendation-badge ${candidate.recommendation}`}>
                        {getRecommendationLabel(candidate.recommendation)}
                      </span>
                    </div>
                    <div className={`score-circle ${scoreLevel}`}>
                      {candidate.overallScore}
                    </div>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="candidate-card-body">
                  {Object.entries(candidate.scores || {}).map(([key, value]) => (
                    <div key={key} className="score-bar-item">
                      <div className="score-bar-label">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="score-bar">
                        <div
                          className={`score-bar-fill ${getScoreLevel(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="candidate-card-footer">
                  <div className="candidate-skills">
                    {(candidate.matchedKeywords || []).slice(0, 4).map((kw, i) => (
                      <span key={i} className="skill-tag matched">{kw}</span>
                    ))}
                    {(candidate.missingKeywords || []).slice(0, 2).map((kw, i) => (
                      <span key={`m-${i}`} className="skill-tag missing">{kw}</span>
                    ))}
                    {((candidate.matchedKeywords?.length || 0) + (candidate.missingKeywords?.length || 0)) > 6 && (
                      <span className="skill-tag" style={{ opacity: 0.6 }}>
                        +{(candidate.matchedKeywords?.length || 0) + (candidate.missingKeywords?.length || 0) - 6} more
                      </span>
                    )}
                  </div>

                  {candidate.claimVerification?.flaggedClaims?.length > 0 && (
                    <span style={{
                      padding: '4px 10px',
                      background: 'rgba(255, 179, 71, 0.15)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.7rem',
                      color: 'var(--accent-warning)',
                      fontWeight: 600,
                    }}>
                      ⚠️ {candidate.claimVerification.flaggedClaims.length} flagged claim{candidate.claimVerification.flaggedClaims.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="empty-state">
            <h3>No candidates match your filters</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* New Analysis Button */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/analyze" className="btn btn-secondary btn-lg">
            ← New Analysis
          </Link>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
