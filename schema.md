# NBA Bwari Digital Portal — Database Schema

## Overview

This document describes the complete database schema for the NBA Bwari Digital Portal, a member management system for the Nigerian Bar Association Bwari Area Council Branch. The system has two portals: a **Member Portal** (for lawyers to view meetings, vote in elections, pay dues, download documents) and an **Admin Portal** (for branch officers to manage members, meetings, elections, finances, content, and audit logs).

The schema uses **Laravel-compatible conventions**:
- `bigserial` auto-incrementing primary keys
- `created_at`, `updated_at`, `deleted_at` timestamp columns (soft-delete support)
- Snake_case naming throughout
- Enum types for status fields
- `updated_at` auto-update triggers on all tables
- Foreign keys with appropriate `ON DELETE CASCADE` / `SET NULL` rules
- Row Level Security (RLS) enabled on every table

**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth (`auth.users` table)
**Total Tables**: 21
**Total Migrations**: 6

---

## Migration Index

| # | Filename | Domain |
|---|----------|--------|
| 1 | `001_core_members_roles_permissions` | Members, roles, permissions, settings |
| 2 | `002_meetings_attendance` | Meetings, attendance tracking |
| 3 | `003_elections_voting` | Elections, positions, candidates, nominations, votes, receipts |
| 4 | `004_financials_payments_reports` | Payments, financial reports |
| 5 | `005_letters_documents_news_notifications` | Good standing letters, documents, news, notifications |
| 6 | `006_audit_logs` | Audit trail |

---

## Enum Types

| Enum | Values |
|------|--------|
| `membership_status` | `pending`, `active`, `inactive`, `suspended` |
| `meeting_status` | `upcoming`, `open`, `completed`, `cancelled` |
| `attendance_method` | `qr`, `fingerprint`, `pin`, `manual` |
| `election_phase` | `nomination`, `voting`, `tallying`, `results` |
| `election_status` | `upcoming`, `open`, `completed`, `cancelled` |
| `candidate_status` | `pending`, `approved`, `rejected`, `withdrawn` |
| `nomination_status` | `pending`, `approved`, `rejected`, `withdrawn` |
| `payment_method` | `card`, `bank_transfer`, `cash` |
| `payment_status` | `pending`, `paid`, `failed`, `verified` |
| `financial_report_type` | `income`, `expenditure`, `audit`, `dues` |
| `financial_report_status` | `draft`, `pending`, `published` |
| `letter_status` | `pending`, `issued`, `expired`, `revoked` |
| `document_type` | `good_standing`, `circular`, `financial_report`, `report`, `election_notice`, `certificate` |
| `news_category` | `branch_news`, `announcement`, `circular`, `report`, `event`, `election`, `national_news` |
| `content_status` | `draft`, `published` |
| `notification_type` | `meeting`, `election`, `finance`, `document`, `announcement`, `system` |

---

## Table Reference

### 1. `members`

Member profiles for all NBA Bwari branch lawyers. Each member is linked to a Supabase Auth user account.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Member ID |
| `user_id` | uuid (FK → auth.users) | Yes | — | Supabase Auth identity (null until registration approved) |
| `nba_number` | text (unique) | No | — | NBA registration number (e.g., "NBA/ABJ/2019/1847") |
| `supreme_court_number` | text | Yes | — | Supreme Court number |
| `first_name` | text | No | — | First name |
| `last_name` | text | No | — | Last name |
| `email` | text (unique) | No | — | Email address |
| `phone` | text | Yes | — | Phone number |
| `year_called_to_bar` | integer | Yes | — | Year called to the Nigerian Bar |
| `branch` | text | No | `'Bwari Area Council Branch'` | Branch name |
| `residential_address` | text | Yes | — | Home address |
| `avatar_url` | text | Yes | — | Profile photo URL |
| `membership_status` | membership_status | No | `'pending'` | Membership state |
| `attendance_percentage` | numeric(5,2) | No | `0` | Computed attendance rate (auto-updated by trigger) |
| `good_standing_status` | boolean | No | `false` | Whether in good standing |
| `voting_eligibility` | boolean | No | `false` | Whether eligible to vote |
| `financial_compliance` | boolean | No | `false` | Whether financially compliant |
| `last_login_at` | timestamptz | Yes | — | Last login timestamp |
| `joined_at` | timestamptz | No | `now()` | When member joined the branch |
| `approved_at` | timestamptz | Yes | — | When admin approved registration |
| `approved_by` | bigint (FK → members) | Yes | — | Admin who approved |
| `suspended_at` | timestamptz | Yes | — | When member was suspended |
| `suspension_reason` | text | Yes | — | Reason for suspension |
| `created_at` | timestamptz | No | `now()` | Record created |
| `updated_at` | timestamptz | No | `now()` | Record updated (auto-trigger) |
| `deleted_at` | timestamptz | Yes | — | Soft delete timestamp |

