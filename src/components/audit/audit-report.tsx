import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Bullets,
  GlassCard,
  KeyValue,
  Pill,
  ScoreBar,
  ScoreRing,
  SectionTitle,
  toneFromWord,
} from "@/components/report-ui";
import type { AuditReport } from "@/lib/report-types";
import { cn } from "@/lib/utils";

const PROJECT_METRICS = [
  ["complexity", "Complexity"],
  ["businessValue", "Business value"],
  ["technicalDepth", "Technical depth"],
  ["industryRelevance", "Industry relevance"],
  ["portfolioStrength", "Portfolio strength"],
] as const;

export function AuditReportView({
  report,
  onRestart,
}: {
  report: AuditReport;
  onRestart: () => void;
}) {
  const [sprintPage, setSprintPage] = useState(0);
  const sprint = report.sprint30Day ?? [];
  const pageDays = sprint.slice(sprintPage * 10, sprintPage * 10 + 10);

  return (
    <div className="animate-rise space-y-6">
      <GlassCard className="p-7 sm:p-9">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center">
          <ScoreRing
            value={report.readinessIndex}
            label="Readiness Index"
            sublabel={report.readinessLabel}
          />
          <div className="flex-1">
            <Pill tone={toneFromWord(report.readinessLabel) as never}>{report.readinessLabel}</Pill>
            <p className="mt-4 text-lg leading-relaxed font-medium">{report.verdict}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {report.subScores?.map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-secondary/25 px-4">
                  <ScoreBar label={s.label} score={s.score} note={s.note} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onRestart}
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Run a new audit
        </button>
      </GlassCard>

      <GlassCard className="p-7">
        <SectionTitle title="Career GPS" subtitle="Where you are, where you're going, how far." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KeyValue label="Current position" value={report.careerGps?.currentPosition} />
          <KeyValue label="Target role" value={report.careerGps?.targetRole} />
          <KeyValue label="Distance remaining" value={report.careerGps?.distanceRemaining} />
          <KeyValue label="Prep time" value={report.careerGps?.estimatedPreparationTime} />
          <KeyValue label="Confidence" value={report.careerGps?.confidence ?? "—"} />
        </div>
        <div className="mt-7 space-y-4">
          {report.roadmap?.map((m, i) => (
            <div key={i} className="relative border-l border-border pl-6">
              <span className="gradient-brand absolute top-1.5 -left-[5px] size-2.5 rounded-full" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{m.milestone}</p>
                <Pill tone="brand">{m.timeframe}</Pill>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{m.outcome}</p>
              <div className="mt-2">
                <Bullets items={m.tasks} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-7">
          <SectionTitle title="Strength analysis" subtitle="Top 5, and why they matter." />
          <div className="space-y-4">
            {report.strengths?.map((s, i) => (
              <div key={i} className="rounded-xl border border-success/25 bg-success/[0.06] p-4">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.why}</p>
                {s.leverage ? (
                  <p className="mt-2 text-xs text-success">Leverage: {s.leverage}</p>
                ) : null}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-7">
          <SectionTitle title="Weakness analysis" subtitle="What it costs you, and the fix." />
          <div className="space-y-4">
            {report.weaknesses?.map((w, i) => (
              <div
                key={i}
                className="rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4"
              >
                <p className="text-sm font-semibold">{w.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{w.why}</p>
                {w.cost ? <p className="mt-2 text-xs text-destructive">Cost: {w.cost}</p> : null}
                {w.fix ? <p className="mt-1 text-xs text-primary">Fix: {w.fix}</p> : null}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden p-7">
        <SectionTitle title="Skill gap matrix" subtitle="Prioritised, with realistic timelines." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr>
                {["Skill", "Now", "Required", "Priority", "Time", "Difficulty", "Resources"].map(
                  (h) => (
                    <th key={h} className="pb-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {report.skillGapMatrix?.map((row, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="py-3 pr-4 font-medium">{row.skill}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.current}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.required}</td>
                  <td className="py-3 pr-4">
                    <Pill tone={row.priority === "Critical" ? "bad" : "warn"}>{row.priority}</Pill>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.learningTime}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.difficulty}</td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {row.resources?.join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {report.projectAnalysis?.length ? (
        <GlassCard className="p-7">
          <SectionTitle title="Project analysis" subtitle="Rated the way a hiring manager reads it." />
          <div className="grid gap-5 lg:grid-cols-2">
            {report.projectAnalysis.map((p, i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-secondary/20 p-5">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.verdict}</p>
                <div className="mt-4 space-y-1">
                  {PROJECT_METRICS.map(([key, label]) => (
                    <ScoreBar
                      key={key}
                      label={label}
                      score={((p.scores?.[key] ?? 0) as number) * 10}
                    />
                  ))}
                </div>
                {p.missing?.length ? (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] tracking-wide text-destructive uppercase">
                      Missing
                    </p>
                    <Bullets items={p.missing} tone="bad" />
                  </div>
                ) : null}
                {p.upgrade ? <p className="mt-3 text-xs text-primary">Upgrade: {p.upgrade}</p> : null}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      {report.suggestedProjects?.length ? (
        <GlassCard className="p-7">
          <SectionTitle title="Projects you should build next" />
          <div className="grid gap-4 lg:grid-cols-3">
            {report.suggestedProjects.map((p, i) => (
              <div key={i} className="rounded-2xl border border-border/70 bg-secondary/20 p-5">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.why}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack?.map((s) => <Pill key={s}>{s}</Pill>)}
                </div>
                <p className="mt-3 text-xs text-primary">
                  {p.difficulty} · {p.timeToBuild}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-7">
          <SectionTitle title="Professional presence review" />
          <div className="space-y-5">
            {Object.entries(report.professionalPresence ?? {}).map(([key, val]) => (
              <div key={key} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                <ScoreBar label={labelize(key)} score={val?.score} note={val?.review} />
                <div className="mt-2">
                  <Bullets items={val?.actions} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-7">
          <SectionTitle title="Communication review" />
          <ScoreBar label="Interview readiness" score={report.communicationReview?.interviewReadiness} />
          <ScoreBar label="Presentation skills" score={report.communicationReview?.presentationSkills} />
          <ScoreBar
            label="Professional confidence"
            score={report.communicationReview?.professionalConfidence}
          />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {report.communicationReview?.review}
          </p>
          <div className="mt-4">
            <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Drills</p>
            <Bullets items={report.communicationReview?.drills} />
          </div>
          <div className="mt-7">
            <SectionTitle title="Industry readiness" subtitle="Where you're likely to succeed." />
            <div className="space-y-1">
              {report.industryReadiness?.map((seg) => (
                <ScoreBar key={seg.segment} label={seg.segment} score={seg.fit} note={seg.reason} />
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-7">
        <SectionTitle title="Personalized recommendations" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(report.recommendations ?? {}).map(([key, items]) => (
            <div key={key}>
              <p className="mb-3 text-[11px] tracking-wide text-primary uppercase">
                {labelize(key)}
              </p>
              <Bullets items={items} />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-7">
        <SectionTitle title="30-day sprint" subtitle="Daily tasks with a deliverable each day." />
        <div className="mb-5 flex gap-2">
          {[0, 1, 2].map((p) => (
            <button
              key={p}
              onClick={() => setSprintPage(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs",
                sprintPage === p
                  ? "gradient-brand text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground",
              )}
            >
              Day {p * 10 + 1}–{p * 10 + 10}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {pageDays.map((d) => (
            <div key={d.day} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <div className="flex items-center gap-2">
                <span className="gradient-brand grid size-7 place-items-center rounded-lg text-[11px] font-semibold text-primary-foreground">
                  {d.day}
                </span>
                <p className="text-sm font-medium">{d.focus}</p>
              </div>
              <div className="mt-3">
                <Bullets items={d.tasks} />
              </div>
              <p className="mt-3 text-xs text-success">Deliverable: {d.deliverable}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-7 sm:p-9">
        <SectionTitle title="Final summary" subtitle="Exactly where you stand today." />
        <p className="text-sm leading-7 text-muted-foreground">{report.finalSummary}</p>
      </GlassCard>
    </div>
  );
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
