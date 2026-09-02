'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Maximize, Minimize } from 'lucide-react'
import {
  useTournamentState,
  useCompetitors,
  useR1Scores,
  useR2Scores,
} from '@/hooks/use-realtime'
import { useCountdownTimer } from '@/hooks/use-timer'
import SpinningWheel from '@/components/stage/SpinningWheel'
import CountdownTimer from '@/components/stage/CountdownTimer'
import EliminationReveal from '@/components/stage/EliminationReveal'
import PodiumReveal from '@/components/stage/PodiumReveal'
import RulesCarousel from '@/components/stage/RulesCarousel'
import { createClient } from '@/lib/supabase/client'

export default function StageClient() {
  const { state: tournamentState, loading: stateLoading } = useTournamentState()
  const { competitors, loading: competitorsLoading } = useCompetitors()
  const { scores: r1Scores, loading: r1Loading } = useR1Scores()
  const { scores: r2Scores, loading: r2Loading } = useR2Scores()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const supabase = createClient()

  const { seconds: liveTimerSeconds } = useCountdownTimer({
    seconds: tournamentState?.timer_seconds ?? 180,
    isRunning: tournamentState?.timer_is_running ?? false,
    startedAt: tournamentState?.timer_started_at ?? null,
  })

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  // Update tournament state pattern
  const handleWheelResult = useCallback(
    async (pattern: string) => {
      if (tournamentState) {
        await supabase
          .from('tournament_state')
          .update({ active_pattern: pattern })
          .eq('id', tournamentState.id)
      }
    },
    [supabase, tournamentState]
  )

  const isLoading =
    stateLoading || competitorsLoading || r1Loading || r2Loading

  if (isLoading) {
    return (
      <div className="h-screen bg-[#121212] text-[#FAEDCD] flex items-center justify-center font-sans">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="text-4xl text-[#D4A373] tracking-widest font-bold"
        >
          LOADING...
        </motion.div>
      </div>
    )
  }

  if (!tournamentState) {
    return (
      <div className="h-screen bg-[#121212] text-[#FAEDCD] flex items-center justify-center font-sans">
        <div className="text-xl">Waiting for tournament state...</div>
      </div>
    )
  }

  // Helpers for current view
  const activeCompetitor = competitors.find(
    (c) => c.id === tournamentState.active_competitor_id
  )

  // Compute Elimination Reveal data
  const computeEliminationRankings = () => {
    const qualifiedCompetitors = competitors.filter(c => c.status === 'qualified_finalist')
    const competitorsToRank = qualifiedCompetitors.length > 0 ? qualifiedCompetitors : competitors

    const competitorAverages = competitorsToRank.map((comp) => {
      const compR1Scores = r1Scores.filter((s) => s.competitor_id === comp.id)
      const avg = compR1Scores.length
        ? compR1Scores.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / compR1Scores.length
        : 0
      return {
        id: comp.id,
        name: comp.full_name,
        outlet: comp.outlet || '',
        score: avg,
      }
    })

    const sorted = competitorAverages.sort((a, b) => b.score - a.score)
    return sorted.map((s, index) => ({ ...s, rank: index + 1 }))
  }

  // Compute Podium data
  const computePodium = () => {
    const top5Competitors = competitors.filter(c => c.status === 'qualified_top_5')
    const competitorsToRank = top5Competitors.length > 0 ? top5Competitors : competitors

    const competitorTotals = competitorsToRank.map((comp) => {
      const compR1Scores = r1Scores.filter((s) => s.competitor_id === comp.id)
      const r1Avg = compR1Scores.length
        ? compR1Scores.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / compR1Scores.length
        : 0

      const compR2Scores = r2Scores.filter((s) => s.competitor_id === comp.id)
      const r2Avg = compR2Scores.length
        ? compR2Scores.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / compR2Scores.length
        : 0

      return {
        id: comp.id,
        name: comp.full_name,
        outlet: comp.outlet || '',
        score: r1Avg + r2Avg,
      }
    })

    const sorted = competitorTotals.sort((a, b) => b.score - a.score)
    return {
      champion: sorted[0],
      runnerUp1: sorted[1],
      runnerUp2: sorted[2],
    }
  }

  const renderScreen = () => {
    switch (tournamentState.screen_mode) {
      case 'idle_timer':
        return (
          <CountdownTimer
            key="idle_timer"
            seconds={liveTimerSeconds}
            isRunning={tournamentState.timer_is_running || false}
            competitorName={activeCompetitor?.full_name || ''}
            competitorOutlet={activeCompetitor?.outlet || ''}
            pattern={tournamentState.active_pattern || ''}
          />
        )
      case 'spinning_wheel':
        return (
          <SpinningWheel
            key="spinning_wheel"
            spinning={true}
            result={tournamentState.active_pattern}
            onResult={handleWheelResult}
          />
        )
      case 'rules_carousel':
        return <RulesCarousel key="rules_carousel" autoPlayInterval={6000} />
      case 'mid_stage_cut':
        return (
          <EliminationReveal
            key="mid_stage_cut"
            rankings={computeEliminationRankings()}
          />
        )
      case 'podium_ceremony': {
        const podiumData = computePodium()
        if (!podiumData.champion || !podiumData.runnerUp1 || !podiumData.runnerUp2) {
          return (
            <div
              key="podium_ceremony_pending"
              className="flex-1 flex items-center justify-center text-[#FAEDCD] opacity-50"
            >
              <h1 className="text-2xl font-bold tracking-widest text-[#D4A373]">
                Waiting for at least 3 finalists to reveal the podium…
              </h1>
            </div>
          )
        }
        return (
          <PodiumReveal
            key="podium_ceremony"
            champion={podiumData.champion}
            runnerUp1={podiumData.runnerUp1}
            runnerUp2={podiumData.runnerUp2}
          />
        )
      }
      default:
        return (
          <div
            key="default_view"
            className="flex-1 flex items-center justify-center text-[#FAEDCD] opacity-50"
          >
            <h1 className="text-4xl font-bold tracking-widest text-[#D4A373]">
              NOURISH LATTE ART BATTLE
            </h1>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-[#121212] text-[#FAEDCD] flex flex-col font-sans relative overflow-hidden">
      {/* Floating Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-6 right-6 z-50 p-3 bg-black/40 hover:bg-[#D4A373]/20 border border-[#D4A373]/30 rounded-full text-[#D4A373] transition-colors"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full h-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tournamentState.screen_mode}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="flex-1 flex flex-col w-full h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Subtle Watermark Footer */}
      <div className="absolute bottom-6 left-0 right-0 z-0 pointer-events-none flex justify-center opacity-20">
        <span className="text-sm font-medium tracking-[0.3em] uppercase text-[#D4A373]">
          NOURISH × EXPAT LATTE ART BATTLE 2026
        </span>
      </div>
    </div>
  )
}