**Indexes**: `user_id`, `email`, `membership_status`, `nba_number`

**RLS Policies**:
- Owner can SELECT/UPDATE own profile
- Admins (super_admin, branch_chairman, branch_secretary, financial_secretary, election_officer, content_manager) can SELECT all members
- Admins (super_admin, branch_chairman, branch_secretary) can UPDATE/INSERT members

---

### 2. `roles`

Defines admin/staff roles for the portal.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Role ID |
| `name` | text (unique) | No | — | Role slug (e.g., "super_admin") |
| `label` | text | No | — | Human-readable label |
| `description` | text | Yes | — | Role description |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Seeded Roles**:

| name | label | description |
|------|-------|-------------|
| `super_admin` | Super Admin | Full access to all modules and settings |
| `branch_chairman` | Branch Chairman | Oversight access to all branch modules |
| `branch_secretary` | Branch Secretary | Manage meetings, attendance, and content |
| `financial_secretary` | Financial Secretary | Manage financial reports and payments |
| `election_officer` | Election Officer | Manage elections and candidates |
| `content_manager` | Content Manager | Manage news, circulars, and documents |
| `member` | Lawyer (Member) | Standard member access to portal |

**RLS Policies**:
- Any authenticated user can SELECT
- Only super_admin can INSERT/UPDATE

---

### 3. `permissions`

Granular permissions grouped by module.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Permission ID |
| `name` | text (unique) | No | — | Permission slug (e.g., "members.read") |
| `label` | text | No | — | Human-readable label |
| `module` | text | No | — | Module grouping |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Seeded Permissions**: `members.read`, `members.write`, `attendance.read`, `attendance.write`, `financials.read`, `financials.write`, `elections.read`, `elections.write`, `content.read`, `content.write`, `documents.read`, `documents.write`, `settings.read`, `settings.write`, `audit.read`

**RLS Policies**:
- Any authenticated user can SELECT
- Only super_admin can INSERT/UPDATE

---

### 4. `role_permissions`

Many-to-many pivot linking roles to permissions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `role_id` | bigint (FK → roles, CASCADE) | No | Role |
| `permission_id` | bigint (FK → permissions, CASCADE) | No | Permission |

**Primary Key**: `(role_id, permission_id)`

**RLS Policies**:
- Any authenticated user can SELECT
- Only super_admin can INSERT/DELETE

---

### 5. `member_roles`

