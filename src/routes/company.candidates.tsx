import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import {
  ActionButton,
  AiDisclaimer,
  EmptyState,
  Notice,
  ReasonRow,
  inputCls,
} from "@/components/s2i/ui";
import {
  actions,
  companyApplications,
  opportunityById,
  studentById,
  useDB,
} from "@/lib/domain/store";
import { matchStudent } from "@/lib/domain/matching";
import { WORK_MODES, formatDate, todayISO, type WorkMode } from "@/lib/domain/types";

export const Route = createFileRoute("/company/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — Company — S2I" },
      {
        name: "description",
        content: "Review candidates released by the T&P cell, schedule interviews and select interns.",
      },
      { property: "og:title", content: "Candidates — Company — S2I" },
      { property: "og:description", content: "T&P-released candidates with transparent match reasons." },
    ],
  }),
  component: CompanyCandidates,
});

function CompanyCandidates() {
  const db = useDB();
  const apps = companyApplications(db, db.session.companyId);
  const [slots, setSlots] = useState<Record<string, { date: string; mode: WorkMode }>>({});

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Company workspace"
        title="Candidates"
        description="These profiles were reviewed and released by the T&P cell. Student contact details stay with the institution."
      />
      <div className="mb-5">
        <Notice tone="info" title="Institutional gatekeeping">
          Applications not yet released by the T&P cell are intentionally invisible here.
        </Notice>
      </div>

      <div className="space-y-4">
        {apps.length ? (
          apps.map((a) => {
            const student = studentById(db, a.studentId);
            const opp = opportunityById(db, a.opportunityId);
            const match = student && opp ? matchStudent(student, opp) : null;
            const slot = slots[a.id] ?? { date: todayISO(), mode: "Remote" as WorkMode };
            return (
              <GlassCard key={a.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {student?.name} → {opp?.role}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {student?.department} · Year {student?.year} · CGPA {student?.cgpa} ·{" "}
                      {student?.city}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Skills: {student?.skills.slice(0, 8).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={a.matchScore >= 70 ? "good" : "warn"}>{a.matchScore}% match</Pill>
                    <Pill tone="neutral">{a.stage}</Pill>
                  </div>
                </div>

                {match ? (
                  <ul className="mt-2">
                    {match.reasons.slice(0, 5).map((r) => (
                      <ReasonRow key={r.label} kind={r.kind} label={r.label} detail={r.detail} />
                    ))}
                  </ul>
                ) : null}

                {a.interview ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Interview {formatDate(a.interview.scheduledFor)} · {a.interview.mode} ·{" "}
                    {a.interview.result}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <input
                    type="date"
                    className={`${inputCls} max-w-40`}
                    value={slot.date}
                    onChange={(e) => setSlots((s) => ({ ...s, [a.id]: { ...slot, date: e.target.value } }))}
                  />
                  <select
                    className={`${inputCls} max-w-32`}
                    value={slot.mode}
                    onChange={(e) =>
                      setSlots((s) => ({ ...s, [a.id]: { ...slot, mode: e.target.value as WorkMode } }))
                    }
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m} value={m} className="bg-card">
                        {m}
                      </option>
                    ))}
                  </select>
                  <ActionButton
                    tone="ghost"
                    onClick={() => actions.scheduleInterview(a.id, slot.date, slot.mode)}
                  >
                    Schedule interview
                  </ActionButton>
                  <ActionButton
                    tone="success"
                    disabled={a.outcome === "Selected"}
                    onClick={() => actions.selectCandidate(a.id)}
                  >
                    Select
                  </ActionButton>
                  <ActionButton
                    tone="danger"
                    disabled={!!a.outcome}
                    onClick={() => actions.rejectCandidate(a.id, "Not selected after interview")}
                  >
                    Reject
                  </ActionButton>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <EmptyState message="No candidates released to you yet." />
        )}
      </div>

      <AiDisclaimer>
        Match reasons come from rule-based scoring on institutionally collected assessment data. They
        are advisory only — hiring decisions and institutional verification are separate human steps.
      </AiDisclaimer>
    </Page>
  );
}