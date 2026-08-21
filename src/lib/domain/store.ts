import {
  saveCloudState,
  loadCloudState,
} from "../firebase/s2i-cloud";
import { useSyncExternalStore } from "react";
import { buildSeed } from "./seed";
import {
  LIFECYCLE,
  newId,
  nextStage,
  stageIndex,
  type Application,
  type CheckIn,
  type Company,
  type DB,
  type Evaluation,
  type EvidenceItem,
  type Feedback,
  type HistoryEntry,
  type Internship,
  type Notification,
  type NotificationKind,
  type Opportunity,
  type ReviewState,
  type Role,
  type Stage,
  type Student,
  type VerificationState,
} from "./types";

const KEY = "s2i.db.v3";

const SEED = buildSeed();
let cache: DB | null = null;
const listeners = new Set<() => void>();

function read(): DB {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as DB;
    if (!parsed || parsed.version !== SEED.version) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

function snapshot(): DB {
  if (typeof window === "undefined") return SEED;
  if (!cache) cache = read();
  return cache;
}

function serverSnapshot(): DB {
  return SEED;
}

export async function hydrateFromFirebase() {
  if (typeof window === "undefined") return;

  const cloudState = await loadCloudState();

  if (!cloudState) {
    return;
  }

  cache = cloudState;

  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(cloudState),
    );
  } catch {
    /* ignore localStorage failure */
  }

  listeners.forEach((listener) => listener());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next: DB) {
  cache = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore localStorage failure */
    }

    void saveCloudState(next);
  }

  listeners.forEach((l) => l());
}
export function mutate(fn: (db: DB) => DB) {
  commit(fn(structuredClone(snapshot())));
}

export function resetDemoData() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  cache = structuredClone(SEED);
  listeners.forEach((l) => l());
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/* ---------------------------------------------------------------- helpers */

export function entry(
  actor: HistoryEntry["actor"],
  actorName: string,
  event: string,
  note?: string,
): HistoryEntry {
  return { at: new Date().toISOString(), actor, actorName, event, ...(note ? { note } : {}) };
}

export function notify(
  db: DB,
  n: {
    audience: Role;
    audienceId: string;
    kind: NotificationKind;
    title: string;
    body: string;
    internshipId?: string;
    applicationId?: string;
  },
) {
  db.notifications.unshift({
    id: newId("not"),
    createdAt: new Date().toISOString(),
    read: false,
    ...n,
  });
}

/* --------------------------------------------------------------- selectors */

export function studentById(db: DB, id: string) {
  return db.students.find((s) => s.id === id);
}
export function companyById(db: DB, id?: string) {
  return id ? db.companies.find((c) => c.id === id) : undefined;
}
export function facultyById(db: DB, id: string) {
  return db.faculty.find((f) => f.id === id);
}
export function opportunityById(db: DB, id: string) {
  return db.opportunities.find((o) => o.id === id);
}
export function internshipById(db: DB, id: string) {
  return db.internships.find((i) => i.id === id);
}

export function companyOf(db: DB, internship: Internship) {
  return internship.pathway === "college-placed"
    ? companyById(db, internship.companyId)?.name
    : internship.selfPlaced?.companyName;
}

export function companySiteOf(db: DB, internship: Internship) {
  return internship.pathway === "college-placed"
    ? companyById(db, internship.companyId)?.website
    : internship.selfPlaced?.companyWebsite;
}

export function notificationsFor(db: DB, audience: Role, audienceId: string) {
  return db.notifications.filter((n) => n.audience === audience && n.audienceId === audienceId);
}

export function studentInternships(db: DB, studentId: string) {
  return db.internships.filter((i) => i.studentId === studentId);
}

export function studentApplications(db: DB, studentId: string) {
  return db.applications.filter((a) => a.studentId === studentId);
}

export function facultyInternships(db: DB, facultyId: string) {
  // Faculty only ever see records the T&P cell has already released.
  return db.internships.filter(
    (i) =>
      i.facultyId === facultyId &&
      (i.review === "T&P Approved" || i.review === "Institutionally Verified"),
  );
}

export function companyOpportunities(db: DB, companyId: string) {
  return db.opportunities.filter((o) => o.companyId === companyId);
}

