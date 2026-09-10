'use client';

import React, { useState, useEffect } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { labelFontSize, targetRotation } from '@/lib/wheel';
import rosetta from '@/asset/rosetta.jpeg';
import swan from '@/asset/swan.jpeg';
import seahorse from '@/asset/seahorse.jpeg';
import phoenix from '@/asset/phoenix.jpeg';
import stackedTulip from '@/asset/stacked_tulip.jpeg';

export type WheelSegment = {
  /** Matched against `result` to decide where the wheel stops. */
  id: string;
  label: string;
  sublabel?: string;
  image?: StaticImageData;
};

interface SpinningWheelProps {
  /** Defaults to the five R1 patterns. */
  segments?: WheelSegment[];
  spinning?: boolean;
  result?: string | null;
  /** Heading above the revealed result. */
  caption?: string;
  /** Small badge shown with the revealed result, e.g. the draw order "#3". */
  resultBadge?: string;
}

const PATTERN_SEGMENTS: WheelSegment[] = [
  { id: 'Rosetta', label: '🌹 Rosetta', image: rosetta },
  { id: 'Swan', label: '🦢 Swan', image: swan },
  { id: 'Seahorse', label: '🐴 Seahorse', image: seahorse },
  { id: 'Phoenix', label: '🔥 Phoenix', image: phoenix },
  { id: 'Stacked Tulip', label: '🌷 Stacked Tulip', image: stackedTulip },
];

// Cycled by segment index, so any number of segments gets a colour.
const PALETTE = ['#D4A373', '#FAEDCD', '#E76F51', '#2A9D8F', '#1E1E1E'];
const DARK_SWATCH = '#1E1E1E';

// SVG user-unit geometry (viewBox is 400x400).
const RADIUS = 200;
const CX = 200;
const CY = 200;
const TEXT_X = CX + RADIUS - 14; // label sits just inside the rim
const USABLE_LENGTH = RADIUS - 40; // rim padding + centre hub

export default function SpinningWheel({
  segments = PATTERN_SEGMENTS,
  spinning = false,
  result = null,
  caption = 'Selected Pattern',
  resultBadge,
}: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const resultIndex = result ? segments.findIndex((s) => s.id === result) : -1;
  const resultSegment = resultIndex >= 0 ? segments[resultIndex] : null;

  useEffect(() => {
    if (!spinning) return;

    setRevealed(false);

    setRotation(
      resultIndex >= 0
        ? targetRotation(resultIndex, segments.length)
        : 360 * 5 + Math.floor(Math.random() * 360)
    );

    if (resultIndex < 0) return;

    // Reveal once the wheel's own 4s deceleration (see the motion.div transition below) finishes,
    // since the parent screen always passes spinning=true and never flips it off itself.
    const timer = setTimeout(() => setRevealed(true), 4200);
    return () => clearTimeout(timer);
  }, [spinning, resultIndex, segments.length]);


  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0 overflow-hidden pt-6">
      {/* Square sized off whatever height is left, so the wheel fills the stage
          and shrinks again once the reveal block appears below it. */}
      <div className="relative flex-1 min-h-0 aspect-square max-w-full">
        {/* Pointer */}
        <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-terracotta z-10 filter drop-shadow-md"></div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden shadow-2xl relative border-4 border-crema"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.25, 1, 0.5, 1] }} // smooth deceleration
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 400">
            {segments.map((segment, i) => {
              const startAngle = (i * 360) / segments.length;
              const endAngle = ((i + 1) * 360) / segments.length;

              const x1 = CX + RADIUS * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = CY + RADIUS * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = CX + RADIUS * Math.cos((Math.PI * (endAngle - 90)) / 180);
              const y2 = CY + RADIUS * Math.sin((Math.PI * (endAngle - 90)) / 180);

              const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
              const pathData = `M ${CX} ${CY} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              const midAngle = startAngle + (endAngle - startAngle) / 2;

              const color = PALETTE[i % PALETTE.length];
              const textFill = color === DARK_SWATCH ? 'fill-steamed-milk' : 'fill-espresso-black';
              const isWinner = result === segment.id;

              // Labels read along the radius, not the arc: a long name gets the
              // full ~160px of usable radius instead of a thin slice of arc.
              const labelSize = labelFontSize(segment.label, USABLE_LENGTH, 16) * (isWinner ? 1.15 : 1);
              const flipped = midAngle > 180;

              return (
                <g key={segment.id}>
                  <path
                    d={pathData}
                    fill={color}
                    className="stroke-espresso-black stroke-2"
                  />
                  <g
                    transform={
                      `rotate(${midAngle - 90} ${CX} ${CY})` +
                      (flipped ? ` rotate(180 ${TEXT_X} ${CY})` : '')
                    }
                  >
                    <text
                      x={TEXT_X}
                      y={CY}
                      dy={segment.sublabel ? -4 : 0}
                      fontSize={labelSize}
                      textAnchor={flipped ? 'start' : 'end'}
                      alignmentBaseline="middle"
                      className={`font-display font-bold ${textFill}`}
                    >
                      {segment.label}
                    </text>
                    {segment.sublabel && (
                      <text
                        x={TEXT_X}
                        y={CY}
                        dy="9"
                        fontSize={labelFontSize(segment.sublabel, USABLE_LENGTH, 10)}
                        textAnchor={flipped ? 'start' : 'end'}
                        alignmentBaseline="middle"
                        className={`font-sans ${textFill} opacity-70`}
                      >
                        {segment.sublabel}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-crema shadow-inner z-10 border-4 border-espresso-black"></div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {resultSegment && revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col items-center text-center"
          >
            {resultSegment.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                className="rounded-lg border-4 border-crema bg-steamed-milk p-2 shadow-2xl"
              >
                <Image
                  src={resultSegment.image}
                  alt={resultSegment.id}
                  width={220}
                  height={220}
                  className="rounded object-cover w-[13vh] h-[13vh] max-w-[150px] max-h-[150px] min-w-[80px] min-h-[80px]"
                />
              </motion.div>
            )}
            <h2 className="mt-3 text-xl font-display text-steamed-milk">{caption}</h2>
            <p className="text-3xl font-bold text-crema mt-1 drop-shadow-[0_0_15px_rgba(212,163,115,0.5)]">
              {resultBadge && <span className="mr-2 text-terracotta">{resultBadge}</span>}
              {resultSegment.label}
            </p>
            {resultSegment.sublabel && (
              <p className="text-lg text-steamed-milk/70 mt-1">{resultSegment.sublabel}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
