// ============================================================
// NBA BWARI DIGITAL PORTAL — MOCK DATA
// TODO: Replace with Laravel API calls via api.ts
// ============================================================

export const mockMember = {
  id: "MBR-2024-0042",
  nbaNumber: "NBA/ABJ/2019/1847",
  supremeCourtNumber: "SCN/2019/4521",
  fullName: "Barr. Adaeze Okonkwo",
  firstName: "Adaeze",
  lastName: "Okonkwo",
  email: "adaeze.okonkwo@lawfirm.ng",
  phone: "+234 803 456 7890",
  yearCalledToBar: 2019,
  membershipStatus: "Active" as const,
  goodStandingStatus: true,
  attendancePercentage: 78,
  votingEligibility: true,
  financialCompliance: true,
  avatar: null,
  branch: "Bwari Area Council Branch",
  residentialAddress: "15 Gwarimpa Estate, Abuja",
  role: "member" as const,
  lastLogin: "2025-07-29T08:30:00Z",
  joinedAt: "2019-11-15T00:00:00Z",
};

export const mockNotifications = [
  {
    id: "notif-1",
    type: "meeting" as const,
    title: "General Meeting Tomorrow",
    message: "Monthly general meeting scheduled for tomorrow at 10:00 AM — Bwari Community Centre",
    createdAt: "2025-07-29T09:00:00Z",
    read: false,
  },
  {
    id: "notif-2",
    type: "election" as const,
    title: "Election Ballot Now Open",
    message: "Voting for NBA Bwari Branch Executive Elections 2025 is now open. Cast your vote before 6:00 PM today.",
    createdAt: "2025-07-28T14:30:00Z",
    read: false,
  },
  {
    id: "notif-3",
    type: "finance" as const,
    title: "Annual Dues Reminder",
    message: "2025 annual dues of ₦50,000 are due on 31st August 2025.",
    createdAt: "2025-07-27T10:00:00Z",
    read: true,
  },
  {
    id: "notif-4",
    type: "document" as const,
    title: "Good Standing Letter Ready",
    message: "Your Letter of Good Standing for July 2025 is ready for download.",
    createdAt: "2025-07-26T16:00:00Z",
    read: true,
  },
  {
    id: "notif-5",
    type: "announcement" as const,
    title: "New Circular Published",
    message: "NBA National Secretariat Circular No. 15/2025 has been published.",
    createdAt: "2025-07-25T09:00:00Z",
    read: true,
  },
];

export const mockMeetings = [
  {
    id: "mtg-1",
    title: "Monthly General Meeting — July 2025",
    date: "2025-07-30T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "upcoming" as const,
    attendanceOpen: false,
    attendanceCount: 0,
    totalMembers: 312,
  },
  {
    id: "mtg-2",
    title: "Emergency Meeting — AGM Preparation",
    date: "2025-07-15T14:00:00Z",
    venue: "NBA Bwari Branch Secretariat",
    status: "completed" as const,
    attendanceOpen: false,
    attendanceCount: 187,
    totalMembers: 312,
    memberAttended: true,
  },
  {
    id: "mtg-3",
    title: "Monthly General Meeting — June 2025",
    date: "2025-06-25T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "completed" as const,
    attendanceOpen: false,
    attendanceCount: 201,
    totalMembers: 312,
    memberAttended: true,
  },
  {
    id: "mtg-4",
    title: "Monthly General Meeting — May 2025",
    date: "2025-05-28T10:00:00Z",
    venue: "Bwari Community Centre, Area 1",
    status: "completed" as const,
    attendanceOpen: false,
    attendanceCount: 178,
    totalMembers: 312,
    memberAttended: false,
  },
  {
    id: "mtg-5",
    title: "Continuing Legal Education Seminar",
    date: "2025-05-10T09:00:00Z",
    venue: "Bwari Area Council Secretariat Hall",
    status: "completed" as const,
    attendanceOpen: false,
    attendanceCount: 225,
    totalMembers: 312,
    memberAttended: true,
  },
];

