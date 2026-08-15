import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, EmptyState, FieldLabel, Notice, inputCls } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, facultyById, facultyInternships, studentById, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty/evaluations")({
  head: () => ({
    meta: [
      { title: "Evaluations — Faculty — S2I" },
      {
        name: "description",
        content: "Score learning outcomes, documentation quality and recommend academic credits.",
      },
      { property: "og:title", content: "Evaluations — Faculty — S2I" },
      { property: "og:description", content: "Faculty evaluation precedes institutional verification." },
    ],
  }),
  component: FacultyEvaluations,
});

const EMPTY = {
  learningOutcome: 4,
  documentation: 4,
  relevance: 4,
  remarks: "",
  verdict: "Approved" as "Approved" | "Needs rework" | "Rejected",
  creditsRecommended: 2,
};

function FacultyEvaluations() {
  const db = useDB();
  const faculty = facultyById(db, db.session.facultyId);
  const due = facultyInternships(db, db.session.facultyId).filter(
    (i) => i.companyFeedback && !i.facultyEvaluation,
  );
  const done = facultyInternships(db, db.session.facultyId).filter((i) => i.facultyEvaluation);
  const [forms, setForms] = useState<Record<string, typeof EMPTY>>({});
  if (!faculty) return null;
  const facultyId = faculty.id;
  const facultyName = faculty.name;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Faculty workspace"
        title="Evaluations"
        description="Evaluate only after company feedback and evidence are on record. Final institutional verification stays with the T&P cell."
      />
      <div className="mb-5">
        <Notice tone="info" title="Human judgement, not AI">
          S2I never marks an internship verified on its own — your evaluation plus T&P sign-off does.
        </Notice>
      </div>

      <div className="space-y-6">
        {due.length ? (
          due.map((i) => {
            const form = forms[i.id] ?? EMPTY;
            const set = (patch: Partial<typeof EMPTY>) =>
              setForms((f) => ({ ...f, [i.id]: { ...form, ...patch } }));
            return (
              <div key={i.id}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {studentById(db, i.studentId)?.name}
                </p>
                <InternshipPanel internship={i} />
                <GlassCard className="mt-3 p-4">
                  <p className="text-sm font-semibold">Evaluation sheet</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    {(
                      [
                        ["learningOutcome", "Learning outcome (1–5)"],
                        ["documentation", "Documentation (1–5)"],
                        ["relevance", "Curriculum relevance (1–5)"],
                        ["creditsRecommended", "Credits recommended"],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <FieldLabel>{label}</FieldLabel>
                        <input
                          type="number"
                          className={inputCls}
                          value={form[key]}
                          onChange={(e) => set({ [key]: Number(e.target.value) })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <FieldLabel>Verdict</FieldLabel>
                      <select
                        className={inputCls}
                        value={form.verdict}
                        onChange={(e) => set({ verdict: e.target.value as typeof EMPTY.verdict })}
                      >
                        {(["Approved", "Needs rework", "Rejected"] as const).map((v) => (
                          <option key={v} value={v} className="bg-card">
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>Remarks</FieldLabel>
                      <input
                        className={inputCls}
                        value={form.remarks}
                        onChange={(e) => set({ remarks: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <ActionButton
                      onClick={() =>
                        actions.submitEvaluation(i.id, {
                          facultyId,
                          facultyName,
                          learningOutcome: form.learningOutcome,
                          documentation: form.documentation,
                          relevance: form.relevance,
                          remarks: form.remarks || "Outcomes and documentation reviewed.",
                          verdict: form.verdict,
                          creditsRecommended: form.creditsRecommended,
                        })
                      }
                    >
                      Submit evaluation
                    </ActionButton>
                  </div>
                </GlassCard>
              </div>
            );
          })
        ) : (
          <EmptyState message="No evaluations due right now." />
        )}
      </div>

      {done.length ? (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold">Completed evaluations</h2>
          <GlassCard className="divide-y divide-border/60 p-0">
            {done.map((i) => (
              <div key={i.id} className="p-4">
                <p className="text-sm font-medium">
                  {studentById(db, i.studentId)?.name} — {i.role}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Verdict {i.facultyEvaluation?.verdict} · {i.facultyEvaluation?.creditsRecommended}{" "}
                  credits · {i.facultyEvaluation?.remarks}
                </p>
              </div>
            ))}
          </GlassCard>
        </>
      ) : null}
    </Page>
  );
}