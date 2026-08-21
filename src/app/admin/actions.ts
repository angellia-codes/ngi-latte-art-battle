"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  BattleStage,
  ScreenDisplayMode,
  PatternType,
  OutletLocation,
} from "@/lib/supabase/types";

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const expected = process.env.ADMIN_PIN;
  return !!expected && pin === expected;
}

// ============================================================
// 1. updateTournamentState
// ============================================================
export async function updateTournamentState(data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tournament_state")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 2–5. Simple setters
export async function setActiveCompetitor(competitorId: string) {
  return updateTournamentState({ active_competitor_id: competitorId });
}
export async function setPattern(pattern: PatternType) {
  return updateTournamentState({ active_pattern: pattern });
}
export async function setScreenMode(mode: ScreenDisplayMode) {
  return updateTournamentState({ screen_mode: mode });
}
export async function setStage(stage: BattleStage) {
  return updateTournamentState({ current_stage: stage });
}

// 6–8. Timer controls
//
// timer_seconds holds the remaining time as of timer_started_at (while
// running) or as of the last pause/reset (while stopped). This lets any
// client compute the exact remaining time from server state alone,
// instead of ticking a local copy that drifts from the DB.
export async function startTimer() {
  return updateTournamentState({ timer_is_running: true, timer_started_at: new Date().toISOString() });
}

export async function pauseTimer() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tournament_state")
    .select("timer_seconds, timer_is_running, timer_started_at")
    .eq("id", 1)
    .single();

  let remaining = data?.timer_seconds ?? 0;
  if (data?.timer_is_running && data.timer_started_at) {
    const elapsed = Math.floor((Date.now() - new Date(data.timer_started_at).getTime()) / 1000);
    remaining = Math.max(0, remaining - elapsed);
  }

  return updateTournamentState({ timer_seconds: remaining, timer_is_running: false, timer_started_at: null });
}

export async function resetTimer(seconds: number = 180) {
  return updateTournamentState({ timer_seconds: seconds, timer_is_running: false, timer_started_at: null });
}

// ============================================================
// 9. executeTop5Cut
// ============================================================
export async function executeTop5Cut() {
  const supabase = await createClient();

  const { data: competitorsRaw } = await supabase
    .from("competitors")
    .select("id, full_name, outlet")
    .eq("status", "qualified_finalist");
  const competitors = competitorsRaw as Array<{ id: string; full_name: string; outlet: string }> | null;

  const { data: scoresRaw } = await supabase.from("main_day_r1_scores").select("*");
  const scores = scoresRaw as Array<{
    competitor_id: string; total_score: number;
    pattern_accuracy: number; milk_foam: number;
  }> | null;

  if (!competitors || !scores) {
    return { success: false, error: "Failed to fetch data", rankings: [] };
  }

  const grouped: Record<string, typeof scores> = {};
  for (const s of scores) {
    if (!grouped[s.competitor_id]) grouped[s.competitor_id] = [];
    grouped[s.competitor_id].push(s);
  }

  const rankings = competitors.map((comp) => {
    const cs = grouped[comp.id] || [];
    const avg = cs.length ? cs.reduce((sum, s) => sum + Number(s.total_score), 0) / cs.length : 0;
    const patAvg = cs.length ? cs.reduce((sum, s) => sum + Number(s.pattern_accuracy), 0) / cs.length : 0;
    const foamAvg = cs.length ? cs.reduce((sum, s) => sum + Number(s.milk_foam), 0) / cs.length : 0;
    return { competitorId: comp.id, name: comp.full_name, outlet: comp.outlet, totalScoreAvg: avg, patternAccuracyAvg: patAvg, milkFoamAvg: foamAvg };
  });

  rankings.sort((a, b) => {
    if (b.totalScoreAvg !== a.totalScoreAvg) return b.totalScoreAvg - a.totalScoreAvg;
    if (b.patternAccuracyAvg !== a.patternAccuracyAvg) return b.patternAccuracyAvg - a.patternAccuracyAvg;
    return b.milkFoamAvg - a.milkFoamAvg;
  });

  const top5 = rankings.slice(0, 5).map((r) => r.competitorId);
  const elim = rankings.slice(5).map((r) => r.competitorId);

  if (top5.length > 0) await supabase.from("competitors").update({ status: "qualified_top_5" }).in("id", top5);
  if (elim.length > 0) await supabase.from("competitors").update({ status: "eliminated_r1" }).in("id", elim);

  return { success: true, rankings: rankings.map((r, i) => ({ ...r, rank: i + 1 })) };
}