export const mockAttendanceHistory = [
  { month: "Jan", attended: 1, total: 1 },
  { month: "Feb", attended: 1, total: 1 },
  { month: "Mar", attended: 1, total: 2 },
  { month: "Apr", attended: 1, total: 2 },
  { month: "May", attended: 1, total: 2 },
  { month: "Jun", attended: 2, total: 2 },
  { month: "Jul", attended: 1, total: 1 },
];

// ============================================================
// ELECTIONS MOCK DATA
// ============================================================

export type ElectionPhase = "nomination" | "voting" | "tallying" | "results";
export type ElectionStatus = "upcoming" | "open" | "completed";

export type Election = {
  id: string;
  title: string;
  description: string;
  phase: ElectionPhase;
  status: ElectionStatus;
  nominationStart: string;
  nominationDeadline: string;
  votingStart: string;
  votingEnd: string;
  resultsPublishedAt: string | null;
  positions: string[];
  memberEligible: boolean;
  eligibilityFailReasons: string[];
  hasVoted: boolean;
  voteReceiptNumber: string | null;
  voterTurnout: { voted: number; eligible: number };
  totalCandidates: number;
  isAnonymous: boolean;
  requiresAttendance: boolean;
  requiresFinancialCompliance: boolean;
};

export const mockElections: Election[] = [
  {
    id: "elec-1",
    title: "NBA Bwari Branch Executive Elections 2025",
    description: "Annual election for branch executive committee positions for the 2025/2026 term. All eligible members in good standing with a minimum 75% attendance record are entitled to vote. Voting is secret and your choices are fully anonymous.",
    phase: "voting",
    status: "open",
    nominationStart: "2025-07-01T08:00:00Z",
    nominationDeadline: "2025-08-01T23:59:00Z",
    votingStart: "2025-08-15T08:00:00Z",
    votingEnd: "2025-08-15T18:00:00Z",
    resultsPublishedAt: null,
    positions: ["Branch Chairman", "Vice Chairman", "Secretary", "Financial Secretary", "Welfare Secretary"],
    memberEligible: true,
    eligibilityFailReasons: [],
    hasVoted: false,
    voteReceiptNumber: null,
    voterTurnout: { voted: 134, eligible: 287 },
    totalCandidates: 11,
    isAnonymous: true,
    requiresAttendance: true,
    requiresFinancialCompliance: true,
  },
  {
    id: "elec-2",
    title: "NBA Bwari Welfare Committee By-Election 2025",
    description: "By-election to fill two vacant positions on the branch Welfare Committee. Nominations are currently open — eligible members may declare their candidacy before the deadline. Voting will commence on 5 September 2025.",
    phase: "nomination",
    status: "upcoming",
    nominationStart: "2025-08-01T08:00:00Z",
    nominationDeadline: "2025-08-25T23:59:00Z",
    votingStart: "2025-09-05T08:00:00Z",
    votingEnd: "2025-09-05T18:00:00Z",
    resultsPublishedAt: null,
    positions: ["Welfare Officer", "Assistant Welfare Officer"],
    memberEligible: true,
    eligibilityFailReasons: [],
    hasVoted: false,
    voteReceiptNumber: null,
    voterTurnout: { voted: 0, eligible: 287 },
    totalCandidates: 3,
    isAnonymous: true,
    requiresAttendance: true,
    requiresFinancialCompliance: true,
  },
  {
    id: "elec-3",
    title: "NBA National Officers Election 2024",
    description: "National election for NBA executive committee positions for the 2024/2025 term. Members across all branches participated. Results were officially published by the National Electoral Committee on 2 September 2024.",
    phase: "results",
    status: "completed",
    nominationStart: "2024-07-01T08:00:00Z",
    nominationDeadline: "2024-08-15T23:59:00Z",
    votingStart: "2024-09-01T08:00:00Z",
    votingEnd: "2024-09-01T18:00:00Z",
    resultsPublishedAt: "2024-09-02T10:00:00Z",
    positions: ["NBA President", "General Secretary", "Treasurer"],
    memberEligible: true,
    eligibilityFailReasons: [],
    hasVoted: true,
    voteReceiptNumber: "VR-2024-09-01-8247",
    voterTurnout: { voted: 201, eligible: 298 },
    totalCandidates: 7,
    isAnonymous: true,
    requiresAttendance: true,
    requiresFinancialCompliance: true,
  },
];