Many-to-many pivot linking members to roles. A member can hold multiple admin roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `member_id` | bigint (FK → members, CASCADE) | No | — | Member |
| `role_id` | bigint (FK → roles, CASCADE) | No | — | Role |
| `assigned_at` | timestamptz | No | `now()` | When role was assigned |
| `assigned_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who assigned the role |

**Primary Key**: `(member_id, role_id)`

**Indexes**: `member_id`, `role_id`

**RLS Policies**:
- Any authenticated user can SELECT (needed for admin checks)
- Only super_admin can INSERT/DELETE

---

### 6. `settings`

Key-value branch configuration table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | — |
| `key` | text (unique) | No | — | Setting key |
| `value` | text | Yes | — | Setting value (stored as text, cast by app) |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Seeded Settings**: `branch_name`, `branch_address`, `branch_phone`, `branch_email`, `annual_dues_amount` (50000), `attendance_threshold` (75), `voting_eligibility_threshold` (75), `good_standing_validity_months` (12), `enable_biometric_login`, `enable_email_notifications`, `enable_sms_notifications`, `enable_push_notifications`, `session_timeout_minutes` (30), `max_login_attempts` (5)

**RLS Policies**:
- Any authenticated user can SELECT
- Only super_admin can INSERT/UPDATE

---

### 7. `meetings`

Records all branch meetings (general, emergency, CLE seminars, AGMs).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Meeting ID |
| `title` | text | No | — | Meeting title |
| `description` | text | Yes | — | Agenda/details |
| `meeting_date` | timestamptz | No | — | Scheduled date and time |
| `venue` | text | No | — | Meeting location |
| `status` | meeting_status | No | `'upcoming'` | Meeting state |
| `attendance_open` | boolean | No | `false` | Whether attendance marking is active |
| `attendance_opened_at` | timestamptz | Yes | — | When attendance window opened |
| `attendance_closed_at` | timestamptz | Yes | — | When attendance window closed |
| `created_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who created the meeting |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |

**Indexes**: `meeting_date`, `status`

**RLS Policies**:
- Any authenticated user can SELECT (where `deleted_at IS NULL`)
- Admins (super_admin, branch_chairman, branch_secretary) can INSERT/UPDATE/DELETE

---

### 8. `attendance`

Individual member attendance records for each meeting.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | — |
| `meeting_id` | bigint (FK → meetings, CASCADE) | No | — | Meeting |
| `member_id` | bigint (FK → members, CASCADE) | No | — | Member who attended |
| `method` | attendance_method | No | — | How attendance was marked |
| `marked_at` | timestamptz | No | `now()` | When attendance was recorded |
| `marked_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who manually marked (null for self-marked) |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Unique Constraint**: `(meeting_id, member_id)` — one attendance record per member per meeting

**Indexes**: `meeting_id`, `member_id`

**Triggers**:
- `attendance_recalc_insert` — After INSERT, recalculates `members.attendance_percentage`
- `attendance_recalc_delete` — After DELETE, recalculates `members.attendance_percentage`

**RLS Policies**:
- Members can SELECT own records; admins can SELECT all
- Members can INSERT own (self-mark attendance); admins can INSERT (manual mark)
- Admins can UPDATE/DELETE (correct errors)

---

### 9. `elections`

Records each election event (branch executive, by-election, national).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Election ID |
| `title` | text | No | — | Election title |
| `description` | text | Yes | — | Election description |
| `phase` | election_phase | No | `'nomination'` | Current phase |
| `status` | election_status | No | `'upcoming'` | Election state |
| `nomination_start` | timestamptz | No | — | When nominations open |
| `nomination_deadline` | timestamptz | No | — | When nominations close |
| `voting_start` | timestamptz | No | — | When voting opens |
| `voting_end` | timestamptz | No | — | When voting closes |
| `results_published_at` | timestamptz | Yes | — | When results were published |
| `is_anonymous` | boolean | No | `true` | Whether voting is secret |
| `requires_attendance` | boolean | No | `true` | 75% attendance required to vote |
| `requires_financial_compliance` | boolean | No | `true` | Must be financially compliant to vote |
| `created_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who created the election |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |

**Indexes**: `phase`, `status`

**RLS Policies**:
- Any authenticated user can SELECT (where `deleted_at IS NULL`)
- Admins (super_admin, election_officer) can INSERT/UPDATE/DELETE

---

### 10. `election_positions`

