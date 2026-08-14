import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { GlassCard, KeyValue, Pill, ScoreBar, SectionTitle } from "@/components/report-ui";
import { PageHeader } from "@/components/app-shell";
import { STORE, usePersistedState } from "@/lib/storage";
import type { AuditReport, ResumeReport } from "@/lib/report-types";
import { formatDate, verificationOf, type InternshipRecord } from "@/lib/passport";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Skill2Intern" },
      {
        name: "description",
        content:
          "One page linking your Career Audit readiness, your latest resume analysis and your internship passport records.",
      },
      { property: "og:title", content: "Your Profile — Skill2Intern" },
      {
        property: "og:description",
        content: "Where you stand across all three modules, based only on what you've actually run.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [audit, , auditReady] = usePersistedState<AuditReport | null>(STORE.audit, null);
  const [resume] = usePersistedState<ResumeReport | null>(STORE.resume, null);
  const [records] = usePersistedState<InternshipRecord[]>(STORE.passport, []);

  const active = records.find((r) => r.status === "In Progress") ?? records[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="This page only shows what you have actually run or recorded. Nothing here is assumed."
      />

      {!auditReady ? (
        <GlassCard className="p-7 text-sm text-muted-foreground">Loading your data…</GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-7 lg:col-span-2">
            <SectionTitle title="Career GPS" subtitle="From your most recent Career Audit." />
            {audit ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <KeyValue label="Target role" value={audit.careerGps?.targetRole ?? "Not recorded"} />
                <KeyValue
                  label="Where you are"
                  value={audit.careerGps?.currentPosition ?? "Not recorded"}
                />
                <KeyValue
                  label="Distance remaining"
                  value={audit.careerGps?.distanceRemaining ?? "Not recorded"}
                />
                <KeyValue
                  label="Estimated preparation time"
                  value={audit.careerGps?.estimatedPreparationTime ?? "Not recorded"}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No career audit yet.{" "}
                <Link to="/career-audit" className="text-primary">
                  Run the Career Audit
                </Link>{" "}
                to see your readiness and gaps here.
              </p>
            )}

            <div className="mt-7">
              <SectionTitle
                title="Internship passport"
                subtitle="Records you've saved, with their real verification state."
              />
              {records.length ? (
                <div className="space-y-3">
                  {records.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {r.role} · {r.company}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(r.startDate)} → {formatDate(r.endDate)} ·{" "}
                          {r.documents.length} document{r.documents.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={r.status === "Completed" ? "good" : "brand"}>{r.status}</Pill>
                        <Pill tone={verificationOf(r) === "Verification Pending" ? "warn" : "neutral"}>
                          {verificationOf(r)}
                        </Pill>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No internships recorded.{" "}
                  <Link to="/internship-passport" className="text-primary">
                    Add your first one
                  </Link>
                  .
                </p>
              )}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-7">
              <SectionTitle title="Career Readiness Index" />
              {audit ? (
                <>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold">
                      {audit.readinessIndex}
                    </span>
                    <Pill tone="brand">{audit.readinessLabel}</Pill>
                  </div>
                  {audit.subScores?.map((s) => (
                    <ScoreBar key={s.label} label={s.label} score={s.score} />
                  ))}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last run {formatDate(audit.generatedAt?.slice(0, 10))}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not calculated yet.</p>
              )}
              <Link
                to="/career-audit"
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary"
              >
                {audit ? "Re-run career audit" : "Start career audit"}{" "}
                <ArrowRight className="size-3.5" />
              </Link>
            </GlassCard>

            <GlassCard className="p-7">
              <SectionTitle title="Latest resume analysis" />
              {resume ? (
                <div className="space-y-3">
                  <KeyValue label="Target role" value={resume.role ?? "Not recorded"} />
                  <KeyValue label="ATS score" value={String(resume.atsScore)} />
                  <KeyValue label="Resume health" value={String(resume.resumeQualityScore)} />
                  <KeyValue
                    label="Job match"
                    value={
                      resume.targetRoleMatch?.score !== null &&
                      resume.targetRoleMatch?.score !== undefined
                        ? String(resume.targetRoleMatch.score)
                        : "No job description supplied"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Last run {formatDate(resume.generatedAt?.slice(0, 10))}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No resume analysed yet.{" "}
                  <Link to="/resume-intelligence" className="text-primary">
                    Analyse your resume
                  </Link>
                  .
                </p>
              )}
            </GlassCard>

            {active ? (
              <GlassCard className="p-7">
                <SectionTitle title="Current internship" />
                <KeyValue label={active.company} value={`${active.role} · ${active.status}`} />
              </GlassCard>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
