// ============================================================
// NBA BWARI DIGITAL PORTAL — ADMIN MOCK DATA
// TODO: Replace with Laravel API calls via admin-api.ts
// ============================================================

export const mockAdminUser = {
  id: "ADM-001",
  name: "Barr. Ibrahim Suleiman",
  email: "admin@nbabwari.org",
  phone: "+234 805 111 2222",
  role: "super_admin" as const,
  roleLabel: "Super Admin",
  avatar: null,
  lastLogin: "2025-07-30T07:15:00Z",
};

export const mockAdminStats = {
  totalMembers: 312,
  activeMembers: 287,
  inactiveMembers: 18,
  suspendedMembers: 7,
  pendingApprovals: 9,
  attendanceRate: 72,
  financialCompliance: 81,
  votingParticipation: 68,
  goodStandingCount: 256,
  upcomingMeetings: 2,
  activeElections: 1,
  totalRevenue: 15650000,
  outstandingDues: 3450000,
  monthlyRevenue: [
    { month: "Jan", revenue: 2100000, expenditure: 1800000 },
    { month: "Feb", revenue: 3800000, expenditure: 2100000 },
    { month: "Mar", revenue: 5200000, expenditure: 1950000 },
    { month: "Apr", revenue: 2900000, expenditure: 1700000 },
    { month: "May", revenue: 6100000, expenditure: 2300000 },
    { month: "Jun", revenue: 4300000, expenditure: 1600000 },
    { month: "Jul", revenue: 3500000, expenditure: 1400000 },
  ],
  memberGrowth: [
    { month: "Jan", new: 12, total: 280 },
    { month: "Feb", new: 8, total: 288 },
    { month: "Mar", new: 15, total: 303 },
    { month: "Apr", new: 4, total: 307 },
    { month: "May", new: 9, total: 316 },
    { month: "Jun", new: 6, total: 322 },
    { month: "Jul", new: 3, total: 325 },
  ],
  attendanceTrend: [
    { month: "Jan", rate: 68 },
    { month: "Feb", rate: 72 },
    { month: "Mar", rate: 75 },
    { month: "Apr", rate: 65 },
    { month: "May", rate: 78 },
    { month: "Jun", rate: 80 },
    { month: "Jul", rate: 72 },
  ],
};

export type AdminMember = {
  id: string;
  fullName: string;
  nbaNumber: string;
  email: string;
  phone: string;
  yearCalledToBar: number;
  membershipStatus: "Active" | "Inactive" | "Suspended" | "Pending";
  goodStanding: boolean;
  attendancePercentage: number;
  financialCompliance: boolean;
  joinedAt: string;
  avatar: string | null;
};

