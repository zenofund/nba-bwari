/*
# Audit Logs Schema

## Overview
This migration creates the audit_logs table to track all administrative actions
performed in the portal. Every admin action (member approval, suspension, election
configuration, report publishing, etc.) is recorded with the actor, action type,
target, and timestamp.

## New Table

### `audit_logs`
Records all administrative actions for compliance and accountability.
- `id` (bigint, PK)
- `actor_id` (bigint, FK → members, nullable) — the admin who performed the action
- `actor_name` (text) — denormalized actor name (for display even if member deleted)
- `actor_role` (text, nullable) — the role the actor had at the time
- `action` (text) — action type (e.g., "MEMBER_APPROVED", "MEETING_CREATED")
- `target` (text, nullable) — the entity affected (e.g., member name, meeting title)
- `target_id` (text, nullable) — the ID of the target entity
- `details` (text, nullable) — human-readable description of the action
- `ip_address` (text, nullable) — IP address of the actor
- `metadata` (jsonb, nullable) — additional structured data about the action
- `created_at` (timestamptz) — when the action occurred

## Security
- RLS enabled.
- Only admins can read audit logs.
- Any authenticated user can insert (the app logs actions server-side); in practice,
  inserts come from edge functions or SECURITY DEFINER functions.
- No one can update or delete audit logs (immutable record).

## Important Notes
1. Audit logs are append-only — no UPDATE or DELETE policies are defined.
2. `actor_name` is denormalized so logs remain readable even if a member is deleted.
3. `metadata` stores structured JSON for complex actions (e.g., before/after values).
*/

-- ============================================================
-- AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            bigserial PRIMARY KEY,
  actor_id      bigint REFERENCES members(id) ON DELETE SET NULL,
  actor_name    text NOT NULL,
  actor_role    text,
  action        text NOT NULL,
  target        text,
  target_id     text,
  details       text,
  ip_address    text,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- AUDIT_LOGS POLICIES
-- ============================================================
-- Only admins can read audit logs
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

-- Any authenticated user can insert (for server-side logging)
DROP POLICY IF EXISTS "audit_logs_insert_any" ON audit_logs;
CREATE POLICY "audit_logs_insert_any" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- No UPDATE or DELETE policies — audit logs are immutable