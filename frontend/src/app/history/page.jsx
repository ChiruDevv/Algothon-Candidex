"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/history`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="analyze-page min-h-screen pt-24 pb-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="analyze-header mb-12">
          <h1>
            <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Analysis History
            </span>
          </h1>
          <p>View previously analyzed candidates.</p>
        </div>

        {loading ? (
          <div className="flex justify-center my-20">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-md">
            ⚠️ {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500 my-20">
            No history found. Go to <Link href="/analyze" className="text-blue-500 underline">Analyze</Link> to analyze a resume.
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((candidate) => (
              <div key={candidate.id} className="card p-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{candidate.candidate_name}</h3>
                    <p className="text-[var(--text-secondary)]">{candidate.job_title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {new Date(candidate.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <button 
                      onClick={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      {expandedId === candidate.id ? 'Hide Details' : 'View Details'}
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Overall</span>
                      <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold" 
                        style={{ 
                          borderColor: candidate.overall_score >= 80 ? 'var(--accent-primary)' : 
                                      candidate.overall_score >= 60 ? 'var(--accent-warning)' : 'red',
                          color: 'var(--text-primary)'
                        }}>
                        {candidate.overall_score}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === candidate.id && candidate.analysis_data && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Match Explanation</h4>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                          {candidate.analysis_data.matchExplanation}
                        </p>
                        
                        <h4 className="text-sm font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 mb-4 text-sm text-[var(--text-secondary)]">
                          {candidate.analysis_data.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</h4>
                        <ul className="list-disc pl-5 mb-4 text-sm text-[var(--text-secondary)]">
                          {candidate.analysis_data.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                        
                        <h4 className="text-sm font-bold text-[var(--accent-warning)] uppercase tracking-wider mb-2">Interview Questions</h4>
                        <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)]">
                          {candidate.analysis_data.suggestedInterviewQuestions?.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