export const mockAdminMembers: AdminMember[] = [
  {
    id: "MBR-2024-0042",
    fullName: "Barr. Adaeze Okonkwo",
    nbaNumber: "NBA/ABJ/2019/1847",
    email: "adaeze.okonkwo@lawfirm.ng",
    phone: "+234 803 456 7890",
    yearCalledToBar: 2019,
    membershipStatus: "Active",
    goodStanding: true,
    attendancePercentage: 78,
    financialCompliance: true,
    joinedAt: "2019-11-15",
    avatar: null,
  },
  {
    id: "MBR-2024-0043",
    fullName: "Barr. Chukwuemeka Nwosu",
    nbaNumber: "NBA/ABJ/2010/0234",
    email: "c.nwosu@chambers.ng",
    phone: "+234 805 234 5678",
    yearCalledToBar: 2010,
    membershipStatus: "Active",
    goodStanding: true,
    attendancePercentage: 85,
    financialCompliance: true,
    joinedAt: "2010-10-22",
    avatar: null,
  },
  {
    id: "MBR-2024-0044",
    fullName: "Barr. Fatimah Aliyu-Bello",
    nbaNumber: "NBA/ABJ/2012/0891",
    email: "fatimah.aliyu@lawfirm.ng",
    phone: "+234 802 345 6789",
    yearCalledToBar: 2012,
    membershipStatus: "Active",
    goodStanding: true,
    attendancePercentage: 92,
    financialCompliance: true,
    joinedAt: "2012-09-18",
    avatar: null,
  },
  {
    id: "MBR-2024-0045",
    fullName: "Barr. Olumide Adeyemi",
    nbaNumber: "NBA/ABJ/2008/0112",
    email: "olumide@adeyemichambers.com",
    phone: "+234 807 456 7890",
    yearCalledToBar: 2008,
    membershipStatus: "Active",
    goodStanding: false,
    attendancePercentage: 58,
    financialCompliance: false,
    joinedAt: "2008-11-03",
    avatar: null,
  },
  {
    id: "MBR-2024-0046",
    fullName: "Barr. Ngozi Eze",
    nbaNumber: "NBA/ABJ/2015/0567",
    email: "ngozi.eze@legal.ng",
    phone: "+234 809 567 8901",
    yearCalledToBar: 2015,
    membershipStatus: "Suspended",
    goodStanding: false,
    attendancePercentage: 30,
    financialCompliance: false,
    joinedAt: "2015-10-14",
    avatar: null,
  },
  {
    id: "MBR-2024-0047",
    fullName: "Barr. Tunde Bakare",
    nbaNumber: "NBA/ABJ/2017/0234",
    email: "t.bakare@bakarelaw.ng",
    phone: "+234 803 678 9012",
    yearCalledToBar: 2017,
    membershipStatus: "Active",
    goodStanding: true,
    attendancePercentage: 81,
    financialCompliance: true,
    joinedAt: "2017-11-20",
    avatar: null,
  },
  {
    id: "MBR-2024-0048",
    fullName: "Barr. Aisha Mohammed",
    nbaNumber: "NBA/ABJ/2020/0456",
    email: "aisha.m@lawfirm.ng",
    phone: "+234 805 789 0123",
    yearCalledToBar: 2020,
    membershipStatus: "Pending",
    goodStanding: false,
    attendancePercentage: 0,
    financialCompliance: false,
    joinedAt: "2025-07-28",
    avatar: null,
  },
  {
    id: "MBR-2024-0049",
    fullName: "Barr. Samuel Okafor",
    nbaNumber: "NBA/ABJ/2013/0789",
    email: "s.okafor@okaforlaw.com",
    phone: "+234 802 890 1234",
    yearCalledToBar: 2013,
    membershipStatus: "Active",
    goodStanding: true,
    attendancePercentage: 76,
    financialCompliance: true,
    joinedAt: "2013-10-05",
    avatar: null,
  },
  {
    id: "MBR-2024-0050",
    fullName: "Barr. Grace Ene",
    nbaNumber: "NBA/ABJ/2018/0345",
    email: "grace.ene@legal.ng",
    phone: "+234 807 901 2345",
    yearCalledToBar: 2018,
    membershipStatus: "Inactive",
    goodStanding: false,
    attendancePercentage: 42,
    financialCompliance: false,
    joinedAt: "2018-11-12",
    avatar: null,
  },
  {
    id: "MBR-2024-0051",
    fullName: "Barr. Yusuf Bello",
    nbaNumber: "NBA/ABJ/2011/0567",
    email: "yusuf.bello@bellolaw.ng",
    phone: "+234 809 012 3456",
    yearCalledToBar: 2011,
    membershipStatus: "Pending",
    goodStanding: false,
    attendancePercentage: 0,
    financialCompliance: false,
    joinedAt: "2025-07-29",
    avatar: null,
  },
];

export type AdminMeeting = {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: "upcoming" | "open" | "completed" | "cancelled";
  attendanceCount: number;
  totalMembers: number;
  attendanceOpen: boolean;
};

export const mockAdminMeetings: AdminMeeting[] = [
  {
    id: "mtg-1",
    title: "Monthly General Meeting — July 2025",
    date: "2025-07-30T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "upcoming",
    attendanceCount: 0,
    totalMembers: 312,
    attendanceOpen: false,
  },
  {
    id: "mtg-2",
    title: "Emergency Meeting — AGM Preparation",
    date: "2025-07-15T14:00:00Z",
    venue: "NBA Bwari Branch Secretariat",
    status: "completed",
    attendanceCount: 187,
    totalMembers: 312,
    attendanceOpen: false,
  },
  {
    id: "mtg-3",
    title: "Monthly General Meeting — June 2025",
    date: "2025-06-25T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "completed",
    attendanceCount: 201,
    totalMembers: 312,
    attendanceOpen: false,
  },
  {
    id: "mtg-4",
    title: "Monthly General Meeting — May 2025",
    date: "2025-05-28T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "completed",
    attendanceCount: 178,
    totalMembers: 312,
    attendanceOpen: false,
  },
  {
    id: "mtg-5",
    title: "Continuing Legal Education Seminar",
    date: "2025-05-10T09:00:00Z",
    venue: "Bwari Area Council Secretariat Hall",
    status: "completed",
    attendanceCount: 225,
    totalMembers: 312,
    attendanceOpen: false,
  },
];

