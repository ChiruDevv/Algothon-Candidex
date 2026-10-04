import React from 'react';
import RadarChart from './RadarChart';

export default function CandidateDetail({ candidate, onClose }) {
  if (!candidate) return null;

  const getScoreLevel = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const info = candidate.extractedInfo || {};
  const claims = candidate.claimVerification || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{candidate.candidateName || 'Candidate Details'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Header Info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div className="detail-grid" style={{ marginBottom: '16px' }}>
                <div className="detail-item">
                  <div className="detail-item-label">Current Role</div>
                  <div className="detail-item-value">{info.currentRole || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-item-label">Experience</div>
                  <div className="detail-item-value">{info.yearsOfExperience || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-item-label">Location</div>
                  <div className="detail-item-value">{info.location || 'N/A'}</div>
                </div>
              </div>
              
              <div className="match-explanation">
                <strong>AI Assessment:</strong> {candidate.matchExplanation || 'No explanation provided.'}
              </div>
            </div>

            <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`score-circle ${getScoreLevel(candidate.overallScore)}`} style={{ width: '80px', height: '80px', fontSize: '1.5rem', marginBottom: '16px' }}>
                {candidate.overallScore}
              </div>
              <div className={`recommendation-badge ${candidate.recommendation}`} style={{ marginBottom: '16px' }}>
                {candidate.recommendation?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            {/* Left Column */}
            <div style={{ flex: '1 1 400px' }}>
              <div className="detail-section">
                <div className="detail-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Skill Radar
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                  <RadarChart scores={candidate.scores} size={250} />
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Keywords
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Matched ({candidate.matchedKeywords?.length || 0})</div>
                  <div className="candidate-skills">
                    {(candidate.matchedKeywords || []).map((kw, i) => (
                      <span key={i} className="skill-tag matched">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Missing ({candidate.missingKeywords?.length || 0})</div>
                  <div className="candidate-skills">
                    {(candidate.missingKeywords || []).map((kw, i) => (
                      <span key={i} className="skill-tag missing">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Strengths & Weaknesses
                </div>
                <div className="sw-list">
                  {(candidate.strengths || []).map((s, i) => (
                    <div key={`s-${i}`} className="sw-item strength">
                      <span className="sw-icon">➕</span>
                      <span>{s}</span>
                    </div>
                  ))}
                  {(candidate.weaknesses || []).map((w, i) => (
                    <div key={`w-${i}`} className="sw-item weakness">
                      <span className="sw-icon">➖</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: '1 1 400px' }}>
              <div className="detail-section">
                <div className="detail-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Claim Verification
                </div>
                
                <div className="trust-meter" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Trust Score</div>
                  <div className="trust-meter-bar">
                    <div 
                      className={`trust-meter-fill ${getScoreLevel(claims.trustScore || 0)}`} 
                      style={{ width: `${claims.trustScore || 0}%`, background: `var(--gradient-score-${getScoreLevel(claims.trustScore || 0)})` }}
                    />
                  </div>
                  <div className={`trust-meter-value ${getScoreLevel(claims.trustScore || 0)}`}>
                    {claims.trustScore || 0}/100
                  </div>
                </div>

                {claims.verificationSummary && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {claims.verificationSummary}
                  </p>
                )}

                {claims.flaggedClaims && claims.flaggedClaims.length > 0 ? (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Flagged Claims:</h4>
                    {claims.flaggedClaims.map((claim, i) => (
                      <div key={i} className={`claim-card ${claim.severity}`}>
                        <div className="claim-text">"{claim.claim}"</div>
                        <div className="claim-issue">{claim.issue}</div>
                        <span className={`claim-severity ${claim.severity}`}>{claim.severity} Severity</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: 'rgba(0, 212, 170, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 212, 170, 0.2)', color: 'var(--accent-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                    ✓ No suspicious claims detected.
                  </div>
                )}
              </div>

              <div className="detail-section">
                <div className="detail-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Suggested Interview Questions
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
                  {(candidate.suggestedInterviewQuestions || []).length > 0 ? (
                    candidate.suggestedInterviewQuestions.map((q, i) => (
                      <div key={i} className="question-item">
                        <div className="question-number">{i + 1}</div>
                        <div className="question-text">{q}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>No questions generated.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
