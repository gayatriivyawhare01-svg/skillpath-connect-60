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
import { actions, companyById, studentApplications, studentById, useDB } from "@/lib/domain/store";
import { matchBand, matchStudent } from "@/lib/domain/matching";
import { formatDate, inr } from "@/lib/domain/types";

export const Route = createFileRoute("/student/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "College-placed internship openings approved by the T&P cell, with transparent match reasons.",
      },
      { property: "og:title", content: "Opportunities — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "T&P approved openings with transparent, explainable matching.",
      },
    ],
  }),
  component: StudentOpportunities,
});

function StudentOpportunities() {
  const db = useDB();
  const [query, setQuery] = useState("");
  const student = studentById(db, db.session.studentId);
  const applied = new Set(studentApplications(db, db.session.studentId).map((a) => a.opportunityId));
  if (!student) return null;

  const live = db.opportunities
    .filter((o) => o.status === "Live")
    .filter((o) =>
      `${o.role} ${o.domain} ${o.location}`.toLowerCase().includes(query.trim().toLowerCase()),
    );

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="College-placed pathway"
        title="Approved opportunities"
        description="Only openings the T&P cell has approved appear here. Matching is advisory — the T&P cell reviews every application before the company sees you."
      />

      {!student.assessmentComplete ? (
        <div className="mb-5">
          <Notice tone="warn" title="Assessment required">
            Complete your career assessment so matching can use verified skill data.
          </Notice>
        </div>
      ) : null}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search role, domain or location"
        className={`${inputCls} mb-5 max-w-md`}
      />

      <div className="space-y-4">
        {live.length ? (
          live.map((o) => {
            const match = matchStudent(student, o);
            const company = companyById(db, o.companyId);
            return (
              <GlassCard key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{o.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company?.name} · {o.location} · {o.workMode} · {inr(o.stipend)}/mo ·{" "}
                      {o.durationMonths} months
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Starts {formatDate(o.startDate)} · Apply by {formatDate(o.deadline)} · Min CGPA{" "}
                      {o.minCgpa} · {o.openings} openings
                    </p>
                  </div>
                  <div className="text-right">
                    <Pill tone={match.score >= 70 ? "good" : match.score >= 45 ? "warn" : "neutral"}>
                      {match.score}% · {matchBand(match.score).label}
                    </Pill>
                    <div className="mt-2">
                      {applied.has(o.id) ? (
                        <Pill tone="brand">Applied</Pill>
                      ) : (
                        <ActionButton
                          onClick={() => actions.studentApply(o.id, student.id, match.score)}
                          disabled={!student.assessmentComplete || !match.eligible}
                        >
                          Apply
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{o.description}</p>

                <p className="mt-4 mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                  Why this match
                </p>
                <ul>
                  {match.reasons.map((r) => (
                    <ReasonRow key={r.label} kind={r.kind} label={r.label} detail={r.detail} />
                  ))}
                </ul>
                {!match.eligible ? (
                  <p className="mt-2 text-[11px] text-destructive">
                    You do not meet the mandatory eligibility criteria for this opening.
                  </p>
                ) : null}
                <AiDisclaimer>
                  Matching is a rule-based recommendation to help prioritisation. It is not
                  institutional verification and does not guarantee shortlisting.
                </AiDisclaimer>
              </GlassCard>
            );
          })
        ) : (
          <EmptyState message="No approved opportunities match your search." />
        )}
      </div>
    </Page>
  );
}