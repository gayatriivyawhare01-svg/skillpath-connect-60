import { requirementForRole, skillSatisfied } from "./role-requirements";

export type AuditProject = {
  name: string;
  description: string;
  problemSolved: string;
  technologies: string;
  github: string;
  live: string;
  contribution: string;
  challenges: string;
  lessons: string;
};

export type AuditSubmission = {
  personal: {
    name: string;
    college: string;
    degree: string;
    branch: string;
    year: string;
    graduationYear: string;
    cgpa: string;
  };
  targetRole: string;
  technicalSkills: Record<string, string>;
  projects: AuditProject[];
  professionalProfiles: Record<string, string>;
  experience: Record<string, string>;
  softSkillsRating: Record<string, number>;
  communicationAnswers?: Record<string, string>;
  careerPreferences: {
    mode: string;
    stipend: string;
    industry: string;
    location: string;
    companyType: string;
  };
  resumeSnapshot?: { role: string; resumeHealth: number; atsScore: number; date: string } | null;
};

export type CategoryEvidence = {
  key: string;
  label: string;
  score: number;
  evidence: string[];
  insufficient?: boolean;
};

export type SkillGap = {
  skill: string;
  status: "Missing" | "Beginner only" | "Not demonstrated";
  evidence: string;
  recommendation: string;
  priority: "Critical" | "High" | "Medium";
};

export type AuditEvidence = {
  targetRole: string;
  requirementSet: { core: string[]; supporting: string[]; signals: string[] };
  overall: number;
  readinessLabel: string;
  categories: CategoryEvidence[];
  matchedSkills: string[];
  gaps: SkillGap[];
  facts: string[];
  insufficientEvidence: string[];
  focusAreas: string[];
};

const PROF_WEIGHT: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const isUrl = (v?: string) => Boolean(v && /^https?:\/\/\S+\.\S+/i.test(v.trim()));
const words = (v?: string) => (v ? v.trim().split(/\s+/).filter(Boolean).length : 0);

