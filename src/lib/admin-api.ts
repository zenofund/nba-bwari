// ============================================================
// NBA BWARI DIGITAL PORTAL — ADMIN API Layer
// TODO: Replace mock implementations with real Laravel API calls
// Base URL: process.env.VITE_API_BASE_URL || 'https://api.nbabwari.org/api/v1/admin'
// All admin endpoints require JWT Bearer token with admin role
// ============================================================

import {
  mockAdminUser,
  mockAdminStats,
  mockAdminMembers,
  mockAdminMeetings,
  mockAdminFinancialReports,
  mockAdminPayments,
  mockAdminElections,
  mockAdminCandidates,
  mockAdminContent,
  mockAdminDocuments,
  mockAdminAuditLogs,
  mockAdminRoles,
} from "@/lib/admin-mock-data";
import type {
  AdminMember,
  AdminMeeting,
  AdminFinancialReport,
  AdminPayment,
  AdminElection,
  AdminCandidate,
  AdminContent,
  AdminDocument,
} from "@/lib/admin-mock-data";

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ============================================================
// ADMIN AUTH ENDPOINTS
// TODO: POST /admin/auth/login
// TODO: POST /admin/auth/logout
// TODO: POST /admin/auth/refresh-token
// TODO: GET  /admin/auth/me
// TODO: PUT  /admin/auth/password
// ============================================================

export const adminAuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    await delay(800);
    // TODO: POST /admin/auth/login
    if (credentials.email && credentials.password) {
      return { user: mockAdminUser, token: "mock-admin-jwt-token-xyz" };
    }
    throw new Error("Invalid admin credentials");
  },

  getMe: async () => {
    await delay(300);
    // TODO: GET /admin/auth/me
    return mockAdminUser;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    await delay(600);
    // TODO: PUT /admin/auth/password
    console.log("Change password:", data);
    return { success: true };
  },

  logout: async () => {
    await delay(300);
    // TODO: POST /admin/auth/logout
    return { success: true };
  },
};

// ============================================================
// ADMIN ANALYTICS / DASHBOARD ENDPOINTS
// TODO: GET /admin/analytics/overview
// TODO: GET /admin/analytics/member-growth
// TODO: GET /admin/analytics/attendance-trend
// TODO: GET /admin/analytics/revenue
// TODO: GET /admin/analytics/voting-stats
// ============================================================

export const adminAnalyticsApi = {
  getOverview: async () => {
    await delay();
    // TODO: GET /admin/analytics/overview
    return mockAdminStats;
  },

  getMemberGrowth: async () => {
    await delay();
    // TODO: GET /admin/analytics/member-growth
    return mockAdminStats.memberGrowth;
  },

  getAttendanceTrend: async () => {
    await delay();
    // TODO: GET /admin/analytics/attendance-trend
    return mockAdminStats.attendanceTrend;
  },

  getRevenue: async () => {
    await delay();
    // TODO: GET /admin/analytics/revenue
    return mockAdminStats.monthlyRevenue;
  },
};

// ============================================================
// ADMIN MEMBER MANAGEMENT ENDPOINTS
// TODO: GET    /admin/members                  — list (paginated, filterable)
// TODO: GET    /admin/members/{id}             — single member
// TODO: POST   /admin/members                  — create/register member
// TODO: PUT    /admin/members/{id}             — update member
// TODO: PATCH  /admin/members/{id}/status       — approve/suspend/activate
// TODO: PATCH  /admin/members/{id}/approve      — approve pending member
// TODO: PATCH  /admin/members/{id}/suspend      — suspend member
// TODO: PATCH  /admin/members/{id}/activate     — re-activate member
// TODO: DELETE /admin/members/{id}             — remove member
// TODO: GET    /admin/members/export            — export CSV/Excel
// TODO: GET    /admin/members/pending           — pending approvals list
// ============================================================

