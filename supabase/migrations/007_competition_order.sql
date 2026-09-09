-- ============================================================
-- Migration 007: Competition Draw Order
-- competition_order is assigned by the stage spinning wheel when a
-- competitor is drawn. NULL means "not drawn yet" / still on the wheel.
-- ============================================================

ALTER TABLE competitors
  ADD COLUMN competition_order INT;

-- Safe inside this transaction: the new value is not used by this migration.
ALTER TYPE screen_display_mode ADD VALUE 'competitor_wheel';
