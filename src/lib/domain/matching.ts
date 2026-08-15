import { skillSatisfied } from "@/lib/role-requirements";
import type { Opportunity, Student } from "./types";

/**
 * Rule-based matching engine. Deterministic by design so the demo is reliable and
 * every score can be explained back to the student's own assessment data.
 * AI assists explanation only — it never decides eligibility.
 */

export type ReasonKind = "strong" | "partial" | "missing";

export type MatchReason = {
  kind: ReasonKind;
  label: string;
  detail: string;
};

export type MatchResult = {
  studentId: string;
  score: number;
  eligible: boolean;
  blockers: string[];
  reasons: MatchReason[];
  breakdown: { label: string; earned: number; max: number; note: string }[];
};

const WEIGHTS = {
  required: 40,
  preferred: 12,
  cgpa: 14,
  department: 8,
  rolePreference: 10,
  location: 8,
  availability: 8,
} as const;

function studentSkillPool(student: Student) {
  return [
    ...student.skills,
    ...student.softSkills,
    ...student.certifications,
    ...student.projects.flatMap((p) => p.skills),
  ];
}

function evidenceText(student: Student) {
  return [
    student.resumeSummary,
    ...student.projects.map((p) => `${p.title} ${p.description} ${p.skills.join(" ")}`),
    ...student.certifications,
    ...student.interests,
  ]
    .join(" ")
    .toLowerCase();
}

