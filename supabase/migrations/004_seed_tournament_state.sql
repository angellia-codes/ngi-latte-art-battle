-- ============================================================
-- Migration 004: Seed Tournament State
-- Insert the singleton row with defaults
-- ============================================================

INSERT INTO tournament_state (id, current_stage, timer_seconds, timer_is_running, screen_mode)
VALUES (1, 'preselection_berawa', 180, FALSE, 'idle_timer')
ON CONFLICT (id) DO NOTHING;