export const adminMembersApi = {
  list: async (filters?: { status?: string; search?: string }) => {
    await delay();
    // TODO: GET /admin/members?status={filters.status}&search={filters.search}
    let result = [...mockAdminMembers];
    if (filters?.status && filters.status !== "all") {
      result = result.filter((m) => m.membershipStatus.toLowerCase() === filters!.status!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) => m.fullName.toLowerCase().includes(q) || m.nbaNumber.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }
    return result;
  },

  get: async (id: string): Promise<AdminMember> => {
    await delay();
    // TODO: GET /admin/members/{id}
    return mockAdminMembers.find((m) => m.id === id) || mockAdminMembers[0];
  },

  create: async (data: Partial<AdminMember>) => {
    await delay(1000);
    // TODO: POST /admin/members
    console.log("Create member:", data);
    return { success: true, member: { ...mockAdminMembers[0], ...data, id: `MBR-${Date.now()}` } };
  },

  update: async (id: string, data: Partial<AdminMember>) => {
    await delay(800);
    // TODO: PUT /admin/members/{id}
    console.log("Update member:", id, data);
    return { success: true };
  },

  approve: async (id: string) => {
    await delay(800);
    // TODO: PATCH /admin/members/{id}/approve
    console.log("Approve member:", id);
    return { success: true };
  },

  suspend: async (id: string) => {
    await delay(800);
    // TODO: PATCH /admin/members/{id}/suspend
    console.log("Suspend member:", id);
    return { success: true };
  },

  activate: async (id: string) => {
    await delay(800);
    // TODO: PATCH /admin/members/{id}/activate
    console.log("Activate member:", id);
    return { success: true };
  },

  remove: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/members/{id}
    console.log("Remove member:", id);
    return { success: true };
  },

  export: async (format: "csv" | "excel") => {
    await delay(1200);
    // TODO: GET /admin/members/export?format={format}
    console.log("Export members:", format);
    return { url: "#" };
  },

  getPending: async () => {
    await delay();
    // TODO: GET /admin/members/pending
    return mockAdminMembers.filter((m) => m.membershipStatus === "Pending");
  },
};

// ============================================================
// ADMIN ATTENDANCE / MEETING MANAGEMENT ENDPOINTS
// TODO: GET    /admin/meetings                  — list all meetings
// TODO: GET    /admin/meetings/{id}             — single meeting
// TODO: POST   /admin/meetings                  — create meeting
// TODO: PUT    /admin/meetings/{id}             — update meeting
// TODO: DELETE /admin/meetings/{id}             — cancel/delete meeting
// TODO: PATCH  /admin/meetings/{id}/open         — open attendance
// TODO: PATCH  /admin/meetings/{id}/close        — close attendance
// TODO: GET    /admin/meetings/{id}/attendance   — attendance records
// TODO: GET    /admin/meetings/{id}/export       — export attendance CSV
// TODO: POST   /admin/meetings/{id}/manual-attend — manually mark member
// ============================================================

export const adminMeetingsApi = {
  list: async () => {
    await delay();
    // TODO: GET /admin/meetings
    return mockAdminMeetings;
  },

  get: async (id: string): Promise<AdminMeeting> => {
    await delay();
    // TODO: GET /admin/meetings/{id}
    return mockAdminMeetings.find((m) => m.id === id) || mockAdminMeetings[0];
  },

  create: async (data: Partial<AdminMeeting>) => {
    await delay(1000);
    // TODO: POST /admin/meetings
    console.log("Create meeting:", data);
    return { success: true, meeting: { ...mockAdminMeetings[0], ...data, id: `mtg-${Date.now()}` } };
  },

  update: async (id: string, data: Partial<AdminMeeting>) => {
    await delay(800);
    // TODO: PUT /admin/meetings/{id}
    console.log("Update meeting:", id, data);
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/meetings/{id}
    console.log("Delete meeting:", id);
    return { success: true };
  },

  openAttendance: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/meetings/{id}/open
    console.log("Open attendance:", id);
    return { success: true };
  },

  closeAttendance: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/meetings/{id}/close
    console.log("Close attendance:", id);
    return { success: true };
  },

  getAttendance: async (_meetingId: string) => {
    await delay();
    // TODO: GET /admin/meetings/{_meetingId}/attendance
    return mockAdminMembers.slice(0, 10).map((m, i) => ({
      member: m,
      attended: i < 7,
      method: i < 7 ? (["qr", "fingerprint", "pin"] as const)[i % 3] : null,
      timestamp: i < 7 ? "2025-07-15T14:05:00Z" : null,
    }));
  },

  exportAttendance: async (_meetingId: string) => {
    await delay(1000);
    // TODO: GET /admin/meetings/{_meetingId}/export
    console.log("Export attendance:", _meetingId);
    return { url: "#" };
  },

  manualAttend: async (meetingId: string, memberId: string) => {
    await delay(500);
    // TODO: POST /admin/meetings/{meetingId}/manual-attend
    console.log("Manual attend:", meetingId, memberId);
    return { success: true };
  },
};

