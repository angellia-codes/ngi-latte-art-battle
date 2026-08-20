# Product Requirements Document (PRD) & Technical Blueprint
**Project Name:** Nourish Barista Latte Art Battle 2026 Web App[cite: 1, 2]  
**Organized By:** Nourish Group Indonesia × EXPAT Roastery[cite: 2]  
**Document Version:** 2.0 (Complete End-to-End Specification)  
**Target Platform:** Mobile-First Web Application (PWA) + Big-Screen Live Projector View  

---

## 1. Executive Summary & Event Architecture

The **Nourish Barista Latte Art Battle 2026 Web App** is an internal event management and live competition platform designed to handle barista registration, multi-day pre-selection scoring across outlet locations, live spinning-wheel pattern assignment, multi-round elimination judging, and automated podium tallying[cite: 1, 2].

### 1.1 Competition Format & Tournament Funnel
* **Pre-Selection Phase (1 Round):** Classic Tulip (100 Points Max) across 3 regional outlet sessions[cite: 1, 2].
* **Main Day Phase 1 (Top 10 Finalists):** Round 1 Random Pattern Challenge (100 Points Max) via 5-pattern spinning wheel[cite: 1, 2].
* **Main Day Cutoff:** Top 5 highest-scoring baristas advance to Round 2; positions 6–10 are eliminated.
* **Main Day Phase 2 (Top 5 Finalists):** Round 2 Free Pour (100 Points Max)[cite: 1, 2].
* **Podium Determination:** Cumulative scoring (Round 1 + Round 2 = 200 Points Max) to determine Champion, 1st Runner-Up, and 2nd Runner-Up[cite: 1, 2].

---

## 2. Event Schedule, Quotas & Assigned Personnel

### 2.1 Pre-Selection Schedule & Venues
* **Session 1 — Nourish Berawa:** Wednesday, 2 September 2026 at 5:00 PM WITA (Venue: Nourish Berawa).
* **Session 2 — Nourish Uluwatu & The Bakery Uluwatu:** Thursday, 3 September 2026 at 5:00 PM WITA (Venue: Nourish Uluwatu).
* **Session 3 — Nourish Ungasan:** Friday, 4 September 2026 at 5:00 PM WITA (Venue: Nourish Ungasan).

### 2.2 Finalist Quota Allocation (10 Finalists Total)
The app auto-ranks pre-selection results per outlet pool and flags qualifiers[cite: 1, 2]:
* **Nourish Berawa:** Top 2 baristas advance.
* **Nourish Ungasan:** Top 3 baristas advance.
* **Nourish Uluwatu & The Bakery Uluwatu (Combined Pool):** Top 5 baristas advance.

### 2.3 Official Judging Panels
* **Pre-Selection Panel (2 Judges):**
  1. Made Bagia Arsana (General Manager)
  2. Aristarkus Rawang (Bar Manager)
* **Main Day Panel (3 Judges):**
  1. Made Bagia Arsana (General Manager)
  2. Aristarkus Rawang (Bar Manager)
  3. Adinda Agustina (Coffee Trainer, PT. Expat Roasters)

---

## 3. Detailed Functional Modules

### 3.1 Registration & Competitor Intake
* **Form Fields:**
  * **Full Name:** Text input (mandatory).
  * **Position (Dropdown):** `Bar Supervisor`, `Bar Captain`, `Barista/Bartender`, `Bar Back (Daily Worker)`.
  * **Outlet (Dropdown):** `Nourish Ungasan`, `Nourish Uluwatu`, `Nourish Berawa`, `The Bakery Uluwatu`.
* **Validation & Auto-Routing:** Validates single entry per staff member, generates a competitor QR code/ID badge, and assigns them to the correct pre-selection session.

### 3.2 Pre-Selection Scoring Engine (Classic Tulip — 100 Pts Max)
Scored independently by the 2 pre-selection judges[cite: 1, 2]:

| Criteria | Weight | Max Pts | Reference Guide[cite: 1, 2] |
|---|---|---|---|
| **Milk Foam Quality**[cite: 1, 2] | 20%[cite: 1, 2] | 20[cite: 1, 2] | Silky, creamy, glossy, fine microfoam, minimal bubbles[cite: 1, 2]. |
| **Contrast & Definition**[cite: 1, 2] | 20%[cite: 1, 2] | 20[cite: 1, 2] | Clear espresso/milk contrast, crisp pattern definition[cite: 1, 2]. |
| **Tulip Structure & Symmetry**[cite: 1, 2] | 30%[cite: 1, 2] | 30[cite: 1, 2] | Layers, petal consistency, symmetry, final pull-through[cite: 1, 2]. |
| **Pouring Technique & Control**[cite: 1, 2] | 15%[cite: 1, 2] | 15[cite: 1, 2] | Pitcher height, flow rate, speed, wrist control[cite: 1, 2]. |
| **Position, Proportion & Presentation**[cite: 1, 2] | 15%[cite: 1, 2] | 15[cite: 1, 2] | Centering, cup balance, rim cleanliness, presentation[cite: 1, 2]. |
| **TOTAL**[cite: 1, 2] | **100%**[cite: 1, 2] | **100**[cite: 1, 2] | Score per judge[cite: 1, 2] |

* **Formula:** $\text{Pre-Selection Final Score} = \frac{\text{Judge 1 Total} + \text{Judge 2 Total}}{2}$
* **Automated Cut:** Automatically sets `status = 'qualified_finalist'` for top 2 (Berawa), top 3 (Ungasan), and top 5 (Uluwatu + The Bakery).

### 3.3 Main Day — Digital Spinning Wheel (Round 1)
* **Wheel Items (5 Patterns):** Rosetta, Swan, Seahorse, Phoenix, Stacked Tulip[cite: 1, 2].
* **Behavior:** Admin/Emcee spins wheel on the live stage view[cite: 2]. The locked pattern broadcasts via WebSockets to all 3 judge tablets and locks into the heat record[cite: 1, 2].

### 3.4 Main Day Scoring & Mid-Stage Cutoff Engine

#### Round 1: Random Pattern Challenge (100 Pts Max — All 10 Finalists)
* Pattern Accuracy & Structure: Max 30 pts[cite: 1, 2]
* Milk Foam Quality: Max 20 pts[cite: 1, 2]
* Contrast & Definition: Max 15 pts[cite: 1, 2]
* Symmetry, Proportion & Position: Max 15 pts[cite: 1, 2]
* Pouring Technique & Control: Max 10 pts[cite: 1, 2]
* Overall Presentation: Max 10 pts[cite: 1, 2]
* **Calculation:** $\text{R1 Final Score} = \frac{\text{Judge 1} + \text{Judge 2} + \text{Judge 3}}{3}$
* **Top 5 Cut:** Baristas ranked 1–5 advance to Round 2; baristas ranked 6–10 are locked and given `eliminated_r1` status.
* **R1 Cut Tie-Breakers:**
  1. Higher average Pattern Accuracy & Structure[cite: 1, 2].
  2. Higher average Milk Foam Quality[cite: 1, 2].
  3. Head Judge in-app toggle vote[cite: 1, 2].

#### Round 2: Free Pour (100 Pts Max — Top 5 Finalists Only)
* Creativity & Originality: Max 25 pts[cite: 1, 2]
* Technical Execution: Max 25 pts[cite: 1, 2]
* Milk Foam Quality: Max 20 pts[cite: 1, 2]
* Contrast, Definition & Composition: Max 15 pts[cite: 1, 2]
* Overall Appeal & Presentation: Max 15 pts[cite: 1, 2]
* **Calculation:** $\text{R2 Final Score} = \frac{\text{Judge 1} + \text{Judge 2} + \text{Judge 3}}{3}$

#### Final Podium Calculation (200 Pts Max)
$$\text{Cumulative Final Score} = \text{R1 Final Score} + \text{R2 Final Score} \quad (\text{Max: 200 Points}) \text{[cite: 1, 2]}$$

* **Podium Tie-Breakers:**
  1. Higher Round 1 Pattern Accuracy & Structure score[cite: 1, 2].
  2. Higher Round 2 Creativity & Originality score[cite: 1, 2].
  3. Head Judge / Panel collective vote modal[cite: 1, 2].
* **Titles Awarded:** Champion, 1st Runner-Up, 2nd Runner-Up[cite: 1, 2].

