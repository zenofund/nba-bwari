// ============================================================
// NBA BWARI DIGITAL PORTAL — API Layer
// Base URL: import.meta.env.VITE_API_BASE_URL || 'https://api.nbabwari.org/api/v1'
// All functions are mocked. Replace each with a real HTTP call
// (axios / fetch) when the Laravel backend is ready.
// Every endpoint is documented with its HTTP method, path, and
// required auth scope. [admin] = requires admin role.
// ============================================================

import {
  mockMember,
  mockNotifications,
  mockMeetings,
  mockElections,
  mockCandidates,
  mockFinancials,
  mockDocuments,
  mockNewsItems,
  mockAdminStats,
  mockAttendanceHistory,
} from "@/lib/mock-data";

// Simulate network delay for realistic mock
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ============================================================
// AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────
// POST   /auth/login             — member email/phone/id login
// POST   /auth/register          — new member registration request
// POST   /auth/logout            — invalidate session token
// POST   /auth/refresh-token     — exchange refresh token for new access token
// POST   /auth/forgot-password   — send reset link to registered email
// POST   /auth/reset-password    — confirm reset with token + new password
// POST   /auth/verify-otp        — verify OTP for 2FA / phone verification
// POST   /auth/biometric-login   — biometric challenge-response login
// GET    /auth/me                — return authenticated member profile
// ============================================================

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    await delay(800);
    // TODO: POST /auth/login
    // Body: { identifier, password }
    // Returns: { member, token, refreshToken, expiresAt }
    if (credentials.identifier && credentials.password) {
      return { member: mockMember, token: "mock-jwt-token-xyz", refreshToken: "mock-refresh-xyz" };
    }
    throw new Error("Invalid credentials");
  },

  register: async (data: Record<string, unknown>) => {
    await delay(1000);
    // TODO: POST /auth/register
    // Body: { nbaNumber, supremeCourtNumber, fullName, email, phone, yearCalledToBar, branch }
    // Returns: { message, memberId } — status pending admin verification
    console.log("Register data:", data);
    return { message: "Registration submitted. Await admin verification." };
  },

  logout: async () => {
    await delay(300);
    // TODO: POST /auth/logout
    // Header: Authorization: Bearer {token}
    // Returns: { message }
    return { message: "Logged out successfully" };
  },

  refreshToken: async (refreshToken: string) => {
    await delay(400);
    // TODO: POST /auth/refresh-token
    // Body: { refreshToken }
    // Returns: { token, refreshToken, expiresAt }
    console.log("Refresh token:", refreshToken);
    return { token: "new-mock-jwt-token", refreshToken: "new-mock-refresh", expiresAt: Date.now() + 3600000 };
  },

  forgotPassword: async (email: string) => {
    await delay(800);
    // TODO: POST /auth/forgot-password
    // Body: { email }
    // Returns: { message }
    console.log("Forgot password:", email);
    return { message: "Password reset link sent to your email." };
  },

  resetPassword: async (data: { token: string; password: string }) => {
    await delay(800);
    // TODO: POST /auth/reset-password
    // Body: { token, password, passwordConfirmation }
    // Returns: { message }
    console.log("Reset password:", data);
    return { message: "Password reset successful." };
  },
};

// ============================================================
// MEMBER ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /members/me              — authenticated member profile
// PUT    /members/me              — update profile fields
// POST   /members/me/avatar       — upload profile photo (multipart)
// GET    /members/me/eligibility  — full compliance & eligibility summary
// GET    /members/{id}            — fetch any member by ID [admin]
// GET    /members                 — paginated member list [admin]
// POST   /members                 — create member record [admin]
// PATCH  /members/{id}/status     — change status (active/suspended) [admin]
// PATCH  /members/{id}/approve    — approve pending registration [admin]
// DELETE /members/{id}            — remove member record [admin]
// ============================================================

