import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  FileSearch,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { GlassCard, Pill } from "@/components/report-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InternHub AI — Don't Apply Blindly. Apply Smartly." },
      {
        name: "description",
        content:
          "AI internship intelligence for Tier-2 & Tier-3 students: career audit, resume intelligence, internship X-Ray and a verified internship passport.",
      },
      { property: "og:title", content: "InternHub AI — Internship Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Know your readiness, fix your skill gaps, verify the internship, and prove your journey to your college.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BrainCircuit,
    to: "/career-audit",
    tag: "Hero feature",
    title: "AI Career Audit",
    body: "An 8-step consultation that produces a Career Readiness Index, Career GPS, skill-gap matrix, project ratings and a day-by-day 30-day sprint.",
  },
  {
    icon: FileSearch,
    to: "/resume-intelligence",
    tag: "Recruiter lens",
    title: "Resume Intelligence",
    body: "ATS score, keyword match, impact scoring, red flags and rewritten bullet points — with the reason each change matters.",
  },
  {
    icon: ScanSearch,
    to: "/internship-xray",
    tag: "Our USP",
    title: "Internship X-Ray",
    body: "Paste a link or JD and get a health score, trust level, career ROI, hidden risks and a clear Apply / Prepare First / Avoid verdict.",
  },
  {
    icon: BadgeCheck,
    to: "/internship-passport",
    tag: "For colleges too",
    title: "Verified Internship Passport",
    body: "A digital passport of your internship journey — verification, documents, deliverables and a placement-cell view.",
  },
];

function Landing() {
  return (
    <div>
      <section className="aurora relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
        <div className="mx-auto max-w-5xl px-5 pt-24 pb-20 text-center">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Internship Intelligence Platform — not a marketplace
          </div>
          <h1 className="animate-rise mt-7 text-4xl leading-[1.08] font-semibold sm:text-6xl">
            Don&apos;t Apply Blindly.
            <br />
            <span className="gradient-text animate-shimmer">Apply Smartly.</span>
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Students waste months applying to internships without knowing if they&apos;re ready or
            whether the internship is genuine. InternHub AI analyzes your career profile, identifies
            your skill gaps, evaluates internship quality, and helps you build a trusted internship
            journey.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/career-audit"
              className="gradient-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start Career Audit <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/internship-passport"
              className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium"
            >
              View Demo
            </Link>
          </div>
          <p className="mt-8 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Know Yourself · Verify the Opportunity · Build Your Career
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to}>
              <GlassCard hover className="h-full p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="gradient-brand grid size-11 place-items-center rounded-xl">
                    <f.icon className="size-5 text-primary-foreground" />
                  </span>
                  <Pill tone="brand">{f.tag}</Pill>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  Open <ArrowRight className="size-3.5" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-14">
        <GlassCard className="p-8 sm:p-10">
          <h2 className="text-2xl font-semibold">Four questions. Answered with evidence.</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Am I ready for internships?", "A Career Readiness Index built from 8 dimensions."],
              ["What exactly should I improve?", "A prioritised skill-gap matrix with timelines."],
              ["Is this internship worth my time?", "Health score, hidden risks and career ROI."],
              ["How do I prove it's genuine?", "A verified passport your placement cell can read."],
            ].map(([q, a]) => (
              <div key={q} className="border-l border-border pl-4">
                <p className="text-sm font-medium">{q}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
