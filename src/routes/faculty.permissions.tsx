import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, EmptyState, FieldLabel, Notice, inputCls } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, facultyInternships, studentById, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty/permissions")({
  head: () => ({
    meta: [
      { title: "Pending Permissions — Faculty — S2I" },
      {
        name: "description",
        content: "Grant or reject academic permission for approved internships.",
      },
      { property: "og:title", content: "Pending Permissions — Faculty — S2I" },
      { property: "og:description", content: "Academic permission decisions with recorded remarks." },
    ],
  }),
  component: FacultyPermissions,
});

function FacultyPermissions() {
  const db = useDB();
  const pending = facultyInternships(db, db.session.facultyId).filter(
    (i) => i.facultyPermission === "Pending",
  );
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Faculty workspace"
        title="Pending permissions"
        description="Academic clearance confirms the internship fits the student's curriculum and attendance obligations."
      />
      <div className="mb-5">
        <Notice tone="info" title="Your remarks are permanent evidence">
          Whatever you write is appended to the internship's single evidence trail.
        </Notice>
      </div>

      <div className="space-y-5">
        {pending.length ? (
          pending.map((i) => (
            <div key={i.id}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {studentById(db, i.studentId)?.name}
              </p>
              <InternshipPanel internship={i}>
                <div className="w-full">
                  <FieldLabel>Remarks</FieldLabel>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={remarks[i.id] ?? ""}
                    onChange={(e) => setRemarks((r) => ({ ...r, [i.id]: e.target.value }))}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      tone="success"
                      onClick={() =>
                        actions.setFacultyPermission(
                          i.id,
                          "Granted",
                          remarks[i.id] || "Curriculum fit verified; attendance adjustment approved.",
                        )
                      }
                    >
                      Grant permission
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() =>
                        actions.setFacultyPermission(
                          i.id,
                          "Rejected",
                          remarks[i.id] || "Conflicts with academic obligations.",
                        )
                      }
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
              </InternshipPanel>
            </div>
          ))
        ) : (
          <EmptyState message="No permissions awaiting your decision." />
        )}
      </div>
    </Page>
  );
}