export const memberApi = {
  getProfile: async () => {
    await delay();
    // TODO: GET /members/me
    return mockMember;
  },

  updateProfile: async (data: Partial<typeof mockMember>) => {
    await delay(800);
    // TODO: PUT /members/me
    // Body: { firstName, lastName, email, phone, residentialAddress, ... }
    // Returns: updated member object
    console.log("Update profile:", data);
    return { ...mockMember, ...data };
  },

  uploadAvatar: async (_file: File) => {
    await delay(1200);
    // TODO: POST /members/me/avatar
    // Body: FormData { avatar: File }
    // Returns: { avatarUrl }
    return { avatarUrl: "https://example.com/avatar.jpg" };
  },

  getEligibility: async () => {
    await delay();
    // TODO: GET /members/me/eligibility
    // Returns: { membershipValid, financialCompliant, attendanceMet, goodStanding, votingEligible }
    return {
      membershipValid: true,
      financialCompliant: mockMember.financialCompliance,
      attendanceMet: mockMember.attendancePercentage >= 75,
      goodStanding: mockMember.goodStandingStatus,
      votingEligible: mockMember.votingEligibility,
    };
  },

  getMembers: async (params?: { page?: number; status?: string; search?: string }) => {
    await delay();
    // TODO: GET /members?page={page}&status={status}&search={search}
    console.log("Get members:", params);
    return { data: [mockMember], meta: { total: 1, page: 1, perPage: 20 } };
  },
};

// ============================================================
// ATTENDANCE ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /meetings                          — list all meetings
// GET    /meetings/{id}                     — meeting details
// POST   /meetings                          — create meeting [admin]
// PUT    /meetings/{id}                     — update meeting [admin]
// DELETE /meetings/{id}                     — delete meeting [admin]
// PATCH  /meetings/{id}/open-attendance     — open attendance window [admin]
// PATCH  /meetings/{id}/close-attendance    — close attendance window [admin]
// POST   /meetings/{id}/attend              — mark own attendance (QR/pin/biometric)
// GET    /meetings/{id}/attendance          — full attendance list [admin]
// GET    /members/me/attendance             — my attendance history
// GET    /members/me/attendance/stats       — my attendance stats + percentage
// GET    /members/me/attendance/history     — monthly attendance chart data
// ============================================================

export const attendanceApi = {
  getMeetings: async () => {
    await delay();
    // TODO: GET /meetings
    return mockMeetings;
  },

  getMeeting: async (meetingId: string) => {
    await delay();
    // TODO: GET /meetings/{meetingId}
    return mockMeetings.find((m) => m.id === meetingId);
  },

  markAttendance: async (meetingId: string, method: "qr" | "fingerprint" | "pin", payload?: string) => {
    await delay(1200);
    // TODO: POST /meetings/{meetingId}/attend
    // Body: { method: "qr"|"fingerprint"|"pin", payload: <qr_data|pin> }
    // Returns: { success, message, meeting }
    console.log("Mark attendance:", meetingId, method, payload);
    return { success: true, message: "Attendance marked successfully" };
  },

  getMyAttendanceStats: async () => {
    await delay();
    // TODO: GET /members/me/attendance/stats
    // Returns: { percentage, totalMeetings, attended, missed, history }
    return {
      percentage: mockMember.attendancePercentage,
      totalMeetings: 14,
      attended: 11,
      missed: 3,
      history: mockAttendanceHistory,
    };
  },
};

