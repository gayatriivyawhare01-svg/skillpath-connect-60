import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, GraduationCap, ShieldCheck, BadgeCheck } from "lucide-react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState, Notice, StatCard } from "@/components/s2i/ui";
import { companyOf, facultyById, facultyInternships, studentById, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty/")({
  head: () => ({
    meta: [
      { title: "Faculty Dashboard — S2I Skill2Intern" },
      {
        name: "description",
        content: "Academic oversight of internship permissions, evaluations and credit recommendations.",
      },
      { property: "og:title", content: "Faculty Dashboard — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Faculty mentors review only T&P-released internship records.",
      },
    ],
  }),
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const db = useDB();
  const faculty = facultyById(db, db.session.facultyId);
  const records = facultyInternships(db, db.session.facultyId);
  const permissions = records.filter((i) => i.facultyPermission === "Pending");
  const evaluations = records.filter((i) => i.companyFeedback && !i.facultyEvaluation);
  if (!faculty) return null;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Faculty workspace"
        title={faculty.name}
        description={`${faculty.designation}, ${faculty.department}. You act on academic permission, evaluation and credit recommendation.`}
      />
      <div className="mb-6">
        <Notice tone="info" title="Scoped visibility">
          Only internships the T&P cell has approved or verified appear here — nothing in draft or
          under review.
        </Notice>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned records" value={records.length} icon={GraduationCap} />
        <StatCard label="Permissions pending" value={permissions.length} icon={ShieldCheck} tone="warn" />
        <StatCard label="Evaluations due" value={evaluations.length} icon={ClipboardList} tone="brand" />
        <StatCard
          label="Verified"
          value={records.filter((i) => i.verification === "Institutionally Verified").length}
          icon={BadgeCheck}
          tone="good"
        />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Needs your action</h2>
      {permissions.length || evaluations.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {[...permissions, ...evaluations].map((i) => (
            <div key={`${i.id}-${i.facultyPermission}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {studentById(db, i.studentId)?.name} — {i.role}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {companyOf(db, i)} · {i.pathway === "self-placed" ? "Self-placed" : "College-placed"}
                </p>
              </div>
              <Pill tone="warn">
                {i.facultyPermission === "Pending" ? "Permission pending" : "Evaluation due"}
              </Pill>
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState message="Nothing pending. All assigned records are up to date." />
      )}
    </Page>
  );
}