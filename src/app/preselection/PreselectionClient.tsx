"use client";

import { useState, useMemo, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, Users, Trophy, ChevronRight, ChevronLeft } from "lucide-react";
import { useCompetitors, usePreselectionScores } from "@/hooks/use-realtime";
import { submitPreselectionScore } from "./actions";
import { verifyJudgePin } from "@/app/judge/actions";
import type { Competitor, OutletLocation } from "@/lib/supabase/types";

const JUDGES = ["Made Bagia Arsana", "Aristarkus Rawang"] as const;

const CRITERIA = [
  { key: "milkFoam", label: "Milk Foam Quality", max: 20, description: "Silky, creamy, glossy, fine microfoam" },
  { key: "contrastDefinition", label: "Contrast & Definition", max: 20, description: "Clear espresso/milk contrast, crisp pattern" },
  { key: "tulipStructure", label: "Tulip Structure & Symmetry", max: 30, description: "Layers, petal consistency, symmetry, pull-through" },
  { key: "techniqueControl", label: "Pouring Technique & Control", max: 15, description: "Pitcher height, flow rate, wrist control" },
  { key: "positionPresentation", label: "Position, Proportion & Presentation", max: 15, description: "Centering, cup balance, rim cleanliness" },
] as const;

const OUTLET_QUOTAS: Record<string, { label: string; quota: number; outlets: OutletLocation[] }> = {
  berawa: { label: "Nourish Berawa", quota: 2, outlets: ["Nourish Berawa"] },
  ungasan: { label: "Nourish Ungasan", quota: 3, outlets: ["Nourish Ungasan"] },
  uluwatu: { label: "Nourish Uluwatu & The Bakery", quota: 5, outlets: ["Nourish Uluwatu", "The Bakery Uluwatu"] },
};

// Order the outlet-selection screen: Ungasan, Berawa, then the combined Uluwatu & Bakery pool
const OUTLET_POOL_KEYS: (keyof typeof OUTLET_QUOTAS)[] = ["ungasan", "berawa", "uluwatu"];

