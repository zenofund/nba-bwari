// ============================================================
// NBA BWARI DIGITAL PORTAL — API Layer
// TODO: Replace mock implementations with real Laravel API calls
// Base URL: process.env.VITE_API_BASE_URL || 'https://api.nbabwari.org/api/v1'
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
// TODO: POST /auth/login
// TODO: POST /auth/register
// TODO: POST /auth/logout
// TODO: POST /auth/refresh-token
// TODO: POST /auth/forgot-password
// TODO: POST /auth/reset-password
// TODO: POST /auth/verify-otp
// TODO: POST /auth/biometric-login
// ============================================================

export const authApi = {
  login: async (credentials: { identifier: string; password: string }) => {
    await delay(800);
    // TODO: POST /auth/login
    // return axios.post('/auth/login', credentials);
    if (credentials.identifier && credentials.password) {
      return { member: mockMember, token: "mock-jwt-token-xyz", refreshToken: "mock-refresh-xyz" };
    }
    throw new Error("Invalid credentials");
  },

  register: async (data: Record<string, unknown>) => {
    await delay(1000);
    // TODO: POST /auth/register
    console.log("Register data:", data);
    return { message: "Registration submitted. Await admin verification." };
  },

  logout: async () => {
    await delay(300);
    // TODO: POST /auth/logout
    return { message: "Logged out successfully" };
  },
};

// ============================================================
// MEMBER ENDPOINTS
// TODO: GET /members/me
// TODO: PUT /members/me
// TODO: POST /members/me/avatar
// TODO: GET /members/{id}  [admin]
// TODO: GET /members  [admin]
// TODO: POST /members  [admin]
// TODO: PATCH /members/{id}/status  [admin]
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
    console.log("Update profile:", data);
    return { ...mockMember, ...data };
  },

  getMembers: async () => {
    await delay();
    // TODO: GET /members  [admin]
    return [mockMember];
  },
};

// ============================================================
// ATTENDANCE ENDPOINTS
// TODO: GET /meetings
// TODO: GET /meetings/{id}
// TODO: POST /meetings  [admin]
// TODO: PATCH /meetings/{id}/open-attendance  [admin]
// TODO: PATCH /meetings/{id}/close-attendance  [admin]
// TODO: POST /meetings/{id}/attend
// TODO: GET /meetings/{id}/attendance  [admin]
// TODO: GET /members/me/attendance
// TODO: GET /members/me/attendance/stats
// ============================================================

export const attendanceApi = {
  getMeetings: async () => {
    await delay();
    // TODO: GET /meetings
    return mockMeetings;
  },

  markAttendance: async (meetingId: string, method: "qr" | "fingerprint" | "pin") => {
    await delay(1200);
    // TODO: POST /meetings/{meetingId}/attend
    console.log("Mark attendance:", meetingId, method);
    return { success: true, message: "Attendance marked successfully" };
  },

  getMyAttendanceStats: async () => {
    await delay();
    // TODO: GET /members/me/attendance/stats
    return {
      percentage: mockMember.attendancePercentage,
      totalMeetings: 14,
      attended: 11,
      history: mockAttendanceHistory,
    };
  },
};

// ============================================================
// ELECTIONS ENDPOINTS
// TODO: GET /elections
// TODO: GET /elections/{id}
// TODO: GET /elections/{id}/candidates
// TODO: POST /elections/{id}/vote
// TODO: GET /elections/{id}/results  [admin / post-election]
// TODO: POST /elections  [admin]
// TODO: PUT /elections/{id}  [admin]
// TODO: POST /elections/{id}/candidates  [admin]
// ============================================================

export const electionApi = {
  getElections: async () => {
    await delay();
    // TODO: GET /elections
    return mockElections;
  },

  getCandidates: async (electionId: string) => {
    await delay();
    // TODO: GET /elections/{electionId}/candidates
    return mockCandidates.filter((c) => c.electionId === electionId);
  },

  castVote: async (electionId: string, candidateId: string, position: string) => {
    await delay(1500);
    // TODO: POST /elections/{electionId}/vote
    console.log("Cast vote:", electionId, candidateId, position);
    return { success: true, message: "Vote cast successfully. This is anonymous and final." };
  },

  verifyEligibility: async (_electionId: string) => {
    await delay();
    // TODO: GET /elections/{_electionId}/eligibility
    return { eligible: true, reasons: [] };
  },
};

