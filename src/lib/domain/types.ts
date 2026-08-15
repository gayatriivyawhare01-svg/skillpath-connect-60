/**
 * S2I domain model. One connected evidence trail:
 * Student -> Company -> T&P -> Faculty -> Verified internship -> Employability record.
 *
 * Every institutional state transition is an explicit human action recorded in
 * `history`. Nothing in this file lets AI mark a record as verified.
 */

export type Role = "student" | "tnp" | "faculty" | "company";

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  tnp: "T&P Cell",
  faculty: "Faculty",
  company: "Company",
};

export type WorkMode = "Onsite" | "Hybrid" | "Remote";
export const WORK_MODES: WorkMode[] = ["Onsite", "Hybrid", "Remote"];

export type Pathway = "college-placed" | "self-placed";
export const PATHWAY_LABEL: Record<Pathway, string> = {
  "college-placed": "College-Placed",
  "self-placed": "Self-Placed",
};

/** The 12-stage internship lifecycle tracker. */
export const LIFECYCLE = [
  "Application",
  "Shortlisted",
  "Interview",
  "Selected",
  "Consent Submitted",
  "Offer Letter",
  "Joining",
  "Active",
  "Progress",
  "Completion",
  "Faculty Evaluation",
  "Verified",
] as const;
export type Stage = (typeof LIFECYCLE)[number];

export function stageIndex(stage: Stage) {
  return LIFECYCLE.indexOf(stage);
}
export function stageProgress(stage: Stage) {
  return Math.round(((stageIndex(stage) + 1) / LIFECYCLE.length) * 100);
}
export function nextStage(stage: Stage): Stage | null {
  const i = stageIndex(stage);
  return i >= 0 && i < LIFECYCLE.length - 1 ? (LIFECYCLE[i + 1] as Stage) : null;
}
export function stageReached(stage: Stage, target: Stage) {
  return stageIndex(stage) >= stageIndex(target);
}

/** Institutional review state. Only a T&P action can move a record forward. */
export const REVIEW_STATES = [
  "Student Submitted",
  "Under Review",
  "Needs More Evidence",
  "T&P Approved",
  "T&P Rejected",
  "Institutionally Verified",
] as const;
export type ReviewState = (typeof REVIEW_STATES)[number];

export const REVIEW_NOTE: Record<ReviewState, string> = {
  "Student Submitted": "Submitted by the student. No institutional review has happened yet.",
  "Under Review": "The T&P cell is reviewing the submitted information and evidence.",
  "Needs More Evidence": "Review is blocked until the student adds the requested evidence.",
  "T&P Approved": "The T&P cell accepted this internship and released it to faculty.",
  "T&P Rejected": "The T&P cell declined this internship. Reason is recorded in the history.",
  "Institutionally Verified":
    "Evidence trail complete and signed off by both the T&P cell and faculty.",
};

/** Verification is deliberately separate from lifecycle stage. */
export const VERIFICATION_STATES = [
  "Self Reported",
  "Evidence Submitted",
  "Under Review",
  "T&P Verified",
  "Faculty Verified",
  "Completed",
] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export type Permission = "Not Required" | "Pending" | "Granted" | "Rejected";

export type HistoryEntry = {
  at: string;
  actor: Role | "system";
  actorName: string;
  event: string;
  note?: string;
};

export type Project = {
  title: string;
  description: string;
  skills: string[];
};

export type Student = {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  phone: string;
  collegeId: string;
  institutionId: string;
  department: string;
  degree: string;
  year: number;
  semester: number;
  graduationYear: number;
  cgpa: number;
  city: string;
  skills: string[];
  softSkills: string[];
  projects: Project[];
  certifications: string[];
  interests: string[];
  preferredRoles: string[];
  preferredDomain: string;
  preferredLocation: string;
  preferredModes: WorkMode[];
  availableFrom: string;
  availableMonths: number;
  previousInternships: number;
  resumeSummary: string;
  facultyId: string;
  assessmentComplete: boolean;
  assessmentUpdatedAt?: string;
  readinessIndex?: number;
};

export const COMPANY_APPROVALS = [
  "Registered",
  "Under Review",
  "T&P Approved",
  "T&P Rejected",
] as const;
export type CompanyApproval = (typeof COMPANY_APPROVALS)[number];

export type Company = {
  id: string;
  name: string;
  website: string;
  industry: string;
  hqLocation: string;
  size: string;
  about: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  approval: CompanyApproval;
  registeredAt: string;
};

export type Faculty = {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  department: string;
  designation: string;
  assignedYears: number[];
  /** Demo stand-in for institutional SSO. Real deployments swap this for IdP login. */
  accessCode: string;
};

export type Institution = {
  id: string;
  name: string;
  code: string;
  city: string;
  tnpHead: string;
  tnpEmail: string;
  departments: string[];
  degrees: string[];
};

/** Kept as an alias so existing `db.college` references stay valid. */
export type College = Institution;

export type TnpUser = {
  id: string;
  institutionId: string;
  name: string;
  email: string;
  designation: string;
  accessCode: string;
};

export const OPPORTUNITY_STATES = [
  "Draft",
  "Submitted to T&P",
  "T&P Approved",
  "Live",
  "Closed",
] as const;
export type OpportunityState = (typeof OPPORTUNITY_STATES)[number];

export type Opportunity = {
  id: string;
  companyId: string;
  pathway: "college-placed";
  role: string;
  domain: string;
  location: string;
  workMode: WorkMode;
  durationMonths: number;
  stipend: number;
  openings: number;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  minCgpa: number;
  departments: string[];
  years: number[];
  startDate: string;
  deadline: string;
  status: OpportunityState;
  createdAt: string;
  history: HistoryEntry[];
};