The contested positions within an election.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Position ID |
| `election_id` | bigint (FK → elections, CASCADE) | No | — | Parent election |
| `name` | text | No | — | Position title (e.g., "Branch Chairman") |
| `description` | text | Yes | — | Position description |
| `order` | integer | No | `0` | Display order on ballot |
| `min_choices` | integer | No | `1` | Minimum selections |
| `max_choices` | integer | No | `1` | Maximum selections |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Index**: `election_id`

**RLS Policies**:
- Any authenticated user can SELECT
- Admins (super_admin, election_officer) can INSERT/UPDATE/DELETE

---

### 11. `candidates`

Individuals standing for a position in an election.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Candidate ID |
| `election_id` | bigint (FK → elections, CASCADE) | No | — | Parent election |
| `position_id` | bigint (FK → election_positions, CASCADE) | No | — | Position contested |
| `member_id` | bigint (FK → members, CASCADE) | No | — | The member who is the candidate |
| `manifesto` | text | Yes | — | Campaign statement |
| `qualifications` | text[] | Yes | — | Array of qualification strings |
| `practice_area` | text | Yes | — | Area of legal practice |
| `photo_url` | text | Yes | — | Candidate photo URL |
| `proposer_name` | text | Yes | — | Name of the nominating member |
| `seconder_name` | text | Yes | — | Name of the seconding member |
| `status` | candidate_status | No | `'pending'` | Candidate state |
| `votes` | integer | No | `0` | Vote count (populated after tallying) |
| `is_winner` | boolean | No | `false` | Set after results are published |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Indexes**: `election_id`, `position_id`, `member_id`

**RLS Policies**:
- Any authenticated user can SELECT
- Admins (super_admin, election_officer) can INSERT/UPDATE/DELETE

---

### 12. `nominations`