// ============================================================
// ELECTIONS ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /elections                             — list all elections (with member status)
// GET    /elections/active                      — elections currently open for voting
// GET    /elections/{id}                        — single election detail
// GET    /elections/{id}/ballot                 — ballot structure: positions + candidates
// GET    /elections/{id}/candidates             — all candidates for an election
// GET    /elections/{id}/candidates/{candidateId} — single candidate profile
// GET    /elections/{id}/eligibility            — check if authenticated member can vote
// POST   /elections/{id}/vote                   — cast vote (all positions in one request)
// GET    /elections/{id}/receipt                — get voting receipt (post-vote)
// GET    /elections/{id}/results                — published results (post-election)
// GET    /elections/{id}/turnout                — anonymous turnout stats (count only)
// GET    /elections/{id}/nominations            — list of confirmed nominees per position
// POST   /elections/{id}/nominations            — self-nominate for a position
// DELETE /elections/{id}/nominations/{nominationId} — withdraw own nomination
//
// Admin-only:
// POST   /elections                             — create election [admin]
// PUT    /elections/{id}                        — update election details [admin]
// PATCH  /elections/{id}/phase                  — advance phase (nomination→voting→tallying→results) [admin]
// DELETE /elections/{id}                        — cancel/delete election [admin]
// POST   /elections/{id}/candidates             — add candidate [admin]
// PUT    /elections/{id}/candidates/{id}        — update candidate [admin]
// DELETE /elections/{id}/candidates/{id}        — remove candidate [admin]
// POST   /elections/{id}/publish-results        — publish final results [admin]
// GET    /elections/{id}/votes/export           — export anonymised vote log [admin]
// GET    /elections/{id}/audit-log              — full election audit trail [admin]
// POST   /elections/{id}/notify                 — send ballot-open notification to eligible members [admin]
// ============================================================

export type VoteBallot = Record<string, string>; // { position: candidateId }

export type EligibilityResult = {
  eligible: boolean;
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
};

export type VoteReceipt = {
  receiptNumber: string;
  electionId: string;
  electionTitle: string;
  timestamp: string;
  positionsVoted: string[];
  confirmationMessage: string;
};

