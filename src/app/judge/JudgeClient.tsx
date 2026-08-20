'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronLeft,
  Minus,
  Plus,
  AlertCircle,
  Timer,
  Coffee,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useTournamentState, useCompetitors } from '@/hooks/use-realtime';
import { submitRound1Score, submitRound2Score, verifyJudgePin, type JudgeName } from './actions';

type Judge = JudgeName;

const JUDGES = [
  { name: 'Made Bagia Arsana', title: 'General Manager' },
  { name: 'Aristarkus Rawang', title: 'Bar Manager' },
  { name: 'Adinda Agustina', title: 'Coffee Trainer' }
] as const;

interface ScoreCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

const R1_CRITERIA: ScoreCriterion[] = [
  { id: 'pattern_accuracy', label: 'Pattern Accuracy & Structure', description: 'Resemblance to assigned pattern', maxScore: 30 },
  { id: 'milk_quality', label: 'Milk Foam Quality', description: 'Texture, glossiness, microfoam', maxScore: 20 },
  { id: 'contrast', label: 'Contrast & Definition', description: 'Clear lines between milk and espresso', maxScore: 15 },
  { id: 'symmetry', label: 'Symmetry, Proportion & Position', description: 'Placement in the cup', maxScore: 15 },
  { id: 'pouring_technique', label: 'Pouring Technique & Control', description: 'Steadiness and flow rate', maxScore: 10 },
  { id: 'overall', label: 'Overall Presentation', description: 'Visual appeal and cleanliness', maxScore: 10 }
];

const R2_CRITERIA: ScoreCriterion[] = [
  { id: 'creativity', label: 'Creativity & Originality', description: 'Uniqueness of design', maxScore: 25 },
  { id: 'technical_execution', label: 'Technical Execution', description: 'Difficulty and mastery', maxScore: 25 },
  { id: 'milk_quality', label: 'Milk Foam Quality', description: 'Texture, glossiness, microfoam', maxScore: 20 },
  { id: 'contrast', label: 'Contrast, Definition & Composition', description: 'Visual clarity and layout', maxScore: 15 },
  { id: 'overall', label: 'Overall Appeal & Presentation', description: 'Final visual impact', maxScore: 15 }
];

