'use client';

import React from 'react';
import { motion } from 'motion/react';

interface CountdownTimerProps {
  seconds: number;
  isRunning: boolean;
  competitorName?: string;
  competitorOutlet?: string;
  pattern?: string;
}

export default function CountdownTimer({
  seconds,
  isRunning,
  competitorName,
  competitorOutlet,
  pattern
}: CountdownTimerProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const isLowTime = seconds <= 30;
  const isMidTime = seconds <= 60 && seconds > 30;
  
  let color = 'text-sage';
  let strokeColor = 'stroke-sage';
  if (isLowTime) {
    color = 'text-terracotta';
    strokeColor = 'stroke-terracotta';
  } else if (isMidTime) {
    color = 'text-[#E9C46A]'; // Amber-ish
    strokeColor = 'stroke-[#E9C46A]';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-espresso-black p-8 relative overflow-hidden">
      <div className="relative w-[400px] h-[400px] flex items-center justify-center">
        {/* SVG Ring */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            className="stroke-dark-charcoal stroke-[10px]"
          />
          <motion.circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            strokeDasharray="1194"
            strokeDashoffset="0"
            className={`${strokeColor} stroke-[10px] drop-shadow-[0_0_15px_currentColor]`}
            animate={isLowTime && isRunning ? { opacity: [1, 0.5, 1], scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </svg>

        {/* Time Text */}
        <motion.div
          className={`font-display text-9xl font-bold tracking-widest ${color}`}
          animate={isLowTime && isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {formatTime(seconds)}
        </motion.div>
      </div>

      {/* Competitor Info */}
      <div className="mt-12 text-center flex flex-col items-center gap-4">
        {competitorName && (
          <h1 className="text-5xl font-display text-steamed-milk font-bold">{competitorName}</h1>
        )}
        {competitorOutlet && (
          <div className="px-6 py-2 bg-dark-charcoal text-crema text-xl rounded-full uppercase tracking-wider font-semibold border border-crema/30">
            {competitorOutlet}
          </div>
        )}
        {pattern && (
          <div className="mt-4 px-8 py-3 bg-sage/20 border border-sage text-sage text-2xl rounded-lg font-display flex items-center gap-3">
            <span>Assigned Pattern:</span>
            <strong className="text-steamed-milk">{pattern}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
