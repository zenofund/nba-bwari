/*
# Good Standing Letters, Documents, News, Notifications

## Overview
This migration creates four tables: good standing letters, documents, news articles,
and member notifications.

## New Tables

### 1. `good_standing_letters`
Letters issued to members confirming they are in good standing.
- `id` (bigint, PK)
- `member_id` (bigint, FK → members, CASCADE)
- `letter_number` (text, unique) — e.g., "LGS-2025-0247"
- `status` (enum) — 'pending' | 'issued' | 'expired' | 'revoked'
- `eligible` (boolean) — whether member was eligible at time of issue
- `file_url` (text, nullable) — PDF URL
- `issued_at` (timestamptz)
- `expires_at` (timestamptz, nullable)
- `requested_at` (timestamptz) — when member requested the letter
- `created_at`, `updated_at` (timestamptz)

### 2. `documents`
Branch documents (circulars, reports, election notices, certificates, good standing letters).
- `id` (bigint, PK)
- `title` (text)
- `type` (enum) — 'good_standing' | 'circular' | 'financial_report' | 'report' | 'election_notice' | 'certificate'
- `description` (text, nullable)
- `file_url` (text, nullable) — storage URL
- `file_size` (bigint, nullable) — size in bytes
- `file_format` (text, nullable) — e.g., "PDF"
- `issued_date` (date) — date document was issued
- `expiry_date` (date, nullable) — for documents with validity
- `downloads` (int, default 0) — download counter
- `uploaded_by` (bigint, FK → members, nullable)
- `created_at`, `updated_at`, `deleted_at` (timestamptz)

### 3. `news_articles`
News and announcements published by admins.
- `id` (bigint, PK)
- `title` (text)
- `slug` (text, unique) — URL slug
- `category` (enum) — 'branch_news' | 'announcement' | 'circular' | 'report' | 'event' | 'election' | 'national_news'
- `excerpt` (text) — short summary
- `body` (text, nullable) — full article content (HTML/markdown)
- `featured` (boolean, default false) — pinned/featured article
- `status` (enum) — 'draft' | 'published'
- `read_time` (text, nullable) — e.g., "4 min read"
- `views` (int, default 0) — view counter
- `author_id` (bigint, FK → members, nullable)
- `published_at` (timestamptz, nullable)
- `created_at`, `updated_at`, `deleted_at` (timestamptz)

### 4. `notifications`
Member-specific notification feed.
- `id` (bigint, PK)
- `member_id` (bigint, FK → members, CASCADE)
- `type` (enum) — 'meeting' | 'election' | 'finance' | 'document' | 'announcement' | 'system'
- `title` (text)
- `message` (text)
- `read` (boolean, default false)
- `read_at` (timestamptz, nullable)
- `created_at`, `updated_at` (timestamptz)

## Security
- RLS enabled on all tables.
- Good standing letters: members can read own; admins can read all and write.
- Documents: any authenticated member can read; only admins can write.
- News: any authenticated member can read published; admins can read all and write.
- Notifications: members can read/update/delete own; admins can insert (send notifications).

## Important Notes
1. Good standing letters have an expiry date (default 12 months from settings).
2. Documents track download counts for analytics.
3. News articles support both published and draft states.
4. Notifications are per-member; the `read` flag drives the unread badge count.
*/

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE letter_status AS ENUM ('pending', 'issued', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('good_standing', 'circular', 'financial_report', 'report', 'election_notice', 'certificate');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE news_category AS ENUM ('branch_news', 'announcement', 'circular', 'report', 'event', 'election', 'national_news');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('meeting', 'election', 'finance', 'document', 'announcement', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- GOOD_STANDING_LETTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS good_standing_letters (
  id              bigserial PRIMARY KEY,
  member_id       bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  letter_number   text UNIQUE NOT NULL,
  status          letter_status NOT NULL DEFAULT 'pending',
  eligible        boolean NOT NULL DEFAULT false,
  file_url        text,
  issued_at       timestamptz,
  expires_at      timestamptz,
  requested_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gsl_member ON good_standing_letters(member_id);
CREATE INDEX IF NOT EXISTS idx_gsl_status ON good_standing_letters(status);

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id            bigserial PRIMARY KEY,
  title         text NOT NULL,
  type          document_type NOT NULL,
  description   text,
  file_url      text,
  file_size     bigint,
  file_format   text,
  issued_date   date NOT NULL,
  expiry_date   date,
  downloads     integer NOT NULL DEFAULT 0,
  uploaded_by   bigint REFERENCES members(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_issued_date ON documents(issued_date);

-- ============================================================
-- NEWS_ARTICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news_articles (
  id            bigserial PRIMARY KEY,
  title         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  category      news_category NOT NULL,
  excerpt       text NOT NULL,
  body          text,
  featured      boolean NOT NULL DEFAULT false,
  status        content_status NOT NULL DEFAULT 'draft',
  read_time     text,
  views         integer NOT NULL DEFAULT 0,
  author_id     bigint REFERENCES members(id) ON DELETE SET NULL,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          bigserial PRIMARY KEY,
  member_id   bigint NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_member ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(member_id, read);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER good_standing_letters_updated_at BEFORE UPDATE ON good_standing_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER news_articles_updated_at BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
ALTER TABLE good_standing_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- GOOD_STANDING_LETTERS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "gsl_select_own" ON good_standing_letters;
CREATE POLICY "gsl_select_own" ON good_standing_letters FOR SELECT
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "gsl_select_admin" ON good_standing_letters;
CREATE POLICY "gsl_select_admin" ON good_standing_letters FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_chairman', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "gsl_insert_own" ON good_standing_letters;
CREATE POLICY "gsl_insert_own" ON good_standing_letters FOR INSERT
  TO authenticated WITH CHECK (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

DROP POLICY IF EXISTS "gsl_insert_admin" ON good_standing_letters;
CREATE POLICY "gsl_insert_admin" ON good_standing_letters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "gsl_update_admin" ON good_standing_letters;
CREATE POLICY "gsl_update_admin" ON good_standing_letters FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_secretary')
    )
  );

-- ============================================================
-- DOCUMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "documents_select_all" ON documents;
CREATE POLICY "documents_select_all" ON documents FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "documents_insert_admin" ON documents;
CREATE POLICY "documents_insert_admin" ON documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "documents_update_admin" ON documents;
CREATE POLICY "documents_update_admin" ON documents FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "documents_delete_admin" ON documents;
CREATE POLICY "documents_delete_admin" ON documents FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

-- ============================================================
-- NEWS_ARTICLES POLICIES
-- ============================================================
-- Any member can read published articles
DROP POLICY IF EXISTS "news_select_published" ON news_articles;
CREATE POLICY "news_select_published" ON news_articles FOR SELECT
  TO authenticated USING (status = 'published' AND deleted_at IS NULL);

-- Admins can read all (including drafts)
DROP POLICY IF EXISTS "news_select_admin" ON news_articles;
CREATE POLICY "news_select_admin" ON news_articles FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "news_insert_admin" ON news_articles;
CREATE POLICY "news_insert_admin" ON news_articles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "news_update_admin" ON news_articles;
CREATE POLICY "news_update_admin" ON news_articles FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

DROP POLICY IF EXISTS "news_delete_admin" ON news_articles;
CREATE POLICY "news_delete_admin" ON news_articles FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'content_manager', 'branch_secretary')
    )
  );

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
-- Members can read own notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Members can update own (mark as read)
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  ) WITH CHECK (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Members can delete own
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- Admins can insert notifications (send to members)
DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN roles r ON mr.role_id = r.id
      WHERE mr.member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
        AND r.name IN ('super_admin', 'branch_secretary', 'content_manager', 'election_officer')
    )
  );