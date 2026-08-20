"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { registerCompetitor, type RegisterResult } from "./actions";
import type { StaffPosition, OutletLocation } from "@/lib/supabase/types";

const POSITIONS: StaffPosition[] = [
  "Bar Supervisor",
  "Bar Captain",
  "Barista/Bartender",
  "Bar Back (Daily Worker)",
];

const OUTLETS: OutletLocation[] = [
  "Nourish Ungasan",
  "Nourish Uluwatu",
  "Nourish Berawa",
  "The Bakery Uluwatu",
];

const RULES = [
  {
    title: "Competition Format",
    content:
      "Pre-Selection: Classic Tulip (100 pts). Main Day Round 1: Random Pattern via spinning wheel (100 pts). Top 5 advance. Round 2: Free Pour (100 pts). Cumulative scores determine the podium.",
  },
  {
    title: "Judging Criteria",
    content:
      "Scored on Milk Foam Quality, Contrast & Definition, Structure & Symmetry, Pouring Technique, Position & Presentation. Each criteria has specific point weights.",
  },
  {
    title: "Time Limit",
    content:
      "Each competitor has exactly 3:00 minutes (180 seconds) per pour. Audio alerts at 1:00 remaining, 0:30 remaining, and 0:00.",
  },
  {
    title: "Penalties",
    content:
      "Minor Penalties (1–5 pts): excessive spill, dirty cup presentation. Major Penalties (5–10 pts): overtime, use of unauthorized equipment.",
  },
  {
    title: "Qualification Quotas",
    content:
      "Nourish Berawa: Top 2 advance. Nourish Ungasan: Top 3 advance. Nourish Uluwatu & The Bakery Uluwatu (combined pool): Top 5 advance. Total: 10 finalists.",
  },
];

export default function RegisterClient() {
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("consent", consent ? "true" : "false");
    const res = await registerCompetitor(formData);
    setResult(res);
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1E1E1E] rounded-2xl p-8 max-w-md w-full text-center border border-[#D4A373]/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-[#2A9D8F]/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-[#2A9D8F]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#FAEDCD] mb-2 font-[family-name:var(--font-syne)]">
            Registration Complete!
          </h2>
          <p className="text-[#FAEDCD]/60 mb-6">
            You&apos;re officially in the Nourish Barista Latte Art Battle 2026.
          </p>
          <div className="bg-[#121212] rounded-xl p-4 mb-6">
            <p className="text-xs text-[#FAEDCD]/40 uppercase tracking-wider mb-1">Competitor ID</p>
            <p className="text-[#D4A373] font-mono text-sm break-all">{result.competitorId}</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] text-sm">
            <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse" />
            Pre-Selection Registered
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1E1E1E] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[#D4A373]/10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Image src="/nourish_logo.jpeg" alt="Nourish" width={64} height={20} className="h-5 w-auto invert mix-blend-screen" />
            <span className="text-[#D4A373] font-[family-name:var(--font-syne)] font-bold text-sm">×</span>
            <Image src="/Expat._Roaster_Logo_White.avif" alt="Expat Roastery" width={80} height={24} className="h-6 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)]">
            Latte Art Battle 2026
          </h1>
          <p className="text-[#FAEDCD]/50 text-sm mt-1">Competitor Registration</p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#FAEDCD]/80 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              minLength={2}
              maxLength={100}
              placeholder="Enter your full name"
              className="w-full bg-[#121212] border border-[#D4A373]/20 rounded-xl px-4 py-3 text-[#FAEDCD] placeholder-[#FAEDCD]/30 focus:outline-none focus:border-[#D4A373]/60 transition-colors"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-[#FAEDCD]/80 mb-1.5">
              Position
            </label>
            <select
              name="position"
              required
              defaultValue=""
              className="w-full bg-[#121212] border border-[#D4A373]/20 rounded-xl px-4 py-3 text-[#FAEDCD] focus:outline-none focus:border-[#D4A373]/60 transition-colors appearance-none"
            >
              <option value="" disabled className="text-[#FAEDCD]/30">
                Select your position
              </option>
              {POSITIONS.map((p) => (
                <option key={p} value={p} className="bg-[#121212]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Outlet */}
          <div>
            <label className="block text-sm font-medium text-[#FAEDCD]/80 mb-1.5">
              Outlet
            </label>
            <select
              name="outlet"
              required
              defaultValue=""
              className="w-full bg-[#121212] border border-[#D4A373]/20 rounded-xl px-4 py-3 text-[#FAEDCD] focus:outline-none focus:border-[#D4A373]/60 transition-colors appearance-none"
            >
              <option value="" disabled className="text-[#FAEDCD]/30">
                Select your outlet
              </option>
              {OUTLETS.map((o) => (
                <option key={o} value={o} className="bg-[#121212]">
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Rules & Regulations Accordion */}
          <div className="border border-[#D4A373]/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#D4A373] hover:bg-[#D4A373]/5 transition-colors"
            >
              <span className="font-medium">Rules & Regulations</span>
              {rulesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <AnimatePresence>
              {rulesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {RULES.map((rule, i) => (
                      <div key={i} className="border-t border-[#D4A373]/5 pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedRule(expandedRule === i ? null : i)}
                          className="w-full text-left flex items-center justify-between py-1"
                        >
                          <span className="text-sm text-[#FAEDCD]/70 font-medium">
                            {rule.title}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 text-[#FAEDCD]/40 transition-transform ${
                              expandedRule === i ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedRule === i && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-xs text-[#FAEDCD]/50 pb-2 leading-relaxed overflow-hidden"
                            >
                              {rule.content}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                  consent
                    ? "bg-[#D4A373] border-[#D4A373]"
                    : "border-[#FAEDCD]/30 group-hover:border-[#D4A373]/50"
                }`}
              >
                {consent && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-[#121212]"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path d="M2 6l3 3 5-5" />
                  </motion.svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[#FAEDCD]/60 leading-snug">
              I have read and agree to the competition rules, regulations, and judging criteria of the
              Nourish Barista Latte Art Battle 2026.
            </span>
          </label>

          {/* Error Message */}
          {result?.error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#E76F51]/10 border border-[#E76F51]/30 rounded-xl px-4 py-3 text-sm text-[#E76F51]"
            >
              {result.error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!consent || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#D4A373]/90 disabled:bg-[#D4A373]/30 disabled:cursor-not-allowed text-[#121212] font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-[#121212]/30 border-t-[#121212] rounded-full"
              />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Register
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