export type Candidate = {
  id: string;
  electionId: string;
  position: string;
  name: string;
  nbaNumber: string;
  yearCalled: number;
  practiceArea: string;
  photo: null;
  manifesto: string;
  qualifications: string[];
  proposer: string;
  seconder: string;
  // Populated for completed elections
  votes?: number;
  percentage?: number;
  isWinner?: boolean;
};

export const mockCandidates: Candidate[] = [
  // ── elec-1: Branch Chairman (3 candidates) ────────────────
  {
    id: "cand-1",
    electionId: "elec-1",
    position: "Branch Chairman",
    name: "Barr. Chukwuemeka Nwosu",
    nbaNumber: "NBA/ABJ/2010/0234",
    yearCalled: 2010,
    practiceArea: "Commercial & Corporate Law",
    photo: null,
    manifesto: "I pledge to modernise branch administration through digital systems, improve member welfare packages, and represent our interests at the national level with integrity. Having served on the welfare subcommittee for three years, I understand our branch's challenges intimately. My priority will be securing a permanent secretariat building, reducing administrative delays, and growing our CLE programme.",
    qualifications: ["LL.B (UNILAG)", "B.L (NLS)", "LL.M Corporate Law (UNIBEN)", "15 years in practice"],
    proposer: "Barr. Uche Emezie",
    seconder: "Barr. Grace Okpe",
  },
  {
    id: "cand-2",
    electionId: "elec-1",
    position: "Branch Chairman",
    name: "Barr. Fatimah Aliyu-Bello",
    nbaNumber: "NBA/ABJ/2012/0891",
    yearCalled: 2012,
    practiceArea: "Family & Human Rights Law",
    photo: null,
    manifesto: "My vision is a digitally-forward, financially transparent branch that serves every member with excellence. I will introduce a member app for real-time attendance and dues tracking, negotiate CLE partnerships with law schools, and establish a legal aid clinic in the Bwari community — elevating our branch's profile nationally while serving our people locally.",
    qualifications: ["LL.B (ABU Zaria)", "B.L (NLS)", "Certificate in Legal Management (CILT)", "13 years in practice"],
    proposer: "Barr. Hadiza Bello",
    seconder: "Barr. Sunday Eze",
  },
  {
    id: "cand-3",
    electionId: "elec-1",
    position: "Branch Chairman",
    name: "Barr. Olumide Adeyemi",
    nbaNumber: "NBA/ABJ/2008/0112",
    yearCalled: 2008,
    practiceArea: "Criminal Defense & Constitutional Law",
    photo: null,
    manifesto: "With 17 years of practice and a strong advocacy record, I will fight for better branch infrastructure, reduced unnecessary dues, and a robust CLE programme. I served as Vice Chairman from 2021 to 2023 and know exactly what it takes to run this branch effectively. Member welfare, financial accountability, and inter-branch relations are my three pillars.",
    qualifications: ["LL.B (OAU Ile-Ife)", "B.L (NLS)", "LL.M (UNILAG)", "Former Vice Chairman 2021–2023", "17 years in practice"],
    proposer: "Barr. Segun Abiola",
    seconder: "Barr. Nneka Chukwu",
  },

  // ── elec-1: Vice Chairman (2 candidates) ──────────────────
  {
    id: "cand-4",
    electionId: "elec-1",
    position: "Vice Chairman",
    name: "Barr. Ngozi Eze",
    nbaNumber: "NBA/ABJ/2015/0567",
    yearCalled: 2015,
    practiceArea: "Property & Real Estate Law",
    photo: null,
    manifesto: "As Vice Chairman I will focus on member engagement — increasing meeting attendance, creating mentorship circles for young lawyers, and ensuring every member feels heard and valued. I bring 10 years of branch participation and a genuine passion for our collective growth.",
    qualifications: ["LL.B (UNIBEN)", "B.L (NLS)", "Certificate in Property Law (IBLP)", "10 years in practice"],
    proposer: "Barr. Amaka Onwe",
    seconder: "Barr. Felix Nduka",
  },
  {
    id: "cand-5",
    electionId: "elec-1",
    position: "Vice Chairman",
    name: "Barr. Kabir Yusuf",
    nbaNumber: "NBA/ABJ/2013/0445",
    yearCalled: 2013,
    practiceArea: "Corporate & Banking Law",
    photo: null,
    manifesto: "I will serve as a bridge between the chairman and the membership — ensuring policies are explained clearly, complaints are addressed swiftly, and every member has a fair voice in branch decisions. My background in corporate governance will bring structure and accountability to branch operations.",
    qualifications: ["LL.B (BUK)", "B.L (NLS)", "MBA (ABU Business School)", "12 years in practice"],
    proposer: "Barr. Sani Garba",
    seconder: "Barr. Maryam Abubakar",
  },

  // ── elec-1: Secretary (2 candidates) ──────────────────────
  {
    id: "cand-6",
    electionId: "elec-1",
    position: "Secretary",
    name: "Barr. Tunde Bakare",
    nbaNumber: "NBA/ABJ/2017/0234",
    yearCalled: 2017,
    practiceArea: "Civil Litigation",
    photo: null,
    manifesto: "Transparent, accurate, and timely record-keeping is the backbone of any functioning branch. I will digitise our correspondence records, publish meeting minutes within 72 hours, and maintain an open registry of all branch decisions. Accountability through documentation.",
    qualifications: ["LL.B (UNILAG)", "B.L (NLS)", "Certificate in Legal Records Management", "8 years in practice"],
    proposer: "Barr. Dayo Omotunde",
    seconder: "Barr. Nike Adewale",
  },
  {
    id: "cand-7",
    electionId: "elec-1",
    position: "Secretary",
    name: "Barr. Blessing Okoro",
    nbaNumber: "NBA/ABJ/2018/0902",
    yearCalled: 2018,
    practiceArea: "Labour & Employment Law",
    photo: null,
    manifesto: "I will bring precision and innovation to the secretary role. My goal is paperless branch administration — digital agendas, cloud-based minutes, and a member communication portal. I will ensure every member is informed of branch activities in real time.",
    qualifications: ["LL.B (ESUT)", "B.L (NLS)", "Diploma in HR Management", "7 years in practice"],
    proposer: "Barr. Chika Eze",
    seconder: "Barr. Emeka Obi",
  },

  // ── elec-1: Financial Secretary (2 candidates) ────────────
  {
    id: "cand-8",
    electionId: "elec-1",
    position: "Financial Secretary",
    name: "Barr. Ibrahim Suleiman",
    nbaNumber: "NBA/ABJ/2014/0678",
    yearCalled: 2014,
    practiceArea: "Tax & Revenue Law",
    photo: null,
    manifesto: "Financial integrity is non-negotiable. I will publish quarterly branch financial reports, implement an online dues payment system, and ensure every naira is accounted for. My tax law background means I understand exactly how organisational finances should be managed for maximum accountability.",
    qualifications: ["LL.B (ABU Zaria)", "B.L (NLS)", "ACCA (Part-qualified)", "11 years in practice"],
    proposer: "Barr. Mohammed Aliyu",
    seconder: "Barr. Hadiza Umar",
  },
  {
    id: "cand-9",
    electionId: "elec-1",
    position: "Financial Secretary",
    name: "Barr. Chidinma Aneke",
    nbaNumber: "NBA/ABJ/2016/0334",
    yearCalled: 2016,
    practiceArea: "Commercial Law & Finance",
    photo: null,
    manifesto: "I will modernise our dues collection, introduce a transparent budget cycle, and propose an investment strategy for idle branch funds. Members deserve to know how their money is being used — and I will make that information freely accessible to all.",
    qualifications: ["LL.B (UNIZIK)", "B.L (NLS)", "BSc Accounting (minor)", "9 years in practice"],
    proposer: "Barr. Obiora Nwosu",
    seconder: "Barr. Ada Okeke",
  },

  // ── elec-1: Welfare Secretary (2 candidates) ──────────────
  {
    id: "cand-10",
    electionId: "elec-1",
    position: "Welfare Secretary",
    name: "Barr. Emeka Obi",
    nbaNumber: "NBA/ABJ/2016/0789",
    yearCalled: 2016,
    practiceArea: "Human Rights & Public Interest Law",
    photo: null,
    manifesto: "Every member deserves to feel supported — in practice, in health, and in life. I will establish a bereavement fund, negotiate health insurance group rates, and create a mental health support programme for members under professional stress. Welfare is not a secondary concern; it is the soul of our branch.",
    qualifications: ["LL.B (UNILAG)", "B.L (NLS)", "Certificate in Occupational Health Law", "9 years in practice"],
    proposer: "Barr. Tunde Bakare",
    seconder: "Barr. Ngozi Eze",
  },
  {
    id: "cand-11",
    electionId: "elec-1",
    position: "Welfare Secretary",
    name: "Barr. Aisha Mohammed",
    nbaNumber: "NBA/ABJ/2019/0456",
    yearCalled: 2019,
    practiceArea: "Family & Social Welfare Law",
    photo: null,
    manifesto: "Young lawyers and female practitioners in our branch face unique challenges. I will create a dedicated welfare hotline, host quarterly wellness events, and advocate for crèche facilities at branch meetings. My practice in family law has given me deep empathy for the challenges our members navigate daily.",
    qualifications: ["LL.B (UDUSOK)", "B.L (NLS)", "Certificate in Child Rights Law", "6 years in practice"],
    proposer: "Barr. Zainab Abubakar",
    seconder: "Barr. Fatima Garba",
  },

  // ── elec-2: Welfare Committee Nominations ─────────────────
  {
    id: "cand-12",
    electionId: "elec-2",
    position: "Welfare Officer",
    name: "Barr. Sophia Nwachukwu",
    nbaNumber: "NBA/ABJ/2018/0654",
    yearCalled: 2018,
    practiceArea: "Health & Medical Law",
    photo: null,
    manifesto: "I am committed to improving member welfare through health access, peer support, and professional development resources.",
    qualifications: ["LL.B (UNIBEN)", "B.L (NLS)", "7 years in practice"],
    proposer: "Barr. Emeka Obi",
    seconder: "Barr. Ngozi Eze",
  },
  {
    id: "cand-13",
    electionId: "elec-2",
    position: "Welfare Officer",
    name: "Barr. Daniel Okafor",
    nbaNumber: "NBA/ABJ/2016/0321",
    yearCalled: 2016,
    practiceArea: "General Practice",
    photo: null,
    manifesto: "I will ensure the welfare fund is used equitably, respond to distress cases swiftly, and organise quarterly member bonding events.",
    qualifications: ["LL.B (UNN)", "B.L (NLS)", "9 years in practice"],
    proposer: "Barr. Tunde Bakare",
    seconder: "Barr. Kabir Yusuf",
  },
  {
    id: "cand-14",
    electionId: "elec-2",
    position: "Assistant Welfare Officer",
    name: "Barr. Kemi Adebayo",
    nbaNumber: "NBA/ABJ/2020/0901",
    yearCalled: 2020,
    practiceArea: "Family Law",
    photo: null,
    manifesto: "As a young practitioner I know first-hand the challenges facing junior members. I will be an accessible welfare contact and champion for all.",
    qualifications: ["LL.B (OAU Ile-Ife)", "B.L (NLS)", "5 years in practice"],
    proposer: "Barr. Aisha Mohammed",
    seconder: "Barr. Blessing Okoro",
  },

  // ── elec-3: NBA National 2024 (with results) ──────────────
  {
    id: "cand-15",
    electionId: "elec-3",
    position: "NBA President",
    name: "Barr. Yakubu Mahmoud Abubakar",
    nbaNumber: "NBA/ABJ/2002/0045",
    yearCalled: 2002,
    practiceArea: "Constitutional & Public Law",
    photo: null,
    manifesto: "Strengthening the rule of law, improving legal aid access, and elevating Nigerian lawyers on the global stage.",
    qualifications: ["SAN", "LL.M (Cambridge)", "23 years in practice"],
    proposer: "NBA FCT Branch",
    seconder: "NBA Kano Branch",
    votes: 12847,
    percentage: 44.8,
    isWinner: true,
  },
  {
    id: "cand-16",
    electionId: "elec-3",
    position: "NBA President",
    name: "Barr. Olabisi Ogundimu",
    nbaNumber: "NBA/LAG/2005/0213",
    yearCalled: 2005,
    practiceArea: "Commercial & Energy Law",
    photo: null,
    manifesto: "A modern NBA that is financially self-sustaining, technologically forward, and respected by government at all levels.",
    qualifications: ["SAN (proposed)", "LL.M (SOAS London)", "20 years in practice"],
    proposer: "NBA Lagos Branch",
    seconder: "NBA Ikeja Branch",
    votes: 9340,
    percentage: 32.6,
    isWinner: false,
  },
  {
    id: "cand-17",
    electionId: "elec-3",
    position: "NBA President",
    name: "Barr. Nkem Ifeanyi-Okeke",
    nbaNumber: "NBA/OWE/2000/0087",
    yearCalled: 2000,
    practiceArea: "Criminal & Human Rights Law",
    photo: null,
    manifesto: "Restoring member trust, cracking down on professional misconduct, and ensuring the NBA is a shield — not a sword — for justice.",
    qualifications: ["SAN", "Ph.D Law (UNIBEN)", "25 years in practice"],
    proposer: "NBA Onitsha Branch",
    seconder: "NBA Enugu Branch",
    votes: 6477,
    percentage: 22.6,
    isWinner: false,
  },
  {
    id: "cand-18",
    electionId: "elec-3",
    position: "General Secretary",
    name: "Barr. Amaka Osei",
    nbaNumber: "NBA/ABJ/2008/0567",
    yearCalled: 2008,
    practiceArea: "Corporate & Securities Law",
    photo: null,
    manifesto: "Transparent governance, digital transformation, and responsive administration for NBA members nationwide.",
    qualifications: ["LL.M (University of Pretoria)", "17 years in practice"],
    proposer: "NBA Abuja Branch",
    seconder: "NBA Kaduna Branch",
    votes: 16890,
    percentage: 58.3,
    isWinner: true,
  },
  {
    id: "cand-19",
    electionId: "elec-3",
    position: "General Secretary",
    name: "Barr. Rotimi Fasanya",
    nbaNumber: "NBA/LAG/2007/0334",
    yearCalled: 2007,
    practiceArea: "Civil Litigation",
    photo: null,
    manifesto: "Efficient records management and open communication with every branch in Nigeria.",
    qualifications: ["LL.M (OAU)", "18 years in practice"],
    proposer: "NBA Ilorin Branch",
    seconder: "NBA Kwara Branch",
    votes: 12074,
    percentage: 41.7,
    isWinner: false,
  },
  {
    id: "cand-20",
    electionId: "elec-3",
    position: "Treasurer",
    name: "Barr. Samuel Dike",
    nbaNumber: "NBA/ABJ/2010/0789",
    yearCalled: 2010,
    practiceArea: "Tax & Revenue Law",
    photo: null,
    manifesto: "Prudent financial management, transparent reporting, and growing the NBA's investment portfolio for member benefit.",
    qualifications: ["ACCA", "LL.M Taxation", "15 years in practice"],
    proposer: "NBA Abuja Branch",
    seconder: "NBA Port Harcourt Branch",
    votes: 15230,
    percentage: 52.9,
    isWinner: true,
  },
  {
    id: "cand-21",
    electionId: "elec-3",
    position: "Treasurer",
    name: "Barr. Patience Eze",
    nbaNumber: "NBA/PHC/2009/0654",
    yearCalled: 2009,
    practiceArea: "Banking & Finance Law",
    photo: null,
    manifesto: "Modern financial controls, digital dues collection, and full transparency in NBA expenditure.",
    qualifications: ["ACA", "LL.M Finance", "16 years in practice"],
    proposer: "NBA Rivers Branch",
    seconder: "NBA Bayelsa Branch",
    votes: 13572,
    percentage: 47.1,
    isWinner: false,
  },
];