Self-nomination records submitted by members during the nomination phase.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Nomination ID |
| `election_id` | bigint (FK → elections, CASCADE) | No | — | Parent election |
| `position_id` | bigint (FK → election_positions, CASCADE) | No | — | Position nominated for |
| `member_id` | bigint (FK → members, CASCADE) | No | — | Nominating member |
| `statement` | text | Yes | — | Nomination statement/manifesto draft |
| `status` | nomination_status | No | `'pending'` | Nomination state |
| `reviewed_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who reviewed |
| `reviewed_at` | timestamptz | Yes | — | When reviewed |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Unique Constraint**: `(election_id, position_id, member_id)` — one nomination per position per member

**Indexes**: `election_id`, `member_id`

**RLS Policies**:
- Any authenticated user can SELECT (nominations are public)
- Members can INSERT own; can DELETE own (withdraw)
- Admins (super_admin, election_officer) can UPDATE (approve/reject)

---

### 13. `votes`

Anonymized ballot records. **CRITICAL: This table has NO `member_id` column** — votes cannot be linked back to individual members. Only the `vote_receipts` table tracks that a member voted (for turnout), without linking them to specific candidates.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | — |
| `election_id` | bigint (FK → elections, CASCADE) | No | — | Parent election |
| `position_id` | bigint (FK → election_positions, CASCADE) | No | — | Position voted for |
| `candidate_id` | bigint (FK → candidates, CASCADE) | No | — | Candidate selected |
| `created_at` | timestamptz | No | `now()` | Timestamp of vote |

**Indexes**: `election_id`, `candidate_id`, `position_id`

**RLS Policies**:
- **No SELECT policy** — votes are never readable via the API
- INSERT allowed (via the `cast_vote()` SECURITY DEFINER function)

---

### 14. `vote_receipts`

Records that a member has voted in an election (for turnout tracking and preventing double voting). Does NOT contain which candidates were selected.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | — |
| `election_id` | bigint (FK → elections, CASCADE) | No | — | Parent election |
| `member_id` | bigint (FK → members, CASCADE) | No | — | The member who voted |
| `receipt_number` | text (unique) | No | — | Human-readable receipt (e.g., "VR-2025-08-15-8247") |
| `voted_at` | timestamptz | No | `now()` | When the vote was cast |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Unique Constraint**: `(election_id, member_id)` — one vote per member per election

**Indexes**: `election_id`, `member_id`

**RLS Policies**:
- Members can SELECT own receipts; admins can SELECT all (for turnout)
- INSERT allowed (via the `cast_vote()` SECURITY DEFINER function)

---

### 15. `payments`

Records all payment transactions (dues, CLE fees, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Payment ID |
| `member_id` | bigint (FK → members, CASCADE) | No | — | Paying member |
| `description` | text | No | — | What the payment is for |
| `amount` | numeric(12,2) | No | — | Amount in Naira |
| `method` | payment_method | No | `'card'` | Payment method |
| `status` | payment_status | No | `'pending'` | Payment state |
| `reference` | text (unique) | No | — | Payment gateway reference (e.g., "PAY-2025-001234") |
| `gateway` | text | Yes | — | Gateway name ("paystack", "flutterwave", "manual") |
| `gateway_response` | jsonb | Yes | — | Raw gateway response payload |
| `paid_at` | timestamptz | Yes | — | When payment was confirmed |
| `verified_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who verified |
| `verified_at` | timestamptz | Yes | — | When verified |
| `created_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who recorded (for manual payments) |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Indexes**: `member_id`, `status`, `reference`, `paid_at`

**RLS Policies**:
- Members can SELECT own payments; admins can SELECT all
- Members can INSERT own (initiate payment); admins can INSERT (manual recording)
- Admins (super_admin, financial_secretary) can UPDATE/DELETE

---

### 16. `financial_reports`

Published branch financial reports.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Report ID |
| `title` | text | No | — | Report title |
| `period` | text | No | — | Reporting period (e.g., "Q2 2025", "FY 2024") |
| `type` | financial_report_type | No | — | Report type |
| `amount` | numeric(14,2) | No | `0` | Total amount in the report |
| `report_date` | date | No | — | Date of the report |
| `status` | financial_report_status | No | `'draft'` | Publication state |
| `file_url` | text | Yes | — | PDF document URL |
| `published_at` | timestamptz | Yes | — | When published |
| `created_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who created |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |

**Indexes**: `status`, `type`

**RLS Policies**:
- Any authenticated user can SELECT published reports
- Admins (super_admin, financial_secretary, branch_chairman) can SELECT all (including drafts)
- Admins (super_admin, financial_secretary) can INSERT/UPDATE/DELETE

---

### 17. `good_standing_letters`

Letters issued to members confirming they are in good standing.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Letter ID |
| `member_id` | bigint (FK → members, CASCADE) | No | — | Member who requested/received |
| `letter_number` | text (unique) | No | — | Letter reference (e.g., "LGS-2025-0247") |
| `status` | letter_status | No | `'pending'` | Letter state |
| `eligible` | boolean | No | `false` | Whether member was eligible at issue time |
| `file_url` | text | Yes | — | PDF URL |
| `issued_at` | timestamptz | Yes | — | When issued |
| `expires_at` | timestamptz | Yes | — | Expiry date (default 12 months from settings) |
| `requested_at` | timestamptz | No | `now()` | When member requested |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Indexes**: `member_id`, `status`

**RLS Policies**:
- Members can SELECT own; admins can SELECT all
- Members can INSERT own (request letter); admins can INSERT
- Admins (super_admin, branch_secretary) can UPDATE

---

### 18. `documents`

Branch documents (circulars, reports, election notices, certificates).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Document ID |
| `title` | text | No | — | Document title |
| `type` | document_type | No | — | Document category |
| `description` | text | Yes | — | Document description |
| `file_url` | text | Yes | — | Storage URL |
| `file_size` | bigint | Yes | — | Size in bytes |
| `file_format` | text | Yes | — | File format (e.g., "PDF") |
| `issued_date` | date | No | — | Date issued |
| `expiry_date` | date | Yes | — | Expiry date (if applicable) |
| `downloads` | integer | No | `0` | Download counter |
| `uploaded_by` | bigint (FK → members, SET NULL) | Yes | — | Admin who uploaded |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |

