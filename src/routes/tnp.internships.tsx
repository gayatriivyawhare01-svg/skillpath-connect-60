import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, EmptyState, Toolbar, inputCls } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, studentById, useDB } from "@/lib/domain/store";
import { PATHWAY_LABEL, type Pathway } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/internships")({
  head: () => ({
    meta: [
      { title: "Internships — T&P Cell — S2I" },
      {
        name: "description",
        content:
          "Every college-placed and self-placed internship record with its full lifecycle and evidence trail.",
      },
      { property: "og:title", content: "Internships — T&P Cell — S2I" },
      { property: "og:description", content: "Both pathways, one evidence trail." },
    ],
  }),
  component: TnpInternships,
});

function TnpInternships() {
  const db = useDB();
  const [pathway, setPathway] = useState<Pathway | "all">("all");
  const [q, setQ] = useState("");

  const list = db.internships
    .filter((i) => pathway === "all" || i.pathway === pathway)
    .filter((i) =>
      `${studentById(db, i.studentId)?.name ?? ""} ${i.role} ${i.location}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
    );

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Internship records"
        description="Both pathways stay clearly distinguishable while sharing one lifecycle, one evidence trail and one audit history."
      />
      <Toolbar>
        <select
          className={`${inputCls} max-w-48`}
          value={pathway}
          onChange={(e) => setPathway(e.target.value as Pathway | "all")}
        >
          <option value="all" className="bg-card">
            All pathways
          </option>
          <option value="college-placed" className="bg-card">
            {PATHWAY_LABEL["college-placed"]}
          </option>
          <option value="self-placed" className="bg-card">
            {PATHWAY_LABEL["self-placed"]}
          </option>
        </select>
        <input
          className={`${inputCls} max-w-sm`}
          placeholder="Search student, role or location"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Toolbar>

      <div className="space-y-5">
        {list.length ? (
          list.map((i) => (
            <div key={i.id}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {studentById(db, i.studentId)?.name} · {studentById(db, i.studentId)?.rollNo}
              </p>
              <InternshipPanel
                internship={i}
                onReviewEvidence={(item, status) =>
                  actions.reviewEvidence(
                    i.id,
                    item.id,
                    status,
                    status === "Accepted" ? "Verified by T&P cell" : "Resubmission required",
                    "tnp",
                    db.college.tnpHead,
                  )
                }
              >
                <ActionButton
                  tone="ghost"
                  onClick={() => actions.advanceInternship(i.id, "tnp", db.college.tnpHead)}
                >
                  Advance stage
                </ActionButton>
              </InternshipPanel>
            </div>
          ))
        ) : (
          <EmptyState message="No internship records match this filter." />
        )}
      </div>
    </Page>
  );
}