// ============================================================
// FINANCIAL ENDPOINTS
// TODO: GET /members/me/finances
// TODO: GET /members/me/payments
// TODO: POST /payments/initiate
// TODO: POST /payments/verify  (Paystack/Flutterwave callback)
// TODO: GET /financial-reports
// TODO: GET /financial-reports/{id}
// TODO: POST /financial-reports  [admin]
// ============================================================

export const financialApi = {
  getMyFinances: async () => {
    await delay();
    // TODO: GET /members/me/finances
    return mockFinancials;
  },

  getFinancialReports: async () => {
    await delay();
    // TODO: GET /financial-reports
    return [];
  },

  initiatePayment: async (amount: number, description: string) => {
    await delay(800);
    // TODO: POST /payments/initiate
    console.log("Initiate payment:", amount, description);
    return { paymentUrl: "#", reference: "PAY-MOCK-12345" };
  },
};

// ============================================================
// GOOD STANDING ENDPOINTS
// TODO: GET /good-standing/check
// TODO: POST /good-standing/request
// TODO: GET /good-standing/letters
// TODO: GET /good-standing/letters/{id}/download
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
      reasons: [],
    };
  },

  requestLetter: async () => {
    await delay(1000);
    // TODO: POST /good-standing/request
    return { success: true, letterId: "LGS-2025-0247", message: "Letter generated successfully" };
  },

  downloadLetter: async (letterId: string) => {
    await delay(800);
    // TODO: GET /good-standing/letters/{letterId}/download
    console.log("Download letter:", letterId);
    return { url: "#" };
  },
};

// ============================================================
// DOCUMENTS ENDPOINTS
// TODO: GET /documents
// TODO: GET /documents/{id}
// TODO: GET /documents/{id}/download
// TODO: POST /documents  [admin]
// TODO: DELETE /documents/{id}  [admin]
// ============================================================

export const documentsApi = {
  getDocuments: async () => {
    await delay();
    // TODO: GET /documents
    return mockDocuments;
  },

  downloadDocument: async (documentId: string) => {
    await delay(600);
    // TODO: GET /documents/{documentId}/download
    console.log("Download document:", documentId);
    return { url: "#" };
  },
};

// ============================================================
// NEWS & ANNOUNCEMENTS ENDPOINTS
// TODO: GET /news
// TODO: GET /news/{id}
// TODO: POST /news  [admin]
// TODO: PUT /news/{id}  [admin]
// TODO: DELETE /news/{id}  [admin]
// ============================================================

export const newsApi = {
  getNews: async () => {
    await delay();
    // TODO: GET /news
    return mockNewsItems;
  },

  getNewsItem: async (newsId: string) => {
    await delay();
    // TODO: GET /news/{newsId}
    return mockNewsItems.find((n) => n.id === newsId);
  },
};

// ============================================================
// NOTIFICATIONS ENDPOINTS
// TODO: GET /notifications
// TODO: PATCH /notifications/{id}/read
// TODO: PATCH /notifications/read-all
// TODO: DELETE /notifications/{id}
// TODO: GET /notifications/settings
// TODO: PUT /notifications/settings
// ============================================================

export const notificationsApi = {
  getNotifications: async () => {
    await delay();
    // TODO: GET /notifications
    return mockNotifications;
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
};

// ============================================================
// ADMIN ENDPOINTS
// TODO: GET /admin/stats
// TODO: GET /admin/members
// TODO: PATCH /admin/members/{id}/approve
// TODO: PATCH /admin/members/{id}/suspend
// TODO: GET /admin/attendance/export
// TODO: POST /admin/meetings
// TODO: GET /admin/audit-logs
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
};
