'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ScoreStepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  step?: number;
  description?: string;
}

export function ScoreStepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  description
}: ScoreStepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="bg-dark-charcoal p-4 rounded-xl border border-white/5 flex flex-col gap-3">
      <div>
        <h3 className="text-white font-medium">{label}</h3>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white active:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Decrease score"
        >
          <Minus size={24} />
        </button>

        <div className="flex-1 flex flex-col items-center">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-crema font-display"
          >
            {value}
          </motion.span>
        </div>

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white active:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Increase score"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
        <motion.div
          className="h-full bg-crema"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}
