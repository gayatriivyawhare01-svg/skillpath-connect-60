import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FileUp, RotateCcw, Wand2 } from "lucide-react";
import { generateResumeIntel } from "@/lib/intel.functions";
import type { ResumeReport } from "@/lib/report-types";
import { STORE, usePersistedState } from "@/lib/storage";
import {
  Bullets,
  GlassCard,
  KeyValue,
  Loading,
  Pill,
  ScoreBar,
  ScoreRing,
  SectionTitle,
} from "@/components/report-ui";
import { PageHeader } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/student/resume")({
  head: () => ({
    meta: [
      { title: "Resume Intelligence — Skill2Intern" },
      {
        name: "description",
        content:
          "Extract what your resume actually says, score its health, and compare it against a real job description to see matched and missing skills.",
      },
      { property: "og:title", content: "Resume Intelligence — Skill2Intern" },
      {
        property: "og:description",
        content: "Resume Health and Job Match, kept separate — with the reason behind every fix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<{ filename: string; mime: string; base64: string } | null>(null);
  const [report, setReport] = usePersistedState<ResumeReport | null>(STORE.resume, null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useServerFn(generateResumeIntel);
  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          role,
          ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
          ...(file ? { file } : { resumeText }),
        },
      }),

    onSuccess: (data) => {
      setReport(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onPick = async (f: File) => {
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Please upload a file under 8MB.");
      return;
    }
    const buffer = await f.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] as number);
    setFile({
      filename: f.name,
      mime: f.type || "application/pdf",
      base64: btoa(binary),
    });
    toast.success(`${f.name} attached`);
  };

  const ready = role.trim() && (file || resumeText.trim().length > 80);
  const extracted = report?.extracted;
  const notFound = (list?: string[]) => (list?.length ? list : ["Not found in resume."]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageHeader
        eyebrow="Feature 02"
        title="Resume Intelligence"
        description="Your resume is read line by line, then measured two ways: how healthy it is on its own, and how well it matches a specific job description if you paste one."
      />

      {mutation.isPending ? (
        <Loading message="Reading your resume…" />
      ) : report ? (
        <div className="animate-rise space-y-6">
          <GlassCard className="p-7 sm:p-9">
            <div className="flex flex-col items-center gap-10 lg:flex-row">
              <div className="flex flex-wrap justify-center gap-8">
                <ScoreRing value={report.atsScore} label="ATS Score" size={150} />
                <ScoreRing value={report.resumeQualityScore} label="Resume Health" size={150} />
                {report.targetRoleMatch?.score !== null &&
                report.targetRoleMatch?.score !== undefined ? (
                  <ScoreRing value={report.targetRoleMatch.score} label="Job Match" size={150} />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="brand">
                    {report.mode === "match" ? "Resume Health + Job Match" : "Resume Health only"}
                  </Pill>
                  {report.role ? <Pill>Target: {report.role}</Pill> : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{report.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {report.targetRoleMatch?.note}
                </p>
                <button
                  onClick={() => {
                    setReport(null);
                    mutation.reset();
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Analyse another resume
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-7">
            <SectionTitle
              title="What we actually found in your resume"
              subtitle="Extracted text only — anything absent is marked 'Not found in resume.'"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {extracted?.skills?.length ? (
                    extracted.skills.map((s) => <Pill key={s}>{s}</Pill>)
                  ) : (
                    <p className="text-xs text-muted-foreground">Not found in resume.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Education</p>
                <Bullets items={notFound(extracted?.education)} />
              </div>
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Experience</p>
                <Bullets items={notFound(extracted?.experience)} />
              </div>
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">Projects</p>
                {extracted?.projects?.length ? (
                  <div className="space-y-2">
                    {extracted.projects.map((p, i) => (
                      <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not found in resume.</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                  Certifications
                </p>
                <Bullets items={notFound(extracted?.certifications)} />
              </div>
              <div>
                <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                  Achievements & measurable results
                </p>
                <Bullets
                  items={notFound([
                    ...(extracted?.achievements ?? []),
                    ...(extracted?.measurableResults ?? []),
                  ])}
                />
              </div>
            </div>
          </GlassCard>

          {report.mode === "match" && report.jdComparison ? (
            <GlassCard className="p-7">
              <SectionTitle
                title="Job Match — resume vs job description"
                subtitle={report.jdComparison.roleAlignment}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                    Matched skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.jdComparison.matchedSkills?.map((s) => (
                      <Pill key={s} tone="good">
                        {s}
                      </Pill>
                    ))}
                  </div>
                  <p className="mt-4 mb-2 text-[11px] tracking-wide text-primary uppercase">
                    Missing skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.jdComparison.missingSkills?.map((s) => (
                      <Pill key={s} tone="bad">
                        {s}
                      </Pill>
                    ))}
                  </div>
                  <p className="mt-4 mb-2 text-[11px] tracking-wide text-primary uppercase">
                    Missing keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.jdComparison.missingKeywords?.map((s) => (
                      <Pill key={s} tone="warn">
                        {s}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                      Relevant projects
                    </p>
                    <Bullets items={report.jdComparison.relevantProjects} tone="good" />
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                      Weak or irrelevant sections
                    </p>
                    <Bullets items={report.jdComparison.weakOrIrrelevantSections} tone="bad" />
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] tracking-wide text-primary uppercase">
                      Evidence the JD expects but your resume lacks
                    </p>
                    <Bullets items={report.jdComparison.missingEvidence} tone="bad" />
                  </div>
                </div>
              </div>
              {report.jdComparison.weakBullets?.length ? (
                <div className="mt-6 space-y-3">
                  {report.jdComparison.weakBullets.map((b, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                      <p className="text-xs text-muted-foreground line-through">{b.bullet}</p>
                      <p className="mt-2 text-xs text-warning">{b.problem}</p>
                      <p className="mt-2 text-sm">{b.rewritten}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </GlassCard>
          ) : null}


          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-7">
              <SectionTitle title="Score breakdown" />
              {report.scores?.map((s) => (
                <ScoreBar key={s.label} label={s.label} score={s.score} note={s.note} />
              ))}
            </GlassCard>
            <div className="space-y-6">
              <GlassCard className="p-7">
                <SectionTitle title="Recruiter perspective" />
                <div className="space-y-3">
                  <KeyValue
                    label="First six seconds"
                    value={report.recruiterPerspective?.firstSixSeconds}
                  />
                  <KeyValue
                    label="Shortlist odds"
                    value={report.recruiterPerspective?.shortlistOdds}
                  />
                  <KeyValue label="Honest take" value={report.recruiterPerspective?.honestTake} />
                </div>
              </GlassCard>
              <GlassCard className="p-7">
                <SectionTitle title="Keyword match" subtitle={report.keywordMatch?.note} />
                <div className="flex flex-wrap gap-1.5">
                  {report.keywordMatch?.matched?.map((k) => (
                    <Pill key={k} tone="good">
                      {k}
                    </Pill>
                  ))}
                  {report.keywordMatch?.missing?.map((k) => (
                    <Pill key={k} tone="bad">
                      {k}
                    </Pill>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-7">
              <SectionTitle title="Formatting review" subtitle={report.formattingReview?.verdict} />
              <Bullets items={report.formattingReview?.issues} tone="bad" />
              <div className="mt-3">
                <Bullets items={report.formattingReview?.wins} tone="good" />
              </div>
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Missing sections" />
              <Bullets items={report.missingSections} tone="bad" />
            </GlassCard>
            <GlassCard className="p-7">
              <SectionTitle title="Stronger action verbs" />
              <div className="flex flex-wrap gap-1.5">
                {report.actionVerbs?.map((v) => (
                  <Pill key={v} tone="brand">
                    {v}
                  </Pill>
                ))}
              </div>
            </GlassCard>
          </div>

          {report.redFlags?.length ? (
            <GlassCard className="p-7">
              <SectionTitle title="Red flags" subtitle="What makes a recruiter hesitate." />
              <div className="grid gap-4 lg:grid-cols-2">
                {report.redFlags.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4"
                  >
                    <p className="text-sm font-semibold">{f.flag}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{f.why}</p>
                    <p className="mt-2 text-xs text-primary">Fix: {f.fix}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="p-7">
            <SectionTitle title="Most important improvements" subtitle="In priority order." />
            <div className="space-y-3">
              {report.topImprovements?.map((imp, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-xl border border-border/60 bg-secondary/20 p-4"
                >
                  <span className="gradient-brand grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-primary-foreground">
                    {imp.priority ?? i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{imp.change}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{imp.why}</p>
                    <p className="mt-1.5 text-xs text-success">Impact: {imp.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {report.weakProjectDescriptions?.length ? (
            <GlassCard className="p-7">
              <SectionTitle title="Weak project descriptions" subtitle="Rewritten for you." />
              <div className="space-y-4">
                {report.weakProjectDescriptions.map((w, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                    <p className="text-xs text-muted-foreground line-through">{w.original}</p>
                    <p className="mt-2 text-xs text-warning">{w.problem}</p>
                    <p className="mt-2 text-sm">{w.rewritten}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="p-7">
            <SectionTitle title="Improved bullet points" />
            <div className="space-y-4">
              {report.improvedBullets?.map((b, i) => (
                <div key={i} className="grid gap-3 rounded-xl border border-border/60 bg-secondary/20 p-4 lg:grid-cols-2">
                  <div>
                    <Pill tone="bad">Before</Pill>
                    <p className="mt-2 text-xs text-muted-foreground">{b.before}</p>
                  </div>
                  <div>
                    <Pill tone="good">After</Pill>
                    <p className="mt-2 text-sm">{b.after}</p>
                    <p className="mt-2 text-xs text-primary">{b.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-7 sm:p-9">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Target internship role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Frontend Developer Intern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Upload resume (PDF)</Label>
              <button
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-sm text-muted-foreground transition-colors hover:border-primary/50"
              >
                <FileUp className="size-5 text-primary" />
                {file ? file.filename : "Click to upload your resume"}
                <span className="text-xs">PDF, DOCX or image · under 8MB</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPick(f);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                …or paste your resume text instead
              </Label>
              <Textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume here"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Job description (optional) — paste it to also get a Job Match analysis
              </Label>
              <Textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the internship's job description. Leave blank to get Resume Health only."
              />
              <p className="text-xs text-muted-foreground">
                Without a job description we report Resume Health only — no job-match score is
                invented.
              </p>
            </div>

            <button
              disabled={!ready || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="gradient-brand inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              <Wand2 className="size-4" />
              {mutation.isPending ? "Analysing…" : "Run resume intelligence"}
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