export type AdminFinancialReport = {
  id: string;
  title: string;
  period: string;
  type: "income" | "expenditure" | "audit" | "dues";
  amount: number;
  date: string;
  status: "published" | "draft" | "pending";
};

export const mockAdminFinancialReports: AdminFinancialReport[] = [
  { id: "fr-1", title: "Q2 2025 Income Report", period: "Q2 2025", type: "income", amount: 15600000, date: "2025-07-01", status: "published" },
  { id: "fr-2", title: "Q2 2025 Expenditure Report", period: "Q2 2025", type: "expenditure", amount: 9400000, date: "2025-07-01", status: "published" },
  { id: "fr-3", title: "Annual Audit Report 2024", period: "FY 2024", type: "audit", amount: 52000000, date: "2025-01-15", status: "published" },
  { id: "fr-4", title: "Membership Dues Collection — July", period: "July 2025", type: "dues", amount: 3500000, date: "2025-07-31", status: "draft" },
  { id: "fr-5", title: "Q3 2025 Income Report", period: "Q3 2025", type: "income", amount: 0, date: "2025-10-01", status: "pending" },
];

export type AdminPayment = {
  id: string;
  memberName: string;
  memberNbaNumber: string;
  description: string;
  amount: number;
  date: string;
  method: "card" | "bank_transfer" | "cash";
  status: "paid" | "pending" | "failed";
  reference: string;
};

export const mockAdminPayments: AdminPayment[] = [
  { id: "pay-1", memberName: "Barr. Adaeze Okonkwo", memberNbaNumber: "NBA/ABJ/2019/1847", description: "2025 Annual Dues", amount: 50000, date: "2025-01-15", method: "card", status: "paid", reference: "PAY-2025-001234" },
  { id: "pay-2", memberName: "Barr. Chukwuemeka Nwosu", memberNbaNumber: "NBA/ABJ/2010/0234", description: "2025 Annual Dues", amount: 50000, date: "2025-01-20", method: "bank_transfer", status: "paid", reference: "PAY-2025-001235" },
  { id: "pay-3", memberName: "Barr. Fatimah Aliyu-Bello", memberNbaNumber: "NBA/ABJ/2012/0891", description: "2025 Annual Dues + CLE Fee", amount: 60000, date: "2025-02-05", method: "card", status: "paid", reference: "PAY-2025-001236" },
  { id: "pay-4", memberName: "Barr. Olumide Adeyemi", memberNbaNumber: "NBA/ABJ/2008/0112", description: "2025 Annual Dues", amount: 50000, date: "2025-07-10", method: "card", status: "pending", reference: "PAY-2025-001237" },
  { id: "pay-5", memberName: "Barr. Samuel Okafor", memberNbaNumber: "NBA/ABJ/2013/0789", description: "CLE Seminar Fee", amount: 10000, date: "2025-05-10", method: "cash", status: "paid", reference: "PAY-2025-001238" },
  { id: "pay-6", memberName: "Barr. Tunde Bakare", memberNbaNumber: "NBA/ABJ/2017/0234", description: "2025 Annual Dues", amount: 50000, date: "2025-07-28", method: "bank_transfer", status: "failed", reference: "PAY-2025-001239" },
];

export type AdminElection = {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  positions: string[];
  totalVotes: number;
  eligibleVoters: number;
};

export const mockAdminElections: AdminElection[] = [
  {
    id: "elec-1",
    title: "NBA Bwari Branch Executive Elections 2025",
    description: "Annual election for branch executive positions for the 2025/2026 term.",
    status: "upcoming",
    startDate: "2025-08-15T08:00:00Z",
    endDate: "2025-08-15T18:00:00Z",
    positions: ["Branch Chairman", "Vice Chairman", "Secretary", "Financial Secretary", "Welfare Secretary"],
    totalVotes: 0,
    eligibleVoters: 287,
  },
  {
    id: "elec-2",
    title: "NBA National Officers Election 2024",
    description: "National election for NBA national executive positions.",
    status: "completed",
    startDate: "2024-09-01T08:00:00Z",
    endDate: "2024-09-01T18:00:00Z",
    positions: ["NBA President", "General Secretary", "Treasurer"],
    totalVotes: 195,
    eligibleVoters: 280,
  },
];

