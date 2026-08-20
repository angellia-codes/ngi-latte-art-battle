'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Award, Calendar, BookOpen, Star } from 'lucide-react';

interface RulesCarouselProps {
  autoPlayInterval?: number;
}

const slides = [
  {
    id: 1,
    icon: <Coffee size={60} className="text-crema" />,
    title: "Philosophy",
    content: "Quality + Control + Technique + Creativity > Complexity alone."
  },
  {
    id: 2,
    icon: <Star size={60} className="text-sage" />,
    title: "Scoring Bands",
    content: (
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-2xl mt-8 text-left">
        <div><strong className="text-crema">90-100:</strong> Exceptional</div>
        <div><strong className="text-crema">80-89:</strong> Very Good</div>
        <div><strong className="text-crema">70-79:</strong> Good</div>
        <div><strong className="text-crema">60-69:</strong> Satisfactory</div>
        <div><strong className="text-crema">50-59:</strong> Needs Improvement</div>
        <div><strong className="text-crema">&lt;50:</strong> Unacceptable</div>
      </div>
    )
  },
  {
    id: 3,
    icon: <Calendar size={60} className="text-terracotta" />,
    title: "Competition Schedule",
    content: (
      <ul className="text-2xl space-y-6 text-left inline-block mt-8">
        <li><strong className="text-crema">Session 1:</strong> Pre-Selection (Internal)</li>
        <li><strong className="text-crema">Session 2:</strong> Top 10 Elimination</li>
        <li><strong className="text-crema">Session 3:</strong> Top 5 Finals</li>
      </ul>
    )
  },
  {
    id: 4,
    icon: <BookOpen size={60} className="text-[#E9C46A]" />,
    title: "Pre-Selection Criteria",
    content: "Pattern difficulty is capped. Focus is strictly on execution, contrast, symmetry, and overall harmony."
  },
  {
    id: 5,
    icon: <Award size={60} className="text-sage" />,
    title: "Main Day Criteria",
    content: "Both rounds demand flawlessness under pressure. The final round encourages pushing the boundaries of creativity."
  },
  {
    id: 6,
    icon: <Coffee size={60} className="text-crema" />,
    title: "Ready?",
    content: "May the best pour win!"
  }
];

export default function RulesCarousel({ autoPlayInterval = 6000 }: RulesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval]);

  return (
    <div className="w-full min-h-[500px] h-screen bg-espresso-black flex flex-col relative overflow-hidden">
      
      {/* Decorative Top/Bottom Borders */}
      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-terracotta via-crema to-sage"></div>
      <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-sage via-crema to-terracotta"></div>

      <div className="flex-1 flex items-center justify-center p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center max-w-4xl"
          >
            <div className="mb-8 p-6 rounded-full bg-dark-charcoal border border-dark-charcoal shadow-2xl">
              {slides[currentIndex].icon}
            </div>
            
            <h2 className="text-5xl font-display text-crema mb-10 uppercase tracking-widest font-bold">
              {slides[currentIndex].title}
            </h2>

            <div className="text-4xl text-steamed-milk font-light leading-relaxed">
              {slides[currentIndex].content}
            </div>
            
            {/* Decorative Divider */}
            <div className="mt-12 flex items-center justify-center gap-4 opacity-50">
              <div className="w-16 h-px bg-crema"></div>
              <Coffee size={24} className="text-crema" />
              <div className="w-16 h-px bg-crema"></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-dark-charcoal absolute bottom-2">
        <motion.div
          key={`progress-${currentIndex}`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="h-full bg-crema"
        />
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-10 w-full flex justify-center gap-3">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-crema scale-125' : 'bg-dark-charcoal'}`}
          />
        ))}
      </div>
    </div>
  );
}
