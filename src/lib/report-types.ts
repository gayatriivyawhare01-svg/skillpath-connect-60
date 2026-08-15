import type { CategoryEvidence, SkillGap } from "./audit-evidence";

export type ScoreItem = { label: string; score: number; note?: string };

export type AuditReport = {
  readinessIndex: number;
  readinessLabel: string;
  verdict: string;
  subScores: ScoreItem[];
  /** Deterministic, evidence-backed category analysis computed from the submission. */
  categoryEvidence?: CategoryEvidence[];
  /** Skill gaps derived from the target-role requirement set. */
  missingSkills?: SkillGap[];
  insufficientEvidence?: string[];
  immediateNextSteps?: string[];
  careerGps: {
    currentPosition: string;
    targetRole: string;
    distanceRemaining: string;
    estimatedPreparationTime: string;
    confidence?: string;
  };
  roadmap: { milestone: string; timeframe: string; outcome: string; tasks: string[] }[];
  strengths: { title: string; why: string; leverage?: string }[];
  weaknesses: { title: string; evidence?: string; why: string; cost?: string; fix?: string }[];
  skillGapMatrix: {
    skill: string;
    current: string;
    required: string;
    priority: string;
    learningTime: string;
    difficulty: string;
    resources: string[];
  }[];
  projectAnalysis: {
    name: string;
    scores: Record<string, number>;
    verdict: string;
    missing: string[];
    upgrade: string;
  }[];
  suggestedProjects: {
    title: string;
    why: string;
    stack: string[];
    difficulty: string;
    timeToBuild: string;
  }[];
  professionalPresence: Record<string, { score: number; review: string; actions: string[] }>;
  communicationReview: {
    interviewReadiness: number;
    presentationSkills: number;
    professionalConfidence: number;
    review: string;
    drills: string[];
  };
  industryReadiness: { segment: string; fit: number; reason: string }[];
  recommendations: Record<string, string[]>;
  finalSummary: string;
  sprint30Day: { day: number; focus: string; tasks: string[]; deliverable: string }[];
  generatedAt?: string;
};

export type ResumeExtraction = {
  skills: string[];
  projects: { name: string; summary: string }[];
  education: string[];
  experience: string[];
  certifications: string[];
  achievements: string[];
  measurableResults: string[];
};

export type JdComparison = {
  roleAlignment: string;
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  relevantProjects: string[];
  weakOrIrrelevantSections: string[];
  missingEvidence: string[];
  weakBullets: { bullet: string; problem: string; rewritten: string }[];
};

export type ResumeReport = {
  /** Target role the analysis was run for. */
  role?: string;
  /** "health" = no job description supplied; "match" = compared against a JD. */
  mode: "health" | "match";
  atsScore: number;
  resumeQualityScore: number;
  targetRoleMatch: { score: number | null; note: string };
  extracted: ResumeExtraction;
  jdComparison?: JdComparison | null;
  scores: ScoreItem[];
  keywordMatch: { matched: string[]; missing: string[]; note: string };
  formattingReview: { verdict: string; issues: string[]; wins: string[] };
  missingSections: string[];
  redFlags: { flag: string; why: string; fix: string }[];
  recruiterPerspective: { firstSixSeconds: string; shortlistOdds: string; honestTake: string };
  topImprovements: { priority: number; change: string; why: string; impact: string }[];
  weakProjectDescriptions: { original: string; problem: string; rewritten: string }[];
  improvedBullets: { before: string; after: string; why: string }[];
  actionVerbs: string[];
  summary: string;
  generatedAt?: string;
};

export type RiskLevel = "LOW RISK" | "MODERATE RISK" | "HIGH RISK" | "INSUFFICIENT EVIDENCE";

export type XrayReport = {
  companyName: string;
  roleTitle: string;
  riskLevel: RiskLevel | string;
  confidence: "High" | "Moderate" | "Low" | string;
  healthScore: number | null;
  recommendation: string;
  recommendationReason: string;
  recommendedAction: string;
  trustLevel: string;
  sourceNote: string;
  positiveSignals: { signal: string; evidence: string }[];
  riskSignals: { signal: string; evidence: string; severity: "High" | "Moderate" | "Low" | string }[];
  missingInformation: string[];
  evidenceUsed: string[];
  metrics: ScoreItem[];
  expectedResponsibilities: string[];
  skillsActuallyLearned: { skill: string; depth: string }[];
  ppoPossibility: { likelihood: string; reason: string };
  hiddenRisks: { risk: string; evidence: string }[];
  warningFlags: string[];
  questionsToAsk: string[];
  suitableFor: string[];
  shouldAvoid: string[];
  employabilityImpact: string;
  valueAfterCompletion: Record<string, string>;
  generatedAt?: string;
};
