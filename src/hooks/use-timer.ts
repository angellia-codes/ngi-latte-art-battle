"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// Audio helper — uses Web Audio API as fallback (no external files needed)
// Attempts Howler.js if available, falls back to tone generator
// ============================================================

function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported
  }
}

function playChime() {
  playTone(880, 0.3, "sine"); // A5 - gentle chime
}

function playWarning() {
  playTone(660, 0.5, "triangle"); // E5 - warning tone
}

function playBuzzer() {
  playTone(220, 1.0, "sawtooth"); // A3 - buzzer
  setTimeout(() => playTone(220, 1.0, "sawtooth"), 300);
  setTimeout(() => playTone(220, 1.5, "sawtooth"), 600);
}

// ============================================================
// useCountdownTimer Hook
// ============================================================

interface UseCountdownTimerOptions {
  // Remaining seconds as of `startedAt` (while running) or the exact
  // remaining seconds (while stopped) — i.e. tournament_state.timer_seconds.
  seconds: number;
  isRunning: boolean;
  // ISO timestamp of when the current run started (tournament_state.timer_started_at).
  startedAt: string | null;
  onComplete?: () => void;
  enableAudio?: boolean;
}

function computeRemaining(seconds: number, isRunning: boolean, startedAt: string | null) {
  if (isRunning && startedAt) {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, seconds - elapsed);
  }
  return Math.max(0, seconds);
}

// Derives the displayed countdown straight from server state + wall-clock
// time on every tick, rather than decrementing a local counter — so it
// can never drift from (or fail to resync with) the DB, even when the
// DB writes the same numeric `seconds` value across a start/pause/reset.
export function useCountdownTimer({
  seconds,
  isRunning,
  startedAt,
  onComplete,
  enableAudio = true,
}: UseCountdownTimerOptions) {
  const [displaySeconds, setDisplaySeconds] = useState(() => computeRemaining(seconds, isRunning, startedAt));
  const audioPlayedRef = useRef<Set<number>>(new Set());
  const completedRef = useRef(false);

  // Snap to the authoritative value immediately whenever server state changes.
  useEffect(() => {
    setDisplaySeconds(computeRemaining(seconds, isRunning, startedAt));
    audioPlayedRef.current.clear();
    completedRef.current = false;
  }, [seconds, isRunning, startedAt]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const next = computeRemaining(seconds, isRunning, startedAt);
      setDisplaySeconds(next);

      if (enableAudio && !audioPlayedRef.current.has(next)) {
        if (next === 60) {
          playChime();
          audioPlayedRef.current.add(60);
        } else if (next === 30) {
          playWarning();
          audioPlayedRef.current.add(30);
        } else if (next === 0) {
          playBuzzer();
          audioPlayedRef.current.add(0);
        }
      }

      if (next <= 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [isRunning, seconds, startedAt, enableAudio, onComplete]);

  const minutes = Math.floor(displaySeconds / 60);
  const remainingSeconds = displaySeconds % 60;
  const formatted = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  const progress = seconds > 0 ? displaySeconds / seconds : 0;

  return {
    seconds: displaySeconds,
    minutes,
    remainingSeconds,
    formatted,
    progress,
    running: isRunning,
  };
}