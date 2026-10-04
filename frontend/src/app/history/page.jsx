"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CandidateDetail from '@/components/CandidateDetail';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
              <div 
                key={candidate.id} 
                className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                onClick={() => setSelectedCandidate(candidate.analysis_data)}
              >
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{candidate.candidate_name}</h3>
                  <p className="text-[var(--text-secondary)]">{candidate.job_title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {new Date(candidate.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
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
            ))}
          </div>
        )}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </div>
  );
}
