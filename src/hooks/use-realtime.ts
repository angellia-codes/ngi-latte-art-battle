"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  TournamentState,
  Competitor,
  PreselectionScore,
  MainDayR1Score,
  MainDayR2Score,
} from "@/lib/supabase/types";

// Lazy singleton — only created client-side, never during SSR/prerender
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

// ============================================================
// useTournamentState
// ============================================================

export function useTournamentState() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase
      .from("tournament_state")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setState(data as TournamentState);
        setLoading(false);
      });

    const channel = supabase
      .channel("tournament-state-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournament_state", filter: "id=eq.1" },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            setState(payload.new as TournamentState);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { state, loading };
}

// ============================================================
// useCompetitors
// ============================================================

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("competitors")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setCompetitors(data as Competitor[]);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    refresh().then(() => setLoading(false));

    const channel = supabase
      .channel("competitors-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "competitors" }, () => { refresh(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  return { competitors, loading, refresh };
}

// ============================================================
// usePreselectionScores
// ============================================================

export function usePreselectionScores() {
  const [scores, setScores] = useState<PreselectionScore[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("preselection_scores")
      .select("*")
      .order("submitted_at", { ascending: true });
    if (data) setScores(data as PreselectionScore[]);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    refresh().then(() => setLoading(false));

    const channel = supabase
      .channel("preselection-scores-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "preselection_scores" }, () => { refresh(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  return { scores, loading, refresh };
}

// ============================================================
// useR1Scores
// ============================================================

export function useR1Scores() {
  const [scores, setScores] = useState<MainDayR1Score[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("main_day_r1_scores")
      .select("*")
      .order("submitted_at", { ascending: true });
    if (data) setScores(data as MainDayR1Score[]);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    refresh().then(() => setLoading(false));

    const channel = supabase
      .channel("r1-scores-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "main_day_r1_scores" }, () => { refresh(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  return { scores, loading, refresh };
}

// ============================================================
// useR2Scores
// ============================================================

export function useR2Scores() {
  const [scores, setScores] = useState<MainDayR2Score[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("main_day_r2_scores")
      .select("*")
      .order("submitted_at", { ascending: true });
    if (data) setScores(data as MainDayR2Score[]);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    refresh().then(() => setLoading(false));

    const channel = supabase
      .channel("r2-scores-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "main_day_r2_scores" }, () => { refresh(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  return { scores, loading, refresh };
}
