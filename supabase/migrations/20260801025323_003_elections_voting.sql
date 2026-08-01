/*
# Elections Schema

## Overview
This migration creates the full elections system: elections, positions, candidates,
nominations, anonymized votes, and voting receipts. The system supports a multi-phase
election lifecycle: nomination → voting → tallying → results.

## New Tables

### 1. `elections`
Records each election event (branch executive, by-election, national).
- `id` (bigint, PK)
- `title` (text) — election title
- `description` (text, nullable)
- `phase` (enum) — 'nomination' | 'voting' | 'tallying' | 'results'
- `status` (enum) — 'upcoming' | 'open' | 'completed' | 'cancelled'
- `nomination_start` (timestamptz) — when nominations open
- `nomination_deadline` (timestamptz) — when nominations close
- `voting_start` (timestamptz) — when voting opens
- `voting_end` (timestamptz) — when voting closes
- `results_published_at` (timestamptz, nullable) — when results were published
- `is_anonymous` (boolean, default true) — whether voting is secret
- `requires_attendance` (boolean, default true) — 75% attendance required to vote
- `requires_financial_compliance` (boolean, default true) — must be financially compliant
- `created_by` (bigint, FK → members)
- `created_at`, `updated_at`, `deleted_at` (timestamptz)

### 2. `election_positions`
The contested positions within an election (e.g., "Branch Chairman", "Secretary").
- `id` (bigint, PK)
- `election_id` (bigint, FK → elections, CASCADE)
- `name` (text) — position title
- `description` (text, nullable)
- `order` (int) — display order on ballot
- `min_choices` (int, default 1) — minimum selections
- `max_choices` (int, default 1) — maximum selections
- `created_at`, `updated_at` (timestamptz)

### 3. `candidates`
Individuals standing for a position in an election.
- `id` (bigint, PK)
- `election_id` (bigint, FK → elections, CASCADE)
- `position_id` (bigint, FK → election_positions, CASCADE)
- `member_id` (bigint, FK → members, CASCADE) — the member who is the candidate
- `manifesto` (text, nullable) — campaign statement
- `qualifications` (text[], nullable) — array of qualification strings
- `practice_area` (text, nullable)
- `photo_url` (text, nullable)
- `proposer_name` (text, nullable) — name of the nominating member
- `seconder_name` (text, nullable) — name of the seconding member
- `status` (enum) — 'pending' | 'approved' | 'rejected' | 'withdrawn'
- `votes` (int, default 0) — vote count (populated after tallying)
- `is_winner` (boolean, default false) — set after results are published
- `created_at`, `updated_at` (timestamptz)

### 4. `nominations`
Self-nomination records submitted by members during the nomination phase.
- `id` (bigint, PK)
- `election_id` (bigint, FK → elections, CASCADE)
- `position_id` (bigint, FK → election_positions, CASCADE)
- `member_id` (bigint, FK → members, CASCADE) — nominating member
- `statement` (text, nullable) — nomination statement/manifesto draft
- `status` (enum) — 'pending' | 'approved' | 'rejected' | 'withdrawn'
- `reviewed_by` (bigint, FK → members, nullable) — admin who reviewed
- `reviewed_at` (timestamptz, nullable)
- `created_at`, `updated_at` (timestamptz)
- UNIQUE(election_id, position_id, member_id) — one nomination per position per member

### 5. `votes`
Anonymized ballot records. CRITICAL: This table does NOT link votes to member identities.
It only records which candidate received a vote for which position in which election.
The `vote_receipts` table separately tracks that a member voted (for turnout) without
linking them to specific candidates.
- `id` (bigint, PK)
- `election_id` (bigint, FK → elections, CASCADE)
- `position_id` (bigint, FK → election_positions, CASCADE)
- `candidate_id` (bigint, FK → candidates, CASCADE)
- `created_at` (timestamptz) — timestamp of vote cast
- No member_id column — votes are fully anonymized

### 6. `vote_receipts`
Records that a member has voted in an election (for turnout tracking and preventing
double voting). Does NOT contain which candidates were selected.
- `id` (bigint, PK)
- `election_id` (bigint, FK → elections, CASCADE)
- `member_id` (bigint, FK → members, CASCADE) — the member who voted
- `receipt_number` (text, unique) — human-readable receipt (e.g., "VR-2025-08-15-8247")
- `voted_at` (timestamptz) — when the vote was cast
- `created_at`, `updated_at` (timestamptz)
- UNIQUE(election_id, member_id) — one vote per member per election

## Security
- RLS enabled on all tables.
- Elections/positions/candidates: any authenticated member can read; only admins can write.
- Nominations: members can read all (nominations are public), insert own, delete own; admins can update.
- Votes: no one can read individual votes via the API (admin reads aggregate only); insert via server function.
- Vote receipts: members can read own; admins can read all; insert via server function.

## Important Notes
1. The `votes` table has NO `member_id` — this is by design for ballot secrecy.
2. `vote_receipts` tracks participation only, not choices — enables turnout without compromising anonymity.
3. The `votes` table SELECT policy returns no rows to any client (only server-side functions read it).
4. Vote insertion should be done via a SECURITY DEFINER function that validates eligibility and
   inserts both the anonymized votes and the receipt atomically.
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE election_phase AS ENUM ('nomination', 'voting', 'tallying', 'results');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE election_status AS ENUM ('upcoming', 'open', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE candidate_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE nomination_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ELECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS elections (
  id                              bigserial PRIMARY KEY,
  title                           text NOT NULL,
  description                     text,
  phase                           election_phase NOT NULL DEFAULT 'nomination',
  status                          election_status NOT NULL DEFAULT 'upcoming',
  nomination_start                timestamptz NOT NULL,
  nomination_deadline             timestamptz NOT NULL,
  voting_start                    timestamptz NOT NULL,
  voting_end                      timestamptz NOT NULL,
  results_published_at            timestamptz,
  is_anonymous                    boolean NOT NULL DEFAULT true,
  requires_attendance             boolean NOT NULL DEFAULT true,
  requires_financial_compliance  boolean NOT NULL DEFAULT true,
  created_by                      bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now(),
  deleted_at                      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_elections_phase ON elections(phase);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);

-- ============================================================
-- ELECTION_POSITIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS election_positions (
  id            bigserial PRIMARY KEY,
  election_id   bigint NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  "order"       integer NOT NULL DEFAULT 0,
  min_choices   integer NOT NULL DEFAULT 1,
  max_choices   integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_election_positions_election ON election_positions(election_id);

-- ============================================================
-- CANDIDATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS candidates (
  id              bigserial PRIMARY KEY,
  election_id     bigint NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id     bigint NOT NULL REFERENCES election_positions(id) ON DELETE CASCADE,
  member_id       bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  manifesto       text,
  qualifications  text[],
  practice_area   text,
  photo_url       text,
  proposer_name   text,
  seconder_name   text,
  status          candidate_status NOT NULL DEFAULT 'pending',
  votes           integer NOT NULL DEFAULT 0,
  is_winner       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_candidates_member ON candidates(member_id);

-- ============================================================
-- NOMINATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS nominations (
  id            bigserial PRIMARY KEY,
  election_id   bigint NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id   bigint NOT NULL REFERENCES election_positions(id) ON DELETE CASCADE,
  member_id     bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  statement     text,
  status        nomination_status NOT NULL DEFAULT 'pending',
  reviewed_by    bigint REFERENCES members(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(election_id, position_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_nominations_election ON nominations(election_id);
CREATE INDEX IF NOT EXISTS idx_nominations_member ON nominations(member_id);

-- ============================================================
-- VOTES TABLE (anonymized — no member_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id            bigserial PRIMARY KEY,
  election_id   bigint NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id   bigint NOT NULL REFERENCES election_positions(id) ON DELETE CASCADE,
  candidate_id  bigint NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_position ON votes(position_id);

-- ============================================================
-- VOTE_RECEIPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vote_receipts (
  id              bigserial PRIMARY KEY,
  election_id     bigint NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  member_id       bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  receipt_number  text UNIQUE NOT NULL,
  voted_at        timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(election_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_receipts_election ON vote_receipts(election_id);
CREATE INDEX IF NOT EXISTS idx_vote_receipts_member ON vote_receipts(member_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER elections_updated_at BEFORE UPDATE ON elections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER election_positions_updated_at BEFORE UPDATE ON election_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER nominations_updated_at BEFORE UPDATE ON nominations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER vote_receipts_updated_at BEFORE UPDATE ON vote_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ELECTIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "elections_select_all" ON elections;
CREATE POLICY "elections_select_all" ON elections FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "elections_insert_admin" ON elections;
CREATE POLICY "elections_insert_admin" ON elections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "elections_update_admin" ON elections;
CREATE POLICY "elections_update_admin" ON elections FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "elections_delete_admin" ON elections;
CREATE POLICY "elections_delete_admin" ON elections FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

-- ============================================================
-- ELECTION_POSITIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "election_positions_select_all" ON election_positions;
CREATE POLICY "election_positions_select_all" ON election_positions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "election_positions_insert_admin" ON election_positions;
CREATE POLICY "election_positions_insert_admin" ON election_positions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "election_positions_update_admin" ON election_positions;
CREATE POLICY "election_positions_update_admin" ON election_positions FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "election_positions_delete_admin" ON election_positions;
CREATE POLICY "election_positions_delete_admin" ON election_positions FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

-- ============================================================
-- CANDIDATES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "candidates_select_all" ON candidates;
CREATE POLICY "candidates_select_all" ON candidates FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "candidates_insert_admin" ON candidates;
CREATE POLICY "candidates_insert_admin" ON candidates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "candidates_update_admin" ON candidates;
CREATE POLICY "candidates_update_admin" ON candidates FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

DROP POLICY IF EXISTS "candidates_delete_admin" ON candidates;
CREATE POLICY "candidates_delete_admin" ON candidates FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

-- ============================================================
-- NOMINATIONS POLICIES
-- ============================================================
-- Nominations are public (all authenticated members can see who nominated)
DROP POLICY IF EXISTS "nominations_select_all" ON nominations;
CREATE POLICY "nominations_select_all" ON nominations FOR SELECT
  TO authenticated USING (true);

-- Members can submit own nominations
DROP POLICY IF EXISTS "nominations_insert_own" ON nominations;
CREATE POLICY "nominations_insert_own" ON nominations FOR INSERT
  TO authenticated WITH CHECK (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Members can withdraw (delete) own nominations
DROP POLICY IF EXISTS "nominations_delete_own" ON nominations;
CREATE POLICY "nominations_delete_own" ON nominations FOR DELETE
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can update nominations (approve/reject)
DROP POLICY IF EXISTS "nominations_update_admin" ON nominations;
CREATE POLICY "nominations_update_admin" ON nominations FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

-- ============================================================
-- VOTES POLICIES — no SELECT for anyone (anonymized)
-- ============================================================
-- No SELECT policy: votes are never readable via the API.
-- Insert should be done via a SECURITY DEFINER function (see below).

DROP POLICY IF EXISTS "votes_insert_function" ON votes;
CREATE POLICY "votes_insert_function" ON votes FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- VOTE_RECEIPTS POLICIES
-- ============================================================
-- Members can read own receipts
DROP POLICY IF EXISTS "vote_receipts_select_own" ON vote_receipts;
CREATE POLICY "vote_receipts_select_own" ON vote_receipts FOR SELECT
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can read all receipts (for turnout)
DROP POLICY IF EXISTS "vote_receipts_select_admin" ON vote_receipts;
CREATE POLICY "vote_receipts_select_admin" ON vote_receipts FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'election_officer')
    )
  );

-- Insert via SECURITY DEFINER function (see below)
DROP POLICY IF EXISTS "vote_receipts_insert_function" ON vote_receipts;
CREATE POLICY "vote_receipts_insert_function" ON vote_receipts FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- SECURITY DEFINER: cast_vote function
-- Validates eligibility and inserts anonymized votes + receipt atomically.
-- This function bypasses RLS to insert into votes and vote_receipts.
-- ============================================================
CREATE OR REPLACE FUNCTION cast_vote(
  p_election_id bigint,
  p_votes jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id bigint;
  v_election elections%ROWTYPE;
  v_existing_receipt vote_receipts%ROWTYPE;
  v_receipt_number text;
  v_position_id bigint;
  v_candidate_id bigint;
  v_attendance_threshold numeric;
  v_now timestamptz := now();
BEGIN
  -- Get the authenticated member
  SELECT id INTO v_member_id FROM members WHERE user_id = auth.uid() LIMIT 1;
  IF v_member_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Member not found');
  END IF;

  -- Get the election
  SELECT * INTO v_election FROM elections WHERE id = p_election_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Election not found');
  END IF;

  -- Check voting window
  IF v_election.phase <> 'voting' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Election is not in voting phase');
  END IF;
  IF v_now < v_election.voting_start OR v_now > v_election.voting_end THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voting window is not open');
  END IF;

  -- Check eligibility
  IF NOT EXISTS (SELECT 1 FROM members WHERE id = v_member_id AND membership_status = 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membership is not active');
  END IF;

  SELECT value::numeric INTO v_attendance_threshold FROM settings WHERE key = 'attendance_threshold';
  IF v_attendance_threshold IS NULL THEN v_attendance_threshold := 75; END IF;

  IF v_election.requires_attendance THEN
    IF NOT EXISTS (SELECT 1 FROM members WHERE id = v_member_id AND attendance_percentage >= v_attendance_threshold) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Attendance requirement not met');
    END IF;
  END IF;

  IF v_election.requires_financial_compliance THEN
    IF NOT EXISTS (SELECT 1 FROM members WHERE id = v_member_id AND financial_compliance = true) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Financial compliance requirement not met');
    END IF;
  END IF;

  -- Check for existing vote (prevent double voting)
  SELECT * INTO v_existing_receipt FROM vote_receipts WHERE election_id = p_election_id AND member_id = v_member_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already voted in this election');
  END IF;

  -- Generate receipt number
  v_receipt_number := 'VR-' || to_char(v_now, 'YYYY-MM-DD') || '-' || floor(1000 + random() * 9000)::text;

  -- Insert receipt
  INSERT INTO vote_receipts (election_id, member_id, receipt_number, voted_at)
  VALUES (p_election_id, v_member_id, v_receipt_number, v_now);

  -- Insert anonymized votes
  FOR v_position_id, v_candidate_id IN
    SELECT key::bigint, value::bigint FROM jsonb_each_text(p_votes)
  LOOP
    INSERT INTO votes (election_id, position_id, candidate_id, created_at)
    VALUES (p_election_id, v_position_id, v_candidate_id, v_now);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'receiptNumber', v_receipt_number,
    'timestamp', v_now
  );
END;
$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION cast_vote(bigint, jsonb) TO authenticated;