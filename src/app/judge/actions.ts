"use server";

import { createClient } from "@/lib/supabase/server";
import type { PatternType } from "@/lib/supabase/types";

export interface ScoreSubmitResult {
  success: boolean;
  error?: string;
}

export type JudgeName = "Made Bagia Arsana" | "Aristarkus Rawang" | "Adinda Agustina";

const JUDGE_PIN_ENV_KEY: Record<JudgeName, string> = {
  "Made Bagia Arsana": "JUDGE_PIN_MADE_BAGIA_ARSANA",
  "Aristarkus Rawang": "JUDGE_PIN_ARISTARKUS_RAWANG",
  "Adinda Agustina": "JUDGE_PIN_ADINDA_AGUSTINA",
};

export async function verifyJudgePin(judgeName: JudgeName, pin: string): Promise<boolean> {
  const expected = process.env[JUDGE_PIN_ENV_KEY[judgeName]];
  return !!expected && pin === expected;
}

export async function submitRound1Score(data: {
  competitorId: string;
  judgeName: "Made Bagia Arsana" | "Aristarkus Rawang" | "Adinda Agustina";
  assignedPattern: PatternType;
  patternAccuracy: number;
  milkFoam: number;
  contrastDefinition: number;
  symmetryPosition: number;
  techniqueControl: number;
  overallPresentation: number;
  penaltyPoints: number;
  notes?: string;
}): Promise<ScoreSubmitResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("main_day_r1_scores").upsert(
    {
      competitor_id: data.competitorId,
      judge_name: data.judgeName,
      assigned_pattern: data.assignedPattern,
      pattern_accuracy: data.patternAccuracy,
      milk_foam: data.milkFoam,
      contrast_definition: data.contrastDefinition,
      symmetry_position: data.symmetryPosition,
      technique_control: data.techniqueControl,
      overall_presentation: data.overallPresentation,
      penalty_points: data.penaltyPoints,
      notes: data.notes || null,
    },
    { onConflict: "competitor_id,judge_name" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function submitRound2Score(data: {
  competitorId: string;
  judgeName: "Made Bagia Arsana" | "Aristarkus Rawang" | "Adinda Agustina";
  designConcept?: string;
  creativityOriginality: number;
  technicalExecution: number;
  milkFoam: number;
  contrastComposition: number;
  overallAppeal: number;
  penaltyPoints: number;
  notes?: string;
}): Promise<ScoreSubmitResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("main_day_r2_scores").upsert(
    {
      competitor_id: data.competitorId,
      judge_name: data.judgeName,
      design_concept: data.designConcept || null,
      creativity_originality: data.creativityOriginality,
      technical_execution: data.technicalExecution,
      milk_foam: data.milkFoam,
      contrast_composition: data.contrastComposition,
      overall_appeal: data.overallAppeal,
      penalty_points: data.penaltyPoints,
      notes: data.notes || null,
    },
    { onConflict: "competitor_id,judge_name" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
