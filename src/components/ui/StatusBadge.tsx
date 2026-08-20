'use client';

import React from 'react';
import type { CompetitorStatus } from '@/lib/supabase/types';

interface StatusBadgeProps {
  status: CompetitorStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let label = '';
  let colorClasses = '';

  switch (status) {
    case 'registered':
      label = 'Registered';
      colorClasses = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      break;
    case 'preselection_completed':
      label = 'Pre-Selection Done';
      colorClasses = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      break;
    case 'qualified_finalist':
      label = 'Qualified Finalist';
      colorClasses = 'bg-sage/20 text-sage border-sage/30';
      break;
    case 'eliminated_preselection':
      label = 'Eliminated';
      colorClasses = 'bg-terracotta/20 text-terracotta border-terracotta/30';
      break;
    case 'qualified_top_5':
      label = 'Top 5';
      colorClasses = 'bg-crema/20 text-crema border-crema/30';
      break;
    case 'eliminated_r1':
      label = 'Eliminated R1';
      colorClasses = 'bg-terracotta/20 text-terracotta border-terracotta/30';
      break;
    case 'completed_tournament':
      label = 'Completed';
      colorClasses = 'bg-sage/20 text-sage border-sage/30';
      break;
    case 'disqualified':
      label = 'Disqualified';
      colorClasses = 'bg-red-500/20 text-red-500 border-red-500/30';
      break;
    default:
      label = status;
      colorClasses = 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${colorClasses}`}>
      {label}
    </div>
  );
}
