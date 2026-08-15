import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Users, UserCheck, ShieldCheck } from "lucide-react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState, Notice, StatCard } from "@/components/s2i/ui";
import {
  companyApplications,
  companyById,
  companyInternships,
  companyOpportunities,
  studentById,
  useDB,
} from "@/lib/domain/store";
import { formatDate, inr } from "@/lib/domain/types";

export const Route = createFileRoute("/company/")({
  head: () => ({
    meta: [
      { title: "Company Dashboard — S2I Skill2Intern" },
      {
        name: "description",
        content: "Post internships, review T&P-released candidates and track your interns.",
      },
      { property: "og:title", content: "Company Dashboard — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Hiring pipeline for campus internships, released by the T&P cell.",
      },
    ],
  }),
  component: CompanyDashboard,
});

function CompanyDashboard() {
  const db = useDB();
  const company = companyById(db, db.session.companyId);
  const opps = companyOpportunities(db, db.session.companyId);
  const apps = companyApplications(db, db.session.companyId);
  const interns = companyInternships(db, db.session.companyId);
  if (!company) return null;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Company workspace"
        title={company.name}
        description={`${company.industry} · ${company.hqLocation}. You only ever see candidates the T&P cell has released to you.`}
      />

      {company.approval !== "T&P Approved" ? (
        <div className="mb-6">
          <Notice tone="warn" title={`Registration status: ${company.approval}`}>
            Your openings will not circulate to students until the T&P cell approves your company.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Openings" value={opps.length} icon={Briefcase} />
        <StatCard label="Released candidates" value={apps.length} icon={Users} tone="brand" />
        <StatCard
          label="Selected"
          value={apps.filter((a) => a.outcome === "Selected").length}
          icon={UserCheck}
          tone="good"
        />
        <StatCard
          label="Active interns"
          value={interns.filter((i) => i.stage !== "Verified").length}
          icon={ShieldCheck}
        />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Your openings</h2>
      {opps.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {opps.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{o.role}</p>
                <p className="text-[11px] text-muted-foreground">
                  {o.location} · {o.workMode} · {inr(o.stipend)}/mo · {o.openings} openings · apply by{" "}
                  {formatDate(o.deadline)}
                </p>
              </div>
              <Pill tone={o.status === "Live" ? "good" : "warn"}>{o.status}</Pill>
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState message="No openings posted yet." hint="Use Post Internship to submit one." />
      )}

      <h2 className="mt-8 mb-3 text-sm font-semibold">Recent candidate activity</h2>
      {apps.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {apps.slice(0, 8).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{studentById(db, a.studentId)?.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {a.matchScore}% match · {a.stage}
                  {a.interview ? ` · interview ${formatDate(a.interview.scheduledFor)}` : ""}
                </p>
              </div>
              <Pill tone={a.outcome === "Selected" ? "good" : "neutral"}>
                {a.outcome ?? "In progress"}
              </Pill>
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState message="No candidates released yet." />
      )}
    </Page>
  );
}