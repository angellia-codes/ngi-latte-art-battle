"use server";

import { createClient } from "@/lib/supabase/server";
import type { StaffPosition, OutletLocation } from "@/lib/supabase/types";

export interface RegisterResult {
  success: boolean;
  error?: string;
  competitorId?: string;
}

export async function registerCompetitor(formData: FormData): Promise<RegisterResult> {
  const fullName = formData.get("fullName") as string;
  const position = formData.get("position") as StaffPosition;
  const outlet = formData.get("outlet") as OutletLocation;

  // Validation
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: "Full name is required (minimum 2 characters)." };
  }

  if (!position) {
    return { success: false, error: "Please select your position." };
  }

  if (!outlet) {
    return { success: false, error: "Please select your outlet." };
  }

  const consent = formData.get("consent");
  if (consent !== "true") {
    return { success: false, error: "You must agree to the competition rules." };
  }

  const supabase = await createClient();

  // Check for duplicate registration
  const { data: existing } = await supabase
    .from("competitors")
    .select("id")
    .eq("full_name", fullName.trim())
    .eq("outlet", outlet)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "A competitor with this name from this outlet is already registered." };
  }

  // Insert competitor
  const { data, error } = await supabase
    .from("competitors")
    .insert({
      full_name: fullName.trim(),
      position,
      outlet,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: `Registration failed: ${error.message}` };
  }

  return { success: true, competitorId: data.id };
}