export const mockFinancials = {
  totalDuesPaid: 150000,
  outstandingPayments: 0,
  lastPaymentDate: "2025-01-15",
  complianceStatus: "compliant" as const,
  payments: [
    { id: "pay-1", description: "2025 Annual Dues", amount: 50000, date: "2025-01-15", status: "paid" as const },
    { id: "pay-2", description: "2024 Annual Dues", amount: 50000, date: "2024-02-10", status: "paid" as const },
    { id: "pay-3", description: "2023 Annual Dues", amount: 50000, date: "2023-03-05", status: "paid" as const },
    { id: "pay-4", description: "CLE Seminar Fee", amount: 10000, date: "2025-05-10", status: "paid" as const },
  ],
  monthlyData: [
    { month: "Jan", income: 4250, expenditure: 1800 },
    { month: "Feb", income: 3800, expenditure: 2100 },
    { month: "Mar", income: 5200, expenditure: 1950 },
    { month: "Apr", income: 2900, expenditure: 1700 },
    { month: "May", income: 6100, expenditure: 2300 },
    { month: "Jun", income: 4300, expenditure: 1600 },
    { month: "Jul", income: 3500, expenditure: 1400 },
  ],
};

export const mockDocuments = [
  {
    id: "doc-1",
    title: "Letter of Good Standing — July 2025",
    type: "good_standing" as const,
    issuedDate: "2025-07-01",
    expiryDate: "2025-12-31",
    size: "245 KB",
    format: "PDF",
  },
  {
    id: "doc-2",
    title: "NBA Circular No. 15/2025",
    type: "circular" as const,
    issuedDate: "2025-07-20",
    size: "1.2 MB",
    format: "PDF",
  },
  {
    id: "doc-3",
    title: "Branch Financial Report Q2 2025",
    type: "financial_report" as const,
    issuedDate: "2025-07-01",
    size: "3.4 MB",
    format: "PDF",
  },
  {
    id: "doc-4",
    title: "Annual General Meeting Minutes 2024",
    type: "report" as const,
    issuedDate: "2024-12-10",
    size: "890 KB",
    format: "PDF",
  },
  {
    id: "doc-5",
    title: "Election Notice — 2025 Branch Elections",
    type: "election_notice" as const,
    issuedDate: "2025-07-25",
    size: "156 KB",
    format: "PDF",
  },
];

