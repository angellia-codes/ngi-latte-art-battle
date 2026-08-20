"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  initialSeconds?: number;
  isRunning?: boolean;
  onTick?: (seconds: number) => void;
  onComplete?: () => void;
  enableAudio?: boolean;
}

export function useCountdownTimer({
  initialSeconds = 180,
  isRunning = false,
  onTick,
  onComplete,
  enableAudio = true,
}: UseCountdownTimerOptions = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(isRunning);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayedRef = useRef<Set<number>>(new Set());

  // Sync with external state
  useEffect(() => {
    setSeconds(initialSeconds);
    audioPlayedRef.current.clear();
  }, [initialSeconds]);

  useEffect(() => {
    setRunning(isRunning);
  }, [isRunning]);

  // Core countdown
  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev - 1;

          // Audio alerts
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

          onTick?.(next);

          if (next <= 0) {
            onComplete?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running, seconds > 0, enableAudio, onTick, onComplete]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(
    (newSeconds?: number) => {
      setRunning(false);
      setSeconds(newSeconds ?? initialSeconds);
      audioPlayedRef.current.clear();
    },
    [initialSeconds]
  );

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formatted = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  const progress = seconds / initialSeconds; // 1.0 → 0.0

  return {
    seconds,
    minutes,
    remainingSeconds,
    formatted,
    progress,
    running,
    start,
    pause,
    reset,
  };
}
