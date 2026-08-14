import { createServerFn } from "@tanstack/react-start";
import { analyseSubmission, type AuditSubmission } from "./audit-evidence";
import type { AuditReport, ResumeReport, XrayReport } from "./report-types";

export const generateCareerAudit = createServerFn({ method: "POST" })
  .inputValidator((data: { submission: AuditSubmission }) => {
    if (!data?.submission?.targetRole?.trim()) throw new Error("A target role is required.");
    return data;
  })
  .handler(async ({ data }) => {
    const evidence = analyseSubmission(data.submission);
    const { runCareerAudit } = await import("./ai.server");
    const narrative = (await runCareerAudit({
      submission: data.submission,
      evidence,
    })) as Partial<AuditReport>;

    const recommendations = (narrative.recommendations ?? {}) as Record<string, string[]>;

    // Deterministic numbers override anything the model produced.
    const report: AuditReport = {
      ...(narrative as AuditReport),
      readinessIndex: evidence.overall,
      readinessLabel: evidence.readinessLabel,
      subScores: evidence.categories.map((c) => ({
        label: c.label,
        score: c.score,
        note: c.insufficient
          ? `Insufficient evidence — ${c.evidence[0] ?? ""}`
          : (c.evidence[0] ?? ""),
      })),

      categoryEvidence: evidence.categories,
      missingSkills: evidence.gaps,
      insufficientEvidence: evidence.insufficientEvidence,
      immediateNextSteps: recommendations["immediateNextSteps"] ?? [],
      recommendations,
      generatedAt: new Date().toISOString(),
    };
    return report;
  });

export const generateResumeIntel = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      role: string;
      jobDescription?: string;
      resumeText?: string;
      file?: { filename: string; mime: string; base64: string };
    }) => {
      if (!data?.role?.trim()) throw new Error("A target role is required.");
      if (!data.file && (data.resumeText ?? "").trim().length < 80)
        throw new Error("Upload a resume or paste at least a few lines of resume text.");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { runResumeIntel } = await import("./ai.server");
    const report = (await runResumeIntel(data)) as ResumeReport;
    const hasJd = Boolean(data.jobDescription && data.jobDescription.trim().length > 60);
    return {
      ...report,
      role: data.role,
      mode: hasJd ? "match" : "health",
      jdComparison: hasJd ? (report.jdComparison ?? null) : null,
      targetRoleMatch: hasJd
        ? report.targetRoleMatch
        : {
            score: null,
            note: "No job description supplied, so no job-match score was calculated. This report measures Resume Health only.",
          },
      generatedAt: new Date().toISOString(),
    } satisfies ResumeReport;
  });

export const generateInternshipXray = createServerFn({ method: "POST" })
  .inputValidator((data: { url?: string; description?: string }) => {
    const hasUrl = Boolean(data?.url?.trim());
    const hasText = (data?.description ?? "").trim().length >= 40;
    if (!hasUrl && !hasText)
      throw new Error(
        "Insufficient evidence. Paste the internship description (or provide a link) to run the X-Ray.",
      );
    return data;
  })
  .handler(async ({ data }) => {
    const { runInternshipXray } = await import("./ai.server");
    const report = (await runInternshipXray(data)) as XrayReport;
    return { ...report, generatedAt: new Date().toISOString() } satisfies XrayReport;
  });