export function companyApplications(db: DB, companyId: string) {
  const oppIds = new Set(companyOpportunities(db, companyId).map((o) => o.id));
  return db.applications.filter((a) => oppIds.has(a.opportunityId) && a.tnpApproved);
}

export function companyInternships(db: DB, companyId: string) {
  return db.internships.filter((i) => i.companyId === companyId);
}

export function eligibleStudents(db: DB) {
  return db.students.filter((s) => s.assessmentComplete);
}

/* ----------------------------------------------------------------- actions */

export const actions = {
  setRole(role: Role | null) {
    mutate((db) => {
      db.session.role = role;
      return db;
    });
  },
  setIdentity(patch: Partial<DB["session"]>) {
    mutate((db) => {
      db.session = { ...db.session, ...patch };
      return db;
    });
  },
  saveStudent(studentId: string, patch: Partial<Student>) {
    mutate((db) => {
      const s = db.students.find((x) => x.id === studentId);
      if (s) Object.assign(s, patch, { assessmentUpdatedAt: new Date().toISOString() });
      return db;
    });
  },
  markNotificationsRead(audience: Role, audienceId: string) {
    mutate((db) => {
      db.notifications.forEach((n) => {
        if (n.audience === audience && n.audienceId === audienceId) n.read = true;
      });
      return db;
    });
  },

  /* Company */
  postOpportunity(opp: Omit<Opportunity, "id" | "createdAt" | "history" | "pathway" | "status">) {
    let id = "";
    mutate((db) => {
      const company = companyById(db, opp.companyId);
      id = newId("opp");
      db.opportunities.unshift({
        ...opp,
        id,
        pathway: "college-placed",
        status: "Submitted to T&P",
        createdAt: new Date().toISOString(),
        history: [
          entry("company", company?.name ?? "Company", "Opportunity submitted for T&P approval"),
          entry(
            "system",
            "S2I Matching Engine",
            "Requirements parsed and eligible students ranked",
            `${opp.requiredSkills.join(", ")} · min CGPA ${opp.minCgpa}`,
          ),
        ],
      });
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "opportunity",
        title: `New opportunity from ${company?.name ?? "a company"}`,
        body: `${opp.role} · ${opp.location} · ${opp.workMode}. Awaiting T&P approval before circulation.`,
      });
      return db;
    });
    return id;
  },
  updateCompany(companyId: string, patch: Partial<Company>) {
    mutate((db) => {
      const c = db.companies.find((x) => x.id === companyId);
      if (c) Object.assign(c, patch);
      return db;
    });
  },

  /* T&P */
  approveOpportunity(oppId: string) {
    mutate((db) => {
      const o = opportunityById(db, oppId);
      if (!o) return db;
      o.status = "Live";
      o.history.push(entry("tnp", db.college.tnpHead, "Approved for circulation"));
      notify(db, {
        audience: "company",
        audienceId: o.companyId,
        kind: "opportunity",
        title: "Opportunity approved by T&P",
        body: `${o.role} is now circulating to eligible students.`,
      });
      return db;
    });
  },
  shortlist(oppId: string, studentId: string, matchScore: number) {
    mutate((db) => {
      const o = opportunityById(db, oppId);
      if (!o) return db;
      const existing = db.applications.find(
        (a) => a.opportunityId === oppId && a.studentId === studentId,
      );
      if (existing) {
        existing.tnpApproved = true;
        if (stageIndex(existing.stage) < stageIndex("Shortlisted")) existing.stage = "Shortlisted";
        existing.history.push(entry("tnp", db.college.tnpHead, "Approved and shortlisted"));
      } else {
        db.applications.unshift({
          id: newId("app"),
          opportunityId: oppId,
          studentId,
          stage: "Shortlisted",
          matchScore,
          source: "T&P shortlist",
          tnpApproved: true,
          createdAt: new Date().toISOString(),
          history: [
            entry(
              "tnp",
              db.college.tnpHead,
              "Shortlisted from matching recommendations",
              `Match score ${matchScore}%`,
            ),
          ],
        });
      }
      const company = companyById(db, o.companyId);
      notify(db, {
        audience: "student",
        audienceId: studentId,
        kind: "shortlist",
        title: `Shortlisted for ${o.role} at ${company?.name ?? "a company"}`,
        body: `The T&P cell shortlisted you. Location ${o.location} · ${o.workMode}. Apply before ${o.deadline}.`,
      });
      notify(db, {
        audience: "company",
        audienceId: o.companyId,
        kind: "shortlist",
        title: "New candidate released by T&P",
        body: `${studentById(db, studentId)?.name} was shortlisted for ${o.role}.`,
      });
      return db;
    });
  },
  studentApply(oppId: string, studentId: string, matchScore: number) {
    mutate((db) => {
      const o = opportunityById(db, oppId);
      const s = studentById(db, studentId);
      if (!o || !s) return db;
      if (db.applications.some((a) => a.opportunityId === oppId && a.studentId === studentId))
        return db;
      db.applications.unshift({
        id: newId("app"),
        opportunityId: oppId,
        studentId,
        stage: "Application",
        matchScore,
        source: "Student applied",
        tnpApproved: false,
        createdAt: new Date().toISOString(),
        history: [entry("student", s.name, "Applied — awaiting T&P review")],
      });
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "review",
        title: `${s.name} applied to ${o.role}`,
        body: "Awaiting T&P review before the company sees this candidate.",
      });
      return db;
    });
  },
  advanceApplication(
    appId: string,
    stage: Stage,
    actor: Role,
    actorName: string,
    note?: string,
  ) {
    mutate((db) => {
      const a = db.applications.find((x) => x.id === appId);
      if (!a) return db;
      a.stage = stage;
      a.history.push(entry(actor, actorName, `Moved to ${stage}`, note));
      const o = opportunityById(db, a.opportunityId);
      const kind: NotificationKind =
        stage === "Interview" ? "interview" : stage === "Selected" ? "selection" : "shortlist";
      notify(db, {
        audience: "student",
        audienceId: a.studentId,
        kind,
        title: `${stage} — ${o?.role ?? "internship"}`,
        body: note ?? `Your application moved to ${stage}.`,
        applicationId: a.id,
      });
      return db;
    });
  },
  scheduleInterview(appId: string, scheduledFor: string, mode: CheckIn["workMode"]) {
    mutate((db) => {
      const a = db.applications.find((x) => x.id === appId);
      if (!a) return db;
      a.interview = { scheduledFor, mode, result: "Pending" };
      a.stage = "Interview";
      const o = opportunityById(db, a.opportunityId);
      const company = companyById(db, o?.companyId ?? "");
      a.history.push(
        entry("company", company?.name ?? "Company", "Interview scheduled", `${scheduledFor} · ${mode}`),
      );
      notify(db, {
        audience: "student",
        audienceId: a.studentId,
        kind: "interview",
        title: `Interview scheduled — ${o?.role ?? "internship"}`,
        body: `${company?.name ?? "The company"} scheduled your interview for ${scheduledFor} (${mode}).`,
        applicationId: a.id,
      });
      return db;
    });
  },
  /** Company selects a candidate; creates the internship record at "Selected". */
  selectCandidate(appId: string) {
    mutate((db) => {
      const a = db.applications.find((x) => x.id === appId);
      if (!a) return db;
      const o = opportunityById(db, a.opportunityId);
      const s = studentById(db, a.studentId);
      if (!o || !s) return db;
      const company = companyById(db, o.companyId);
      a.stage = "Selected";
      a.outcome = "Selected";
      if (a.interview) a.interview.result = "Cleared";
      a.history.push(entry("company", company?.name ?? "Company", "Selected"));

      const end = new Date(o.startDate);
      end.setMonth(end.getMonth() + o.durationMonths);
      const internship: Internship = {
        id: newId("int"),
        pathway: "college-placed",
        studentId: s.id,
        companyId: o.companyId,
        applicationId: a.id,
        role: o.role,
        domain: o.domain,
        location: o.location,
        workMode: o.workMode,
        startDate: o.startDate,
        endDate: end.toISOString().slice(0, 10),
        durationMonths: o.durationMonths,
        stipend: o.stipend,
        stage: "Selected",
        review: "T&P Approved",
        verification: "Self Reported",
        facultyPermission: "Not Required",
        facultyId: s.facultyId,
        evidence: [],
        checkIns: [],
        riskFlags: ["Consent pending", "Offer letter not yet recorded"],
        createdAt: new Date().toISOString(),
        history: [entry("company", company?.name ?? "Company", "Selected — consent requested from student")],
      };
      db.internships.unshift(internship);
      a.internshipId = internship.id;
      notify(db, {
        audience: "student",
        audienceId: s.id,
        kind: "consent",
        title: `Selected at ${company?.name ?? "the company"}`,
        body: `Submit your consent form so the T&P cell can record the offer for ${o.role}.`,
        internshipId: internship.id,
      });
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "consent",
        title: `Consent pending — ${s.name}`,
        body: `Selected at ${company?.name ?? "a company"} for ${o.role}.`,
        internshipId: internship.id,
      });
      return db;
    });
  },
  rejectCandidate(appId: string, reason: string) {
    mutate((db) => {
      const a = db.applications.find((x) => x.id === appId);
      if (!a) return db;
      const o = opportunityById(db, a.opportunityId);
      a.outcome = "Rejected";
      if (a.interview) a.interview.result = "Not cleared";
      a.history.push(entry("company", "Company", "Candidate not selected", reason));
      notify(db, {
        audience: "student",
        audienceId: a.studentId,
        kind: "selection",
        title: `Not selected — ${o?.role ?? "internship"}`,
        body: reason,
        applicationId: a.id,
      });
      return db;
    });
  },

  /* Self-placed */
  submitSelfPlaced(internship: Omit<Internship, "id" | "createdAt" | "history">) {
    let id = "";
    mutate((db) => {
      const s = studentById(db, internship.studentId);
      id = newId("int");
      db.internships.unshift({
        ...internship,
        id,
        createdAt: new Date().toISOString(),
        history: [
          entry("student", s?.name ?? "Student", "Self-placed internship submitted"),
          entry(
            "system",
            "S2I",
            "Completeness and consistency check generated for T&P review",
            "Automated check only — this is not institutional verification.",
          ),
        ],
      });
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "verification",
        title: `Self-placed internship awaiting decision — ${s?.name ?? "student"}`,
        body: `${internship.selfPlaced?.companyName} · ${internship.role} · ${internship.location}`,
        internshipId: id,
      });
      notify(db, {
        audience: "student",
        audienceId: internship.studentId,
        kind: "review",
        title: "Self-placed submission received",
        body: "Your submission is queued with the T&P cell. Status will move to Under Review shortly.",
        internshipId: id,
      });
      return db;
    });
    return id;
  },

  /* Institutional decisions */
  setReview(internshipId: string, review: ReviewState, note: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.review = review;
      i.history.push(entry("tnp", db.college.tnpHead, `Review set to ${review}`, note));
      if (review === "T&P Approved") {
        i.verification = "T&P Verified";
        if (i.pathway === "self-placed") i.facultyPermission = "Pending";
        const f = facultyById(db, i.facultyId);
        notify(db, {
          audience: "faculty",
          audienceId: i.facultyId,
          kind: "evaluation",
          title: `Permission pending — ${studentById(db, i.studentId)?.name}`,
          body: `T&P approved ${i.role} at ${companyOf(db, i)}. Your permission is required.`,
          internshipId: i.id,
        });
        notify(db, {
          audience: "student",
          audienceId: i.studentId,
          kind: "review",
          title: "T&P approved your internship",
          body: `Released to ${f?.name ?? "your faculty coordinator"} for academic permission.`,
          internshipId: i.id,
        });
      } else {
        notify(db, {
          audience: "student",
          audienceId: i.studentId,
          kind: "review",
          title: `Internship review: ${review}`,
          body: note,
          internshipId: i.id,
        });
      }
      return db;
    });
  },
  setVerification(internshipId: string, verification: VerificationState, actor: Role, actorName: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.verification = verification;
      i.history.push(entry(actor, actorName, `Verification set to ${verification}`));
      return db;
    });
  },
  advanceInternship(internshipId: string, actor: Role, actorName: string, note?: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      const next = nextStage(i.stage);
      if (!next) return db;
      i.stage = next;
      i.history.push(entry(actor, actorName, `Lifecycle moved to ${next}`, note));
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "progress",
        title: `Internship stage: ${next}`,
        body: note ?? `${i.role} at ${companyOf(db, i)} moved to ${next}.`,
        internshipId: i.id,
      });
      return db;
    });
  },
  setStage(internshipId: string, stage: Stage, actor: Role, actorName: string, note?: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.stage = stage;
      i.history.push(entry(actor, actorName, `Lifecycle set to ${stage}`, note));
      return db;
    });
  },
  submitConsent(internshipId: string, consent: Omit<Internship["consent"] & object, "id" | "submittedAt" | "tnpVerified">) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      const s = studentById(db, i.studentId);
      i.consent = {
        ...consent,
        id: newId("con"),
        submittedAt: new Date().toISOString(),
        tnpVerified: false,
      };
      i.stage = stageIndex(i.stage) < stageIndex("Consent Submitted") ? "Consent Submitted" : i.stage;
      i.riskFlags = i.riskFlags.filter((f) => f !== "Consent pending");
      i.evidence.push({
        id: newId("evd"),
        type: "Consent letter",
        title: "Student and parent consent",
        submittedBy: "student",
        submittedByName: s?.name ?? "Student",
        submittedAt: new Date().toISOString(),
        status: "Submitted",
      });
      i.history.push(entry("student", s?.name ?? "Student", "Consent submitted"));
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "consent",
        title: `Consent submitted — ${s?.name}`,
        body: `Verify consent for ${i.role} at ${companyOf(db, i)}.`,
        internshipId: i.id,
      });
      return db;
    });
  },
  verifyConsent(internshipId: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i?.consent) return db;
      i.consent.tnpVerified = true;
      i.consent.tnpVerifiedAt = new Date().toISOString();
      i.evidence.forEach((e) => {
        if (e.type === "Consent letter") e.status = "Accepted";
      });
      i.history.push(entry("tnp", db.college.tnpHead, "Consent verified"));
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "consent",
        title: "Consent verified by T&P",
        body: "Next step: upload the offer letter so the T&P cell can record it.",
        internshipId: i.id,
      });
      return db;
    });
  },
  recordOffer(internshipId: string, offer: Omit<NonNullable<Internship["offer"]>, "id" | "recordedByTnp">, byTnp: boolean) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.offer = {
        ...offer,
        id: newId("off"),
        recordedByTnp: byTnp,
        ...(byTnp ? { recordedAt: new Date().toISOString() } : {}),
      };
      i.riskFlags = i.riskFlags.filter((f) => f !== "Offer letter not yet recorded");
      if (stageIndex(i.stage) < stageIndex("Offer Letter")) i.stage = "Offer Letter";
      if (!i.evidence.some((e) => e.type === "Offer letter")) {
        i.evidence.push({
          id: newId("evd"),
          type: "Offer letter",
          title: offer.fileName ?? "Offer letter",
          ...(offer.fileName ? { fileName: offer.fileName } : {}),
          submittedBy: byTnp ? "tnp" : "student",
          submittedByName: byTnp ? db.college.tnpHead : (studentById(db, i.studentId)?.name ?? "Student"),
          submittedAt: new Date().toISOString(),
          status: byTnp ? "Accepted" : "Submitted",
        });
      }
      i.history.push(
        entry(byTnp ? "tnp" : "student", byTnp ? db.college.tnpHead : "Student", "Offer letter recorded"),
      );
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "offer",
        title: "Offer letter recorded",
        body: `Joining ${offer.joiningDate} at ${offer.reportingLocation} (${offer.workMode}).`,
        internshipId: i.id,
      });
      return db;
    });
  },
  addEvidence(internshipId: string, item: Omit<EvidenceItem, "id" | "submittedAt" | "status">) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.evidence.push({
        ...item,
        id: newId("evd"),
        submittedAt: new Date().toISOString(),
        status: "Submitted",
      });
      i.riskFlags = i.riskFlags.filter((f) => !f.toLowerCase().includes("progress report") || item.type !== "Progress report");
      i.history.push(entry(item.submittedBy, item.submittedByName, `Evidence added: ${item.type}`, item.title));
      if (i.verification === "Self Reported") i.verification = "Evidence Submitted";
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "evidence",
        title: `Evidence added — ${studentById(db, i.studentId)?.name}`,
        body: `${item.type}: ${item.title}`,
        internshipId: i.id,
      });
      return db;
    });
  },
  reviewEvidence(internshipId: string, evidenceId: string, status: EvidenceItem["status"], reviewNote: string, actor: Role, actorName: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      const e = i?.evidence.find((x) => x.id === evidenceId);
      if (!i || !e) return db;
      e.status = status;
      e.reviewNote = reviewNote;
      i.history.push(entry(actor, actorName, `Evidence ${status.toLowerCase()}: ${e.type}`, reviewNote));
      return db;
    });
  },
  addCheckIn(internshipId: string, checkIn: Omit<CheckIn, "id">) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.checkIns.push({ ...checkIn, id: newId("chk") });
      i.history.push(
        entry(checkIn.confirmedBy, checkIn.confirmedByName, `${checkIn.kind} recorded`, `${checkIn.reportedLocation} · ${checkIn.workMode}`),
      );
      if (checkIn.kind === "Joining confirmation" && stageIndex(i.stage) < stageIndex("Active")) {
        i.stage = "Active";
      }
      return db;
    });
  },
  setFacultyPermission(internshipId: string, permission: "Granted" | "Rejected", remarks: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      const f = facultyById(db, i.facultyId);
      i.facultyPermission = permission;
      i.history.push(entry("faculty", f?.name ?? "Faculty", `Academic permission ${permission.toLowerCase()}`, remarks));
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "evaluation",
        title: `Faculty permission ${permission.toLowerCase()}`,
        body: remarks,
        internshipId: i.id,
      });
      return db;
    });
  },
  submitCompanyFeedback(internshipId: string, feedback: Omit<Feedback, "id" | "at" | "by">) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.companyFeedback = { ...feedback, id: newId("fbk"), by: "company", at: new Date().toISOString() };
      i.evidence.push({
        id: newId("evd"),
        type: "Company feedback",
        title: "End of internship feedback",
        submittedBy: "company",
        submittedByName: feedback.byName,
        submittedAt: new Date().toISOString(),
        status: "Accepted",
      });
      if (stageIndex(i.stage) < stageIndex("Completion")) i.stage = "Completion";
      i.history.push(entry("company", feedback.byName, "Company feedback submitted"));
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "completion",
        title: "Company feedback received",
        body: `${feedback.byName} submitted your performance feedback.`,
        internshipId: i.id,
      });
      notify(db, {
        audience: "faculty",
        audienceId: i.facultyId,
        kind: "evaluation",
        title: `Evaluation pending — ${studentById(db, i.studentId)?.name}`,
        body: "Company feedback is in. Faculty evaluation is now due.",
        internshipId: i.id,
      });
      return db;
    });
  },
  submitEvaluation(internshipId: string, evaluation: Omit<Evaluation, "id" | "at">) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.facultyEvaluation = { ...evaluation, id: newId("eval"), at: new Date().toISOString() };
      i.evidence.push({
        id: newId("evd"),
        type: "Faculty evaluation",
        title: "Faculty evaluation sheet",
        submittedBy: "faculty",
        submittedByName: evaluation.facultyName,
        submittedAt: new Date().toISOString(),
        status: "Accepted",
      });
      i.stage = "Faculty Evaluation";
      i.verification = "Faculty Verified";
      i.history.push(entry("faculty", evaluation.facultyName, "Faculty evaluation completed", evaluation.verdict));
      notify(db, {
        audience: "tnp",
        audienceId: "tnp",
        kind: "verification",
        title: `Ready for verification — ${studentById(db, i.studentId)?.name}`,
        body: `Faculty verdict: ${evaluation.verdict}. Final institutional verification pending.`,
        internshipId: i.id,
      });
      return db;
    });
  },
  institutionallyVerify(internshipId: string, note: string) {
    mutate((db) => {
      const i = internshipById(db, internshipId);
      if (!i) return db;
      i.stage = "Verified";
      i.review = "Institutionally Verified";
      i.verification = "Completed";
      i.riskFlags = [];
      i.history.push(entry("tnp", db.college.tnpHead, "Institutionally verified", note));
      notify(db, {
        audience: "student",
        audienceId: i.studentId,
        kind: "verification",
        title: "Internship verified",
        body: `${i.role} at ${companyOf(db, i)} is now a verified record in your Internship Passport.`,
        internshipId: i.id,
      });
      return db;
    });
  },
};

export { LIFECYCLE };
