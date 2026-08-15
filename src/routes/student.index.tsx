import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, BrainCircuit, Briefcase, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState, Notice, StatCard } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import {
  notificationsFor,
  opportunityById,
  studentApplications,
  studentById,
  studentInternships,
  useDB,
} from "@/lib/domain/store";
import { formatDate } from "@/lib/domain/types";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "Track your career assessment, applications, internship lifecycle and verified evidence trail in one place.",
      },
      { property: "og:title", content: "Student Dashboard — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Assessment, applications, internships and verified evidence in one workspace.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const db = useDB();
  const student = studentById(db, db.session.studentId);
  const internships = studentInternships(db, db.session.studentId);
  const applications = studentApplications(db, db.session.studentId);
  const verified = internships.filter((i) => i.review === "Institutionally Verified").length;
  const unread = notificationsFor(db, "student", db.session.studentId).filter((n) => !n.read).length;

  if (!student) return null;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Student workspace"
        title={`Welcome, ${student.name.split(" ")[0]}`}
        description={`${student.department} · Year ${student.year} · CGPA ${student.cgpa} · Faculty mentor assigned by the T&P cell.`}
      />

      {!student.assessmentComplete ? (
        <div className="mb-6">
          <Notice tone="warn" title="Career assessment incomplete">
            The T&P cell can only shortlist you for college-placed opportunities once your
            assessment is complete.{" "}
            <Link to="/student/career-audit" className="underline">
              Complete it now
            </Link>
            .
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Assessment"
          value={student.assessmentComplete ? "Complete" : "Pending"}
          tone={student.assessmentComplete ? "good" : "warn"}
          icon={BrainCircuit}
          hint={
            student.assessmentUpdatedAt
              ? `Updated ${formatDate(student.assessmentUpdatedAt)}`
              : "Required for matching"
          }
        />
        <StatCard
          label="Active applications"
          value={applications.length}
          icon={Briefcase}
          tone="brand"
          hint="College-placed pipeline"
        />
        <StatCard
          label="Internships"
          value={internships.length}
          icon={BadgeCheck}
          hint="Both pathways"
        />
        <StatCard
          label="Verified records"
          value={verified}
          tone="good"
          icon={ShieldCheck}
          hint={unread ? `${unread} unread updates` : "Institutionally verified"}
        />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Application pipeline</h2>
      {applications.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {applications.map((a) => {
            const opp = opportunityById(db, a.opportunityId);
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{opp?.role ?? "Opportunity"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.source} · match {a.matchScore}% ·{" "}
                    {a.tnpApproved ? "T&P approved" : "Awaiting T&P review"}
                    {a.interview ? ` · Interview ${formatDate(a.interview.scheduledFor)}` : ""}
                  </p>
                </div>
                <span className="rounded-lg border border-border/70 px-2.5 py-1 text-[11px]">
                  {a.stage}
                </span>
              </div>
            );
          })}
        </GlassCard>
      ) : (
        <EmptyState
          message="No applications yet."
          hint="Browse opportunities the T&P cell has approved."
        />
      )}

      <h2 className="mt-8 mb-3 text-sm font-semibold">My internships — one evidence trail</h2>
      <div className="space-y-5">
        {internships.length ? (
          internships.map((i) => <InternshipPanel key={i.id} internship={i} />)
        ) : (
          <EmptyState
            message="No internship record yet."
            hint="Get selected through the college pathway, or submit a self-placed internship."
          />
        )}
      </div>
    </Page>
  );
}