// ============================================================
// ADMIN FINANCIAL MANAGEMENT ENDPOINTS
// TODO: GET    /admin/financial-reports          — list reports
// TODO: GET    /admin/financial-reports/{id}     — single report
// TODO: POST   /admin/financial-reports          — create/publish report
// TODO: PUT    /admin/financial-reports/{id}     — update report
// TODO: DELETE /admin/financial-reports/{id}     — delete report
// TODO: GET    /admin/payments                   — list all payments
// TODO: GET    /admin/payments/{id}             — single payment
// TODO: POST   /admin/payments                   — record manual payment
// TODO: PATCH  /admin/payments/{id}/verify       — verify pending payment
// TODO: GET    /admin/payments/export            — export payments CSV
// TODO: GET    /admin/financials/summary         — financial dashboard summary
// ============================================================

export const adminFinancialApi = {
  getReports: async () => {
    await delay();
    // TODO: GET /admin/financial-reports
    return mockAdminFinancialReports;
  },

  getReport: async (id: string): Promise<AdminFinancialReport> => {
    await delay();
    // TODO: GET /admin/financial-reports/{id}
    return mockAdminFinancialReports.find((r) => r.id === id) || mockAdminFinancialReports[0];
  },

  createReport: async (data: Partial<AdminFinancialReport>) => {
    await delay(1000);
    // TODO: POST /admin/financial-reports
    console.log("Create report:", data);
    return { success: true };
  },

  updateReport: async (id: string, data: Partial<AdminFinancialReport>) => {
    await delay(800);
    // TODO: PUT /admin/financial-reports/{id}
    console.log("Update report:", id, data);
    return { success: true };
  },

  deleteReport: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/financial-reports/{id}
    console.log("Delete report:", id);
    return { success: true };
  },

  getPayments: async (filters?: { status?: string }) => {
    await delay();
    // TODO: GET /admin/payments?status={filters.status}
    let result = [...mockAdminPayments];
    if (filters?.status && filters.status !== "all") {
      result = result.filter((p) => p.status === filters!.status);
    }
    return result;
  },

  recordPayment: async (data: Partial<AdminPayment>) => {
    await delay(1000);
    // TODO: POST /admin/payments
    console.log("Record payment:", data);
    return { success: true };
  },

  verifyPayment: async (id: string) => {
    await delay(800);
    // TODO: PATCH /admin/payments/{id}/verify
    console.log("Verify payment:", id);
    return { success: true };
  },

  exportPayments: async () => {
    await delay(1000);
    // TODO: GET /admin/payments/export
    return { url: "#" };
  },

  getSummary: async () => {
    await delay();
    // TODO: GET /admin/financials/summary
    return {
      totalRevenue: mockAdminStats.totalRevenue,
      outstandingDues: mockAdminStats.outstandingDues,
      monthlyData: mockAdminStats.monthlyRevenue,
    };
  },
};

// ============================================================
// ADMIN ELECTIONS MANAGEMENT ENDPOINTS
// TODO: GET    /admin/elections                 — list elections
// TODO: GET    /admin/elections/{id}            — single election
// TODO: POST   /admin/elections                 — create election
// TODO: PUT    /admin/elections/{id}            — update election
// TODO: DELETE /admin/elections/{id}            — delete election
// TODO: PATCH  /admin/elections/{id}/activate   — activate election
// TODO: PATCH  /admin/elections/{id}/close       — close election
// TODO: GET    /admin/elections/{id}/candidates  — list candidates
// TODO: POST   /admin/elections/{id}/candidates  — add candidate
// TODO: PUT    /admin/elections/{id}/candidates/{candId} — update candidate
// TODO: DELETE /admin/elections/{id}/candidates/{candId} — remove candidate
// TODO: GET    /admin/elections/{id}/results     — view results
// TODO: GET    /admin/elections/{id}/eligibility — configure eligibility
// TODO: PUT    /admin/elections/{id}/eligibility — update eligibility config
// ============================================================

