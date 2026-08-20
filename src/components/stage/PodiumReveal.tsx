'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

interface Finalist {
  name: string;
  outlet: string;
  score: number;
}

interface PodiumRevealProps {
  champion: Finalist;
  runnerUp1: Finalist;
  runnerUp2: Finalist;
}

export default function PodiumReveal({ champion, runnerUp1, runnerUp2 }: PodiumRevealProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500); // 3rd place
    const t2 = setTimeout(() => setStep(2), 3000); // 2nd place
    const t3 = setTimeout(() => setStep(3), 4500); // 1st place
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const getCardContent = (finalist: Finalist, place: number, color: string, title: string) => (
    <div className="flex flex-col items-center justify-end h-full">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h3 className="text-2xl font-bold mb-2 uppercase tracking-widest text-gray-400">{title}</h3>
        <h2 className="text-4xl font-display text-steamed-milk mb-2 drop-shadow-lg">{finalist.name}</h2>
        <p className="text-crema mb-4">{finalist.outlet}</p>
        <p className="text-2xl font-mono font-bold text-white/80">{finalist.score.toFixed(2)} pts</p>
      </motion.div>
      
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: place === 1 ? 400 : place === 2 ? 300 : 200 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 1 }}
        className="w-full flex items-start justify-center pt-8 relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        {place === 1 ? (
          <Trophy size={80} className="text-espresso-black drop-shadow-md" />
        ) : (
          <span className="text-6xl font-display font-bold text-espresso-black/80">{place}</span>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-espresso-black relative overflow-hidden flex flex-col items-center justify-end pb-0 px-10">
      
      {/* Confetti overlay for champion */}
      <AnimatePresence>
        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 pointer-events-none z-50 flex justify-center"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -100, 
                  x: Math.random() * window.innerWidth,
                  rotate: 0 
                }}
                animate={{ 
                  y: window.innerHeight, 
                  rotate: 360,
                  x: (Math.random() * window.innerWidth) + (Math.random() > 0.5 ? 200 : -200)
                }}
                transition={{ 
                  duration: Math.random() * 2 + 2, 
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 2
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#FFD700', '#D4A373', '#FAEDCD', '#2A9D8F'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center absolute top-20 w-full z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-display text-crema uppercase tracking-widest drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]"
        >
          Final Results
        </motion.h1>
      </div>

      <div className="flex items-end justify-center w-full max-w-6xl h-[600px] gap-4 z-20">
        
        {/* 3rd Place */}
        <div className="flex-1 max-w-xs h-full">
          {step >= 1 && getCardContent(runnerUp2, 3, '#CD7F32', '2nd Runner-Up')}
        </div>

        {/* 1st Place */}
        <div className="flex-1 max-w-sm h-full z-30 transform translate-y-[-20px]">
          {step >= 3 && getCardContent(champion, 1, '#FFD700', 'Champion')}
        </div>

        {/* 2nd Place */}
        <div className="flex-1 max-w-xs h-full">
          {step >= 2 && getCardContent(runnerUp1, 2, '#C0C0C0', '1st Runner-Up')}
        </div>

      </div>
    </div>
  );
}
