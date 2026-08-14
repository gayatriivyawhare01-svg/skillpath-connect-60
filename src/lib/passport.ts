export const INTERNSHIP_STATUSES = ["Applied", "Selected", "In Progress", "Completed"] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

/**
 * Verification is deliberately separate from lifecycle status. The platform has no
 * organisation-verification channel yet, so a record can never reach
 * "Organization Verified" from document uploads alone.
 */
export const VERIFICATION_STATUSES = [
  "Self Reported",
  "Documents Added",
  "Verification Pending",
  "Organization Verified",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "Offer letter",
  "Joining letter",
  "Certificate",
  "Project evidence",
  "Other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type PassportDocument = {
  id: string;
  type: DocumentType;
  name: string;
  addedAt: string;
};

export type TimelineEntry = {
  id: string;
  label: string;
  date: string;
  kind: "status" | "document" | "note";
};

export type InternshipRecord = {
  id: string;
  company: string;
  role: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  stipend?: string;
  mode?: string;
  description?: string;
  projectLink?: string;
  githubLink?: string;
  status: InternshipStatus;
  /** Set only when the student has requested organisation verification. */
  verificationRequested?: boolean;
  documents: PassportDocument[];
  timeline: TimelineEntry[];
  createdAt: string;
};

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value?: string) {
  if (!value) return "Not recorded";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function verificationOf(record: InternshipRecord): VerificationStatus {
  if (record.verificationRequested) return "Verification Pending";
  if (record.documents.length > 0) return "Documents Added";
  return "Self Reported";
}

export function verificationNote(status: VerificationStatus) {
  switch (status) {
    case "Self Reported":
      return "Details were entered by you. No supporting document has been attached yet.";
    case "Documents Added":
      return "Documents are recorded against this internship. Documents alone are not organisation verification.";
    case "Verification Pending":
      return "Verification has been requested. Skill2Intern has no organisation verification channel for this company yet, so this stays pending.";
    default:
      return "Confirmed directly by the organisation.";
  }
}

export function nextStatus(status: InternshipStatus): InternshipStatus | null {
  const i = INTERNSHIP_STATUSES.indexOf(status);
  return i >= 0 && i < INTERNSHIP_STATUSES.length - 1
    ? (INTERNSHIP_STATUSES[i + 1] as InternshipStatus)
    : null;
}

export function statusProgress(status: InternshipStatus) {
  return Math.round(((INTERNSHIP_STATUSES.indexOf(status) + 1) / INTERNSHIP_STATUSES.length) * 100);
}
