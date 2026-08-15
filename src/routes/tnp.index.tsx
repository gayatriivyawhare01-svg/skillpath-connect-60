import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, GraduationCap, ShieldCheck, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { AiDisclaimer, StatCard } from "@/components/s2i/ui";
import { companyOf, studentById, useDB } from "@/lib/domain/store";
import { PATHWAY_LABEL, formatDate } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/")({
  head: () => ({
    meta: [
      { title: "T&P Cell Overview — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "Institutional overview of students, companies, both internship pathways and the verification pipeline.",
      },
      { property: "og:title", content: "T&P Cell Overview — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Placement analytics and the institutional verification pipeline.",
      },
    ],
  }),
  component: TnpOverview,
});

function TnpOverview() {
  const db = useDB();
  const pendingOpps = db.opportunities.filter((o) => o.status === "Submitted to T&P").length;
  const pendingApps = db.applications.filter((a) => !a.tnpApproved).length;
  const pendingReview = db.internships.filter(
    (i) => i.review === "Student Submitted" || i.review === "Under Review",
  );
  const verified = db.internships.filter((i) => i.review === "Institutionally Verified").length;
  const flagged = db.internships.filter((i) => i.riskFlags.length);

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title={db.college.name}
        description="You are the institutional authority in S2I. Approvals, rejections and verification are only ever recorded through your actions."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Students"
          value={db.students.length}
          icon={GraduationCap}
          hint={`${db.students.filter((s) => s.assessmentComplete).length} assessment-complete`}
        />
        <StatCard
          label="Companies"
          value={db.companies.length}
          icon={Building2}
          hint={`${db.companies.filter((c) => c.approval === "T&P Approved").length} approved`}
        />
        <StatCard
          label="Verified internships"
          value={verified}
          tone="good"
          icon={ShieldCheck}
          hint={`${db.internships.length} total records`}
        />
        <StatCard
          label="Needs attention"
          value={pendingOpps + pendingApps + pendingReview.length + flagged.length}
          tone="warn"
          icon={TriangleAlert}
          hint="Openings, applications, reviews and flags"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <p className="text-sm font-semibold">Queue snapshot</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Opportunities awaiting approval</span>
              <span className="font-medium">{pendingOpps}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Applications awaiting T&P release</span>
              <span className="font-medium">{pendingApps}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Self-placed records under review</span>
              <span className="font-medium">{pendingReview.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Records with open risk flags</span>
              <span className="font-medium">{flagged.length}</span>
            </li>
          </ul>
          <Link
            to="/tnp/actions"
            className="gradient-brand mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Open Action Center
          </Link>
          <AiDisclaimer>
            S2I ranks and prioritises this queue. Prioritisation is not verification — every state
            change below is a recorded human decision.
          </AiDisclaimer>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-semibold">Records awaiting your decision</p>
          <ul className="mt-3 divide-y divide-border/60">
            {pendingReview.slice(0, 6).map((i) => (
              <li key={i.id} className="py-2.5">
                <p className="text-sm font-medium">
                  {studentById(db, i.studentId)?.name} · {i.role}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {PATHWAY_LABEL[i.pathway]} · {companyOf(db, i)} · submitted{" "}
                  {formatDate(i.createdAt)}
                </p>
              </li>
            ))}
            {!pendingReview.length ? (
              <li className="py-2 text-xs text-muted-foreground">Nothing pending review.</li>
            ) : null}
          </ul>
        </GlassCard>
      </div>
    </Page>
  );
}