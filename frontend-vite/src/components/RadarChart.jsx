import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function RadarChart({ scores, size = 300 }) {
  if (!scores) return null;

  const data = [
    {
      subject: 'Skills',
      A: scores.skillsMatch || 0,
      fullMark: 100,
    },
    {
      subject: 'Experience',
      A: scores.experienceRelevance || 0,
      fullMark: 100,
    },
    {
      subject: 'Education',
      A: scores.educationFit || 0,
      fullMark: 100,
    },
    {
      subject: 'Keywords',
      A: scores.keywordAlignment || 0,
      fullMark: 100,
    },
    {
      subject: 'Culture',
      A: scores.cultureFit || 0,
      fullMark: 100,
    },
  ];

  return (
    <div style={{ width: '100%', height: size, display: 'flex', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Candidate"
            dataKey="A"
            stroke="var(--accent-primary)"
            fill="var(--accent-primary)"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)'
            }}
            itemStyle={{ color: 'var(--accent-primary)' }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
