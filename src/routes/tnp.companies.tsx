import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton } from "@/components/s2i/ui";
import { actions, companyInternships, companyOpportunities, useDB } from "@/lib/domain/store";
import { formatDate } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/companies")({
  head: () => ({
    meta: [
      { title: "Companies — T&P Cell — S2I" },
      {
        name: "description",
        content: "Registered recruiters, their approval state, openings and current interns.",
      },
      { property: "og:title", content: "Companies — T&P Cell — S2I" },
      { property: "og:description", content: "Recruiter approvals and hiring activity." },
    ],
  }),
  component: TnpCompanies,
});

function TnpCompanies() {
  const db = useDB();
  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Companies"
        description="A company can only circulate openings to students after your approval."
      />
      <div className="space-y-3">
        {db.companies.map((c) => (
          <GlassCard key={c.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Pill
                    tone={
                      c.approval === "T&P Approved"
                        ? "good"
                        : c.approval === "T&P Rejected"
                          ? "bad"
                          : "warn"
                    }
                  >
                    {c.approval}
                  </Pill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.industry} · {c.size} · {c.hqLocation} · {c.website}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.contactName} · {c.contactEmail} · {c.contactPhone} · registered{" "}
                  {formatDate(c.registeredAt)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {companyOpportunities(db, c.id).length} openings ·{" "}
                  {companyInternships(db, c.id).length} interns
                </p>
              </div>
              <div className="flex gap-2">
                {c.approval !== "T&P Approved" ? (
                  <ActionButton
                    tone="success"
                    onClick={() => actions.updateCompany(c.id, { approval: "T&P Approved" })}
                  >
                    Approve
                  </ActionButton>
                ) : null}
                {c.approval !== "T&P Rejected" ? (
                  <ActionButton
                    tone="danger"
                    onClick={() => actions.updateCompany(c.id, { approval: "T&P Rejected" })}
                  >
                    Reject
                  </ActionButton>
                ) : null}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Page>
  );
}