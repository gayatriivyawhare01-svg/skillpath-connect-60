import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, AiDisclaimer, EmptyState, ReasonRow } from "@/components/s2i/ui";
import {
  actions,
  companyById,
  opportunityById,
  studentById,
  useDB,
} from "@/lib/domain/store";
import { matchStudent } from "@/lib/domain/matching";
import { formatDate, inr } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/actions")({
  head: () => ({
    meta: [
      { title: "Action Center — T&P Cell — S2I" },
      {
        name: "description",
        content:
          "Approve company openings, release student applications and act on self-placed submissions.",
      },
      { property: "og:title", content: "Action Center — T&P Cell — S2I" },
      {
        property: "og:description",
        content: "Every pending institutional decision in one queue.",
      },
    ],
  }),
  component: TnpActions,
});

function TnpActions() {
  const db = useDB();
  const pendingOpps = db.opportunities.filter((o) => o.status === "Submitted to T&P");
  const pendingApps = db.applications.filter((a) => !a.tnpApproved);
  const pendingCompanies = db.companies.filter((c) => c.approval !== "T&P Approved");

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Action Center"
        description="Nothing reaches a company or faculty member without a decision recorded here."
      />

      <h2 className="mb-3 text-sm font-semibold">Company registrations</h2>
      <div className="mb-8 space-y-3">
        {pendingCompanies.length ? (
          pendingCompanies.map((c) => (
            <GlassCard key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {c.industry} · {c.hqLocation} · {c.website} · {c.contactName} ({c.contactEmail})
                </p>
              </div>
              <div className="flex gap-2">
                <Pill tone="warn">{c.approval}</Pill>
                <ActionButton
                  tone="success"
                  onClick={() => actions.updateCompany(c.id, { approval: "T&P Approved" })}
                >
                  Approve
                </ActionButton>
                <ActionButton
                  tone="danger"
                  onClick={() => actions.updateCompany(c.id, { approval: "T&P Rejected" })}
                >
                  Reject
                </ActionButton>
              </div>
            </GlassCard>
          ))
        ) : (
          <EmptyState message="All registered companies have been reviewed." />
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Opportunities awaiting approval</h2>
      <div className="mb-8 space-y-3">
        {pendingOpps.length ? (
          pendingOpps.map((o) => (
            <GlassCard key={o.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{o.role}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {companyById(db, o.companyId)?.name} · {o.location} · {inr(o.stipend)}/mo ·{" "}
                    {o.openings} openings · min CGPA {o.minCgpa}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Required: {o.requiredSkills.join(", ")} · Departments:{" "}
                    {o.departments.join(", ")}
                  </p>
                </div>
                <ActionButton onClick={() => actions.approveOpportunity(o.id)}>
                  Approve &amp; circulate
                </ActionButton>
              </div>
            </GlassCard>
          ))
        ) : (
          <EmptyState message="No openings waiting for approval." />
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Student applications awaiting release</h2>
      <div className="space-y-3">
        {pendingApps.length ? (
          pendingApps.map((a) => {
            const opp = opportunityById(db, a.opportunityId);
            const student = studentById(db, a.studentId);
            const match = student && opp ? matchStudent(student, opp) : null;
            return (
              <GlassCard key={a.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {student?.name} → {opp?.role}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {student?.department} · CGPA {student?.cgpa} · applied{" "}
                      {formatDate(a.createdAt)} · {a.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={a.matchScore >= 70 ? "good" : "warn"}>{a.matchScore}% match</Pill>
                    <ActionButton
                      onClick={() => actions.shortlist(a.opportunityId, a.studentId, a.matchScore)}
                    >
                      Approve &amp; shortlist
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() => actions.rejectCandidate(a.id, "Not released by T&P cell")}
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
                {match ? (
                  <ul className="mt-2">
                    {match.reasons.slice(0, 4).map((r) => (
                      <ReasonRow key={r.label} kind={r.kind} label={r.label} detail={r.detail} />
                    ))}
                  </ul>
                ) : null}
              </GlassCard>
            );
          })
        ) : (
          <EmptyState message="No applications waiting for release." />
        )}
      </div>

      <AiDisclaimer>
        Match percentages are generated by rule-based scoring on assessment data. They rank work for
        you — they never approve, verify or reject anything on their own.
      </AiDisclaimer>
    </Page>
  );
}