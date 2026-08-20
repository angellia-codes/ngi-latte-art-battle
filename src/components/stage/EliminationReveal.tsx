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

  return (
    <div className="w-full min-h-screen bg-espresso-black text-steamed-milk p-10 flex flex-col items-center">
      <h1 className="text-6xl font-display text-crema mb-16 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(212,163,115,0.5)] text-center">
        Top 5 Reveal
      </h1>

      <div className="w-full max-w-5xl flex flex-col gap-4 relative">
        <AnimatePresence>
          {sortedRankings.map((comp, index) => {
            const isAdvancing = comp.rank <= 5;
            
            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: isAdvancing ? 1 : 0.6, x: 0, scale: isAdvancing ? 1.02 : 0.98 }}
                transition={{ delay: index * 0.3, duration: 0.5, type: 'spring' }}
                className={`flex items-center p-6 rounded-xl border-l-8 ${isAdvancing ? 'bg-dark-charcoal border-sage shadow-[0_0_20px_rgba(42,157,143,0.3)]' : 'bg-[#1a1a1a] border-terracotta'}`}
              >
                <div className={`text-4xl font-display font-bold w-20 text-center ${isAdvancing ? 'text-sage' : 'text-gray-500'}`}>
                  #{comp.rank}
                </div>
                
                <div className="flex-1 ml-6">
                  <h2 className={`text-3xl font-display ${isAdvancing ? 'text-steamed-milk' : 'text-gray-400'}`}>
                    {comp.name}
                  </h2>
                  <div className="text-crema/80 uppercase tracking-widest text-sm mt-1">
                    {comp.outlet}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className={`text-3xl font-bold font-mono ${isAdvancing ? 'text-crema' : 'text-gray-500'}`}>
                    {comp.score.toFixed(2)}
                  </div>
                  
                  {isAdvancing ? (
                    <div className="px-4 py-2 bg-sage/20 text-sage font-bold rounded flex items-center gap-2 border border-sage/50">
                      <Trophy size={20} />
                      ADVANCING
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-terracotta/10 text-terracotta font-bold rounded flex items-center gap-2 border border-terracotta/30">
                      <XCircle size={20} />
                      ELIMINATED
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