**Indexes**: `type`, `issued_date`

**RLS Policies**:
- Any authenticated user can SELECT (where `deleted_at IS NULL`)
- Admins (super_admin, content_manager, branch_secretary) can INSERT/UPDATE/DELETE

---

### 19. `news_articles`

News and announcements published by admins.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Article ID |
| `title` | text | No | — | Article title |
| `slug` | text (unique) | No | — | URL slug |
| `category` | news_category | No | — | Article category |
| `excerpt` | text | No | — | Short summary |
| `body` | text | Yes | — | Full article content (HTML/markdown) |
| `featured` | boolean | No | `false` | Pinned/featured article |
| `status` | content_status | No | `'draft'` | Publication state |
| `read_time` | text | Yes | — | Estimated read time (e.g., "4 min read") |
| `views` | integer | No | `0` | View counter |
| `author_id` | bigint (FK → members, SET NULL) | Yes | — | Author |
| `published_at` | timestamptz | Yes | — | When published |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |

**Indexes**: `category`, `status`, `published_at`

**RLS Policies**:
- Any authenticated user can SELECT published articles
- Admins (super_admin, content_manager, branch_secretary) can SELECT all (including drafts)
- Admins can INSERT/UPDATE/DELETE

---

### 20. `notifications`

Member-specific notification feed.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Notification ID |
| `member_id` | bigint (FK → members, CASCADE) | No | — | Recipient |
| `type` | notification_type | No | — | Notification type |
| `title` | text | No | — | Notification title |
| `message` | text | No | — | Notification body |
| `read` | boolean | No | `false` | Read status |
| `read_at` | timestamptz | Yes | — | When marked as read |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |

**Indexes**: `member_id`, `(member_id, read)`

**RLS Policies**:
- Members can SELECT/UPDATE/DELETE own
- Admins (super_admin, branch_secretary, content_manager, election_officer) can INSERT (send notifications)

---

### 21. `audit_logs`

Append-only record of all administrative actions. Immutable — no UPDATE or DELETE policies.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigserial (PK) | No | auto | Log ID |
| `actor_id` | bigint (FK → members, SET NULL) | Yes | — | Admin who performed the action |
| `actor_name` | text | No | — | Denormalized actor name (survives member deletion) |
| `actor_role` | text | Yes | — | Role at time of action |
| `action` | text | No | — | Action type (e.g., "MEMBER_APPROVED") |
| `target` | text | Yes | — | Entity affected |
| `target_id` | text | Yes | — | ID of target entity |
| `details` | text | Yes | — | Human-readable description |
| `ip_address` | text | Yes | — | IP address of actor |
| `metadata` | jsonb | Yes | — | Additional structured data |
| `created_at` | timestamptz | No | `now()` | When action occurred |

**Indexes**: `action`, `actor_id`, `created_at`

**RLS Policies**:
- Admins (super_admin, branch_chairman, branch_secretary) can SELECT
- Any authenticated user can INSERT (server-side logging)
- No UPDATE or DELETE — audit logs are immutable

---

## Database Functions

### `update_updated_at_column()`

Trigger function that automatically sets `updated_at = now()` on any row update. Attached as a `BEFORE UPDATE` trigger to all tables with an `updated_at` column.

### `recalculate_attendance_percentage()`

Trigger function that recalculates a member's `attendance_percentage` after an attendance record is inserted or deleted. The percentage is computed as:

```
(attended_completed_meetings / total_completed_meetings) * 100
```

Attached as `AFTER INSERT` and `AFTER DELETE` triggers on the `attendance` table.

### `cast_vote(p_election_id bigint, p_votes jsonb)`

