/*
# Meetings & Attendance Schema

## Overview
This migration creates the meetings and attendance tracking tables for the NBA Bwari branch.
Members attend meetings via QR code, fingerprint (biometric), or PIN.

## New Tables

### 1. `meetings`
Records all branch meetings (general, emergency, CLE seminars, AGMs).
- `id` (bigint, PK)
- `title` (text) — meeting title
- `description` (text, nullable) — meeting agenda/details
- `meeting_date` (timestamptz) — scheduled date and time
- `venue` (text) — meeting location
- `status` (enum) — 'upcoming' | 'open' | 'completed' | 'cancelled'
- `attendance_open` (boolean) — whether attendance marking is currently active
- `attendance_opened_at` (timestamptz, nullable)
- `attendance_closed_at` (timestamptz, nullable)
- `created_by` (bigint, FK → members) — admin who created the meeting
- `created_at`, `updated_at`, `deleted_at` (timestamptz)

### 2. `attendance`
Records individual member attendance for each meeting.
- `id` (bigint, PK)
- `meeting_id` (bigint, FK → meetings, CASCADE)
- `member_id` (bigint, FK → members, CASCADE)
- `method` (enum) — 'qr' | 'fingerprint' | 'pin' | 'manual'
- `marked_at` (timestamptz) — when attendance was recorded
- `marked_by` (bigint, FK → members, nullable) — admin who manually marked (null for self-marked)
- `created_at`, `updated_at` (timestamptz)
- UNIQUE constraint on (meeting_id, member_id) — one attendance record per member per meeting

## Security
- RLS enabled on both tables.
- Meetings: any authenticated member can read; only admins can create/update/delete.
- Attendance: members can read own records; admins can read all; members can insert own; admins can insert (manual).
- A trigger updates `members.attendance_percentage` after attendance changes.

## Important Notes
1. The `attendance_method` enum includes 'manual' for admin-marked attendance.
2. The unique constraint on (meeting_id, member_id) prevents duplicate attendance.
3. An attendance trigger recalculates the member's attendance percentage after each insert/delete.
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('upcoming', 'open', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_method AS ENUM ('qr', 'fingerprint', 'pin', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MEETINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id                    bigserial PRIMARY KEY,
  title                 text NOT NULL,
  description           text,
  meeting_date          timestamptz NOT NULL,
  venue                 text NOT NULL,
  status                meeting_status NOT NULL DEFAULT 'upcoming',
  attendance_open       boolean NOT NULL DEFAULT false,
  attendance_opened_at  timestamptz,
  attendance_closed_at  timestamptz,
  created_by            bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id          bigserial PRIMARY KEY,
  meeting_id  bigint NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  member_id   bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  method      attendance_method NOT NULL,
  marked_at   timestamptz NOT NULL DEFAULT now(),
  marked_by   bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Recalculate attendance percentage after insert
CREATE OR REPLACE FUNCTION recalculate_attendance_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_meetings integer;
  attended_meetings integer;
  new_percentage numeric(5,2);
BEGIN
  SELECT COUNT(*) INTO total_meetings FROM meetings WHERE status = 'completed' AND deleted_at IS NULL;
  IF total_meetings = 0 THEN
    new_percentage := 0;
  ELSE
    SELECT COUNT(*) INTO attended_meetings
    FROM attendance a
    JOIN meetings m ON a.meeting_id = m.id
    WHERE a.member_id = COALESCE(NEW.member_id, OLD.member_id)
      AND m.status = 'completed'
      AND m.deleted_at IS NULL;
    new_percentage := ROUND((attended_meetings::numeric / total_meetings) * 100, 2);
  END IF;

  UPDATE members SET attendance_percentage = new_percentage
  WHERE id = COALESCE(NEW.member_id, OLD.member_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER attendance_recalc_insert AFTER INSERT ON attendance
    FOR EACH ROW EXECUTE FUNCTION recalculate_attendance_percentage();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER attendance_recalc_delete AFTER DELETE ON attendance
    FOR EACH ROW EXECUTE FUNCTION recalculate_attendance_percentage();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MEETINGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "meetings_select_all" ON meetings;
CREATE POLICY "meetings_select_all" ON meetings FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "meetings_insert_admin" ON meetings;
CREATE POLICY "meetings_insert_admin" ON meetings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "meetings_update_admin" ON meetings;
CREATE POLICY "meetings_update_admin" ON meetings FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "meetings_delete_admin" ON meetings;
CREATE POLICY "meetings_delete_admin" ON meetings FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

-- ============================================================
-- ATTENDANCE POLICIES
-- ============================================================
-- Members can read own attendance; admins can read all
DROP POLICY IF EXISTS "attendance_select_own" ON attendance;
CREATE POLICY "attendance_select_own" ON attendance FOR SELECT
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "attendance_select_admin" ON attendance;
CREATE POLICY "attendance_select_admin" ON attendance FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

-- Members can mark own attendance
DROP POLICY IF EXISTS "attendance_insert_own" ON attendance;
CREATE POLICY "attendance_insert_own" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can manually mark attendance
DROP POLICY IF EXISTS "attendance_insert_admin" ON attendance;
CREATE POLICY "attendance_insert_admin" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

-- Admins can update attendance (correct errors)
DROP POLICY IF EXISTS "attendance_update_admin" ON attendance;
CREATE POLICY "attendance_update_admin" ON attendance FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

-- Admins can delete attendance
DROP POLICY IF EXISTS "attendance_delete_admin" ON attendance;
CREATE POLICY "attendance_delete_admin" ON attendance FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );