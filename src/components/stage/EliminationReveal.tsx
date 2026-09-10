'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, XCircle } from 'lucide-react';

interface RankedCompetitor {
  id: string;
  name: string;
  outlet: string;
  score: number;
  rank: number;
}

interface EliminationRevealProps {
  rankings: RankedCompetitor[]; // Array of 10 competitors
}

export default function EliminationReveal({ rankings }: EliminationRevealProps) {
  // Sort rankings by rank descending (10 down to 1) so 10 appears first
  const sortedRankings = [...rankings].sort((a, b) => b.rank - a.rank);

  // Two columns: the stage is a fixed h-screen with overflow hidden, and ten
  // full-height rows in one column run past the fold — which cuts off the
  // advancing half of the field. Splitting keeps every row on screen.
  const half = Math.ceil(sortedRankings.length / 2);
  const columns = [sortedRankings.slice(0, half), sortedRankings.slice(half)];

  return (
    <div className="w-full h-full bg-espresso-black text-steamed-milk px-8 py-6 flex flex-col items-center justify-center overflow-hidden">
      <h1 className="text-5xl font-display text-crema mb-6 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(212,163,115,0.5)] text-center shrink-0">
        Top 5 Reveal
      </h1>

      <div className="w-full max-w-7xl grid grid-cols-2 gap-6 max-h-full">
        <AnimatePresence>
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col justify-center gap-2">
              {column.map((comp, rowIndex) => {
                const isAdvancing = comp.rank <= 5;
                // Keep the 10 -> 1 countdown running across both columns.
                const revealIndex = columnIndex * half + rowIndex;

                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, x: -50, scale: 0.9 }}
                    animate={{ opacity: isAdvancing ? 1 : 0.6, x: 0, scale: isAdvancing ? 1.02 : 0.98 }}
                    transition={{ delay: revealIndex * 0.3, duration: 0.5, type: 'spring' }}
                    className={`flex items-center p-3 rounded-xl border-l-8 ${isAdvancing ? 'bg-dark-charcoal border-sage shadow-[0_0_20px_rgba(42,157,143,0.3)]' : 'bg-[#1a1a1a] border-terracotta'}`}
                  >
                    <div className={`text-2xl xl:text-3xl font-display font-bold w-12 xl:w-16 text-center shrink-0 ${isAdvancing ? 'text-sage' : 'text-gray-500'}`}>
                      #{comp.rank}
                    </div>

                    <div className="flex-1 ml-4 mr-3 min-w-0">
                      <h2 className={`text-lg xl:text-2xl font-display leading-tight line-clamp-2 break-words ${isAdvancing ? 'text-steamed-milk' : 'text-gray-400'}`}>
                        {comp.name}
                      </h2>
                      <div className="text-crema/80 uppercase tracking-widest text-xs mt-1 truncate">
                        {comp.outlet}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className={`text-xl xl:text-2xl font-bold font-mono ${isAdvancing ? 'text-crema' : 'text-gray-500'}`}>
                        {comp.score.toFixed(2)}
                      </div>

                      {isAdvancing ? (
                        <div className="px-3 py-1.5 bg-sage/20 text-sage font-bold text-sm rounded flex items-center gap-2 border border-sage/50">
                          <Trophy size={18} />
                          ADVANCING
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-terracotta/10 text-terracotta font-bold text-sm rounded flex items-center gap-2 border border-terracotta/30">
                          <XCircle size={18} />
                          ELIMINATED
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
