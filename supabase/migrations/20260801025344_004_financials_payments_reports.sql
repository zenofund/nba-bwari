/*
# Financials Schema: Payments & Financial Reports

## Overview
This migration creates the payments and financial reports tables. Members pay annual
dues and other fees via Paystack/Flutterwave. Admins publish financial reports.

## New Tables

### 1. `payments`
Records all payment transactions (dues, CLE fees, etc.).
- `id` (bigint, PK)
- `member_id` (bigint, FK → members, CASCADE) — paying member
- `description` (text) — what the payment is for (e.g., "2025 Annual Dues")
- `amount` (numeric(12,2)) — amount in Naira
- `method` (enum) — 'card' | 'bank_transfer' | 'cash'
- `status` (enum) — 'pending' | 'paid' | 'failed' | 'verified'
- `reference` (text, unique) — payment gateway reference (e.g., "PAY-2025-001234")
- `gateway` (text, nullable) — 'paystack' | 'flutterwave' | 'manual'
- `gateway_response` (jsonb, nullable) — raw gateway response
- `paid_at` (timestamptz, nullable) — when payment was confirmed
- `verified_by` (bigint, FK → members, nullable) — admin who verified
- `verified_at` (timestamptz, nullable)
- `created_by` (bigint, FK → members, nullable) — admin who recorded (for manual payments)
- `created_at`, `updated_at` (timestamptz)

### 2. `financial_reports`
Published branch financial reports (income, expenditure, audit, dues collection).
- `id` (bigint, PK)
- `title` (text) — report title
- `period` (text) — reporting period (e.g., "Q2 2025", "FY 2024")
- `type` (enum) — 'income' | 'expenditure' | 'audit' | 'dues'
- `amount` (numeric(14,2)) — total amount in the report
- `report_date` (date) — date of the report
- `status` (enum) — 'draft' | 'pending' | 'published'
- `file_url` (text, nullable) — PDF document URL
- `published_at` (timestamptz, nullable)
- `created_by` (bigint, FK → members, nullable)
- `created_at`, `updated_at`, `deleted_at` (timestamptz)

## Security
- RLS enabled on both tables.
- Payments: members can read own; admins can read all, insert, update, delete.
- Financial reports: any authenticated member can read published reports; admins can read all and write.

## Important Notes
1. The `reference` column is unique — used to match Paystack/Flutterwave callbacks.
2. `gateway_response` stores the raw payment gateway payload for audit/debugging.
3. Financial reports are visible to all members when published; drafts are admin-only.
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'cash');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE financial_report_type AS ENUM ('income', 'expenditure', 'audit', 'dues');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE financial_report_status AS ENUM ('draft', 'pending', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                bigserial PRIMARY KEY,
  member_id         bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  description       text NOT NULL,
  amount            numeric(12,2) NOT NULL,
  method            payment_method NOT NULL DEFAULT 'card',
  status            payment_status NOT NULL DEFAULT 'pending',
  reference         text UNIQUE NOT NULL,
  gateway           text,
  gateway_response  jsonb,
  paid_at           timestamptz,
  verified_by       bigint REFERENCES members(id) ON DELETE SET NULL,
  verified_at       timestamptz,
  created_by        bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- ============================================================
-- FINANCIAL_REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_reports (
  id            bigserial PRIMARY KEY,
  title         text NOT NULL,
  period        text NOT NULL,
  type          financial_report_type NOT NULL,
  amount        numeric(14,2) NOT NULL DEFAULT 0,
  report_date   date NOT NULL,
  status        financial_report_status NOT NULL DEFAULT 'draft',
  file_url      text,
  published_at  timestamptz,
  created_by    bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_financial_reports_status ON financial_reports(status);
CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(type);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER financial_reports_updated_at BEFORE UPDATE ON financial_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
-- Members can read own payments
DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own" ON payments FOR SELECT
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can read all payments
DROP POLICY IF EXISTS "payments_select_admin" ON payments;
CREATE POLICY "payments_select_admin" ON payments FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary', 'branch_chairman')
    )
  );

-- Members can insert own payment (initiate payment)
DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own" ON payments FOR INSERT
  TO authenticated WITH CHECK (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can insert payments (manual recording)
DROP POLICY IF EXISTS "payments_insert_admin" ON payments;
CREATE POLICY "payments_insert_admin" ON payments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );

-- Admins can update payments (verify, change status)
DROP POLICY IF EXISTS "payments_update_admin" ON payments;
CREATE POLICY "payments_update_admin" ON payments FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );

-- Admins can delete payments
DROP POLICY IF EXISTS "payments_delete_admin" ON payments;
CREATE POLICY "payments_delete_admin" ON payments FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );

-- ============================================================
-- FINANCIAL_REPORTS POLICIES
-- ============================================================
-- Any member can read published reports
DROP POLICY IF EXISTS "financial_reports_select_published" ON financial_reports;
CREATE POLICY "financial_reports_select_published" ON financial_reports FOR SELECT
  TO authenticated USING (status = 'published' AND deleted_at IS NULL);

-- Admins can read all reports (including drafts)
DROP POLICY IF EXISTS "financial_reports_select_admin" ON financial_reports;
CREATE POLICY "financial_reports_select_admin" ON financial_reports FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary', 'branch_chairman')
    )
  );

-- Admins can insert reports
DROP POLICY IF EXISTS "financial_reports_insert_admin" ON financial_reports;
CREATE POLICY "financial_reports_insert_admin" ON financial_reports FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );

-- Admins can update reports
DROP POLICY IF EXISTS "financial_reports_update_admin" ON financial_reports;
CREATE POLICY "financial_reports_update_admin" ON financial_reports FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );

-- Admins can delete reports
DROP POLICY IF EXISTS "financial_reports_delete_admin" ON financial_reports;
CREATE POLICY "financial_reports_delete_admin" ON financial_reports FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'financial_secretary')
    )
  );