'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { PatternType } from '@/lib/supabase/types';
import rosetta from '@/asset/rosetta.jpeg';
import swan from '@/asset/swan.jpeg';
import seahorse from '@/asset/seahorse.jpeg';
import phoenix from '@/asset/phoenix.jpeg';
import stackedTulip from '@/asset/stacked_tulip.jpeg';

interface SpinningWheelProps {
  onResult?: (pattern: PatternType) => void;
  spinning?: boolean;
  result?: PatternType | null;
}

const SEGMENTS = [
  { name: 'Rosetta' as PatternType, emoji: '🌹', color: '#D4A373', image: rosetta },
  { name: 'Swan' as PatternType, emoji: '🦢', color: '#FAEDCD', image: swan },
  { name: 'Seahorse' as PatternType, emoji: '🐴', color: '#E76F51', image: seahorse },
  { name: 'Phoenix' as PatternType, emoji: '🔥', color: '#2A9D8F', image: phoenix },
  { name: 'Stacked Tulip' as PatternType, emoji: '🌷', color: '#1E1E1E', image: stackedTulip },
];

export default function SpinningWheel({ onResult, spinning = false, result = null }: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!spinning) return;

    setRevealed(false);

    // Calculate a target rotation based on the result if provided
    let targetRot = 360 * 5; // at least 5 full spins
    if (result) {
      const resultIndex = SEGMENTS.findIndex(s => s.name === result);
      const segmentAngle = 360 / SEGMENTS.length;
      // Adjust so the center of the segment hits the top (0 degrees)
      const targetOffset = 360 - (resultIndex * segmentAngle + segmentAngle / 2);
      targetRot += targetOffset;
    } else {
      targetRot += Math.floor(Math.random() * 360);
    }
    setRotation(targetRot);

    if (!result) return;

    // Reveal once the wheel's own 4s deceleration (see the motion.div transition below) finishes,
    // since the parent screen always passes spinning=true and never flips it off itself.
    const timer = setTimeout(() => setRevealed(true), 4200);
    return () => clearTimeout(timer);
  }, [spinning, result]);

  const radius = 200;
  const cx = 200;
  const cy = 200;
  const wheelSize = 640; // px — bump this to resize the whole wheel

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Pointer */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[48px] border-t-terracotta z-10 filter drop-shadow-md"></div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden shadow-2xl relative border-4 border-crema"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.25, 1, 0.5, 1] }} // smooth deceleration
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg width={wheelSize} height={wheelSize} viewBox="0 0 400 400">
            {SEGMENTS.map((segment, i) => {
              const startAngle = (i * 360) / SEGMENTS.length;
              const endAngle = ((i + 1) * 360) / SEGMENTS.length;
              
              const x1 = cx + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = cy + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = cx + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = cy + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

              const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
              const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              // Calculate text position
              const midAngle = startAngle + (endAngle - startAngle) / 2;
              const textX = cx + (radius * 0.65) * Math.cos((Math.PI * (midAngle - 90)) / 180);
              const textY = cy + (radius * 0.65) * Math.sin((Math.PI * (midAngle - 90)) / 180);
              
              const isWinner = result === segment.name;

              return (
                <g key={segment.name}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    className="stroke-espresso-black stroke-2"
                  />
                  <g transform={`translate(${textX}, ${textY}) rotate(${midAngle})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className={`font-display text-sm font-bold ${segment.color === '#1E1E1E' ? 'fill-steamed-milk' : 'fill-espresso-black'} ${isWinner ? 'text-xl' : ''}`}
                    >
                      {segment.emoji} {segment.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full bg-crema shadow-inner z-10 border-4 border-espresso-black"></div>
      </div>
      
      {/* Result Display */}
      <AnimatePresence>
        {result && revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="rounded-lg border-4 border-crema bg-steamed-milk p-2 shadow-2xl"
            >
              <Image
                src={SEGMENTS.find(s => s.name === result)!.image}
                alt={result}
                width={220}
                height={220}
                className="rounded object-cover"
              />
            </motion.div>
            <h2 className="mt-6 text-3xl font-display text-steamed-milk">Selected Pattern</h2>
            <p className="text-5xl font-bold text-crema mt-2 drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]">
              {SEGMENTS.find(s => s.name === result)?.emoji} {result}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