**SECURITY DEFINER** function that handles the entire voting process atomically:

1. Looks up the authenticated member via `auth.uid()`
2. Validates the election exists and is in the `voting` phase
3. Checks the voting window is open (`voting_start <= now() <= voting_end`)
4. Validates membership status is `active`
5. Checks attendance requirement (>= threshold from settings, if `requires_attendance`)
6. Checks financial compliance (if `requires_financial_compliance`)
7. Prevents double voting (checks for existing `vote_receipts` row)
8. Generates a unique receipt number (format: `VR-YYYY-MM-DD-XXXX`)
9. Inserts a `vote_receipts` record (member + election + receipt)
10. Inserts anonymized `votes` records (position → candidate, NO member ID)

**Parameters**:
- `p_election_id` — the election to vote in
- `p_votes` — JSON object mapping position IDs to candidate IDs, e.g. `{"1": "5", "2": "8"}`

**Returns**: JSON with `success`, `receiptNumber`, `timestamp` (or `error` message on failure)

**Granted to**: `authenticated` role

---

## Entity Relationship Summary

```
auth.users
    └── members (user_id)
            ├── member_roles ── roles ── role_permissions ── permissions
            ├── attendance ── meetings
            ├── payments
            ├── good_standing_letters
            ├── notifications
            ├── nominations ── election_positions ── elections
            ├── candidates ── election_positions ── elections
            ├── vote_receipts ── elections
            ├── audit_logs (actor_id)
            ├── meetings (created_by)
            ├── elections (created_by)
            ├── payments (created_by, verified_by)
            ├── financial_reports (created_by)
            ├── documents (uploaded_by)
            ├── news_articles (author_id)
            └── good_standing_letters (member_id)

votes (anonymized — no member link)
    └── elections
    └── election_positions
    └── candidates

settings (standalone key-value)
```

---

## RLS Security Model

All 21 tables have Row Level Security enabled. Access is controlled through role-based policies:

| Role | Access Level |
|------|-------------|
| `super_admin` | Full access to all modules and settings |
| `branch_chairman` | Read access to all modules; write to members, meetings |
| `branch_secretary` | Manage meetings, attendance, content, documents, letters |
| `financial_secretary` | Manage payments and financial reports |
| `election_officer` | Manage elections, candidates, and nominations |
| `content_manager` | Manage news, documents, and notifications |
| `member` | Self-service: own profile, own attendance, own payments, own notifications, own letters; read published news/documents/reports; vote in elections |

**Key security principles**:
1. Members can only access their own data (profile, attendance, payments, notifications, letters, vote receipts)
2. Admin access is verified through `member_roles` join checks in every policy
3. The `votes` table has no SELECT policy — anonymized ballots are never readable via the API
4. Audit logs are append-only (no UPDATE/DELETE policies)
5. All admin checks use `auth.uid()` (never `current_user`)
6. The `cast_vote()` SECURITY DEFINER function validates eligibility server-side before recording votes

---

## Laravel Compatibility Notes

This schema follows Laravel conventions for seamless Eloquent ORM integration:

- **Primary keys**: `bigserial` (maps to `$incrementing = true`, `$keyType = 'int'`)
- **Timestamps**: `created_at`, `updated_at` (maps to `$timestamps = true`); auto-update handled by DB triggers (not needed at ORM level, but compatible)
- **Soft deletes**: `deleted_at` on members, meetings, elections, financial_reports, documents, news_articles (maps to `SoftDeletes` trait)
- **Snake_case**: All column and table names use snake_case (Laravel default)
- **Foreign keys**: Explicitly named with standard conventions (`{table}_id`)
- **Enums**: PostgreSQL enum types — in Laravel, use casts or accessors
- **Pivot tables**: `role_permissions`, `member_roles` follow Laravel naming (`belongsToMany`)
- **Settings**: Key-value pattern suitable for a `Setting` model with `Setting::get('key')` / `Setting::set('key', $value)`