export const electionApi = {
  getElections: async () => {
    await delay();
    // TODO: GET /elections
    // Returns: Election[] with memberEligible, hasVoted, voterTurnout
    return mockElections;
  },

  getActiveElections: async () => {
    await delay();
    // TODO: GET /elections/active
    // Returns: Election[] where phase === "voting" AND votingEnd > now
    return mockElections.filter((e) => e.phase === "voting");
  },

  getElection: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}
    // Returns: full Election object with nested positions array
    return mockElections.find((e) => e.id === electionId) ?? null;
  },

  getBallot: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/ballot
    // Returns: { election, positions: [{ name, instruction, minChoices, maxChoices, candidates[] }] }
    const election = mockElections.find((e) => e.id === electionId);
    const candidates = mockCandidates.filter((c) => c.electionId === electionId);
    const positions = election?.positions.map((pos) => ({
      name: pos,
      instruction: `Select one candidate for ${pos}`,
      minChoices: 1,
      maxChoices: 1,
      candidates: candidates.filter((c) => c.position === pos),
    })) ?? [];
    return { election, positions };
  },

  getCandidates: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/candidates
    // Returns: Candidate[] for this election
    return mockCandidates.filter((c) => c.electionId === electionId);
  },

  getCandidate: async (electionId: string, candidateId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/candidates/{candidateId}
    // Returns: full Candidate profile including qualifications, proposer, seconder
    return mockCandidates.find((c) => c.electionId === electionId && c.id === candidateId) ?? null;
  },

  checkEligibility: async (electionId: string): Promise<EligibilityResult> => {
    await delay();
    // TODO: GET /elections/{electionId}/eligibility
    // Returns: { eligible, checks: [{ label, passed, detail }] }
    // Server validates against member record, not client state
    const election = mockElections.find((e) => e.id === electionId);
    const attendancePassed = mockMember.attendancePercentage >= 75;
    const financePassed = mockMember.financialCompliance;
    const goodStandingPassed = mockMember.goodStandingStatus;
    const membershipPassed = mockMember.membershipStatus === "Active";
    const notAlreadyVoted = !election?.hasVoted;

    const checks = [
      {
        label: "Active Membership",
        passed: membershipPassed,
        detail: membershipPassed ? "Your membership is active and in good order." : "Your membership is not active.",
      },
      {
        label: `Attendance ≥ 75% (yours: ${mockMember.attendancePercentage}%)`,
        passed: attendancePassed,
        detail: attendancePassed
          ? `You have met the minimum attendance requirement.`
          : `Your attendance of ${mockMember.attendancePercentage}% is below the required 75%.`,
      },
      {
        label: "Financial Compliance",
        passed: financePassed,
        detail: financePassed ? "All dues and levies are fully paid." : "You have outstanding dues that must be settled.",
      },
      {
        label: "Good Standing",
        passed: goodStandingPassed,
        detail: goodStandingPassed ? "You are in good standing with the branch." : "You are not currently in good standing.",
      },
      {
        label: "Has Not Yet Voted",
        passed: notAlreadyVoted,
        detail: notAlreadyVoted ? "You have not yet cast a vote in this election." : "You have already voted in this election.",
      },
    ];

    return {
      eligible: checks.every((c) => c.passed),
      checks,
    };
  },

  castVote: async (electionId: string, votes: VoteBallot) => {
    await delay(1800);
    // TODO: POST /elections/{electionId}/vote
    // Body: { votes: { "Branch Chairman": "cand-1", "Vice Chairman": "cand-4", ... } }
    // Server validates: eligibility, one-vote-per-member, voting window still open
    // Returns: { success, receiptNumber, timestamp }
    // Note: server MUST NOT store which member voted for which candidate.
    //       Only store that the member voted (for turnout) and an anonymised ballot.
    console.log("Cast vote:", electionId, votes);
    const receiptNumber = `VR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      receiptNumber,
      timestamp: new Date().toISOString(),
      message: "Your vote has been recorded anonymously and securely.",
    };
  },

  getVotingReceipt: async (electionId: string): Promise<VoteReceipt | null> => {
    await delay();
    // TODO: GET /elections/{electionId}/receipt
    // Returns voting receipt for authenticated member (only if they have voted)
    // The receipt does NOT include which candidates were selected — only that a vote was cast
    const election = mockElections.find((e) => e.id === electionId);
    if (!election?.hasVoted || !election.voteReceiptNumber) return null;
    return {
      receiptNumber: election.voteReceiptNumber,
      electionId,
      electionTitle: election.title,
      timestamp: election.votingEnd, // actual vote time would be stored server-side
      positionsVoted: election.positions,
      confirmationMessage: "Your vote was recorded anonymously. This receipt confirms participation only — no candidate selections are stored against your identity.",
    };
  },

  getResults: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/results
    // Only accessible when phase === "results" (resultsPublishedAt is set)
    // Returns: { election, positions: [{ name, candidates: [{ ...candidate, votes, percentage, isWinner }] }], turnout }
    const election = mockElections.find((e) => e.id === electionId);
    if (!election || election.phase !== "results") return null;
    const candidates = mockCandidates.filter((c) => c.electionId === electionId);
    const positions = election.positions.map((pos) => ({
      name: pos,
      candidates: candidates.filter((c) => c.position === pos).sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    }));
    return { election, positions, turnout: election.voterTurnout };
  },

  getTurnout: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/turnout
    // Returns: { voted, eligible, percentage }
    // Does NOT reveal who voted — aggregate counts only
    const election = mockElections.find((e) => e.id === electionId);
    if (!election) return null;
    const { voted, eligible } = election.voterTurnout;
    return { voted, eligible, percentage: Math.round((voted / eligible) * 100) };
  },

  getNominations: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/nominations
    // Returns: Candidate[] for elections in nomination phase
    // Nominations are public (not anonymous)
    return mockCandidates.filter((c) => c.electionId === electionId);
  },

  submitNomination: async (electionId: string, positionId: string, statement: string) => {
    await delay(1200);
    // TODO: POST /elections/{electionId}/nominations
    // Body: { position, statement (nomination speech / manifesto draft) }
    // Server validates: nomination period is open, member is eligible, not already nominated for this position
    // Returns: { nominationId, message }
    console.log("Submit nomination:", electionId, positionId, statement);
    return { nominationId: `nom-${Date.now()}`, message: "Your nomination has been submitted and is pending review by the Electoral Committee." };
  },

  withdrawNomination: async (electionId: string, nominationId: string) => {
    await delay(800);
    // TODO: DELETE /elections/{electionId}/nominations/{nominationId}
    // Only the nominating member can withdraw, and only before the nomination deadline
    // Returns: { success, message }
    console.log("Withdraw nomination:", electionId, nominationId);
    return { success: true, message: "Your nomination has been withdrawn." };
  },
};

// ============================================================
// FINANCIAL ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /members/me/finances          — dues summary & compliance status
// GET    /members/me/payments          — paginated payment history
// GET    /members/me/payments/{id}     — single payment record
// POST   /payments/initiate            — start Paystack/Flutterwave payment
// POST   /payments/verify              — verify payment after redirect (webhook)
// GET    /payments/invoice/{ref}       — download PDF invoice
// GET    /financial-reports            — list of published branch financial reports
// GET    /financial-reports/{id}       — single financial report
// GET    /financial-reports/{id}/download — download report PDF
// POST   /financial-reports            — publish new report [admin]
// ============================================================

export const financialApi = {
  getMyFinances: async () => {
    await delay();
    // TODO: GET /members/me/finances
    return mockFinancials;
  },

  getMyPayments: async (params?: { page?: number; year?: number }) => {
    await delay();
    // TODO: GET /members/me/payments?page={page}&year={year}
    console.log("Get payments:", params);
    return { data: mockFinancials.payments, meta: { total: mockFinancials.payments.length } };
  },

  getFinancialReports: async () => {
    await delay();
    // TODO: GET /financial-reports
    return [];
  },

  initiatePayment: async (amount: number, description: string, reference?: string) => {
    await delay(800);
    // TODO: POST /payments/initiate
    // Body: { amount, description, reference, callbackUrl }
    // Returns: { paymentUrl, reference } — redirect member to paymentUrl
    console.log("Initiate payment:", amount, description, reference);
    return { paymentUrl: "#", reference: reference ?? `PAY-${Date.now()}` };
  },

  verifyPayment: async (reference: string) => {
    await delay(1000);
    // TODO: POST /payments/verify
    // Body: { reference }
    // Returns: { success, payment } — called after Paystack redirects back
    console.log("Verify payment:", reference);
    return { success: true, payment: { reference, status: "paid", amount: 50000 } };
  },
};

// ============================================================
// GOOD STANDING ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /good-standing/check                  — check current eligibility
// POST   /good-standing/request                — request a letter (triggers generation)
// GET    /good-standing/letters                — list all letters issued to member
// GET    /good-standing/letters/{id}           — single letter details
// GET    /good-standing/letters/{id}/download  — download letter as PDF
// POST   /good-standing/letters/{id}/share     — generate shareable link / email copy
// ============================================================

export const goodStandingApi = {
  checkEligibility: async () => {
    await delay();
    // TODO: GET /good-standing/check
    return {
      eligible: true,
      membershipValid: true,
      financialCompliant: true,
      attendanceRequirementMet: true,
      reasons: [] as string[],
    };
  },

  requestLetter: async () => {
    await delay(1000);
    // TODO: POST /good-standing/request
    // Returns: { success, letterId, downloadUrl, expiresAt }
    return { success: true, letterId: "LGS-2025-0247", message: "Letter generated successfully" };
  },

  getLetters: async () => {
    await delay();
    // TODO: GET /good-standing/letters
    return [];
  },

  downloadLetter: async (letterId: string) => {
    await delay(800);
    // TODO: GET /good-standing/letters/{letterId}/download
    // Returns: { url } — signed S3/Cloudinary URL valid for 60 minutes
    console.log("Download letter:", letterId);
    return { url: "#" };
  },
};

// ============================================================
// DOCUMENTS ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /documents                    — list all documents (filtered by member access)
// GET    /documents/{id}               — single document metadata
// GET    /documents/{id}/download      — download file (returns signed URL)
// POST   /documents                    — upload document [admin]
// PUT    /documents/{id}               — update document metadata [admin]
// DELETE /documents/{id}               — remove document [admin]
// GET    /documents/categories         — list document category types
// ============================================================

export const documentsApi = {
  getDocuments: async (params?: { type?: string; search?: string }) => {
    await delay();
    // TODO: GET /documents?type={type}&search={search}
    console.log("Get documents:", params);
    return mockDocuments;
  },

  downloadDocument: async (documentId: string) => {
    await delay(600);
    // TODO: GET /documents/{documentId}/download
    // Returns: { url } — pre-signed URL for direct download
    console.log("Download document:", documentId);
    return { url: "#" };
  },
};

// ============================================================
// NEWS & ANNOUNCEMENTS ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /news                         — paginated news feed
// GET    /news/{id}                    — single news article (full body)
// POST   /news                         — publish article [admin]
// PUT    /news/{id}                    — update article [admin]
// DELETE /news/{id}                    — remove article [admin]
// POST   /news/{id}/pin                — pin article to top [admin]
// ============================================================

export const newsApi = {
  getNews: async (params?: { category?: string; page?: number }) => {
    await delay();
    // TODO: GET /news?category={category}&page={page}
    console.log("Get news:", params);
    return mockNewsItems;
  },

  getNewsItem: async (newsId: string) => {
    await delay();
    // TODO: GET /news/{newsId}
    // Returns: full article including body HTML/markdown
    return mockNewsItems.find((n) => n.id === newsId);
  },
};

// ============================================================
// NOTIFICATIONS ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /notifications                        — notification feed for member
// GET    /notifications/unread-count           — unread count (for badge polling)
// PATCH  /notifications/{id}/read              — mark one as read
// PATCH  /notifications/read-all               — mark all as read
// DELETE /notifications/{id}                   — delete one notification
// DELETE /notifications/clear-all              — clear all notifications
// GET    /notifications/settings               — push/email preferences
// PUT    /notifications/settings               — update preferences
// ============================================================

export const notificationsApi = {
  getNotifications: async () => {
    await delay();
    // TODO: GET /notifications
    return mockNotifications;
  },

  getUnreadCount: async () => {
    await delay(200);
    // TODO: GET /notifications/unread-count
    // Returns: { count } — lightweight endpoint for badge polling
    return { count: mockNotifications.filter((n) => !n.read).length };
  },

  markAsRead: async (notificationId: string) => {
    await delay(300);
    // TODO: PATCH /notifications/{notificationId}/read
    console.log("Mark as read:", notificationId);
    return { success: true };
  },

  markAllAsRead: async () => {
    await delay(400);
    // TODO: PATCH /notifications/read-all
    return { success: true };
  },

  deleteNotification: async (notificationId: string) => {
    await delay(300);
    // TODO: DELETE /notifications/{notificationId}
    console.log("Delete notification:", notificationId);
    return { success: true };
  },
};

// ============================================================
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────
// GET    /admin/stats                          — dashboard KPIs [admin]
// GET    /admin/members                        — full member list with filters [admin]
// PATCH  /admin/members/{id}/approve           — approve registration [admin]
// PATCH  /admin/members/{id}/suspend           — suspend member [admin]
// PATCH  /admin/members/{id}/reinstate         — reinstate suspended member [admin]
// GET    /admin/attendance/export              — export attendance CSV [admin]
// POST   /admin/meetings                       — create meeting [admin]
// GET    /admin/audit-logs                     — paginated audit log [admin]
// GET    /admin/audit-logs/export              — export audit log CSV [admin]
// GET    /admin/financial-reports              — list branch reports [admin]
// POST   /admin/financial-reports              — publish new report [admin]
// GET    /admin/roles                          — list admin roles [admin]
// POST   /admin/roles/{memberId}              — assign admin role to member [admin]
// ============================================================

export const adminApi = {
  getStats: async () => {
    await delay();
    // TODO: GET /admin/stats
    return mockAdminStats;
  },

  approveMember: async (memberId: string) => {
    await delay(800);
    // TODO: PATCH /admin/members/{memberId}/approve
    console.log("Approve member:", memberId);
    return { success: true };
  },

  suspendMember: async (memberId: string, reason: string) => {
    await delay(800);
    // TODO: PATCH /admin/members/{memberId}/suspend
    // Body: { reason }
    console.log("Suspend member:", memberId, reason);
    return { success: true };
  },

  exportAttendance: async (meetingId?: string) => {
    await delay(1200);
    // TODO: GET /admin/attendance/export?meetingId={meetingId}
    // Returns: { url } — signed CSV download URL
    console.log("Export attendance:", meetingId);
    return { url: "#" };
  },
};