export default function PreselectionClient() {
  const { competitors, loading: compLoading } = useCompetitors();
  const { scores, loading: scoreLoading } = usePreselectionScores();

  const [selectedJudge, setSelectedJudge] = useState<(typeof JUDGES)[number] | null>(null);
  const [pendingJudge, setPendingJudge] = useState<(typeof JUDGES)[number] | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<keyof typeof OUTLET_QUOTAS | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [view, setView] = useState<"scoring" | "leaderboard">("scoring");

  const [formValues, setFormValues] = useState({
    milkFoam: 0,
    contrastDefinition: 0,
    tulipStructure: 0,
    techniqueControl: 0,
    positionPresentation: 0,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const totalScore = useMemo(
    () =>
      formValues.milkFoam +
      formValues.contrastDefinition +
      formValues.tulipStructure +
      formValues.techniqueControl +
      formValues.positionPresentation,
    [formValues]
  );

  // Check which competitors this judge has already scored
  const scoredCompetitorIds = useMemo(() => {
    if (!selectedJudge) return new Set<string>();
    return new Set(scores.filter((s) => s.judge_name === selectedJudge).map((s) => s.competitor_id));
  }, [scores, selectedJudge]);

  // Leaderboard data: average score per competitor
  const leaderboard = useMemo(() => {
    const scoreMap = new Map<string, number[]>();
    for (const score of scores) {
      const arr = scoreMap.get(score.competitor_id) || [];
      arr.push(Number(score.total_score));
      scoreMap.set(score.competitor_id, arr);
    }

    return competitors
      .map((c) => {
        const judgeScores = scoreMap.get(c.id) || [];
        const avg = judgeScores.length > 0 ? judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length : 0;
        return { ...c, avgScore: avg, judgeCount: judgeScores.length };
      })
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [competitors, scores]);

  // Leaderboard filtered down to the outlet the judge is currently scoring
  const outletCompetitors = useMemo(
    () => (selectedOutlet ? leaderboard.filter((c) => OUTLET_QUOTAS[selectedOutlet].outlets.includes(c.outlet)) : []),
    [leaderboard, selectedOutlet]
  );

  async function handlePinSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pendingJudge || pin.length === 0) return;

    setIsVerifyingPin(true);
    const ok = await verifyJudgePin(pendingJudge, pin);
    setIsVerifyingPin(false);

    if (ok) {
      setSelectedJudge(pendingJudge);
      setPendingJudge(null);
      setPin("");
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  }

  async function handleSubmit() {
    if (!selectedCompetitor || !selectedJudge) return;
    setSubmitting(true);
    setSubmitMessage(null);

    const result = await submitPreselectionScore({
      competitorId: selectedCompetitor.id,
      judgeName: selectedJudge,
      milkFoam: formValues.milkFoam,
      contrastDefinition: formValues.contrastDefinition,
      tulipStructure: formValues.tulipStructure,
      techniqueControl: formValues.techniqueControl,
      positionPresentation: formValues.positionPresentation,
      notes: formValues.notes || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setSubmitMessage({ type: "success", text: "Score submitted successfully!" });
      setSelectedCompetitor(null);
      setFormValues({ milkFoam: 0, contrastDefinition: 0, tulipStructure: 0, techniqueControl: 0, positionPresentation: 0, notes: "" });
    } else {
      setSubmitMessage({ type: "error", text: result.error || "Failed to submit." });
    }
  }

  if (compLoading || scoreLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#D4A373] animate-pulse">Loading...</div>
      </div>
    );
  }

  // PIN entry
  if (pendingJudge) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <motion.form
          onSubmit={handlePinSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-sm w-full text-center space-y-8"
        >
          <button
            type="button"
            onClick={() => setPendingJudge(null)}
            className="flex items-center gap-1 text-[#D4A373]/70 hover:text-[#D4A373] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#D4A373]">{pendingJudge}</h1>
            <p className="text-[#FAEDCD]/70">Enter your PIN</p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
            className={`w-full bg-[#1E1E1E] border-2 rounded-2xl px-6 py-5 text-3xl text-center tracking-[0.5em] outline-none transition-colors ${
              pinError ? "border-[#E76F51]" : "border-[#D4A373]/20 focus:border-[#D4A373]"
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
            {isVerifyingPin ? "Checking..." : "Unlock"}
          </button>
        </motion.form>
      </div>
    );
  }

  // Judge selection
  if (!selectedJudge) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-4">
          <div className="text-center mb-8">
            <ClipboardCheck className="w-12 h-12 text-[#D4A373] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)]">Pre-Selection Scoring</h1>
            <p className="text-[#FAEDCD]/50 text-sm mt-1">Classic Tulip — 100 Points Max</p>
          </div>
          <p className="text-[#FAEDCD]/60 text-center text-sm">Select your judge identity:</p>
          {JUDGES.map((judge) => (
            <button
              key={judge}
              onClick={() => { setPendingJudge(judge); setPin(""); setPinError(false); }}
              className="w-full bg-[#1E1E1E] border border-[#D4A373]/20 rounded-xl p-4 text-left hover:border-[#D4A373]/50 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-[#FAEDCD] font-medium">{judge}</p>
                <p className="text-[#FAEDCD]/40 text-xs mt-0.5">
                  {judge === "Made Bagia Arsana" ? "General Manager" : "Bar Manager"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#D4A373]/40 group-hover:text-[#D4A373]" />
            </button>
          ))}
        </motion.div>
      </div>
    );
  }

  // Outlet selection
  if (!selectedOutlet) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-4">
          <button
            onClick={() => setSelectedJudge(null)}
            className="flex items-center gap-1 text-[#D4A373]/70 hover:text-[#D4A373] transition-colors mb-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="text-center mb-8">
            <ClipboardCheck className="w-12 h-12 text-[#D4A373] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)]">Select Outlet</h1>
            <p className="text-[#FAEDCD]/50 text-sm mt-1">{selectedJudge}</p>
          </div>
          {OUTLET_POOL_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedOutlet(key)}
              className="w-full bg-[#1E1E1E] border border-[#D4A373]/20 rounded-xl p-4 text-left hover:border-[#D4A373]/50 transition-all flex items-center justify-between group"
            >
              <p className="text-[#FAEDCD] font-medium">{OUTLET_QUOTAS[key].label}</p>
              <ChevronRight className="w-5 h-5 text-[#D4A373]/40 group-hover:text-[#D4A373]" />
            </button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#D4A373] text-sm font-medium">{selectedJudge}</p>
            <h1 className="text-xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)]">Pre-Selection</h1>
            <button
              onClick={() => {
                setSelectedOutlet(null);
                setSelectedCompetitor(null);
                setSubmitMessage(null);
              }}
              className="text-[#FAEDCD]/40 text-xs mt-0.5 hover:text-[#D4A373] transition-colors"
            >
              {OUTLET_QUOTAS[selectedOutlet].label} · Change outlet
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("scoring")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "scoring" ? "bg-[#D4A373] text-[#121212]" : "bg-[#1E1E1E] text-[#FAEDCD]/60"
              }`}
            >
              <ClipboardCheck className="w-4 h-4 inline mr-1" /> Score
            </button>
            <button
              onClick={() => setView("leaderboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "leaderboard" ? "bg-[#D4A373] text-[#121212]" : "bg-[#1E1E1E] text-[#FAEDCD]/60"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-1" /> Leaderboard
            </button>
          </div>
        </div>

        {/* Scoring View */}
        {view === "scoring" && !selectedCompetitor && (
          <div>
            <h2 className="text-[#FAEDCD]/60 text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Select Competitor
            </h2>
            <div className="space-y-2">
              {outletCompetitors.map((c) => {
                const isScored = scoredCompetitorIds.has(c.id);
                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => !isScored && setSelectedCompetitor(c)}
                    disabled={isScored}
                    className={`w-full bg-[#1E1E1E] border rounded-xl p-4 text-left flex items-center justify-between transition-all ${
                      isScored
                        ? "border-[#2A9D8F]/30 opacity-60"
                        : "border-[#D4A373]/10 hover:border-[#D4A373]/40"
                    }`}
                  >
                    <div>
                      <p className="text-[#FAEDCD] font-medium">{c.full_name}</p>
                      <p className="text-[#FAEDCD]/40 text-xs">{c.outlet} · {c.position}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.judgeCount > 0 && (
                        <span className="text-[#D4A373] font-bold text-sm">
                          {c.avgScore.toFixed(1)} <span className="text-[#FAEDCD]/30 font-normal">({c.judgeCount}/2)</span>
                        </span>
                      )}
                      {isScored ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F]">Scored</span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#D4A373]/40" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scoring Form */}
        {view === "scoring" && selectedCompetitor && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <button
              onClick={() => { setSelectedCompetitor(null); setSubmitMessage(null); }}
              className="text-[#D4A373] text-sm mb-4 hover:underline"
            >
              ← Back to competitor list
            </button>

            <div className="bg-[#1E1E1E] rounded-xl p-4 mb-4 border border-[#D4A373]/10">
              <p className="text-[#FAEDCD] font-semibold">{selectedCompetitor.full_name}</p>
              <p className="text-[#FAEDCD]/40 text-sm">{selectedCompetitor.outlet} · Classic Tulip</p>
            </div>

            <div className="space-y-4">
              {CRITERIA.map((criterion) => (
                <div key={criterion.key} className="bg-[#1E1E1E] rounded-xl p-4 border border-[#D4A373]/5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-[#FAEDCD]/80 font-medium">{criterion.label}</label>
                    <span className="text-[#D4A373] font-bold text-lg">
                      {formValues[criterion.key]}<span className="text-[#FAEDCD]/30 text-sm font-normal">/{criterion.max}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#FAEDCD]/30 mb-3">{criterion.description}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={0}
                      max={criterion.max}
                      value={formValues[criterion.key]}
                      onChange={(e) => {
                        const num = e.target.value === "" ? 0 : Math.max(0, Math.min(criterion.max, Number(e.target.value)));
                        setFormValues((prev) => ({ ...prev, [criterion.key]: num }));
                      }}
                      className="w-20 h-12 rounded-xl bg-[#121212] border border-[#D4A373]/20 text-[#FAEDCD] text-xl font-bold text-center focus:outline-none focus:border-[#D4A373] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="flex-1 h-2 bg-[#121212] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#D4A373] rounded-full"
                        animate={{ width: `${(formValues[criterion.key] / criterion.max) * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Notes */}
              <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#D4A373]/5">
                <label className="text-sm text-[#FAEDCD]/80 font-medium block mb-2">Notes (Optional)</label>
                <textarea
                  value={formValues.notes}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional comments..."
                  rows={3}
                  className="w-full bg-[#121212] border border-[#D4A373]/10 rounded-lg px-3 py-2 text-[#FAEDCD] text-sm placeholder-[#FAEDCD]/20 focus:outline-none focus:border-[#D4A373]/40"
                />
              </div>

              {/* Total */}
              <div className="bg-[#D4A373]/10 rounded-xl p-4 text-center border border-[#D4A373]/20">
                <p className="text-[#FAEDCD]/50 text-xs uppercase tracking-wider mb-1">Total Score</p>
                <p className="text-4xl font-bold text-[#D4A373] font-[family-name:var(--font-syne)]">
                  {totalScore}<span className="text-lg text-[#FAEDCD]/30">/100</span>
                </p>
              </div>

              <AnimatePresence>
                {submitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-xl px-4 py-3 text-sm ${
                      submitMessage.type === "success"
                        ? "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/30"
                        : "bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/30"
                    }`}
                  >
                    {submitMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <DoubleConfirmSubmit onConfirm={handleSubmit} loading={submitting} />
            </div>
          </motion.div>
        )}

        {/* Leaderboard View */}
        {view === "leaderboard" && (
          <div className="space-y-6">
            {Object.entries(OUTLET_QUOTAS).map(([key, pool]) => {
              const poolCompetitors = leaderboard.filter((c) =>
                pool.outlets.includes(c.outlet as OutletLocation)
              );
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#FAEDCD] font-semibold font-[family-name:var(--font-syne)]">{pool.label}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#D4A373]/10 text-[#D4A373]">
                      Top {pool.quota} qualify
                    </span>
                  </div>
                  <div className="space-y-2">
                    {poolCompetitors.map((c, i) => (
                      <div
                        key={c.id}
                        className={`bg-[#1E1E1E] rounded-xl p-3 flex items-center justify-between border ${
                          i < pool.quota ? "border-[#2A9D8F]/20" : "border-[#E76F51]/10 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              i < pool.quota ? "bg-[#2A9D8F]/20 text-[#2A9D8F]" : "bg-[#E76F51]/10 text-[#E76F51]"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-[#FAEDCD] text-sm font-medium">{c.full_name}</p>
                            <p className="text-[#FAEDCD]/30 text-xs">{c.outlet} · {c.judgeCount}/2 judges</p>
                          </div>
                        </div>
                        <span className="text-[#D4A373] font-bold">{c.avgScore.toFixed(1)}</span>
                      </div>
                    ))}
                    {poolCompetitors.length === 0 && (
                      <p className="text-[#FAEDCD]/30 text-sm text-center py-4">No competitors yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Double-confirm submit sub-component
// ============================================================

function DoubleConfirmSubmit({ onConfirm, loading }: { onConfirm: () => void; loading: boolean }) {
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (confirming) {
      onConfirm();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      animate={{ scale: confirming ? 1.02 : 1 }}
      className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
        confirming
          ? "bg-[#E76F51] text-white"
          : "bg-[#D4A373] text-[#121212] hover:bg-[#D4A373]/90"
      } disabled:opacity-50`}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
        />
      ) : confirming ? (
        "Tap Again to Confirm"
      ) : (
        "Lock & Submit Score"
      )}
    </motion.button>
  );
}
