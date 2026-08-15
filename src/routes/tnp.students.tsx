import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState, inputCls } from "@/components/s2i/ui";
import { facultyById, studentApplications, studentInternships, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/tnp/students")({
  head: () => ({
    meta: [
      { title: "Students — T&P Cell — S2I" },
      {
        name: "description",
        content: "Institutional view of every student: assessment status, pipeline and mentor.",
      },
      { property: "og:title", content: "Students — T&P Cell — S2I" },
      {
        property: "og:description",
        content: "Assessment readiness and internship pipeline for every student.",
      },
    ],
  }),
  component: TnpStudents,
});

function TnpStudents() {
  const db = useDB();
  const [q, setQ] = useState("");
  const students = db.students.filter((s) =>
    `${s.name} ${s.rollNo} ${s.department} ${s.skills.join(" ")}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Students"
        description="Assessment completeness decides who can be matched to college-placed openings."
      />
      <input
        className={`${inputCls} mb-5 max-w-md`}
        placeholder="Search name, roll number, department or skill"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {students.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {students.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <Pill tone={s.assessmentComplete ? "good" : "warn"}>
                    {s.assessmentComplete ? "Assessment complete" : "Assessment pending"}
                  </Pill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {s.rollNo} · {s.department} · Year {s.year} · CGPA {s.cgpa} · mentor{" "}
                  {facultyById(db, s.facultyId)?.name ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Skills: {s.skills.slice(0, 6).join(", ")}
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>{studentApplications(db, s.id).length} applications</p>
                <p>{studentInternships(db, s.id).length} internships</p>
              </div>
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState message="No students match your search." />
      )}
    </Page>
  );
}