function sameCity(a: string, b: string) {
  const x = (a || "").toLowerCase().trim();
  const y = (b || "").toLowerCase().trim();
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

export function matchStudent(student: Student, opp: Opportunity): MatchResult {
  const pool = studentSkillPool(student);
  const text = evidenceText(student);
  const reasons: MatchReason[] = [];
  const breakdown: MatchResult["breakdown"] = [];
  const blockers: string[] = [];

  // Required skills
  const requiredHits = opp.requiredSkills.filter((s) => skillSatisfied(s, text, pool));
  opp.requiredSkills.forEach((s) => {
    if (requiredHits.includes(s)) {
      reasons.push({ kind: "strong", label: s, detail: "Required skill present in your profile" });
    } else {
      reasons.push({ kind: "missing", label: s, detail: "Required skill not evidenced anywhere" });
    }
  });
  const requiredEarned = opp.requiredSkills.length
    ? (requiredHits.length / opp.requiredSkills.length) * WEIGHTS.required
    : WEIGHTS.required;
  breakdown.push({
    label: "Required skills",
    earned: Math.round(requiredEarned),
    max: WEIGHTS.required,
    note: `${requiredHits.length} of ${opp.requiredSkills.length} matched`,
  });

  // Preferred skills
  const preferredHits = opp.preferredSkills.filter((s) => skillSatisfied(s, text, pool));
  opp.preferredSkills.forEach((s) => {
    if (preferredHits.includes(s)) {
      reasons.push({ kind: "strong", label: s, detail: "Preferred skill present" });
    } else {
      reasons.push({ kind: "partial", label: s, detail: "Preferred skill — nice to add" });
    }
  });
  const preferredEarned = opp.preferredSkills.length
    ? (preferredHits.length / opp.preferredSkills.length) * WEIGHTS.preferred
    : WEIGHTS.preferred;
  breakdown.push({
    label: "Preferred skills",
    earned: Math.round(preferredEarned),
    max: WEIGHTS.preferred,
    note: `${preferredHits.length} of ${opp.preferredSkills.length} matched`,
  });

  // CGPA
  let cgpaEarned = 0;
  if (student.cgpa >= opp.minCgpa) {
    cgpaEarned = WEIGHTS.cgpa;
    reasons.push({
      kind: "strong",
      label: `CGPA ${student.cgpa.toFixed(2)}`,
      detail: `Meets the minimum of ${opp.minCgpa.toFixed(1)}`,
    });
  } else if (student.cgpa >= opp.minCgpa - 0.3) {
    cgpaEarned = Math.round(WEIGHTS.cgpa * 0.4);
    reasons.push({
      kind: "partial",
      label: `CGPA ${student.cgpa.toFixed(2)}`,
      detail: `Marginally below the ${opp.minCgpa.toFixed(1)} cut-off — T&P discretion`,
    });
  } else {
    reasons.push({
      kind: "missing",
      label: `CGPA ${student.cgpa.toFixed(2)}`,
      detail: `Below the required ${opp.minCgpa.toFixed(1)}`,
    });
    blockers.push(`CGPA below the ${opp.minCgpa.toFixed(1)} eligibility cut-off`);
  }
  breakdown.push({
    label: "CGPA",
    earned: cgpaEarned,
    max: WEIGHTS.cgpa,
    note: `Required ${opp.minCgpa.toFixed(1)}`,
  });

  // Department + year
  const deptOk = opp.departments.length === 0 || opp.departments.includes(student.department);
  const yearOk = opp.years.length === 0 || opp.years.includes(student.year);
  if (deptOk) {
    reasons.push({ kind: "strong", label: student.department, detail: "Eligible department" });
  } else {
    reasons.push({
      kind: "missing",
      label: student.department,
      detail: `Opportunity is open to ${opp.departments.join(", ")}`,
    });
    blockers.push("Department not in the eligibility list");
  }
  if (!yearOk) blockers.push(`Year ${student.year} is not eligible for this posting`);
  breakdown.push({
    label: "Department & year",
    earned: deptOk && yearOk ? WEIGHTS.department : 0,
    max: WEIGHTS.department,
    note: deptOk && yearOk ? "Eligible" : "Outside eligibility",
  });

  // Role preference
  const roleMatch = student.preferredRoles.some(
    (r) =>
      r.toLowerCase().includes(opp.role.toLowerCase()) ||
      opp.role.toLowerCase().includes(r.toLowerCase()),
  );
  const domainMatch = sameCity(student.preferredDomain, opp.domain);
  const roleEarned = roleMatch ? WEIGHTS.rolePreference : domainMatch ? 6 : 0;
  reasons.push({
    kind: roleMatch ? "strong" : domainMatch ? "partial" : "missing",
    label: opp.role,
    detail: roleMatch
      ? "Matches a role you listed as preferred"
      : domainMatch
        ? `Adjacent to your preferred domain (${student.preferredDomain})`
        : `You listed ${student.preferredRoles.join(", ") || "no preferred roles"}`,
  });
  breakdown.push({
    label: "Role preference",
    earned: roleEarned,
    max: WEIGHTS.rolePreference,
    note: roleMatch ? "Preferred role" : domainMatch ? "Adjacent domain" : "Different track",
  });

  // Location + mode
  const remote = opp.workMode === "Remote";
  const locOk = remote || sameCity(opp.location, student.preferredLocation) || sameCity(opp.location, student.city);
  const modeOk = student.preferredModes.includes(opp.workMode);
  const locEarned = locOk && modeOk ? WEIGHTS.location : locOk || modeOk ? 4 : 0;
  reasons.push({
    kind: locOk && modeOk ? "strong" : locOk || modeOk ? "partial" : "missing",
    label: `${opp.location} · ${opp.workMode}`,
    detail: locOk
      ? modeOk
        ? "Location and work mode both match your preference"
        : `Location works, but you prefer ${student.preferredModes.join("/") || "no stated mode"}`
      : `You prefer ${student.preferredLocation || "unspecified"}`,
  });
  breakdown.push({
    label: "Location & mode",
    earned: locEarned,
    max: WEIGHTS.location,
    note: `${opp.location} · ${opp.workMode}`,
  });

  // Availability
  const availOk =
    new Date(student.availableFrom) <= new Date(opp.startDate) &&
    student.availableMonths >= opp.durationMonths;
  const availPartial = student.availableMonths >= opp.durationMonths - 1;
  const availEarned = availOk ? WEIGHTS.availability : availPartial ? 4 : 0;
  reasons.push({
    kind: availOk ? "strong" : availPartial ? "partial" : "missing",
    label: `${student.availableMonths} months available`,
    detail: availOk
      ? `Free from ${student.availableFrom}, covers the ${opp.durationMonths}-month duration`
      : `Posting needs ${opp.durationMonths} months from ${opp.startDate}`,
  });
  breakdown.push({
    label: "Availability",
    earned: availEarned,
    max: WEIGHTS.availability,
    note: availOk ? "Covers the internship window" : "Partial overlap",
  });

  // Experience bonus folded into the score cap
  const raw =
    requiredEarned +
    preferredEarned +
    cgpaEarned +
    (deptOk && yearOk ? WEIGHTS.department : 0) +
    roleEarned +
    locEarned +
    availEarned;

  const experienceBonus = Math.min(6, student.previousInternships * 3 + student.projects.length);
  const score = Math.max(0, Math.min(100, Math.round(raw + experienceBonus)));

  if (!student.assessmentComplete) {
    blockers.push("Career assessment incomplete — profile cannot be scored reliably");
  }

  return {
    studentId: student.id,
    score,
    eligible: blockers.length === 0,
    blockers,
    reasons,
    breakdown,
  };
}

export function rankCandidates(students: Student[], opp: Opportunity) {
  return students
    .map((s) => matchStudent(s, opp))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
}

export function matchBand(score: number) {
  if (score >= 80) return { label: "Strong match", tone: "good" as const };
  if (score >= 60) return { label: "Good match", tone: "brand" as const };
  if (score >= 40) return { label: "Partial match", tone: "warn" as const };
  return { label: "Weak match", tone: "bad" as const };
}

/** Requirement extraction from a free-text JD. Rule-based, transparent. */
const SKILL_DICTIONARY = [
  "Python","SQL","Excel","Power BI","Tableau","JavaScript","TypeScript","React","Node.js",
  "Java","C++","HTML","CSS","Tailwind","Next.js","MongoDB","PostgreSQL","MySQL","Docker",
  "Kubernetes","AWS","GCP","Azure","Git","Linux","Pandas","NumPy","scikit-learn","PyTorch",
  "TensorFlow","Figma","Flutter","React Native","Android","Selenium","Playwright","REST APIs",
  "Data Analytics","Machine Learning","Statistics","Communication","Prompt engineering",
];

export function extractRequirements(text: string) {
  const lower = (text || "").toLowerCase();
  const skills = SKILL_DICTIONARY.filter((s) => lower.includes(s.toLowerCase()));
  const cgpaMatch = lower.match(/cgpa\s*(?:>|>=|above|of|:)?\s*([0-9](?:\.[0-9])?)/);
  const durationMatch = lower.match(/([1-9]|1[0-2])\s*month/);
  const stipendMatch = lower.match(/(?:₹|rs\.?|inr)\s*([0-9,]{3,})/);
  return {
    skills,
    minCgpa: cgpaMatch ? Number(cgpaMatch[1]) : null,
    durationMonths: durationMatch ? Number(durationMatch[1]) : null,
    stipend: stipendMatch ? Number((stipendMatch[1] ?? "").replace(/,/g, "")) : null,
    remote: /remote|work from home|wfh/.test(lower),
  };
}