export const mockNewsItems = [
  {
    id: "news-1",
    title: "NBA Bwari Hosts Successful CLE Seminar on Digital Law",
    category: "branch_news" as const,
    excerpt: "Over 200 members attended the continuing legal education seminar on emerging digital law frameworks in Nigeria, featuring keynote speakers from top tech law firms.",
    date: "2025-07-20",
    readTime: "4 min read",
    featured: true,
  },
  {
    id: "news-2",
    title: "New Branch Secretariat Office Opens in Bwari",
    category: "announcement" as const,
    excerpt: "The Bwari Area Council Branch of the Nigerian Bar Association is proud to announce the opening of its new ultra-modern secretariat office at Area 3, Bwari.",
    date: "2025-07-15",
    readTime: "2 min read",
    featured: false,
  },
  {
    id: "news-3",
    title: "Call for Nominations: 2025 Branch Executive Elections",
    category: "election" as const,
    excerpt: "Nominations are now open for all positions in the upcoming 2025 NBA Bwari Branch Executive Elections. All eligible members are encouraged to participate.",
    date: "2025-07-10",
    readTime: "3 min read",
    featured: false,
  },
  {
    id: "news-4",
    title: "NBA National Body Launches New Legal Aid Initiative",
    category: "national_news" as const,
    excerpt: "The Nigerian Bar Association has announced a new legal aid initiative targeting underserved communities across Nigeria, with Bwari Branch participating as a pilot.",
    date: "2025-07-05",
    readTime: "5 min read",
    featured: false,
  },
];

export const mockAdminStats = {
  totalMembers: 312,
  activeMembers: 287,
  attendanceRate: 72,
  financialCompliance: 81,
  votingParticipation: 68,
  goodStandingCount: 256,
  pendingApprovals: 7,
  upcomingMeetings: 2,
};