### 3.5 Competition Timer Module
* **Heat Duration:** Fixed **3:00 minutes (180 seconds)** per competitor.
* **Sync & Alarms:** Synchronized across judge tablets, emcee console, and projector display with audio chimes at 1:00 remaining, 0:30 remaining, and 0:00.
* **Penalties:** Includes toggle for Minor Penalties (1–5 pts: excessive spill, dirty cup)[cite: 2] and Major Penalties (5–10 pts: overtime, unauthorized gear)[cite: 2].

---

## 4. UI/UX & Design System Suggestions

### 4.1 Visual Identity & Palette
* **Theme:** Specialty Coffee Dark Mode (High contrast, stage-optimized, readable under bright cafe lights).
* **Colors:**
  * Background: `#121212` (Espresso Black) & `#1E1E1E` (Dark Roast Charcoal)
  * Primary Accent: `#D4A373` (Warm Latte Crema)
  * Secondary Accent: `#FAEDCD` (Silky Steamed Milk)
  * Success / Qualified: `#2A9D8F` (Earthy Sage Green)
  * Alert / Timer / Penalty: `#E76F51` (Terracotta Coral)
* **Typography:** `Inter` or `Plus Jakarta Sans` for UI data; `Syne` or `Cabinet Grotesk` for bold live stage headers.

### 4.2 Key Screen Wireframes & User Flows

#### A. Competitor Mobile Registration Screen
* Clean single-column layout with Nourish × EXPAT header[cite: 2].
* Auto-populates position and outlet dropdowns.
* Generates downloadable digital competitor pass with real-time status banner (`Pre-Selection Registered`, `Qualified for Main Day`, `Eliminated`).

#### B. Judge Scoring Interface (Tablet Landscape View)
* **Top App Bar:** Active Competitor Name, Outlet Badge, Assigned Pattern (with reference checklist icon), synchronized 3:00 timer badge.
* **Scoring Sliders & Steppers:** 
  * Large, thumb-friendly numeric controls (+ / -) with instant criteria total update.
  * Inline reference guides indicating the 5 scoring bands (`90–100 Exceptional`, `80–89 Very Good`, `70–79 Good`, `60–69 Fair`, `<60 Needs Improvement`)[cite: 1, 2].
* **Notes & Penalties:** Collapsible panel for judge comments and penalty deductions[cite: 1, 2].
* **Submission:** `Lock & Submit Score` button requiring a double-tap confirmation.

#### C. Emcee & Live Big-Screen Projector View
* **View 1 (Idle / Timer):** Giant digital 3:00 countdown clock, current barista profile, outlet banner.
* **View 2 (Spinning Wheel):** Interactive SVG/Canvas 5-segment wheel featuring custom icons for Rosetta, Swan, Seahorse, Phoenix, and Stacked Tulip[cite: 1, 2].
* **View 3 (Mid-Stage Cut Reveal):** Animated bracket transition highlighting the Top 5 advancing finalists.
* **View 4 (Podium Ceremony):** Gold, Silver, and Bronze podium cards displaying Champion, 1st Runner-Up, and 2nd Runner-Up[cite: 1, 2].

---

## 5. System Architecture & Backend Specification

### 5.1 Recommended Tech Stack
* **Frontend:** Next.js 15 (React 19), Tailwind CSS, Framer Motion (wheel & bracket animations), Lucide Icons.
* **Backend & Database:** Supabase (PostgreSQL 16) with built-in Row-Level Security (RLS) and real-time WebSocket subscriptions.
* **Audio & Haptics:** Howler.js for buzzer/timer sounds; Web Vibration API for judge tablet tap feedback.
* **Deployment:** Vercel (Edge runtime) + Supabase Managed Cloud.

### 5.2 Database Schema (PostgreSQL DDL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
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

-- Competitors Table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  position staff_position NOT NULL,
  outlet outlet_location NOT NULL,
  status competitor_status DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-Selection Scores Table
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

-- Main Day Round 1 Scores Table
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

-- Main Day Round 2 Scores Table
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

-- Competition State Engine
CREATE TABLE tournament_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_stage battle_stage DEFAULT 'preselection_berawa',
  active_competitor_id UUID REFERENCES competitors(id),
  active_pattern pattern_type,
  timer_seconds INT DEFAULT 180,
  timer_is_running BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);