'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  progress: number;
}

export function Timer({ seconds, isRunning, progress }: TimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  let colorClass = 'text-sage';
  let strokeColor = '#2A9D8F'; // sage

  if (progress <= 0.17) {
    colorClass = 'text-terracotta';
    strokeColor = '#E76F51'; // terracotta
  } else if (progress <= 0.5) {
    colorClass = 'text-amber-400';
    strokeColor = '#FBBF24'; // amber-400
  }

  const isLowTime = seconds <= 30 && seconds > 0;

  // SVG parameters
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center flex-col">
      <div className="relative flex items-center justify-center w-[200px] h-[200px]">
        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset, stroke: strokeColor }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>

        <motion.div 
          className={`flex flex-col items-center justify-center z-10 ${colorClass}`}
          animate={isLowTime && isRunning ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
          transition={{ repeat: isLowTime && isRunning ? Infinity : 0, duration: 1 }}
        >
          <Clock className={`w-6 h-6 mb-1 ${isRunning ? 'animate-pulse' : ''}`} />
          <span className="text-5xl font-display font-bold tabular-nums tracking-wider">
            {timeString}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
