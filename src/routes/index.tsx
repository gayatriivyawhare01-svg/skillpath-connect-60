import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
  Workflow,
  BadgeCheck,
} from "lucide-react";

import { GlassCard, Pill } from "@/components/report-ui";
import { useDB } from "@/lib/domain/store";
import { LIFECYCLE, type Role } from "@/lib/domain/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "S2I — Skill2Intern | Internship to Employability Platform" },
      {
        name: "description",
        content:
          "S2I connects students, companies, T&P cells and faculty on one internship lifecycle — assessment, matching, consent, offers, evidence and verified internship records.",
      },
      { property: "og:title", content: "S2I — Skill2Intern" },
      {
        property: "og:description",
        content:
          "One connected internship-to-employability system for students, colleges, faculty, T&P cells and companies.",
      },
    ],
  }),
  component: Landing,
});

const ROLES: {
  role: Role;
  label: string;
  icon: typeof GraduationCap;
  blurb: string;
  bullets: string[];
}[] = [
  {
    role: "student",
    label: "Student",
    icon: GraduationCap,
    blurb:
      "Assess yourself, find matched internships, submit evidence, build a verified passport.",
    bullets: [
      "Career assessment",
      "Matched opportunities",
      "Self-placed submission",
      "Internship passport",
    ],
  },
  {
    role: "tnp",
    label: "T&P Cell",
    icon: Users,
    blurb:
      "Run the institutional internship pipeline: shortlists, consent, offers, verification.",
    bullets: [
      "Action centre",
      "Verification queue",
      "Progress monitoring",
      "Reports",
    ],
  },
  {
    role: "faculty",
    label: "Faculty",
    icon: BadgeCheck,
    blurb:
      "Review only T&P-approved internships for your department and evaluate outcomes.",
    bullets: [
      "Assigned students",
      "Academic permission",
      "Evidence review",
      "Evaluation",
    ],
  },
  {
    role: "company",
    label: "Company",
    icon: Building2,
    blurb:
      "Post requirements, see ranked candidates released by the T&P cell, hire and give feedback.",
    bullets: [
      "Post opportunity",
      "Matched candidates",
      "Interviews & offers",
      "Performance feedback",
    ],
  },
];

function Landing() {
  const db = useDB();
  const navigate = useNavigate();

  /**
   * IMPORTANT SECURITY FIX:
   *
   * Previously:
   *   setRole(role) -> directly opened /student, /company, /faculty or /tnp
   *
   * That meant role selection was effectively treated as authentication.
   *
   * Now:
   *   role selection -> /signin?role=<role>
   *
   * The signin page must authenticate the actual identity before
   * the protected workspace can be opened.
   */
  function enter(role: Role) {
  navigate({
    to: "/signin",
    search: { role },
  });

  }

  return (
    <div>
      <section className="aurora relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />

        <div className="mx-auto max-w-5xl px-5 pt-20 pb-14 text-center">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Institutional internship platform — not a job board
          </div>

          <h1 className="animate-rise mt-7 text-4xl leading-[1.08] font-semibold sm:text-5xl">
            One evidence trail from
            <br />
            <span className="gradient-text animate-shimmer">
              skill to internship to employability.
            </span>
          </h1>

          <p className="animate-rise mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            S2I connects the student, the company, the T&amp;P cell and the
            faculty coordinator on a single internship lifecycle — so every
            internship ends as a record the institution can actually stand
            behind.
          </p>

          <p className="mt-7 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {db.college.name} · demo environment
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <h2 className="mb-5 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Select your role to continue
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => enter(r.role)}
              className="text-left"
            >
              <GlassCard hover className="h-full p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="gradient-brand grid size-11 place-items-center rounded-xl">
                    <r.icon className="size-5 text-primary-foreground" />
                  </span>

                  <Pill tone="brand">{r.label}</Pill>
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  Enter as {r.label}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.blurb}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {r.bullets.map((b) => (
                    <li
                      key={b}
                      className="rounded-md bg-secondary/60 px-2 py-1 text-[11px] text-muted-foreground"
                    >
                      {b}
                    </li>
                  ))}
                </ul>

                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  Sign in securely
                  <ArrowRight className="size-3.5" />
                </span>
              </GlassCard>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12">
        <GlassCard className="p-7 sm:p-9">
          <div className="flex items-center gap-2.5">
            <Workflow className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">
              The lifecycle S2I tracks
            </h2>
          </div>

          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Both pathways — college-placed and self-placed — move through the
            same twelve stages, and each transition is recorded against the
            person or organisation that performed it.
          </p>

          <ol className="mt-6 flex flex-wrap gap-2">
            {LIFECYCLE.map((s, i) => (
              <li
                key={s}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-[11px]"
              >
                <span className="text-primary tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
              <Pill tone="brand">College-Placed</Pill>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Company posts a requirement → T&amp;P approves → matching
                engine ranks eligible students → T&amp;P shortlists → interview
                → selection → consent → offer recorded → joining → progress →
                faculty evaluation → verified.
              </p>
            </div>

            <div className="rounded-xl border border-warning/25 bg-warning/5 p-5">
              <Pill tone="warn">Self-Placed</Pill>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Student submits the company and offer they found → S2I runs a
                completeness and consistency check → T&amp;P verification queue
                → T&amp;P decision → faculty permission → progress → completion
                → verified. AI never approves a company.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12 pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Students on record", db.students.length],
            ["Companies engaged", db.companies.length],
            [
              "Live opportunities",
              db.opportunities.filter((o) => o.status === "Live").length,
            ],
            ["Internships tracked", db.internships.length],
          ].map(([label, value]) => (
            <GlassCard key={String(label)} className="p-5">
              <p className="font-display text-3xl font-semibold">
                {String(value)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {label}
              </p>
            </GlassCard>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need the student feature suite directly?{" "}
          <Link
            to="/student/career-audit"
            className="text-primary hover:underline"
          >
            Career assessment
          </Link>
          {" · "}
          <Link
            to="/student/passport"
            className="text-primary hover:underline"
          >
            Internship passport
          </Link>
        </p>
      </section>
    </div>
  );
}