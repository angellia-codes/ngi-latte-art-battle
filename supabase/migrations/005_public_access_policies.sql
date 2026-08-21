-- ============================================================
-- Migration 005: Public access policies
-- App has no Supabase Auth — access is gated by PIN checks in
-- server actions (register/judge/admin), all using the anon key.
-- Grant anon/authenticated full CRUD to match that trust model.
-- ============================================================

CREATE POLICY "public full access" ON competitors
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public full access" ON preselection_scores
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public full access" ON main_day_r1_scores
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public full access" ON main_day_r2_scores
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public full access" ON tournament_state
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
