'use client';

import React from 'react';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
}

export function ScoreBadge({ score, maxScore = 100 }: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;

  let bandLabel = '';
  let colorClasses = '';

  if (percentage >= 90) {
    bandLabel = 'Exceptional';
    colorClasses = 'bg-crema/20 text-crema border-crema/30';
  } else if (percentage >= 80) {
    bandLabel = 'Very Good';
    colorClasses = 'bg-sage/20 text-sage border-sage/30';
  } else if (percentage >= 70) {
    bandLabel = 'Good';
    colorClasses = 'bg-blue-400/20 text-blue-400 border-blue-400/30';
  } else if (percentage >= 60) {
    bandLabel = 'Fair';
    colorClasses = 'bg-amber-400/20 text-amber-400 border-amber-400/30';
  } else {
    bandLabel = 'Needs Improvement';
    colorClasses = 'bg-terracotta/20 text-terracotta border-terracotta/30';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${colorClasses}`}>
      <span>{bandLabel}</span>
      <span className="opacity-60">|</span>
      <span>{percentage.toFixed(0)}%</span>
    </div>
  );
}
