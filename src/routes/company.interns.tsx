import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, EmptyState, FieldLabel, inputCls } from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, companyById, companyInternships, studentById, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/company/interns")({
  head: () => ({
    meta: [
      { title: "Interns & Feedback — Company — S2I" },
      {
        name: "description",
        content: "Track your interns and submit structured performance feedback as evidence.",
      },
      { property: "og:title", content: "Interns & Feedback — Company — S2I" },
      { property: "og:description", content: "Company feedback becomes part of the evidence trail." },
    ],
  }),
  component: CompanyInterns,
});

const EMPTY = {
  technical: 4,
  communication: 4,
  ownership: 4,
  punctuality: 4,
  teamwork: 4,
  remarks: "",
  wouldHire: true,
  skillsDemonstrated: "",
};

function CompanyInterns() {
  const db = useDB();
  const company = companyById(db, db.session.companyId);
  const interns = companyInternships(db, db.session.companyId);
  const [forms, setForms] = useState<Record<string, typeof EMPTY>>({});
  if (!company) return null;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Company workspace"
        title="Interns & feedback"
        description="Your feedback is required evidence before the institution can verify an internship."
      />
      <div className="space-y-6">
        {interns.length ? (
          interns.map((i) => {
            const form = forms[i.id] ?? EMPTY;
            const set = (patch: Partial<typeof EMPTY>) =>
              setForms((f) => ({ ...f, [i.id]: { ...form, ...patch } }));
            return (
              <div key={i.id}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {studentById(db, i.studentId)?.name}
                </p>
                <InternshipPanel internship={i}>
                  <ActionButton
                    tone="ghost"
                    onClick={() =>
                      actions.addCheckIn(i.id, {
                        date: new Date().toISOString().slice(0, 10),
                        kind: "Company confirmation",
                        reportedLocation: i.location,
                        workMode: i.workMode,
                        summary: "Company confirmed the intern is working as scheduled.",
                        consentGiven: true,
                        confirmedBy: "company",
                        confirmedByName: company.name,
                      })
                    }
                  >
                    Confirm attendance
                  </ActionButton>
                </InternshipPanel>

                {!i.companyFeedback ? (
                  <GlassCard className="mt-3 p-4">
                    <p className="text-sm font-semibold">Submit performance feedback</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-5">
                      {(
                        [
                          ["technical", "Technical"],
                          ["communication", "Communication"],
                          ["ownership", "Ownership"],
                          ["punctuality", "Punctuality"],
                          ["teamwork", "Teamwork"],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key}>
                          <FieldLabel>{label} (1–5)</FieldLabel>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            className={inputCls}
                            value={form[key]}
                            onChange={(e) => set({ [key]: Number(e.target.value) })}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Skills demonstrated (comma separated)</FieldLabel>
                        <input
                          className={inputCls}
                          value={form.skillsDemonstrated}
                          onChange={(e) => set({ skillsDemonstrated: e.target.value })}
                        />
                      </div>
                      <label className="flex items-end gap-2 pb-2 text-xs">
                        <input
                          type="checkbox"
                          checked={form.wouldHire}
                          onChange={(e) => set({ wouldHire: e.target.checked })}
                        />
                        We would hire this intern again
                      </label>
                    </div>
                    <div className="mt-3">
                      <FieldLabel>Remarks</FieldLabel>
                      <textarea
                        rows={2}
                        className={inputCls}
                        value={form.remarks}
                        onChange={(e) => set({ remarks: e.target.value })}
                      />
                    </div>
                    <div className="mt-3">
                      <ActionButton
                        onClick={() =>
                          actions.submitCompanyFeedback(i.id, {
                            byName: company.name,
                            technical: form.technical,
                            communication: form.communication,
                            ownership: form.ownership,
                            punctuality: form.punctuality,
                            teamwork: form.teamwork,
                            remarks: form.remarks || "Performed as expected.",
                            wouldHire: form.wouldHire,
                            skillsDemonstrated: form.skillsDemonstrated
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      >
                        Submit feedback
                      </ActionButton>
                    </div>
                  </GlassCard>
                ) : null}
              </div>
            );
          })
        ) : (
          <EmptyState message="No interns yet." />
        )}
      </div>
    </Page>
  );
}