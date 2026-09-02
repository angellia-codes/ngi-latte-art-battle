"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  UserPlus,
  ClipboardCheck,
  Gavel,
  Monitor,
  Settings,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react";
import { useTournamentState } from "@/hooks/use-realtime";

const STAGE_LABELS: Record<string, string> = {
  preselection_berawa: "Pre-Selection — Berawa",
  preselection_uluwatu: "Pre-Selection — Uluwatu",
  preselection_ungasan: "Pre-Selection — Ungasan",
  main_day_r1_top10: "Main Day — Round 1 (Top 10)",
  main_day_r2_top5: "Main Day — Round 2 (Top 5)",
  completed: "Tournament Completed",
};

const NAV_ITEMS = [
  {
    href: "/register",
    icon: UserPlus,
    label: "Register",
    description: "Competitor sign-up & intake",
    color: "#D4A373",
  },
  {
    href: "/preselection",
    icon: ClipboardCheck,
    label: "Pre-Selection",
    description: "Classic Tulip scoring portal",
    color: "#2A9D8F",
  },
  {
    href: "/judge",
    icon: Gavel,
    label: "Judge",
    description: "Main day scoring tablet",
    color: "#E76F51",
  },
  {
    href: "/stage",
    icon: Monitor,
    label: "Stage",
    description: "Live projector display",
    color: "#FAEDCD",
  },
  {
    href: "/admin",
    icon: Settings,
    label: "Admin",
    description: "Head judge control panel",
    color: "#D4A373",
  },
];

const SCHEDULE = [
  { date: "Wed, 2 Sep 2026", time: "5:00 PM WITA", venue: "Nourish Berawa", quota: "Top 2" },
  { date: "Thu, 3 Sep 2026", time: "5:00 PM WITA", venue: "Nourish Uluwatu & The Bakery", quota: "Top 5" },
  { date: "Fri, 4 Sep 2026", time: "5:00 PM WITA", venue: "Nourish Ungasan", quota: "Top 3" },
];

const MAIN_DAY = { date: "Thu, 17 Sep 2026", time: "6:00 PM WITA", venue: "The Bakery Uluwatu" };

export default function HomeClient() {
  const { state } = useTournamentState();

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A373]/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image src="/nourish_logo.jpeg" alt="Nourish" width={80} height={24} className="h-6 w-auto invert mix-blend-screen" />
              <span className="text-[#D4A373] font-[family-name:var(--font-syne)] font-bold text-lg">×</span>
              <Image src="/Expat._Roaster_Logo_White.avif" alt="Expat Roastery" width={100} height={32} className="h-8 w-auto" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)] leading-tight mb-4">
              Barista Latte Art
              <br />
              <span className="text-[#D4A373]">Battle 2026</span>
            </h1>

            <p className="text-[#FAEDCD]/50 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Internal latte art competition across Nourish Group Indonesia outlets.
              Pre-Selection → Top 10 Finalists → Top 5 Cut → Champion.
            </p>

            {/* Live Status */}
            {state && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] border border-[#D4A373]/20"
              >
                <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse" />
                <span className="text-sm text-[#FAEDCD]/70">
                  {STAGE_LABELS[state.current_stage] || state.current_stage}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {NAV_ITEMS.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <Link
                href={item.href}
                className="block bg-[#1E1E1E] rounded-2xl p-6 border border-[#D4A373]/10 hover:border-[#D4A373]/30 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-[#FAEDCD] font-semibold text-lg mb-1">{item.label}</h3>
                <p className="text-[#FAEDCD]/40 text-sm">{item.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Event Schedule */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)] mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4A373]" />
            Pre-Selection Schedule
          </h2>
          <div className="space-y-3">
            {SCHEDULE.map((session, i) => (
              <div
                key={i}
                className="bg-[#1E1E1E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-[#D4A373]/5"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
                  <div>
                    <p className="text-[#FAEDCD] font-medium text-sm">{session.venue}</p>
                    <p className="text-[#FAEDCD]/40 text-xs">
                      {session.date} at {session.time}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2A9D8F]/10 text-[#2A9D8F] text-xs font-medium self-start sm:self-auto">
                  <Trophy className="w-3 h-3" />
                  {session.quota} qualify
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Day Battle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-16"
        >
          <h2 className="text-xl font-bold text-[#FAEDCD] font-[family-name:var(--font-syne)] mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4A373]" />
            Main Day Battle
          </h2>
          <div className="bg-[#1E1E1E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-[#D4A373]/30">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
              <div>
                <p className="text-[#FAEDCD] font-medium text-sm">{MAIN_DAY.venue}</p>
                <p className="text-[#FAEDCD]/40 text-xs">
                  {MAIN_DAY.date} at {MAIN_DAY.time}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4A373]/10 text-[#D4A373] text-xs font-medium self-start sm:self-auto">
              <Trophy className="w-3 h-3" />
              Finals
            </span>
          </div>
        </motion.div>

        {/* Philosophy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-12 border-t border-[#D4A373]/10"
        >
          <p className="text-[#D4A373]/60 text-sm italic max-w-md mx-auto">
            &ldquo;Quality + Control + Technique + Creativity &gt; Complexity alone&rdquo;
          </p>
          <p className="text-[#FAEDCD]/20 text-xs mt-4">
            Nourish Group Indonesia × EXPAT Roastery · Bali 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
