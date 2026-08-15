import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import {
  ActionButton,
  AiDisclaimer,
  EmptyState,
  Notice,
  ReasonRow,
  inputCls,
} from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, studentById, useDB } from "@/lib/domain/store";
import { analyseSelfPlaced } from "@/lib/domain/risk";
import { evidenceCompleteness } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/verification")({
  head: () => ({
    meta: [
      { title: "Verification Queue — T&P Cell — S2I" },
      {
        name: "description",
        content:
          "Move internships through Under Review, Needs More Evidence, T&P Approved, T&P Rejected and Institutionally Verified.",
      },
      { property: "og:title", content: "Verification Queue — T&P Cell — S2I" },
      {
        property: "og:description",
        content: "Human-recorded institutional review and verification decisions.",
      },
    ],
  }),
  component: TnpVerification,
});

function TnpVerification() {
  const db = useDB();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const queue = db.internships.filter((i) => i.review !== "Institutionally Verified");

  const note = (id: string) => notes[id]?.trim() ?? "";

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Verification queue"
        description="Review states are explicit and only ever set here. Institutional verification requires a complete evidence trail plus a faculty evaluation."
      />

      <div className="mb-5">
        <Notice tone="info" title="Verification rule">
          S2I will not let an automated check mark a record verified. You record the decision, and the
          reason is written into the internship history.
        </Notice>
      </div>

      <div className="space-y-6">
        {queue.length ? (
          queue.map((i) => {
            const completeness = evidenceCompleteness(i);
            const analysis = i.pathway === "self-placed" ? analyseSelfPlaced(i) : null;
            const canVerify = completeness.missing.length === 0 && !!i.facultyEvaluation;
            return (
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
                      status === "Accepted" ? "Accepted by T&P cell" : "Resubmission required",
                      "tnp",
                      db.college.tnpHead,
                    )
                  }
                />

                <GlassCard className="mt-3 p-4">
                  {analysis ? (
                    <>
                      <p className="text-sm font-semibold">Self-placed assessment</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{analysis.summary}</p>
                      <ul className="mt-2">
                        {analysis.indicators.map((ind) => (
                          <ReasonRow
                            key={ind.label}
                            kind={
                              ind.status === "ok"
                                ? "strong"
                                : ind.status === "attention"
                                  ? "partial"
                                  : "missing"
                            }
                            label={ind.label}
                            detail={ind.detail}
                          />
                        ))}
                      </ul>
                      <AiDisclaimer>{analysis.disclaimer}</AiDisclaimer>
                    </>
                  ) : null}

                  <textarea
                    rows={2}
                    className={`${inputCls} mt-3`}
                    placeholder="Decision note (recorded in the audit history)"
                    value={notes[i.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [i.id]: e.target.value }))}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      tone="ghost"
                      onClick={() =>
                        actions.setReview(i.id, "Under Review", note(i.id) || "Review started")
                      }
                    >
                      Under Review
                    </ActionButton>
                    <ActionButton
                      tone="ghost"
                      onClick={() =>
                        actions.setReview(
                          i.id,
                          "Needs More Evidence",
                          note(i.id) || `Missing: ${completeness.missing.join(", ")}`,
                        )
                      }
                    >
                      Needs More Evidence
                    </ActionButton>
                    <ActionButton
                      tone="success"
                      onClick={() =>
                        actions.setReview(i.id, "T&P Approved", note(i.id) || "Approved by T&P cell")
                      }
                    >
                      T&amp;P Approved
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() =>
                        actions.setReview(i.id, "T&P Rejected", note(i.id) || "Rejected by T&P cell")
                      }
                    >
                      T&amp;P Rejected
                    </ActionButton>
                    <ActionButton
                      disabled={!canVerify}
                      onClick={() =>
                        actions.institutionallyVerify(
                          i.id,
                          note(i.id) || "Evidence trail complete; faculty evaluation on record",
                        )
                      }
                    >
                      Institutionally Verify
                    </ActionButton>
                  </div>
                  {!canVerify ? (
                    <p className="mt-2 text-[11px] text-warning">
                      Verification is blocked:{" "}
                      {completeness.missing.length
                        ? `missing evidence (${completeness.missing.join(", ")})`
                        : "faculty evaluation not submitted"}
                      .
                    </p>
                  ) : null}
                </GlassCard>
              </div>
            );
          })
        ) : (
          <EmptyState message="Every internship record has been institutionally verified." />
        )}
      </div>
    </Page>
  );
}