export function analyseSubmission(sub: AuditSubmission): AuditEvidence {
  const role = sub.targetRole?.trim() || "General Engineering";
  const req = requirementForRole(role);
  const selected = Object.keys(sub.technicalSkills ?? {});
  const projects = (sub.projects ?? []).filter((p) => p.name?.trim());
  const projectText = projects
    .map((p) => [p.technologies, p.description, p.contribution, p.problemSolved].join(" "))
    .join(" ");
  const skillText = selected.join(" ");
  const facts: string[] = [];
  const insufficient: string[] = [];

  // ---------- A. Technical readiness ----------
  const matchedCore: string[] = [];
  const coreGaps: SkillGap[] = [];
  let proficiencyPoints = 0;
  for (const core of req.core) {
    const satisfied = skillSatisfied(core, `${skillText} ${projectText}`, selected);
    if (satisfied) {
      matchedCore.push(core);
      const direct = selected.find((s) => core.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(core.toLowerCase().replace(/\s*\(.*\)\s*/, "")));
      const level = direct ? (sub.technicalSkills[direct] ?? "Beginner") : "Beginner";
      proficiencyPoints += PROF_WEIGHT[level] ?? 1;
      if ((PROF_WEIGHT[level] ?? 1) === 1) {
        coreGaps.push({
          skill: core,
          status: "Beginner only",
          evidence: `You selected ${direct ?? core} at Beginner level, but ${role} interviews assume working confidence in it.`,
          recommendation: `Move ${core} from Beginner to Intermediate by using it end-to-end in one project this month.`,
          priority: "High",
        });
      }
    } else {
      coreGaps.push({
        skill: core,
        status: "Missing",
        evidence: `Target role ${role} requires ${core}, but neither your selected skills (${selected.join(", ") || "none selected"}) nor your project details mention it.`,
        recommendation: `Learn ${core} fundamentals and build one small project that visibly uses ${core}.`,
        priority: "Critical",
      });
    }
  }
  const matchedSupporting = req.supporting.filter((s) =>
    skillSatisfied(s, `${skillText} ${projectText}`, selected),
  );
  const supportingGaps: SkillGap[] = req.supporting
    .filter((s) => !matchedSupporting.includes(s))
    .slice(0, 4)
    .map((s) => ({
      skill: s,
      status: "Not demonstrated" as const,
      evidence: `${s} is a common supporting requirement for ${role}; it does not appear in your skills or projects.`,
      recommendation: `Add ${s} to one existing project rather than studying it in isolation.`,
      priority: "Medium" as const,
    }));

  const coreCoverage = req.core.length ? matchedCore.length / req.core.length : 0;
  const proficiencyRatio = req.core.length ? proficiencyPoints / (req.core.length * 3) : 0;
  const technical = clamp(coreCoverage * 55 + proficiencyRatio * 45);
  facts.push(
    `Core skill coverage for ${role}: ${matchedCore.length}/${req.core.length} (${matchedCore.join(", ") || "none"}).`,
  );
  if (selected.length === 0) insufficient.push("No technical skills were selected, so technical readiness cannot be judged reliably.");

  // ---------- B. Project readiness ----------
  const projectDetail = projects.map((p) => {
    let depth = 0;
    if (words(p.description) >= 15) depth += 22;
    else if (words(p.description) > 0) depth += 10;
    if (words(p.problemSolved) >= 8) depth += 18;
    if (words(p.contribution) >= 10) depth += 22;
    else if (words(p.contribution) > 0) depth += 9;
    if (p.technologies?.trim()) depth += 14;
    if (isUrl(p.github)) depth += 12;
    if (isUrl(p.live)) depth += 8;
    if (words(p.challenges) >= 6) depth += 4;
    const missing: string[] = [];
    if (words(p.description) < 15) missing.push("a concrete description");
    if (words(p.problemSolved) < 8) missing.push("the problem it solves");
    if (words(p.contribution) < 10) missing.push("your specific contribution");
    if (!p.technologies?.trim()) missing.push("technologies used");
    if (!isUrl(p.github)) missing.push("a GitHub link");
    if (!isUrl(p.live)) missing.push("a live/demo link");
    return { name: p.name, depth: clamp(depth), missing };
  });
  const avgDepth = projectDetail.length
    ? projectDetail.reduce((a, p) => a + p.depth, 0) / projectDetail.length
    : 0;
  const countFactor = Math.min(projects.length, 3) / 3;
  const projectReadiness = clamp(avgDepth * 0.7 + countFactor * 30);
  if (projects.length === 0)
    insufficient.push("No projects were submitted, so project readiness is scored as no evidence.");
  facts.push(
    projects.length
      ? `Projects submitted: ${projectDetail.map((p) => `${p.name} (depth ${p.depth}/100${p.missing.length ? `, missing: ${p.missing.join(", ")}` : ""})`).join(" | ")}.`
      : "Projects submitted: none.",
  );

  // ---------- C. Target-role alignment ----------
  const roleTechInProjects = [...req.core, ...req.supporting].filter((s) =>
    skillSatisfied(s, projectText, []),
  );
  const alignment = clamp(
    coreCoverage * 45 +
      (req.core.length ? (roleTechInProjects.length / (req.core.length + req.supporting.length)) * 40 : 0) +
      (projects.length ? 15 : 0),
  );
  facts.push(
    `Role-relevant technologies visible inside project descriptions: ${roleTechInProjects.join(", ") || "none"}.`,
  );

  // ---------- D. Resume readiness ----------
  let resumeReadiness = 0;
  let resumeInsufficient = false;
  if (sub.resumeSnapshot) {
    resumeReadiness = clamp((sub.resumeSnapshot.resumeHealth + sub.resumeSnapshot.atsScore) / 2);
    facts.push(
      `Resume Intelligence run on ${sub.resumeSnapshot.date} for "${sub.resumeSnapshot.role}": resume health ${sub.resumeSnapshot.resumeHealth}, ATS ${sub.resumeSnapshot.atsScore}.`,
    );
  } else {
    resumeInsufficient = true;
    insufficient.push(
      "No resume has been analysed in Resume Intelligence, so resume readiness is Insufficient evidence.",
    );
    facts.push("Resume: not analysed yet (no Resume Intelligence report stored on this device).");
  }

  // ---------- E. Communication readiness ----------
  const soft = sub.softSkillsRating ?? {};
  const softAvg =
    Object.values(soft).length
      ? Object.values(soft).reduce((a, b) => a + b, 0) / Object.values(soft).length
      : 0;
  const answers = Object.entries(sub.communicationAnswers ?? {}).filter(([, v]) => words(v) > 0);
  const answerWords = answers.reduce((a, [, v]) => a + words(v), 0);
  const answerQuality = answers.length
    ? clamp(Math.min(answerWords / (answers.length * 60), 1) * 100)
    : 0;
  const communication = answers.length
    ? clamp(softAvg * 5 * 0.4 + answerQuality * 0.6)
    : clamp(softAvg * 5 * 0.6);
  if (!answers.length)
    insufficient.push(
      "No written communication answers were provided — communication readiness is based only on self-rating, which is weaker evidence.",
    );
  facts.push(
    `Self-rated soft skills (1-10): ${Object.entries(soft).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}.`,
  );
  if (answers.length)
    facts.push(
      `Written communication answers: ${answers.map(([k, v]) => `${k} — "${v.trim().slice(0, 400)}"`).join(" | ")}.`,
    );

  // ---------- F. Professional presence ----------
  const profiles = sub.professionalProfiles ?? {};
  const presenceItems: Array<[string, number]> = [
    ["github", 34],
    ["linkedin", 26],
    ["portfolio", 20],
    ["leetcode", 10],
    ["hackerrank", 5],
    ["devfolio", 5],
  ];
  let presence = 0;
  const missingProfiles: string[] = [];
  for (const [key, weight] of presenceItems) {
    if (isUrl(profiles[key])) presence += weight;
    else missingProfiles.push(key);
  }
  const professionalPresence = clamp(presence);
  facts.push(
    `Public profiles provided: ${presenceItems.filter(([k]) => isUrl(profiles[k])).map(([k]) => `${k} (${profiles[k]})`).join(", ") || "none"}. Missing: ${missingProfiles.join(", ") || "none"}.`,
  );

  // ---------- G. Evidence strength ----------
  const claims = selected.length + projects.length;
  const backedByLink = projects.filter((p) => isUrl(p.github) || isUrl(p.live)).length;
  const experienceEntries = Object.entries(sub.experience ?? {}).filter(([, v]) => words(v) >= 4);
  const evidenceStrength = clamp(
    (claims ? (backedByLink / Math.max(projects.length, 1)) * 45 : 0) +
      (experienceEntries.length ? Math.min(experienceEntries.length, 3) * 10 : 0) +
      (isUrl(profiles["github"]) ? 15 : 0) +
      (sub.resumeSnapshot ? 10 : 0),
  );
  facts.push(
    `Experience entries described: ${experienceEntries.map(([k]) => k).join(", ") || "none"}. Projects with a working link: ${backedByLink}/${projects.length || 0}.`,
  );
  facts.push(
    `Academic context: ${[sub.personal?.degree, sub.personal?.branch, sub.personal?.year ? `${sub.personal.year} year` : "", sub.personal?.college, sub.personal?.cgpa ? `CGPA ${sub.personal.cgpa}` : ""].filter(Boolean).join(" · ") || "not provided"}.`,
  );

  const categories: CategoryEvidence[] = [
    {
      key: "technical",
      label: "Technical Readiness",
      score: technical,
      evidence: [
        `${matchedCore.length}/${req.core.length} core requirements for ${role} are covered.`,
        `Proficiency-weighted depth: ${Math.round(proficiencyRatio * 100)}% of the maximum for those skills.`,
      ],
    },
    {
      key: "projects",
      label: "Project Readiness",
      score: projectReadiness,
      evidence: projects.length
        ? projectDetail.map(
            (p) => `${p.name}: depth ${p.depth}/100${p.missing.length ? ` — missing ${p.missing.join(", ")}` : " — complete"}.`,
          )
        : ["No projects submitted."],
      insufficient: projects.length === 0,
    },
    {
      key: "alignment",
      label: "Target-Role Alignment",
      score: alignment,
      evidence: [
        `Role-relevant technologies inside your projects: ${roleTechInProjects.join(", ") || "none"}.`,
        `Core coverage contributes ${Math.round(coreCoverage * 100)}%.`,
      ],
    },
    {
      key: "resume",
      label: "Resume Readiness",
      score: resumeReadiness,
      evidence: sub.resumeSnapshot
        ? [
            `Latest Resume Intelligence: health ${sub.resumeSnapshot.resumeHealth}, ATS ${sub.resumeSnapshot.atsScore} for "${sub.resumeSnapshot.role}".`,
          ]
        : ["Insufficient evidence — no resume analysed yet."],
      insufficient: resumeInsufficient,
    },
    {
      key: "communication",
      label: "Communication Readiness",
      score: communication,
      evidence: answers.length
        ? [
            `${answers.length} written answer(s) totalling ${answerWords} words.`,
            `Self-rating average ${softAvg.toFixed(1)}/10 (self-reported).`,
          ]
        : [`Only self-rating available (average ${softAvg.toFixed(1)}/10) — weak evidence.`],
      insufficient: !answers.length,
    },
    {
      key: "presence",
      label: "Professional Presence",
      score: professionalPresence,
      evidence: [
        `Provided: ${presenceItems.filter(([k]) => isUrl(profiles[k])).map(([k]) => k).join(", ") || "none"}.`,
        `Missing: ${missingProfiles.join(", ") || "none"}.`,
      ],
    },
    {
      key: "evidence",
      label: "Evidence Strength",
      score: evidenceStrength,
      evidence: [
        `${backedByLink} of ${projects.length || 0} projects have a GitHub or live link.`,
        `${experienceEntries.length} experience entries described.`,
      ],
    },
  ];

  const scored = categories.filter((c) => !c.insufficient);
  const weights: Record<string, number> = {
    technical: 0.26,
    projects: 0.22,
    alignment: 0.18,
    resume: 0.1,
    communication: 0.1,
    presence: 0.08,
    evidence: 0.06,
  };
  const totalWeight = scored.reduce((a, c) => a + (weights[c.key] ?? 0), 0) || 1;
  const overall = clamp(
    scored.reduce((a, c) => a + c.score * (weights[c.key] ?? 0), 0) / totalWeight,
  );

  const readinessLabel =
    overall >= 82
      ? "Highly Competitive"
      : overall >= 66
        ? "Internship Ready"
        : overall >= 48
          ? "Emerging"
          : overall >= 30
            ? "Foundation Stage"
            : "Not Ready";

  const gaps = [...coreGaps, ...supportingGaps];
  const focusAreas: string[] = [];
  if (technical < 60) focusAreas.push("technical-skill depth");
  if (projectReadiness < 60) focusAreas.push("project depth and evidence");
  if (alignment < 60) focusAreas.push("role alignment");
  if (resumeInsufficient || resumeReadiness < 60) focusAreas.push("resume");
  if (communication < 60) focusAreas.push("communication and interview practice");
  if (professionalPresence < 60) focusAreas.push("public professional presence");
  if (evidenceStrength < 60) focusAreas.push("proof/evidence for claims");

  return {
    targetRole: role,
    requirementSet: { core: req.core, supporting: req.supporting, signals: req.signals },
    overall,
    readinessLabel,
    categories,
    matchedSkills: [...matchedCore, ...matchedSupporting],
    gaps,
    facts,
    insufficientEvidence: insufficient,
    focusAreas: focusAreas.length ? focusAreas : ["converting readiness into applications"],
  };
}