export const adminElectionsApi = {
  list: async () => {
    await delay();
    // TODO: GET /admin/elections
    return mockAdminElections;
  },

  get: async (id: string): Promise<AdminElection> => {
    await delay();
    // TODO: GET /admin/elections/{id}
    return mockAdminElections.find((e) => e.id === id) || mockAdminElections[0];
  },

  create: async (data: Partial<AdminElection>) => {
    await delay(1000);
    // TODO: POST /admin/elections
    console.log("Create election:", data);
    return { success: true };
  },

  update: async (id: string, data: Partial<AdminElection>) => {
    await delay(800);
    // TODO: PUT /admin/elections/{id}
    console.log("Update election:", id, data);
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/elections/{id}
    console.log("Delete election:", id);
    return { success: true };
  },

  activate: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/elections/{id}/activate
    console.log("Activate election:", id);
    return { success: true };
  },

  close: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/elections/{id}/close
    console.log("Close election:", id);
    return { success: true };
  },

  getCandidates: async (electionId: string) => {
    await delay();
    // TODO: GET /admin/elections/{electionId}/candidates
    return mockAdminCandidates.filter((c) => c.electionId === electionId);
  },

  addCandidate: async (electionId: string, data: Partial<AdminCandidate>) => {
    await delay(800);
    // TODO: POST /admin/elections/{electionId}/candidates
    console.log("Add candidate:", electionId, data);
    return { success: true };
  },

  updateCandidate: async (electionId: string, candId: string, data: Partial<AdminCandidate>) => {
    await delay(800);
    // TODO: PUT /admin/elections/{electionId}/candidates/{candId}
    console.log("Update candidate:", electionId, candId, data);
    return { success: true };
  },

  removeCandidate: async (electionId: string, candId: string) => {
    await delay(600);
    // TODO: DELETE /admin/elections/{electionId}/candidates/{candId}
    console.log("Remove candidate:", electionId, candId);
    return { success: true };
  },

  getResults: async (electionId: string) => {
    await delay();
    // TODO: GET /admin/elections/{electionId}/results
    return mockAdminCandidates.filter((c) => c.electionId === electionId);
  },
};

// ============================================================
// ADMIN CONTENT MANAGEMENT ENDPOINTS
// TODO: GET    /admin/content                   — list content items
// TODO: GET    /admin/content/{id}              — single content item
// TODO: POST   /admin/content                   — create article/circular/event
// TODO: PUT    /admin/content/{id}              — update content
// TODO: DELETE /admin/content/{id}              — delete content
// TODO: PATCH  /admin/content/{id}/publish       — publish content
// TODO: PATCH  /admin/content/{id}/unpublish     — unpublish/draft content
// TODO: POST   /admin/content/{id}/attachment   — upload attachment
// ============================================================

export const adminContentApi = {
  list: async (filters?: { category?: string; status?: string }) => {
    await delay();
    // TODO: GET /admin/content?category={filters.category}&status={filters.status}
    let result = [...mockAdminContent];
    if (filters?.category && filters.category !== "all") {
      result = result.filter((c) => c.category === filters!.category);
    }
    if (filters?.status && filters.status !== "all") {
      result = result.filter((c) => c.status === filters!.status);
    }
    return result;
  },

  get: async (id: string): Promise<AdminContent> => {
    await delay();
    // TODO: GET /admin/content/{id}
    return mockAdminContent.find((c) => c.id === id) || mockAdminContent[0];
  },

  create: async (data: Partial<AdminContent>) => {
    await delay(1000);
    // TODO: POST /admin/content
    console.log("Create content:", data);
    return { success: true };
  },

  update: async (id: string, data: Partial<AdminContent>) => {
    await delay(800);
    // TODO: PUT /admin/content/{id}
    console.log("Update content:", id, data);
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/content/{id}
    console.log("Delete content:", id);
    return { success: true };
  },

  publish: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/content/{id}/publish
    console.log("Publish content:", id);
    return { success: true };
  },

  unpublish: async (id: string) => {
    await delay(500);
    // TODO: PATCH /admin/content/{id}/unpublish
    console.log("Unpublish content:", id);
    return { success: true };
  },
};

// ============================================================
// ADMIN DOCUMENTS MANAGEMENT ENDPOINTS
// TODO: GET    /admin/documents                 — list documents
// TODO: GET    /admin/documents/{id}           — single document
// TODO: POST   /admin/documents                 — upload document
// TODO: PUT    /admin/documents/{id}           — update document metadata
// TODO: DELETE /admin/documents/{id}           — delete document
// TODO: GET    /admin/documents/{id}/download  — download document
// ============================================================

