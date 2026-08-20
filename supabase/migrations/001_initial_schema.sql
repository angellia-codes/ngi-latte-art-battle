-- ============================================================
-- Nourish Barista Latte Art Battle 2026
-- Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM Types
-- ============================================================

CREATE TYPE staff_position AS ENUM (
  'Bar Supervisor',
  'Bar Captain',
  'Barista/Bartender',
  'Bar Back (Daily Worker)'
);

CREATE TYPE outlet_location AS ENUM (
  'Nourish Ungasan',
  'Nourish Uluwatu',
  'Nourish Berawa',
  'The Bakery Uluwatu'
);

CREATE TYPE competitor_status AS ENUM (
  'registered',
  'preselection_completed',
  'qualified_finalist',
  'eliminated_preselection',
  'qualified_top_5',
  'eliminated_r1',
  'completed_tournament',
  'disqualified'
);

CREATE TYPE pattern_type AS ENUM (
  'Rosetta',
  'Swan',
  'Seahorse',
  'Phoenix',
  'Stacked Tulip'
);

CREATE TYPE battle_stage AS ENUM (
  'preselection_berawa',
  'preselection_uluwatu',
  'preselection_ungasan',
  'main_day_r1_top10',
  'main_day_r2_top5',
  'completed'
);

-- ============================================================
-- Competitors Table
-- ============================================================

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  position staff_position NOT NULL,
  outlet outlet_location NOT NULL,
  status competitor_status DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Pre-Selection Scores Table
-- Classic Tulip: 100 Points Max, 2 Judges
-- ============================================================

CREATE TABLE preselection_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  judge_name VARCHAR(50) NOT NULL CHECK (judge_name IN ('Made Bagia Arsana', 'Aristarkus Rawang')),
  milk_foam NUMERIC(4,2) CHECK (milk_foam BETWEEN 0 AND 20),
  contrast_definition NUMERIC(4,2) CHECK (contrast_definition BETWEEN 0 AND 20),
  tulip_structure NUMERIC(4,2) CHECK (tulip_structure BETWEEN 0 AND 30),
  technique_control NUMERIC(4,2) CHECK (technique_control BETWEEN 0 AND 15),
  position_presentation NUMERIC(4,2) CHECK (position_presentation BETWEEN 0 AND 15),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (
    milk_foam + contrast_definition + tulip_structure + technique_control + position_presentation
  ) STORED,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, judge_name)
);

-- ============================================================
-- Main Day Round 1 Scores Table
-- Random Pattern Challenge: 100 Points Max, 3 Judges
-- ============================================================

CREATE TABLE main_day_r1_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  judge_name VARCHAR(50) NOT NULL CHECK (judge_name IN ('Made Bagia Arsana', 'Aristarkus Rawang', 'Adinda Agustina')),
  assigned_pattern pattern_type NOT NULL,
  pattern_accuracy NUMERIC(4,2) CHECK (pattern_accuracy BETWEEN 0 AND 30),
  milk_foam NUMERIC(4,2) CHECK (milk_foam BETWEEN 0 AND 20),
  contrast_definition NUMERIC(4,2) CHECK (contrast_definition BETWEEN 0 AND 15),
  symmetry_position NUMERIC(4,2) CHECK (symmetry_position BETWEEN 0 AND 15),
  technique_control NUMERIC(4,2) CHECK (technique_control BETWEEN 0 AND 10),
  overall_presentation NUMERIC(4,2) CHECK (overall_presentation BETWEEN 0 AND 10),
  penalty_points NUMERIC(4,2) DEFAULT 0 CHECK (penalty_points BETWEEN 0 AND 10),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (
    (pattern_accuracy + milk_foam + contrast_definition + symmetry_position + technique_control + overall_presentation) - penalty_points
  ) STORED,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, judge_name)
);

-- ============================================================
-- Main Day Round 2 Scores Table
-- Free Pour: 100 Points Max, 3 Judges
-- ============================================================

CREATE TABLE main_day_r2_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  judge_name VARCHAR(50) NOT NULL CHECK (judge_name IN ('Made Bagia Arsana', 'Aristarkus Rawang', 'Adinda Agustina')),
  design_concept VARCHAR(100),
  creativity_originality NUMERIC(4,2) CHECK (creativity_originality BETWEEN 0 AND 25),
  technical_execution NUMERIC(4,2) CHECK (technical_execution BETWEEN 0 AND 25),
  milk_foam NUMERIC(4,2) CHECK (milk_foam BETWEEN 0 AND 20),
  contrast_composition NUMERIC(4,2) CHECK (contrast_composition BETWEEN 0 AND 15),
  overall_appeal NUMERIC(4,2) CHECK (overall_appeal BETWEEN 0 AND 15),
  penalty_points NUMERIC(4,2) DEFAULT 0 CHECK (penalty_points BETWEEN 0 AND 10),
  total_score NUMERIC(5,2) GENERATED ALWAYS AS (
    (creativity_originality + technical_execution + milk_foam + contrast_composition + overall_appeal) - penalty_points
  ) STORED,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, judge_name)
);

-- ============================================================
-- Competition State Engine (Singleton Row)
-- ============================================================

CREATE TABLE tournament_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_stage battle_stage DEFAULT 'preselection_berawa',
  active_competitor_id UUID REFERENCES competitors(id),
  active_pattern pattern_type,
  timer_seconds INT DEFAULT 180,
  timer_is_running BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
