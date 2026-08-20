"use server";

import { createClient } from "@/lib/supabase/server";
import type { OutletLocation } from "@/lib/supabase/types";

export interface ScoreSubmitResult {
  success: boolean;
  error?: string;
}

export async function submitPreselectionScore(data: {
  competitorId: string;
  judgeName: "Made Bagia Arsana" | "Aristarkus Rawang";
  milkFoam: number;
  contrastDefinition: number;
  tulipStructure: number;
  techniqueControl: number;
  positionPresentation: number;
  notes?: string;
}): Promise<ScoreSubmitResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("preselection_scores").upsert(
    {
      competitor_id: data.competitorId,
      judge_name: data.judgeName,
      milk_foam: data.milkFoam,
      contrast_definition: data.contrastDefinition,
      tulip_structure: data.tulipStructure,
      technique_control: data.techniqueControl,
      position_presentation: data.positionPresentation,
      notes: data.notes || null,
    },
    { onConflict: "competitor_id,judge_name" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  // Update competitor status
  await supabase
    .from("competitors")
    .update({ status: "preselection_completed" })
    .eq("id", data.competitorId);

  return { success: true };
}

interface QualificationResult {
  success: boolean;
  qualified: string[];
  eliminated: string[];
  error?: string;
}

export async function qualifyFinalists(): Promise<QualificationResult> {
  const supabase = await createClient();

  // Get all preselection scores with competitor info
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, full_name, outlet, status")
    .in("status", ["registered", "preselection_completed"]);

  if (!competitors || competitors.length === 0) {
    return { success: false, qualified: [], eliminated: [], error: "No competitors found." };
  }

  const { data: scores } = await supabase
    .from("preselection_scores")
    .select("competitor_id, total_score");

  if (!scores) {
    return { success: false, qualified: [], eliminated: [], error: "No scores found." };
  }

  // Calculate average scores per competitor
  const scoreMap = new Map<string, number[]>();
  for (const score of scores) {
    const existing = scoreMap.get(score.competitor_id) || [];
    existing.push(Number(score.total_score));
    scoreMap.set(score.competitor_id, existing);
  }

  const averages = new Map<string, number>();
  for (const [competitorId, judgeScores] of scoreMap) {
    const avg = judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;
    averages.set(competitorId, avg);
  }

  // Define quota per outlet pool
  const quotas: Record<string, { outlets: OutletLocation[]; quota: number }> = {
    berawa: { outlets: ["Nourish Berawa"], quota: 2 },
    ungasan: { outlets: ["Nourish Ungasan"], quota: 3 },
    uluwatu: { outlets: ["Nourish Uluwatu", "The Bakery Uluwatu"], quota: 5 },
  };

  const qualifiedIds: string[] = [];
  const eliminatedIds: string[] = [];

  for (const pool of Object.values(quotas)) {
    // Get competitors in this pool
    const poolCompetitors = competitors
      .filter((c) => pool.outlets.includes(c.outlet as OutletLocation))
      .map((c) => ({
        id: c.id,
        avgScore: averages.get(c.id) || 0,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    for (let i = 0; i < poolCompetitors.length; i++) {
      if (i < pool.quota) {
        qualifiedIds.push(poolCompetitors[i].id);
      } else {
        eliminatedIds.push(poolCompetitors[i].id);
      }
    }
  }

  // Update statuses
  if (qualifiedIds.length > 0) {
    await supabase
      .from("competitors")
      .update({ status: "qualified_finalist" })
      .in("id", qualifiedIds);
  }

  if (eliminatedIds.length > 0) {
    await supabase
      .from("competitors")
      .update({ status: "eliminated_preselection" })
      .in("id", eliminatedIds);
  }

  return { success: true, qualified: qualifiedIds, eliminated: eliminatedIds };
}
