-- ============================================================
-- Migration 002: Screen Display Mode
-- Adds display mode enum and column to tournament_state
-- ============================================================

CREATE TYPE screen_display_mode AS ENUM (
  'idle_timer',
  'spinning_wheel',
  'mid_stage_cut',
  'podium_ceremony',
  'rules_carousel'
);

ALTER TABLE tournament_state
  ADD COLUMN screen_mode screen_display_mode DEFAULT 'idle_timer';