export default function JudgeClient() {
  const { state: tournamentState } = useTournamentState();
  const { competitors } = useCompetitors();

  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [pendingJudge, setPendingJudge] = useState<Judge | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [penalties, setPenalties] = useState(0);
  const [notes, setNotes] = useState('');
  const [designConcept, setDesignConcept] = useState('');

  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCompetitor = competitors.find(c => c.id === tournamentState?.active_competitor_id);
  const isRound1 = tournamentState?.current_stage === 'main_day_r1_top10';
  const isRound2 = tournamentState?.current_stage === 'main_day_r2_top5';

  const criteria = isRound1 ? R1_CRITERIA : isRound2 ? R2_CRITERIA : [];

  const totalScore = criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0) - penalties;

  // Formatting timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerColor = (tournamentState?.timer_seconds || 0) <= 30 ? 'text-[#E76F51]' : 'text-[#2A9D8F]';

  // Submit button double-tap effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (confirmSubmit) {
      timeout = setTimeout(() => {
        setConfirmSubmit(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [confirmSubmit]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingJudge || pin.length === 0) return;

    setIsVerifyingPin(true);
    const ok = await verifyJudgePin(pendingJudge, pin);
    setIsVerifyingPin(false);

    if (ok) {
      setSelectedJudge(pendingJudge);
      setPendingJudge(null);
      setPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleScoreChange = (id: string, delta: number, maxScore: number) => {
    setScores(prev => {
      const current = prev[id] || 0;
      const newScore = Math.max(0, Math.min(maxScore, current + delta));
      return { ...prev, [id]: newScore };
    });
  };

  const resetForm = () => {
    setScores({});
    setPenalties(0);
    setNotes('');
    setDesignConcept('');
    setConfirmSubmit(false);
  };

  const handleSubmit = async () => {
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }

    if (!selectedJudge || !activeCompetitor) return;

    setIsSubmitting(true);
    try {
      if (isRound1) {
        await submitRound1Score({
          judgeName: selectedJudge,
          competitorId: activeCompetitor.id,
          assignedPattern: (tournamentState?.active_pattern || 'Rosetta') as import('@/lib/supabase/types').PatternType,
          patternAccuracy: scores.pattern_accuracy || 0,
          milkFoam: scores.milk_quality || 0,
          contrastDefinition: scores.contrast || 0,
          symmetryPosition: scores.symmetry || 0,
          techniqueControl: scores.pouring_technique || 0,
          overallPresentation: scores.overall || 0,
          penaltyPoints: penalties,
          notes: notes,
        });
      } else if (isRound2) {
        await submitRound2Score({
          judgeName: selectedJudge,
          competitorId: activeCompetitor.id,
          designConcept: designConcept,
          creativityOriginality: scores.creativity || 0,
          technicalExecution: scores.technical_execution || 0,
          milkFoam: scores.milk_quality || 0,
          contrastComposition: scores.contrast || 0,
          overallAppeal: scores.overall || 0,
          penaltyPoints: penalties,
          notes: notes,
        });
      }
      
      setSubmitSuccess(true);
      resetForm();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to submit score', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pendingJudge) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#FAEDCD] flex flex-col items-center justify-center p-8 font-[family-name:var(--font-syne)]">
        <motion.form
          onSubmit={handlePinSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-8"
        >
          <button
            type="button"
            onClick={() => setPendingJudge(null)}
            className="flex items-center gap-1 text-[#D4A373]/70 hover:text-[#D4A373] transition-colors"
          >
            <ChevronLeft size={20} /> Back
          </button>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#D4A373]">{pendingJudge}</h1>
            <p className="text-lg text-[#FAEDCD]/70">Enter your PIN</p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(false); }}
            className={`w-full bg-[#1E1E1E] border-2 rounded-2xl px-6 py-5 text-3xl text-center tracking-[0.5em] outline-none transition-colors ${
              pinError ? 'border-[#E76F51]' : 'border-[#D4A373]/20 focus:border-[#D4A373]'
            }`}
          />

          {pinError && (
            <p className="text-[#E76F51] font-semibold">Incorrect PIN, try again.</p>
          )}

          <button
            type="submit"
            disabled={pin.length === 0 || isVerifyingPin}
            className="w-full py-5 rounded-2xl text-xl font-bold uppercase tracking-wider bg-[#D4A373] text-[#121212] hover:bg-[#D4A373]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifyingPin ? 'Checking...' : 'Unlock'}
          </button>
        </motion.form>
      </div>
    );
  }

  if (!selectedJudge) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#FAEDCD] flex flex-col items-center justify-center p-8 font-[family-name:var(--font-syne)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#D4A373]">Judge Login</h1>
            <p className="text-xl text-[#FAEDCD]/70">Please select your profile to continue</p>
          </div>

          <div className="grid gap-6">
            {JUDGES.map((judge) => (
              <motion.button
                key={judge.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPendingJudge(judge.name as Judge); setPin(''); setPinError(false); }}
                className="w-full bg-[#1E1E1E] border-2 border-[#D4A373]/20 hover:border-[#D4A373] p-6 rounded-2xl flex flex-col items-center gap-2 transition-colors"
              >
                <span className="text-2xl font-semibold">{judge.name}</span>
                <span className="text-[#D4A373] text-lg">{judge.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#FAEDCD] flex flex-col font-[family-name:var(--font-syne)] pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#1E1E1E] border-b border-[#D4A373]/20 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedJudge(null)}
            className="p-2 hover:bg-[#D4A373]/10 rounded-full transition-colors text-[#D4A373]"
          >
            <ChevronLeft size={28} />
          </button>
          <div>
            <h2 className="text-lg text-[#FAEDCD]/70">{selectedJudge}</h2>
            {activeCompetitor ? (
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#D4A373]">{activeCompetitor.full_name}</span>
                <span className="text-lg opacity-75">{activeCompetitor.outlet}</span>
              </div>
            ) : (
              <span className="text-xl text-[#FAEDCD]/50 italic">Waiting for next competitor...</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isRound1 && tournamentState?.active_pattern && (
            <div className="flex items-center gap-2 bg-[#D4A373]/10 px-4 py-2 rounded-full border border-[#D4A373]/30">
              <Coffee size={20} className="text-[#D4A373]" />
              <span className="font-semibold">{tournamentState.active_pattern}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 bg-[#121212] px-5 py-2.5 rounded-xl border border-white/5">
            <Timer size={24} className={timerColor} />
            <span className={`text-3xl font-mono tracking-wider ${timerColor}`}>
              {formatTimer(tournamentState?.timer_seconds || 0)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        
        {/* Scoring Guide Banner */}
        <div className="bg-[#1E1E1E] rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-center text-sm border border-white/5">
          <div className="flex items-center gap-2 text-[#D4A373] font-semibold"><Info size={18} /> SCORING GUIDE:</div>
          <span className="px-3 py-1 rounded-md bg-[#D4A373]/20 text-[#D4A373]">90-100 Exceptional</span>
          <span className="px-3 py-1 rounded-md bg-[#2A9D8F]/20 text-[#2A9D8F]">80-89 Very Good</span>
          <span className="px-3 py-1 rounded-md bg-[#457B9D]/20 text-[#457B9D]">70-79 Good</span>
          <span className="px-3 py-1 rounded-md bg-[#E9C46A]/20 text-[#E9C46A]">60-69 Fair</span>
          <span className="px-3 py-1 rounded-md bg-[#E76F51]/20 text-[#E76F51]">&lt;60 Needs Improvement</span>
        </div>

        {submitSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#2A9D8F]/20 border border-[#2A9D8F] text-[#2A9D8F] p-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <CheckCircle2 size={24} />
            Scores submitted successfully!
          </motion.div>
        )}

        {isRound2 && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl border border-white/5">
            <label className="block text-xl font-semibold text-[#D4A373]">Design Concept Name</label>
            <input 
              type="text" 
              value={designConcept}
              onChange={(e) => setDesignConcept(e.target.value)}
              placeholder="e.g. The Majestic Swan"
              className="w-full bg-[#121212] border-2 border-[#D4A373]/20 focus:border-[#D4A373] outline-none rounded-xl px-6 py-4 text-xl transition-colors"
            />
          </div>
        )}

        {/* Criteria Steppers */}
        <div className="bg-[#1E1E1E] rounded-3xl shadow-xl border border-white/5 overflow-hidden">
          {criteria.map((c, index) => {
            const currentScore = scores[c.id] || 0;
            const percentage = (currentScore / c.maxScore) * 100;
            
            return (
              <div key={c.id} className={`p-6 md:p-8 ${index !== 0 ? 'border-t border-white/5' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#FAEDCD] mb-1">{c.label}</h3>
                    <p className="text-[#FAEDCD]/50 text-sm">{c.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-[#121212] p-2 rounded-2xl">
                    <button 
                      onClick={() => handleScoreChange(c.id, -1, c.maxScore)}
                      className="w-16 h-16 flex items-center justify-center bg-[#1E1E1E] rounded-xl hover:bg-[#E76F51]/20 hover:text-[#E76F51] transition-colors active:scale-95"
                    >
                      <Minus size={28} />
                    </button>
                    
                    <div className="w-24 text-center">
                      <span className="text-4xl font-bold text-[#D4A373]">{currentScore}</span>
                      <span className="text-xl text-[#FAEDCD]/30">/{c.maxScore}</span>
                    </div>

                    <button 
                      onClick={() => handleScoreChange(c.id, 1, c.maxScore)}
                      className="w-16 h-16 flex items-center justify-center bg-[#1E1E1E] rounded-xl hover:bg-[#2A9D8F]/20 hover:text-[#2A9D8F] transition-colors active:scale-95"
                    >
                      <Plus size={28} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 h-2 bg-[#121212] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#D4A373]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Penalties & Notes Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Penalties */}
          <div className="bg-[#1E1E1E] rounded-3xl p-6 md:p-8 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-[#E76F51]" size={28} />
              <h3 className="text-2xl font-semibold text-[#E76F51]">Penalties</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2, 3, 5, 10].map(val => (
                <button
                  key={val}
                  onClick={() => setPenalties(val)}
                  className={`flex-1 min-w-[80px] py-4 text-xl font-bold rounded-xl border-2 transition-colors ${
                    penalties === val 
                      ? 'bg-[#E76F51] border-[#E76F51] text-white' 
                      : 'bg-[#121212] border-[#E76F51]/20 text-[#E76F51] hover:border-[#E76F51]/50'
                  }`}
                >
                  -{val}
                </button>
              ))}
            </div>
          </div>

          {/* Total Score Display */}
          <div className="bg-[#D4A373] rounded-3xl p-6 md:p-8 text-[#121212] flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />
            <h3 className="text-2xl font-semibold mb-2 relative z-10">Total Score</h3>
            <div className="text-7xl font-bold tracking-tighter relative z-10">
              {totalScore}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 md:p-8 border border-white/5 space-y-4">
          <label className="block text-xl font-semibold text-[#D4A373]">Judge's Notes (Optional)</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add specific observations, areas of improvement, or outstanding elements..."
            className="w-full bg-[#121212] border-2 border-[#D4A373]/20 focus:border-[#D4A373] outline-none rounded-xl p-6 text-lg min-h-[160px] resize-y transition-colors"
          />
        </div>

        {/* Submit Action */}
        <div className="sticky bottom-6 z-40 mt-8">
          <button
            disabled={!activeCompetitor || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-6 rounded-2xl text-2xl font-bold uppercase tracking-wider shadow-2xl transition-all ${
              !activeCompetitor || isSubmitting
                ? 'bg-[#1E1E1E] text-white/20 cursor-not-allowed'
                : confirmSubmit
                  ? 'bg-[#E76F51] text-white hover:bg-[#E76F51]/90 scale-[1.02]'
                  : 'bg-[#D4A373] text-[#121212] hover:bg-[#D4A373]/90'
            }`}
          >
            {isSubmitting 
              ? 'Submitting...' 
              : !activeCompetitor
                ? 'Waiting for Competitor'
                : confirmSubmit
                  ? 'Tap Again to Confirm'
                  : 'Submit Score'}
          </button>
        </div>

      </main>
    </div>
  );
}