export type AdminCandidate = {
  id: string;
  electionId: string;
  position: string;
  name: string;
  nbaNumber: string;
  yearCalled: number;
  manifesto: string;
  votes: number;
};

export const mockAdminCandidates: AdminCandidate[] = [
  { id: "cand-1", electionId: "elec-1", position: "Branch Chairman", name: "Barr. Chukwuemeka Nwosu", nbaNumber: "NBA/ABJ/2010/0234", yearCalled: 2010, manifesto: "I pledge to modernize the branch administration.", votes: 0 },
  { id: "cand-2", electionId: "elec-1", position: "Branch Chairman", name: "Barr. Fatimah Aliyu-Bello", nbaNumber: "NBA/ABJ/2012/0891", yearCalled: 2012, manifesto: "My vision is a digitally-forward, financially transparent branch.", votes: 0 },
  { id: "cand-3", electionId: "elec-1", position: "Branch Chairman", name: "Barr. Olumide Adeyemi", nbaNumber: "NBA/ABJ/2008/0112", yearCalled: 2008, manifesto: "Experienced legal practitioner with strong advocacy record.", votes: 0 },
  { id: "cand-4", electionId: "elec-1", position: "Vice Chairman", name: "Barr. Ngozi Eze", nbaNumber: "NBA/ABJ/2015/0567", yearCalled: 2015, manifesto: "Dedicated to member welfare and engagement.", votes: 0 },
  { id: "cand-5", electionId: "elec-1", position: "Secretary", name: "Barr. Tunde Bakare", nbaNumber: "NBA/ABJ/2017/0234", yearCalled: 2017, manifesto: "Committed to transparent record-keeping.", votes: 0 },
];

export type AdminContent = {
  id: string;
  title: string;
  category: "branch_news" | "announcement" | "circular" | "report" | "event";
  excerpt: string;
  date: string;
  status: "published" | "draft";
  author: string;
  views: number;
};

export const mockAdminContent: AdminContent[] = [
  { id: "news-1", title: "NBA Bwari Hosts Successful CLE Seminar on Digital Law", category: "branch_news", excerpt: "Over 200 members attended the continuing legal education seminar.", date: "2025-07-20", status: "published", author: "Barr. Ibrahim Suleiman", views: 1245 },
  { id: "news-2", title: "New Branch Secretariat Office Opens in Bwari", category: "announcement", excerpt: "The Bwari Area Council Branch is proud to announce the opening of its new ultra-modern secretariat.", date: "2025-07-15", status: "published", author: "Barr. Ibrahim Suleiman", views: 892 },
  { id: "news-3", title: "Call for Nominations: 2025 Branch Executive Elections", category: "announcement", excerpt: "Nominations are now open for all positions in the upcoming 2025 elections.", date: "2025-07-10", status: "published", author: "Barr. Ibrahim Suleiman", views: 1567 },
  { id: "news-4", title: "NBA National Body Launches New Legal Aid Initiative", category: "branch_news", excerpt: "The NBA has announced a new legal aid initiative targeting underserved communities.", date: "2025-07-05", status: "published", author: "Barr. Ibrahim Suleiman", views: 634 },
  { id: "news-5", title: "Draft: New Branch Constitution Amendments", category: "circular", excerpt: "Proposed amendments to the branch constitution for member review.", date: "2025-07-28", status: "draft", author: "Barr. Ibrahim Suleiman", views: 0 },
  { id: "news-6", title: "Upcoming: Annual General Meeting 2025", category: "event", excerpt: "The AGM will hold on December 15, 2025 at the Bwari Community Centre.", date: "2025-07-25", status: "draft", author: "Barr. Ibrahim Suleiman", views: 0 },
];

export type AdminDocument = {
  id: string;
  title: string;
  type: "good_standing" | "circular" | "financial_report" | "report" | "election_notice" | "certificate";
  issuedDate: string;
  size: string;
  format: string;
  downloads: number;
  uploadedBy: string;
};

