'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Settings, Play, Pause, RotateCcw, Users, Trophy, Zap, Monitor, Timer, ChevronDown } from 'lucide-react'
import { useTournamentState, useCompetitors, useR1Scores, useR2Scores, usePreselectionScores } from '@/hooks/use-realtime'
import * as actions from './actions'
import { BattleStage, ScreenDisplayMode, PatternType } from '@/lib/supabase/types'

export default function AdminClient() {
  const { state: tournamentState, loading: tsLoading } = useTournamentState()
  const { competitors } = useCompetitors()
  const { scores: r1Scores } = useR1Scores()
  const { scores: r2Scores } = useR2Scores()
  const { scores: preselectionScores } = usePreselectionScores()

  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pre' | 'r1' | 'r2' | 'final'>('r1')
  const [resultMessage, setResultMessage] = useState<string | null>(null)

  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length === 0) return

    setIsVerifyingPin(true)
    const ok = await actions.verifyAdminPin(pin)
    setIsVerifyingPin(false)

    if (ok) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  const handleAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setLoading(actionName)
    try {
      const res = await actionFn()
      setResultMessage(`Success: ${actionName} completed.`)
      setTimeout(() => setResultMessage(null), 3000)
    } catch (err: any) {
      setResultMessage(`Error: ${err.message}`)
      setTimeout(() => setResultMessage(null), 5000)
    }
    setLoading(null)
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#FAEDCD] flex flex-col items-center justify-center p-8 font-[family-name:var(--font-syne)]">
        <motion.form
          onSubmit={handlePinSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#D4A373]">Head Judge Control</h1>
            <p className="text-lg text-[#FAEDCD]/70">Enter admin PIN</p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(false) }}
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
    )
  }

  if (tsLoading) return <div className="min-h-screen bg-[#121212] text-[#FAEDCD] flex items-center justify-center font-[family-name:var(--font-syne)]">Loading Dashboard...</div>

  const stages: BattleStage[] = ['preselection_berawa', 'preselection_uluwatu', 'preselection_ungasan', 'main_day_r1_top10', 'main_day_r2_top5', 'completed']
  const screenModes: ScreenDisplayMode[] = ['idle_timer', 'spinning_wheel', 'mid_stage_cut', 'podium_ceremony', 'rules_carousel']
  const patterns: PatternType[] = ['Rosetta', 'Swan', 'Seahorse', 'Phoenix', 'Stacked Tulip']

  const qualifiedFinalists = competitors.filter(c => c.status === 'qualified_finalist' || c.status === 'qualified_top_5')

  return (
    <div className="min-h-screen bg-[#121212] text-[#FAEDCD] p-6 font-[family-name:var(--font-syne)] flex flex-col gap-6">
      
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#D4A373]">Head Judge Control</h1>
          <p className="text-sm opacity-80 text-[#2A9D8F]">Nourish Barista Latte Art Battle 2026</p>
        </div>
        {resultMessage && (
          <div className="px-4 py-2 bg-[#2A9D8F] text-[#121212] rounded-md font-bold">
            {resultMessage}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Tournament Control */}
        <motion.div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#D4A373]/20 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="text-[#D4A373]" />
            <h2 className="text-xl font-bold">Tournament Control</h2>
          </div>
          
          <div>
            <h3 className="text-sm uppercase tracking-widest text-[#E76F51] mb-3 font-semibold">Stage Switcher</h3>
            <div className="flex flex-wrap gap-2">
              {stages.map(s => (
                <button
                  key={s}
                  onClick={() => handleAction('setStage', () => actions.setStage(s))}
                  disabled={loading !== null}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                    tournamentState?.current_stage === s 
                      ? 'bg-[#2A9D8F] text-[#121212] border-[#2A9D8F] font-bold' 
                      : 'border-[#D4A373]/30 hover:border-[#D4A373] text-[#FAEDCD]'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-widest text-[#E76F51] mb-3 font-semibold">Screen Mode Switcher</h3>
            <div className="flex flex-wrap gap-2">
              {screenModes.map(m => (
                <button
                  key={m}
                  onClick={() => handleAction('setScreenMode', () => actions.setScreenMode(m))}
                  disabled={loading !== null}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                    tournamentState?.screen_mode === m 
                      ? 'bg-[#D4A373] text-[#121212] border-[#D4A373] font-bold' 
                      : 'border-[#D4A373]/30 hover:border-[#D4A373] text-[#FAEDCD]'
                  }`}
                >
                  {m.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Panel 2 & 3 Col */}
        <div className="flex flex-col gap-6">
          
          {/* Panel 2: Timer Control */}
          <motion.div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#D4A373]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="text-[#D4A373]" />
                <h2 className="text-xl font-bold">Timer Control</h2>
              </div>
              {tournamentState?.timer_is_running && (
                <span className="flex items-center gap-1 text-[#2A9D8F] text-sm font-bold bg-[#2A9D8F]/10 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#2A9D8F] animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 bg-[#121212] rounded-xl border border-[#D4A373]/10 mb-6">
              <span className="text-6xl font-bold font-mono text-[#FAEDCD]">
                {Math.floor((tournamentState?.timer_seconds || 0) / 60).toString().padStart(2, '0')}:
                {((tournamentState?.timer_seconds || 0) % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => handleAction('startTimer', actions.startTimer)} className="flex items-center gap-2 px-4 py-2 bg-[#2A9D8F] text-[#121212] font-bold rounded-lg hover:brightness-110">
                <Play size={18} /> Start
              </button>
              <button onClick={() => handleAction('pauseTimer', actions.pauseTimer)} className="flex items-center gap-2 px-4 py-2 bg-[#E76F51] text-[#FAEDCD] font-bold rounded-lg hover:brightness-110">
                <Pause size={18} /> Pause
              </button>
              <button onClick={() => handleAction('resetTimer', () => actions.resetTimer(180))} className="flex items-center gap-2 px-4 py-2 border border-[#D4A373] text-[#D4A373] font-bold rounded-lg hover:bg-[#D4A373]/10">
                <RotateCcw size={18} /> Reset 3m
              </button>
            </div>
          </motion.div>

          {/* Panel 3: Active Heat */}
          <motion.div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#D4A373]/20 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-[#D4A373]" />
              <h2 className="text-xl font-bold">Active Heat</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-[#D4A373] mb-1 block">Active Competitor</label>
                <div className="relative">
                  <select 
                    value={tournamentState?.active_competitor_id || ''}
                    onChange={(e) => handleAction('setActiveComp', () => actions.setActiveCompetitor(e.target.value))}
                    className="w-full bg-[#121212] border border-[#D4A373]/30 text-[#FAEDCD] p-2 rounded-lg appearance-none"
                  >
                    <option value="">-- Select Competitor --</option>
                    {qualifiedFinalists.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.outlet})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-[#D4A373]" size={16} />
                </div>
              </div>

              <div>
                <label className="text-sm text-[#D4A373] mb-1 block">R1 Pattern Assignment</label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#2A9D8F] font-bold bg-[#2A9D8F]/10 px-3 py-1 rounded">Current: {tournamentState?.active_pattern || 'None'}</span>
                  <button 
                    onClick={() => handleAction('spinWheel', () => actions.setScreenMode('spinning_wheel'))}
                    className="text-xs border border-[#E76F51] text-[#E76F51] px-2 py-1 rounded hover:bg-[#E76F51]/10"
                  >
                    Trigger Spin Wheel
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patterns.map(p => (
                    <button
                      key={p}
                      onClick={() => handleAction(`setPattern_${p}`, () => actions.setPattern(p))}
                      className="text-xs px-2 py-1 border border-[#D4A373]/30 rounded text-[#FAEDCD] hover:border-[#D4A373]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>

        {/* Panel 4 & 5 Col */}
        <div className="flex flex-col gap-6">
          
          {/* Panel 4: Qualification Actions */}
          <motion.div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#E76F51]/30">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-[#E76F51]" />
              <h2 className="text-xl font-bold">Qualification Cuts</h2>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (confirm('Execute Pre-Selection cuts? This will advance Top 1 per outlet to R1.')) {
                    handleAction('Pre-Selection Cut', actions.qualifyPreselectionFinalists)
                  }
                }}
                className="w-full text-left px-4 py-3 bg-[#121212] border border-[#D4A373]/20 rounded-lg hover:border-[#D4A373] flex justify-between items-center group"
              >
                <span>Qualify Pre-Selection Finalists</span>
                <Play className="text-[#D4A373] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
              </button>

              <button 
                onClick={() => {
                  if (confirm('Execute Top 5 Cut? This finalizes R1.')) {
                    handleAction('Top 5 Cut', actions.executeTop5Cut)
                  }
                }}
                className="w-full text-left px-4 py-3 bg-[#121212] border border-[#E76F51]/40 rounded-lg hover:border-[#E76F51] flex justify-between items-center group"
              >
                <span className="text-[#E76F51]">Execute Top 5 Cut</span>
                <Play className="text-[#E76F51] opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
              </button>

              <button 
                onClick={() => {
                  if (confirm('Finalize Podium? This aggregates R1 and R2 to determine winners.')) {
                    handleAction('Finalize Podium', actions.finalizePodium)
                  }
                }}
                className="w-full text-left px-4 py-3 bg-[#D4A373] text-[#121212] font-bold rounded-lg hover:brightness-110 flex justify-between items-center"
              >
                <span>Finalize Podium</span>
                <Trophy size={16} />
              </button>
            </div>
          </motion.div>

          {/* Panel 5: Leaderboard */}
          <motion.div className="bg-[#1E1E1E] p-6 rounded-xl border border-[#D4A373]/20 flex-1 flex flex-col h-full max-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#D4A373]" />
                <h2 className="text-xl font-bold">Leaderboards</h2>
              </div>
            </div>

            <div className="flex border-b border-[#D4A373]/20 mb-4 overflow-x-auto no-scrollbar">
              {['pre', 'r1', 'r2', 'final'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab 
                      ? 'border-[#D4A373] text-[#D4A373] font-bold' 
                      : 'border-transparent text-[#FAEDCD]/60 hover:text-[#FAEDCD]'
                  }`}
                >
                  {tab === 'pre' ? 'Pre-Select' : tab === 'r1' ? 'Round 1' : tab === 'r2' ? 'Round 2' : 'Final'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {competitors.slice(0, 10).map((c, i) => (
                <div key={c.id} className="bg-[#121212] p-3 rounded-lg flex items-center justify-between border border-[#D4A373]/10">
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4A373] font-bold text-lg w-6">{i + 1}</span>
                    <div>
                      <div className="font-bold">{c.full_name}</div>
                      <div className="text-xs text-[#FAEDCD]/60">{c.outlet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#2A9D8F]">{c.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
      
    </div>
  )
}
