import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState, Notice, StageTracker } from "@/components/s2i/ui";
import { companyOf, studentById, useDB } from "@/lib/domain/store";
import { formatDate } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/monitoring")({
  head: () => ({
    meta: [
      { title: "Progress Monitoring — T&P Cell — S2I" },
      {
        name: "description",
        content:
          "Consent-based check-ins, progress evidence and open risk flags across active internships.",
      },
      { property: "og:title", content: "Progress Monitoring — T&P Cell — S2I" },
      { property: "og:description", content: "Check-ins, progress evidence and risk flags." },
    ],
  }),
  component: TnpMonitoring,
});

function TnpMonitoring() {
  const db = useDB();
  const active = db.internships.filter(
    (i) => i.stage !== "Verified" && i.review !== "T&P Rejected",
  );

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Progress monitoring"
        description="Check-ins are consent-based and student-confirmed. S2I never tracks location continuously or in the background."
      />
      <div className="mb-5">
        <Notice tone="info" title="Privacy by design">
          Every check-in below was explicitly submitted by the student or confirmed by the company.
        </Notice>
      </div>

      <div className="space-y-4">
        {active.length ? (
          active.map((i) => (
            <GlassCard key={i.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {studentById(db, i.studentId)?.name} · {i.role}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {companyOf(db, i)} · {i.location} · stage {i.stage}
                  </p>
                </div>
                <Pill tone={i.riskFlags.length ? "warn" : "good"}>
                  {i.riskFlags.length ? `${i.riskFlags.length} flags` : "No flags"}
                </Pill>
              </div>

              <div className="mt-3">
                <StageTracker stage={i.stage} compact />
              </div>

              {i.riskFlags.length ? (
                <ul className="mt-3 rounded-xl border border-warning/35 bg-warning/8 p-3 text-[11px] text-warning">
                  {i.riskFlags.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-4 mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                Check-ins
              </p>
              {i.checkIns.length ? (
                <ul className="divide-y divide-border/60">
                  {i.checkIns.map((c) => (
                    <li key={c.id} className="py-2">
                      <p className="text-xs font-medium">
                        {c.kind} · {formatDate(c.date)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {c.reportedLocation} · {c.workMode} · confirmed by {c.confirmedByName} (
                        {c.confirmedBy}) · consent {c.consentGiven ? "given" : "not given"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{c.summary}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground">No check-ins recorded yet.</p>
              )}
            </GlassCard>
          ))
        ) : (
          <EmptyState message="No active internships to monitor." />
        )}
      </div>
    </Page>
  );
}