export const mockAdminDocuments: AdminDocument[] = [
  { id: "doc-1", title: "Letter of Good Standing — July 2025", type: "good_standing", issuedDate: "2025-07-01", size: "245 KB", format: "PDF", downloads: 142, uploadedBy: "Barr. Ibrahim Suleiman" },
  { id: "doc-2", title: "NBA Circular No. 15/2025", type: "circular", issuedDate: "2025-07-20", size: "1.2 MB", format: "PDF", downloads: 89, uploadedBy: "Barr. Ibrahim Suleiman" },
  { id: "doc-3", title: "Branch Financial Report Q2 2025", type: "financial_report", issuedDate: "2025-07-01", size: "3.4 MB", format: "PDF", downloads: 56, uploadedBy: "Barr. Ibrahim Suleiman" },
  { id: "doc-4", title: "Annual General Meeting Minutes 2024", type: "report", issuedDate: "2024-12-10", size: "890 KB", format: "PDF", downloads: 203, uploadedBy: "Barr. Ibrahim Suleiman" },
  { id: "doc-5", title: "Election Notice — 2025 Branch Elections", type: "election_notice", issuedDate: "2025-07-25", size: "156 KB", format: "PDF", downloads: 178, uploadedBy: "Barr. Ibrahim Suleiman" },
];

export type AdminAuditLog = {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  details: string;
};

export const mockAdminAuditLogs: AdminAuditLog[] = [
  { id: "log-1", action: "MEMBER_APPROVED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "Barr. Aisha Mohammed", timestamp: "2025-07-30T08:15:00Z", ipAddress: "102.89.45.12", details: "Approved new member registration" },
  { id: "log-2", action: "MEETING_CREATED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "Monthly General Meeting — July 2025", timestamp: "2025-07-29T14:30:00Z", ipAddress: "102.89.45.12", details: "Created new meeting and scheduled for July 30" },
  { id: "log-3", action: "ELECTION_CONFIGURED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "NBA Bwari Branch Executive Elections 2025", timestamp: "2025-07-28T10:00:00Z", ipAddress: "102.89.45.12", details: "Configured election with 5 positions and 3 candidates for Chairman" },
  { id: "log-4", action: "FINANCIAL_REPORT_PUBLISHED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "Q2 2025 Income Report", timestamp: "2025-07-01T09:00:00Z", ipAddress: "102.89.45.12", details: "Published Q2 2025 income report" },
  { id: "log-5", action: "MEMBER_SUSPENDED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "Barr. Ngozi Eze", timestamp: "2025-06-20T16:45:00Z", ipAddress: "102.89.45.12", details: "Suspended due to non-compliance with financial obligations" },
  { id: "log-6", action: "DOCUMENT_UPLOADED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "NBA Circular No. 15/2025", timestamp: "2025-07-20T11:20:00Z", ipAddress: "102.89.45.12", details: "Uploaded circular document (1.2 MB PDF)" },
  { id: "log-7", action: "CONTENT_PUBLISHED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "NBA Bwari Hosts Successful CLE Seminar", timestamp: "2025-07-20T10:00:00Z", ipAddress: "102.89.45.12", details: "Published branch news article" },
  { id: "log-8", action: "ATTENDANCE_CLOSED", actor: "Barr. Ibrahim Suleiman", actorRole: "Super Admin", target: "Emergency Meeting — AGM Preparation", timestamp: "2025-07-15T16:00:00Z", ipAddress: "102.89.45.12", details: "Closed attendance with 187/312 members recorded" },
];

export const mockAdminRoles = [
  { id: "role-1", name: "Super Admin", description: "Full access to all modules and settings", memberCount: 2, permissions: ["all"] },
  { id: "role-2", name: "Branch Chairman", description: "Oversight access to all branch modules", memberCount: 1, permissions: ["members.read", "attendance.*", "financials.*", "elections.*", "content.*"] },
  { id: "role-3", name: "Branch Secretary", description: "Manage meetings, attendance, and content", memberCount: 1, permissions: ["members.read", "attendance.*", "content.*"] },
  { id: "role-4", name: "Financial Secretary", description: "Manage financial reports and payments", memberCount: 1, permissions: ["financials.*", "members.read"] },
  { id: "role-5", name: "Election Officer", description: "Manage elections and candidates", memberCount: 1, permissions: ["elections.*"] },
  { id: "role-6", name: "Content Manager", description: "Manage news, circulars, and documents", memberCount: 2, permissions: ["content.*", "documents.*"] },
  { id: "role-7", name: "Lawyer (Member)", description: "Standard member access to portal", memberCount: 304, permissions: ["self.*"] },
];