export const adminDocumentsApi = {
  list: async (filters?: { type?: string }) => {
    await delay();
    // TODO: GET /admin/documents?type={filters.type}
    let result = [...mockAdminDocuments];
    if (filters?.type && filters.type !== "all") {
      result = result.filter((d) => d.type === filters!.type);
    }
    return result;
  },

  get: async (id: string): Promise<AdminDocument> => {
    await delay();
    // TODO: GET /admin/documents/{id}
    return mockAdminDocuments.find((d) => d.id === id) || mockAdminDocuments[0];
  },

  upload: async (data: Partial<AdminDocument>) => {
    await delay(1500);
    // TODO: POST /admin/documents (multipart/form-data)
    console.log("Upload document:", data);
    return { success: true };
  },

  update: async (id: string, data: Partial<AdminDocument>) => {
    await delay(800);
    // TODO: PUT /admin/documents/{id}
    console.log("Update document:", id, data);
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/documents/{id}
    console.log("Delete document:", id);
    return { success: true };
  },

  download: async (id: string) => {
    await delay(600);
    // TODO: GET /admin/documents/{id}/download
    console.log("Download document:", id);
    return { url: "#" };
  },
};

// ============================================================
// ADMIN AUDIT LOG ENDPOINTS
// TODO: GET /admin/audit-logs          — list logs (paginated, filterable)
// TODO: GET /admin/audit-logs/{id}     — single log entry
// TODO: GET /admin/audit-logs/export   — export logs CSV
// ============================================================

export const adminAuditApi = {
  list: async (filters?: { action?: string; search?: string }) => {
    await delay();
    // TODO: GET /admin/audit-logs?action={filters.action}
    let result = [...mockAdminAuditLogs];
    if (filters?.action && filters.action !== "all") {
      result = result.filter((l) => l.action.toLowerCase().includes(filters!.action!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) => l.actor.toLowerCase().includes(q) || l.target.toLowerCase().includes(q) || l.action.toLowerCase().includes(q)
      );
    }
    return result;
  },

  export: async () => {
    await delay(1000);
    // TODO: GET /admin/audit-logs/export
    return { url: "#" };
  },
};

// ============================================================
// ADMIN ROLES & PERMISSIONS ENDPOINTS
// TODO: GET    /admin/roles              — list roles
// TODO: GET    /admin/roles/{id}         — single role
// TODO: POST   /admin/roles              — create role
// TODO: PUT    /admin/roles/{id}         — update role
// TODO: DELETE /admin/roles/{id}         — delete role
// TODO: PUT    /admin/roles/{id}/permissions — update permissions
// TODO: GET    /admin/users              — list admin users
// TODO: POST   /admin/users              — create admin user
// TODO: PATCH  /admin/users/{id}/role    — assign role
// ============================================================

export const adminRolesApi = {
  list: async () => {
    await delay();
    // TODO: GET /admin/roles
    return mockAdminRoles;
  },

  create: async (data: { name: string; description: string; permissions: string[] }) => {
    await delay(800);
    // TODO: POST /admin/roles
    console.log("Create role:", data);
    return { success: true };
  },

  update: async (id: string, data: { name?: string; description?: string; permissions?: string[] }) => {
    await delay(800);
    // TODO: PUT /admin/roles/{id}
    console.log("Update role:", id, data);
    return { success: true };
  },

  delete: async (id: string) => {
    await delay(600);
    // TODO: DELETE /admin/roles/{id}
    console.log("Delete role:", id);
    return { success: true };
  },
};

// ============================================================
// ADMIN SETTINGS ENDPOINTS
// TODO: GET  /admin/settings           — get branch settings
// TODO: PUT  /admin/settings           — update branch settings
// TODO: GET  /admin/settings/notifications — notification config
// TODO: PUT  /admin/settings/notifications — update notification config
// TODO: GET  /admin/settings/security   — security settings
// TODO: PUT  /admin/settings/security   — update security settings
// ============================================================

export const adminSettingsApi = {
  get: async () => {
    await delay();
    // TODO: GET /admin/settings
    return {
      branchName: "NBA Bwari Area Council Branch",
      branchAddress: "Area 3, Bwari, Abuja",
      branchPhone: "+234 805 111 2222",
      branchEmail: "info@nbabwari.org",
      annualDuesAmount: 50000,
      attendanceThreshold: 75,
      votingEligibilityThreshold: 75,
      goodStandingValidityMonths: 12,
      enableBiometricLogin: true,
      enableEmailNotifications: true,
      enableSmsNotifications: true,
      enablePushNotifications: true,
      sessionTimeoutMinutes: 30,
      maxLoginAttempts: 5,
    };
  },

  update: async (data: Record<string, unknown>) => {
    await delay(800);
    // TODO: PUT /admin/settings
    console.log("Update settings:", data);
    return { success: true };
  },
};
