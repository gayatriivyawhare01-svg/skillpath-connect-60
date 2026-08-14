import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RotateCcw, ScanSearch, ShieldAlert } from "lucide-react";
import { generateInternshipXray } from "@/lib/intel.functions";
import type { XrayReport } from "@/lib/report-types";
import {
  Bullets,
  GlassCard,
  KeyValue,
  Loading,
  Pill,
  ScoreBar,
  ScoreRing,
  SectionTitle,
  toneFromWord,
} from "@/components/report-ui";
import { PageHeader } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/student/xray")({
  head: () => ({
    meta: [
      { title: "Internship X-Ray — S2I — Skill2Intern" },
      {
        name: "description",
        content:
          "Paste an internship link or job description and get a health score, trust level, hidden risks and an Apply / Prepare First / Avoid verdict.",
      },
      { property: "og:title", content: "Internship X-Ray — S2I — Skill2Intern" },
      {
        property: "og:description",
        content: "Verify the opportunity before you spend three months on it.",
      },
    ],
  }),
  component: XrayPage,
});

function XrayPage() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [report, setReport] = useState<XrayReport | null>(null);
  const run = useServerFn(generateInternshipXray);
  const mutation = useMutation({
    mutationFn: () => run({ data: { url, description } }),
    onSuccess: (data) => {
      setReport(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const recTone = (r?: string) =>
    r === "Apply" ? "good" : r === "Avoid" ? "bad" : ("warn" as const);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageHeader
        eyebrow="Feature 03 · USP"
        title="Internship X-Ray"
        description="Most students judge an internship by its stipend. This scan judges it by learning potential, mentorship quality, transparency, career ROI and hidden risk — then tells you plainly what to do."
      />

      {mutation.isPending ? (
        <Loading message="Scanning this internship…" />
      ) : report ? (
        <div className="animate-rise space-y-6">
          <GlassCard className="p-7 sm:p-9">
            <div className="flex flex-col items-center gap-9 lg:flex-row">
              <ScoreRing value={report.healthScore ?? 0} label={report.healthScore === null ? "Not scored" : "Health Score"} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={recTone(report.recommendation)}>{report.recommendation}</Pill>
                  <Pill tone={report.riskLevel === "LOW RISK" ? "good" : report.riskLevel === "HIGH RISK" ? "bad" : "warn"}>
                    {report.riskLevel} · Confidence: {report.confidence}
                  </Pill>
                  <Pill tone={toneFromWord(report.trustLevel) as never}>
                    Trust: {report.trustLevel}
                  </Pill>
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{report.roleTitle}</h2>
                <p className="text-sm text-muted-foreground">{report.companyName}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {report.recommendationReason}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{report.sourceNote}</p>
                {report.recommendedAction ? (
                  <p className="mt-2 text-xs text-primary">Recommended action: {report.recommendedAction}</p>
                ) : null}
                <button
                  onClick={() => {
                    setReport(null);
                    mutation.reset();
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Scan another internship
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-7">
              <SectionTitle title="Quality metrics" />
              {report.metrics?.map((m) => (
                <ScoreBar key={m.label} label={m.label} score={m.score} note={m.note} />
              ))}
            </GlassCard>
            <div className="space-y-6">
              <GlassCard className="p-7">
                <SectionTitle title="What you'll actually do" />
                <Bullets items={report.expectedResponsibilities} />
                <div className="mt-5">
                  <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                    Skills you'll actually learn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.skillsActuallyLearned?.map((s) => (
                      <Pill key={s.skill} tone={toneFromWord(s.depth) as never}>
                        {s.skill} · {s.depth}
                      </Pill>
                    ))}
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-7">
                <SectionTitle title="PPO possibility" />
                <KeyValue label={report.ppoPossibility?.likelihood} value={report.ppoPossibility?.reason} />
              </GlassCard>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-7">
              <SectionTitle title="Positive signals" subtitle="Each one quoted from the text analysed." />
              <div className="space-y-3">
                {report.positiveSignals?.map((s, i) => (
                  <div key={i} className="rounded-xl border border-success/25 bg-success/[0.06] p-4">
                    <p className="text-sm font-medium">{s.signal}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{s.evidence}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Risk signals" subtitle="Evidence-based only." />
              <div className="space-y-3">
                {report.riskSignals?.map((s, i) => (
                  <div key={i} className="rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{s.signal}</p>
                      <Pill tone={s.severity === "High" ? "bad" : "warn"}>{s.severity}</Pill>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{s.evidence}</p>
                  </div>
                ))}
                {!report.riskSignals?.length ? (
                  <p className="text-xs text-muted-foreground">No evidence-based risk signals were found in the text supplied.</p>
                ) : null}
              </div>
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Missing information" subtitle="Not stated anywhere in the text." />
              <Bullets items={report.missingInformation} tone="bad" />
              <div className="mt-5">
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Evidence used</p>
                <Bullets items={report.evidenceUsed} />
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-7">
              <SectionTitle title="Hidden risks" />
              <div className="space-y-3">
                {report.hiddenRisks?.filter((r) => r?.risk?.trim()).map((r, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4"
                  >
                    <p className="text-sm font-medium">{r.risk}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{r.evidence}</p>
                  </div>
                ))}
              </div>
              {report.warningFlags?.length ? (
                <div className="mt-5">
                  <p className="mb-2 flex items-center gap-2 text-[11px] tracking-wide text-warning uppercase">
                    <ShieldAlert className="size-3.5" /> Warning flags
                  </p>
                  <Bullets items={report.warningFlags?.filter(Boolean)} tone="bad" />
                </div>
              ) : null}
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Ask these before you join" />
              <Bullets items={report.questionsToAsk} />
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-7">
              <SectionTitle title="Suitable for" />
              <Bullets items={report.suitableFor} tone="good" />
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Should avoid" />
              <Bullets items={report.shouldAvoid} tone="bad" />
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Employability impact" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {report.employabilityImpact}
              </p>
            </GlassCard>
          </div>

          <GlassCard className="p-7">
            <SectionTitle title="Estimated value after completion" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(report.valueAfterCompletion ?? {}).map(([key, value]) => (
                <KeyValue
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                  value={value}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-7 sm:p-9">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Internship URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://company.com/careers/intern-frontend"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Job description (paste for the most accurate scan)
              </Label>
              <Textarea
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full internship description, stipend, duration, responsibilities…"
              />
            </div>
            <button
              disabled={!url.trim() && description.trim().length < 40}
              onClick={() => mutation.mutate()}
              className="gradient-brand inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              <ScanSearch className="size-4" /> Run X-Ray
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
