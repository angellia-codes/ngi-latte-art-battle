-- ============================================================
-- Migration 006: Server-computed timer clock
-- timer_seconds now means "seconds remaining as of timer_started_at
-- (if running) or as of now (if paused/reset)". Lets Start/Pause/Reset
-- compute an authoritative remaining-time value server-side instead of
-- relying on stage clients to tick in sync with the DB.
-- ============================================================

ALTER TABLE tournament_state ADD COLUMN timer_started_at timestamptz;
