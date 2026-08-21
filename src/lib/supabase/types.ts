// ============================================================
// Supabase Database Types
// Auto-generated from PRD schema — Nourish Barista Latte Art Battle 2026
// ============================================================

export type StaffPosition =
  | "Bar Supervisor"
  | "Bar Captain"
  | "Barista/Bartender"
  | "Bar Back (Daily Worker)";

export type OutletLocation =
  | "Nourish Ungasan"
  | "Nourish Uluwatu"
  | "Nourish Berawa"
  | "The Bakery Uluwatu";

export type CompetitorStatus =
  | "registered"
  | "preselection_completed"
  | "qualified_finalist"
  | "eliminated_preselection"
  | "qualified_top_5"
  | "eliminated_r1"
  | "completed_tournament"
  | "disqualified";

export type PatternType =
  | "Rosetta"
  | "Swan"
  | "Seahorse"
  | "Phoenix"
  | "Stacked Tulip";

export type BattleStage =
  | "preselection_berawa"
  | "preselection_uluwatu"
  | "preselection_ungasan"
  | "main_day_r1_top10"
  | "main_day_r2_top5"
  | "completed";

export type ScreenDisplayMode =
  | "idle_timer"
  | "spinning_wheel"
  | "mid_stage_cut"
  | "podium_ceremony"
  | "rules_carousel";

// ============================================================
// Table Row Types
// ============================================================

export interface Competitor {
  id: string;
  full_name: string;
  position: StaffPosition;
  outlet: OutletLocation;
  status: CompetitorStatus;
  created_at: string;
}

export interface PreselectionScore {
  id: string;
  competitor_id: string;
  judge_name: "Made Bagia Arsana" | "Aristarkus Rawang";
  milk_foam: number;
  contrast_definition: number;
  tulip_structure: number;
  technique_control: number;
  position_presentation: number;
  total_score: number; // GENERATED column
  notes: string | null;
  submitted_at: string;
}

export interface MainDayR1Score {
  id: string;
  competitor_id: string;
  judge_name: "Made Bagia Arsana" | "Aristarkus Rawang" | "Adinda Agustina";
  assigned_pattern: PatternType;
  pattern_accuracy: number;
  milk_foam: number;
  contrast_definition: number;
  symmetry_position: number;
  technique_control: number;
  overall_presentation: number;
  penalty_points: number;
  total_score: number; // GENERATED column
  notes: string | null;
  submitted_at: string;
}

export interface MainDayR2Score {
  id: string;
  competitor_id: string;
  judge_name: "Made Bagia Arsana" | "Aristarkus Rawang" | "Adinda Agustina";
  design_concept: string | null;
  creativity_originality: number;
  technical_execution: number;
  milk_foam: number;
  contrast_composition: number;
  overall_appeal: number;
  penalty_points: number;
  total_score: number; // GENERATED column
  notes: string | null;
  submitted_at: string;
}

export interface TournamentState {
  id: number;
  current_stage: BattleStage;
  active_competitor_id: string | null;
  active_pattern: PatternType | null;
  timer_seconds: number;
  timer_is_running: boolean;
  timer_started_at: string | null;
  screen_mode: ScreenDisplayMode;
  updated_at: string;
}

// ============================================================
// Database type for Supabase client
// ============================================================

export interface Database {
  public: {
    Tables: {
      competitors: {
        Row: Competitor;
        Insert: Omit<Competitor, "id" | "created_at" | "status"> & {
          id?: string;
          status?: CompetitorStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Competitor, "id">>;
      };
      preselection_scores: {
        Row: PreselectionScore;
        Insert: Omit<PreselectionScore, "id" | "total_score" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<PreselectionScore, "id" | "total_score">>;
      };
      main_day_r1_scores: {
        Row: MainDayR1Score;
        Insert: Omit<MainDayR1Score, "id" | "total_score" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<MainDayR1Score, "id" | "total_score">>;
      };
      main_day_r2_scores: {
        Row: MainDayR2Score;
        Insert: Omit<MainDayR2Score, "id" | "total_score" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<MainDayR2Score, "id" | "total_score">>;
      };
      tournament_state: {
        Row: TournamentState;
        Insert: Partial<TournamentState>;
        Update: Partial<Omit<TournamentState, "id">>;
      };
    };
    Enums: {
      staff_position: StaffPosition;
      outlet_location: OutletLocation;
      competitor_status: CompetitorStatus;
      pattern_type: PatternType;
      battle_stage: BattleStage;
      screen_display_mode: ScreenDisplayMode;
    };
  };
}