// ============================================================
// 10. finalizePodium
// ============================================================
export async function finalizePodium() {
  const supabase = await createClient();

  const { data: competitorsRaw } = await supabase
    .from("competitors")
    .select("id, full_name, outlet")
    .eq("status", "qualified_top_5");
  const competitors = competitorsRaw as Array<{ id: string; full_name: string; outlet: string }> | null;

  const { data: r1Raw } = await supabase.from("main_day_r1_scores").select("*");
  const r1All = r1Raw as Array<{ competitor_id: string; total_score: number; pattern_accuracy: number }> | null;

  const { data: r2Raw } = await supabase.from("main_day_r2_scores").select("*");
  const r2All = r2Raw as Array<{ competitor_id: string; total_score: number; creativity_originality: number }> | null;

  if (!competitors) return { success: false, error: "No qualified competitors", podium: [] };

  const rankings = competitors.map((comp) => {
    const r1 = (r1All || []).filter((s) => s.competitor_id === comp.id);
    const r2 = (r2All || []).filter((s) => s.competitor_id === comp.id);
    const r1Avg = r1.length ? r1.reduce((sum, s) => sum + Number(s.total_score), 0) / r1.length : 0;
    const r2Avg = r2.length ? r2.reduce((sum, s) => sum + Number(s.total_score), 0) / r2.length : 0;
    const r1Pat = r1.length ? r1.reduce((sum, s) => sum + Number(s.pattern_accuracy), 0) / r1.length : 0;
    const r2Cre = r2.length ? r2.reduce((sum, s) => sum + Number(s.creativity_originality), 0) / r2.length : 0;
    return { competitorId: comp.id, name: comp.full_name, outlet: comp.outlet, r1Score: r1Avg, r2Score: r2Avg, cumulative: Math.min(r1Avg + r2Avg, 200), r1PatternAvg: r1Pat, r2CreativityAvg: r2Cre };
  });

  rankings.sort((a, b) => {
    if (b.cumulative !== a.cumulative) return b.cumulative - a.cumulative;
    if (b.r1PatternAvg !== a.r1PatternAvg) return b.r1PatternAvg - a.r1PatternAvg;
    return b.r2CreativityAvg - a.r2CreativityAvg;
  });

  const top3 = rankings.slice(0, 3).map((r) => r.competitorId);
  if (top3.length > 0) await supabase.from("competitors").update({ status: "completed_tournament" }).in("id", top3);

  return { success: true, podium: rankings.map((r, i) => ({ ...r, rank: i + 1 })) };
}

// ============================================================
// 11. qualifyPreselectionFinalists
// ============================================================
export async function qualifyPreselectionFinalists() {
  const supabase = await createClient();

  const { data: competitorsRaw } = await supabase
    .from("competitors")
    .select("id, full_name, outlet, status")
    .in("status", ["registered", "preselection_completed"]);
  const competitors = competitorsRaw as Array<{ id: string; full_name: string; outlet: string; status: string }> | null;

  const { data: scoresRaw } = await supabase.from("preselection_scores").select("competitor_id, total_score");
  const scores = scoresRaw as Array<{ competitor_id: string; total_score: number }> | null;

  if (!competitors || !scores) return { success: false, error: "No data found", qualified: [] as string[], eliminated: [] as string[] };

  const scoreMap = new Map<string, number[]>();
  for (const s of scores) {
    const arr = scoreMap.get(s.competitor_id) || [];
    arr.push(Number(s.total_score));
    scoreMap.set(s.competitor_id, arr);
  }
  const averages = new Map<string, number>();
  for (const [id, vals] of scoreMap) {
    averages.set(id, vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  const pools: { outlets: OutletLocation[]; quota: number }[] = [
    { outlets: ["Nourish Berawa"], quota: 2 },
    { outlets: ["Nourish Ungasan"], quota: 3 },
    { outlets: ["Nourish Uluwatu", "The Bakery Uluwatu"], quota: 5 },
  ];

  const qualifiedIds: string[] = [];
  const eliminatedIds: string[] = [];

  for (const pool of pools) {
    const pc = competitors
      .filter((c) => pool.outlets.includes(c.outlet as OutletLocation))
      .map((c) => ({ id: c.id, avg: averages.get(c.id) || 0 }))
      .sort((a, b) => b.avg - a.avg);
    for (let i = 0; i < pc.length; i++) {
      (i < pool.quota ? qualifiedIds : eliminatedIds).push(pc[i].id);
    }
  }

  if (qualifiedIds.length > 0) await supabase.from("competitors").update({ status: "qualified_finalist" }).in("id", qualifiedIds);
  if (eliminatedIds.length > 0) await supabase.from("competitors").update({ status: "eliminated_preselection" }).in("id", eliminatedIds);

  return { success: true, qualified: qualifiedIds, eliminated: eliminatedIds };
}

// ============================================================
// 12. headJudgeVote
// ============================================================
export async function headJudgeVote(winnerId: string, loserId: string) {
  const supabase = await createClient();
  const { data: winner } = await supabase.from("competitors").select("status").eq("id", winnerId).single();
  const loserStatus = (winner as { status: string } | null)?.status === "qualified_top_5" ? "eliminated_r1" : "completed_tournament";
  const { error } = await supabase.from("competitors").update({ status: loserStatus }).eq("id", loserId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}