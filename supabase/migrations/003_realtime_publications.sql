-- ============================================================
-- Migration 003: Enable Supabase Realtime
-- Adds tables to the supabase_realtime publication
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE tournament_state;
ALTER PUBLICATION supabase_realtime ADD TABLE competitors;
ALTER PUBLICATION supabase_realtime ADD TABLE preselection_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE main_day_r1_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE main_day_r2_scores;