export type Application = {
  id: string;
  opportunityId: string;
  studentId: string;
  stage: Stage;
  matchScore: number;
  source: "T&P shortlist" | "Student applied";
  tnpApproved: boolean;
  interview?: {
    scheduledFor: string;
    mode: WorkMode;
    result: "Pending" | "Cleared" | "Not cleared";
  };
  outcome?: "Selected" | "Rejected" | "Withdrawn";
  internshipId?: string;
  createdAt: string;
  history: HistoryEntry[];
};

export const EVIDENCE_TYPES = [
  "Offer letter",
  "Consent letter",
  "Joining confirmation",
  "Task log",
  "Project submission",
  "Progress report",
  "Attendance confirmation",
  "Company feedback",
  "Faculty evaluation",
  "Completion certificate",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** Evidence required before an internship may be considered complete. */
export const REQUIRED_EVIDENCE: EvidenceType[] = [
  "Offer letter",
  "Consent letter",
  "Joining confirmation",
  "Progress report",
  "Company feedback",
  "Completion certificate",
];

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  title: string;
  fileName?: string;
  link?: string;
  note?: string;
  submittedBy: Role;
  submittedByName: string;
  submittedAt: string;
  status: "Submitted" | "Accepted" | "Rejected";
  reviewNote?: string;
};

export type Offer = {
  id: string;
  issuedBy: "company" | "student-upload";
  issuedAt: string;
  stipend: number;
  joiningDate: string;
  reportingLocation: string;
  workMode: WorkMode;
  fileName?: string;
  recordedByTnp: boolean;
  recordedAt?: string;
};

export type Consent = {
  id: string;
  studentDeclaration: boolean;
  parentGuardianName: string;
  parentContact: string;
  academicAcknowledgement: boolean;
  locationSharingConsent: boolean;
  submittedAt: string;
  tnpVerified: boolean;
  tnpVerifiedAt?: string;
};

/** Consent-based check-in. No continuous or background location tracking. */
export type CheckIn = {
  id: string;
  date: string;
  kind: "Joining confirmation" | "Weekly check-in" | "Company confirmation";
  reportedLocation: string;
  workMode: WorkMode;
  summary: string;
  consentGiven: boolean;
  confirmedBy: Role;
  confirmedByName: string;
};

export type Feedback = {
  id: string;
  by: "company";
  byName: string;
  at: string;
  technical: number;
  communication: number;
  ownership: number;
  punctuality: number;
  teamwork: number;
  remarks: string;
  wouldHire: boolean;
  skillsDemonstrated: string[];
};

export type Evaluation = {
  id: string;
  facultyId: string;
  facultyName: string;
  at: string;
  learningOutcome: number;
  documentation: number;
  relevance: number;
  remarks: string;
  verdict: "Approved" | "Needs rework" | "Rejected";
  creditsRecommended: number;
};

export type SelfPlacedDetails = {
  companyName: string;
  companyWebsite: string;
  companyEmail: string;
  companyContactName: string;
  companyContactPhone: string;
  companyAddress: string;
  description: string;
  howFound: string;
  hasOfferLetter: boolean;
};

export type Internship = {
  id: string;
  pathway: Pathway;
  studentId: string;
  companyId?: string;
  selfPlaced?: SelfPlacedDetails;
  applicationId?: string;
  role: string;
  domain: string;
  location: string;
  workMode: WorkMode;
  startDate: string;
  endDate: string;
  durationMonths: number;
  stipend: number;
  stage: Stage;
  review: ReviewState;
  verification: VerificationState;
  facultyPermission: Permission;
  facultyId: string;
  evidence: EvidenceItem[];
  checkIns: CheckIn[];
  offer?: Offer;
  consent?: Consent;
  companyFeedback?: Feedback;
  facultyEvaluation?: Evaluation;
  riskFlags: string[];
  createdAt: string;
  history: HistoryEntry[];
};

export type NotificationKind =
  | "opportunity"
  | "shortlist"
  | "interview"
  | "selection"
  | "consent"
  | "offer"
  | "joining"
  | "evidence"
  | "progress"
  | "completion"
  | "evaluation"
  | "verification"
  | "review";

export type Notification = {
  id: string;
  audience: Role;
  audienceId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  internshipId?: string;
  applicationId?: string;
  createdAt: string;
  read: boolean;
};

export type Session = {
  role: Role | null;
  studentId: string;
  facultyId: string;
  companyId: string;
};

export type DB = {
  version: number;
  session: Session;
  college: College;
  students: Student[];
  companies: Company[];
  faculty: Faculty[];
  opportunities: Opportunity[];
  applications: Application[];
  internships: Internship[];
  notifications: Notification[];
};

export function newId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function inr(value?: number) {
  if (value == null) return "—";
  if (value === 0) return "Unpaid";
  return `₹${value.toLocaleString("en-IN")}/mo`;
}

export function evidenceCompleteness(internship: Internship) {
  const accepted = new Set(
    internship.evidence.filter((e) => e.status !== "Rejected").map((e) => e.type),
  );
  const present = REQUIRED_EVIDENCE.filter((t) => accepted.has(t));
  const missing = REQUIRED_EVIDENCE.filter((t) => !accepted.has(t));
  return {
    present,
    missing,
    percent: Math.round((present.length / REQUIRED_EVIDENCE.length) * 100),
  };
}
