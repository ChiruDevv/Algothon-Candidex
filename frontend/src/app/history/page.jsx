"use client";
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import CandidateDetail from '@/components/CandidateDetail'
import RadarChart from '@/components/RadarChart'

export default function HistoryPage() {
  const { isLoaded, getToken } = useAuth()
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchHistory() {
      if (!isLoaded) return; // Wait for clerk to load
      
      try {
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        
        const historyRows = data.history || [];
        const candidates = historyRows.map((row, idx) => {
          return {
            ...row.analysis_data,
            resumeId: row.id, // Use DB id for unique keys
            rank: idx + 1,
            // Override with DB values just in case
            candidateName: row.candidate_name,
            overallScore: row.overall_score,
            _dbJobTitle: row.job_title,
            _dbCreatedAt: row.created_at
          };
        });

        setResults({
          jobTitle: "All Historical Analyses",
          totalResumes: candidates.length,
          analyzedAt: new Date().toISOString(),
          candidates: candidates
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [isLoaded]);

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
    if (!results || !results.candidates) return []
    let list = [...results.candidates]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          (c.candidateName || '').toLowerCase().includes(q) ||
          (c._dbJobTitle || '').toLowerCase().includes(q) ||
          (c.extractedInfo?.skills || []).some((s) => s.toLowerCase().includes(q)) ||
          (c.extractedInfo?.currentRole || '').toLowerCase().includes(q) ||
          (c.fileName || '').toLowerCase().includes(q)
      )
    }

    // Filter by level
    if (filterLevel !== 'all') {
      list = list.filter((c) => getScoreLevel(c.overallScore) === filterLevel)
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore
      if (sortBy === 'name') return (a.candidateName || '').localeCompare(b.candidateName || '')
      if (sortBy === 'trust') return (b.claimVerification?.trustScore || 0) - (a.claimVerification?.trustScore || 0)
      return 0
    })

    return list
  }, [results, searchQuery, filterLevel, sortBy])

  if (loading) {
    return (
      <div className="flex justify-center my-40">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-24">
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-md">
          ⚠️ {error}
        </div>
      </div>
    )
  }

  if (!results || results.candidates.length === 0) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="empty-state" style={{ marginTop: '100px' }}>
            <h2>No History Found</h2>
            <p>You haven't analyzed any resumes yet.</p>
            <Link href="/analyze" className="btn btn-primary mt-6 inline-block">
              Start Analyzing →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Stats
  const avgScore = Math.round(
    results.candidates.reduce((sum, c) => sum + c.overallScore, 0) / results.candidates.length
  ) || 0;
  const topScore = Math.max(...results.candidates.map((c) => c.overallScore), 0)
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
    <div className="results-page pt-24">
      <div className="container">
        {/* Header */}
        <div className="results-header">
          <div className="results-header-left">
            <h1>
              <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Analysis History
              </span>
            </h1>
            <p>{results.totalResumes} historical record{results.totalResumes !== 1 ? 's' : ''} found</p>
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
                    <div>
                      <div className="candidate-name">{candidate.candidateName || 'Unknown'}</div>
                      <div className="candidate-role">
                        {candidate._dbJobTitle || candidate.extractedInfo?.currentRole}
                        {candidate.extractedInfo?.yearsOfExperience && (
                          <span> • {candidate.extractedInfo.yearsOfExperience} exp</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(candidate._dbCreatedAt).toLocaleString()}
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
