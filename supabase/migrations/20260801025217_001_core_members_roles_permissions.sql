/*
# Core Schema: Members, Roles, Permissions, Settings

## Overview
This migration establishes the foundational schema for the NBA Bwari Digital Portal.
It creates the member profile system, role-based access control (RBAC), and branch settings.

## New Tables

### 1. `members`
Stores NBA Bwari branch member profiles. Each member is linked to a Supabase Auth user.
- `id` (bigint, PK) — auto-incrementing member ID
- `user_id` (uuid, FK → auth.users) — Supabase Auth identity, nullable until registration is approved
- `nba_number` (text, unique) — NBA registration number (e.g., "NBA/ABJ/2019/1847")
- `supreme_court_number` (text, nullable) — Supreme Court number
- `first_name` (text) — member first name
- `last_name` (text) — member last name
- `email` (text, unique) — email address
- `phone` (text, nullable) — phone number
- `year_called_to_bar` (int, nullable) — year called to the Nigerian Bar
- `branch` (text) — branch name (default "Bwari Area Council Branch")
- `residential_address` (text, nullable)
- `avatar_url` (text, nullable) — profile photo URL
- `membership_status` (enum) — 'pending' | 'active' | 'inactive' | 'suspended'
- `attendance_percentage` (numeric) — computed attendance percentage, default 0
- `good_standing_status` (boolean) — whether in good standing, default false
- `voting_eligibility` (boolean) — whether eligible to vote, default false
- `financial_compliance` (boolean) — whether financially compliant, default false
- `last_login_at` (timestamptz, nullable)
- `joined_at` (timestamptz) — when member joined the branch
- `approved_at` (timestamptz, nullable) — when admin approved registration
- `approved_by` (bigint, nullable, FK → members) — admin who approved
- `suspended_at` (timestamptz, nullable)
- `suspension_reason` (text, nullable)
- `created_at`, `updated_at`, `deleted_at` (timestamptz) — Laravel timestamps

### 2. `roles`
Defines admin/staff roles for the portal.
- `id` (bigint, PK)
- `name` (text, unique) — role slug (e.g., "super_admin", "branch_secretary")
- `label` (text) — human-readable label
- `description` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

### 3. `permissions`
Defines granular permissions (e.g., "members.read", "elections.*").
- `id` (bigint, PK)
- `name` (text, unique) — permission slug
- `label` (text) — human-readable label
- `module` (text) — which module this belongs to
- `created_at`, `updated_at` (timestamptz)

### 4. `role_permissions`
Pivot table linking roles to permissions (many-to-many).
- `role_id` (bigint, FK → roles, CASCADE)
- `permission_id` (bigint, FK → permissions, CASCADE)
- PK on (role_id, permission_id)

### 5. `member_roles`
Pivot table linking members to roles (many-to-many). A member can have multiple admin roles.
- `member_id` (bigint, FK → members, CASCADE)
- `role_id` (bigint, FK → roles, CASCADE)
- `assigned_at` (timestamptz, default now)
- `assigned_by` (bigint, nullable, FK → members) — who assigned this role
- PK on (member_id, role_id)

### 6. `settings`
Single-row branch configuration table (Laravel key-value style).
- `id` (bigint, PK)
- `key` (text, unique) — setting key
- `value` (text, nullable) — setting value (stored as text, cast by app)
- `created_at`, `updated_at` (timestamptz)

## Security
- RLS enabled on all tables.
- Members: owner can read/update own row; admins (via member_roles) can read all and update.
- Roles/permissions: any authenticated user can read; only super_admin can write.
- Settings: any authenticated user can read; only super_admin can write.

## Important Notes
1. Member `user_id` is nullable because registrations start as 'pending' before a Supabase Auth account is created/approved.
2. The `approved_by` self-referencing FK is nullable to avoid circular dependency issues.
3. Default settings rows are seeded for the branch configuration.
4. Tables are created BEFORE policies to avoid forward-reference errors.
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
  id                      bigserial PRIMARY KEY,
  user_id                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nba_number              text UNIQUE NOT NULL,
  supreme_court_number    text,
  first_name              text NOT NULL,
  last_name               text NOT NULL,
  email                   text UNIQUE NOT NULL,
  phone                   text,
  year_called_to_bar      integer,
  branch                  text NOT NULL DEFAULT 'Bwari Area Council Branch',
  residential_address     text,
  avatar_url              text,
  membership_status       membership_status NOT NULL DEFAULT 'pending',
  attendance_percentage  numeric(5,2) NOT NULL DEFAULT 0,
  good_standing_status    boolean NOT NULL DEFAULT false,
  voting_eligibility      boolean NOT NULL DEFAULT false,
  financial_compliance    boolean NOT NULL DEFAULT false,
  last_login_at           timestamptz,
  joined_at               timestamptz NOT NULL DEFAULT now(),
  approved_at             timestamptz,
  approved_by             bigint REFERENCES members(id) ON DELETE SET NULL,
  suspended_at            timestamptz,
  suspension_reason       text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz
);

CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_members_nba_number ON members(nba_number);

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id           bigserial PRIMARY KEY,
  name         text UNIQUE NOT NULL,
  label        text NOT NULL,
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PERMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id           bigserial PRIMARY KEY,
  name         text UNIQUE NOT NULL,
  label        text NOT NULL,
  module       text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROLE_PERMISSIONS PIVOT
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id        bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id  bigint NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- MEMBER_ROLES PIVOT
-- ============================================================
CREATE TABLE IF NOT EXISTS member_roles (
  member_id    bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role_id      bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  assigned_by  bigint REFERENCES members(id) ON DELETE SET NULL,
  PRIMARY KEY (member_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_member_roles_member ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role ON member_roles(role_id);

-- ============================================================
-- SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id           bigserial PRIMARY KEY,
  key          text UNIQUE NOT NULL,
  value        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SEED DEFAULT ROLES
-- ============================================================
INSERT INTO roles (name, label, description) VALUES
  ('super_admin', 'Super Admin', 'Full access to all modules and settings'),
  ('branch_chairman', 'Branch Chairman', 'Oversight access to all branch modules'),
  ('branch_secretary', 'Branch Secretary', 'Manage meetings, attendance, and content'),
  ('financial_secretary', 'Financial Secretary', 'Manage financial reports and payments'),
  ('election_officer', 'Election Officer', 'Manage elections and candidates'),
  ('content_manager', 'Content Manager', 'Manage news, circulars, and documents'),
  ('member', 'Lawyer (Member)', 'Standard member access to portal')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DEFAULT PERMISSIONS
-- ============================================================
INSERT INTO permissions (name, label, module) VALUES
  ('members.read', 'View Members', 'members'),
  ('members.write', 'Manage Members', 'members'),
  ('attendance.read', 'View Attendance', 'attendance'),
  ('attendance.write', 'Manage Attendance', 'attendance'),
  ('financials.read', 'View Financials', 'financials'),
  ('financials.write', 'Manage Financials', 'financials'),
  ('elections.read', 'View Elections', 'elections'),
  ('elections.write', 'Manage Elections', 'elections'),
  ('content.read', 'View Content', 'content'),
  ('content.write', 'Manage Content', 'content'),
  ('documents.read', 'View Documents', 'documents'),
  ('documents.write', 'Manage Documents', 'documents'),
  ('settings.read', 'View Settings', 'settings'),
  ('settings.write', 'Manage Settings', 'settings'),
  ('audit.read', 'View Audit Logs', 'audit')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DEFAULT SETTINGS
-- ============================================================
INSERT INTO settings (key, value) VALUES
  ('branch_name', 'NBA Bwari Area Council Branch'),
  ('branch_address', 'Area 3, Bwari, Abuja'),
  ('branch_phone', '+234 805 111 2222'),
  ('branch_email', 'info@nbabwari.org'),
  ('annual_dues_amount', '50000'),
  ('attendance_threshold', '75'),
  ('voting_eligibility_threshold', '75'),
  ('good_standing_validity_months', '12'),
  ('enable_biometric_login', 'true'),
  ('enable_email_notifications', 'true'),
  ('enable_sms_notifications', 'true'),
  ('enable_push_notifications', 'true'),
  ('session_timeout_minutes', '30'),
  ('max_login_attempts', '5')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- updated_at TRIGGER (Laravel-style auto-update)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MEMBERS POLICIES
-- ============================================================
-- Owner can read own profile
DROP POLICY IF EXISTS "members_select_own" ON members;
CREATE POLICY "members_select_own" ON members FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Owner can update own profile (limited self-service)
DROP POLICY IF EXISTS "members_update_own" ON members;
CREATE POLICY "members_update_own" ON members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admins can read all members
DROP POLICY IF EXISTS "members_select_admin" ON members;
CREATE POLICY "members_select_admin" ON members FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary', 'financial_secretary', 'election_officer', 'content_manager')
    )
  );

-- Admins can update members (approve, suspend, etc.)
DROP POLICY IF EXISTS "members_update_admin" ON members;
CREATE POLICY "members_update_admin" ON members FOR UPDATE
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

-- Admins can insert members
DROP POLICY IF EXISTS "members_insert_admin" ON members;
CREATE POLICY "members_insert_admin" ON members FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_secretary')
    )
  );

-- ============================================================
-- ROLES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "roles_select_all" ON roles;
CREATE POLICY "roles_select_all" ON roles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "roles_insert_admin" ON roles;
CREATE POLICY "roles_insert_admin" ON roles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "roles_update_admin" ON roles;
CREATE POLICY "roles_update_admin" ON roles FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

-- ============================================================
-- PERMISSIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "permissions_select_all" ON permissions;
CREATE POLICY "permissions_select_all" ON permissions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "permissions_insert_admin" ON permissions;
CREATE POLICY "permissions_insert_admin" ON permissions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "permissions_update_admin" ON permissions;
CREATE POLICY "permissions_update_admin" ON permissions FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

-- ============================================================
-- ROLE_PERMISSIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "role_permissions_select_all" ON role_permissions;
CREATE POLICY "role_permissions_select_all" ON role_permissions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "role_permissions_insert_admin" ON role_permissions;
CREATE POLICY "role_permissions_insert_admin" ON role_permissions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "role_permissions_delete_admin" ON role_permissions;
CREATE POLICY "role_permissions_delete_admin" ON role_permissions FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

-- ============================================================
-- MEMBER_ROLES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "member_roles_select_all" ON member_roles;
CREATE POLICY "member_roles_select_all" ON member_roles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "member_roles_insert_admin" ON member_roles;
CREATE POLICY "member_roles_insert_admin" ON member_roles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "member_roles_delete_admin" ON member_roles;
CREATE POLICY "member_roles_delete_admin" ON member_roles FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

-- ============================================================
-- SETTINGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "settings_select_all" ON settings;
CREATE POLICY "settings_select_all" ON settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON settings;
CREATE POLICY "settings_update_admin" ON settings FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "settings_insert_admin" ON settings;
CREATE POLICY "settings_insert_admin" ON settings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name = 'super_admin'
    )
  );