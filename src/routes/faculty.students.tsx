import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { facultyInternships, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty/students")({
  head: () => ({
    meta: [
      { title: "Assigned Students — Faculty — S2I" },
      {
        name: "description",
        content: "Every assigned student's internship evidence trail in one place.",
      },
      { property: "og:title", content: "Assigned Students — Faculty — S2I" },
      { property: "og:description", content: "Mentor view of assigned students' internships." },
    ],
  }),
  component: FacultyStudents,
});

function FacultyStudents() {
  const db = useDB();
  const records = facultyInternships(db, db.session.facultyId);
  const students = db.students.filter((s) => s.facultyId === db.session.facultyId);

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Faculty workspace"
        title="Assigned students"
        description="Mentees you are accountable for, with their released internship records."
      />

      <GlassCard className="divide-y divide-border/60 p-0">
        {students.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.rollNo} · {s.department} · Year {s.year} · CGPA {s.cgpa}
              </p>
            </div>
            <Pill tone={s.assessmentComplete ? "good" : "warn"}>
              {s.assessmentComplete ? "Assessment complete" : "Assessment pending"}
            </Pill>
          </div>
        ))}
      </GlassCard>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Released internship records</h2>
      <div className="space-y-5">
        {records.length ? (
          records.map((i) => <InternshipPanel key={i.id} internship={i} />)
        ) : (
          <EmptyState message="No records released to you yet." />
        )}
      </div>
    </Page>
  );
}