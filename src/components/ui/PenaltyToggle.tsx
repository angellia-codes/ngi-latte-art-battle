'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PenaltyToggleProps {
  value: number;
  onChange: (v: number) => void;
  maxPenalty?: number;
}

export function PenaltyToggle({ value, onChange, maxPenalty = 20 }: PenaltyToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const commonValues = [0, 1, 2, 3, 5, 10];

  return (
    <div className="bg-dark-charcoal p-4 rounded-xl border border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-white font-medium">
          <AlertTriangle className="w-5 h-5 text-terracotta" />
          <span>Penalties</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold ${value > 0 ? 'text-terracotta' : 'text-gray-400'}`}>
            -{value} pts
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {commonValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => onChange(val)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      value === val
                        ? 'bg-terracotta text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {val === 0 ? 'None' : `-${val}`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-gray-300 font-medium block mb-1">Minor (1-5 pts)</span>
                  <p className="text-gray-500">Spill, dirty cup, minor hygiene issue</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-gray-300 font-medium block mb-1">Major (5-10 pts)</span>
                  <p className="text-gray-500">Overtime, unauthorized gear, unprofessional behavior</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
