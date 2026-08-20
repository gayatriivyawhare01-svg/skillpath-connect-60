import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Building2,
  Sparkles,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "S2I is a college-first internship lifecycle platform with a free student layer and planned premium student services.",
      },
      { property: "og:title", content: "Pricing — S2I Skill2Intern" },
      {
        property: "og:description",
        content:
          "Free for students. Built for institutions. Personalized support for students who want more.",
      },
    ],
  }),
  component: PricingPage,
});

function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 border-b border-white/5 py-2.5 text-sm leading-relaxed text-slate-300 last:border-b-0">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
      <span>{children}</span>
    </li>
  );
}

function PricingCard({
  children,
  featured = false,
}: {
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-full flex-col rounded-3xl border p-6 backdrop-blur-xl transition-all duration-200",
        featured
          ? "border-violet-400/40 bg-violet-500/[0.08] shadow-2xl shadow-violet-500/10"
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function PricingPage() {
  const [waitlisted, setWaitlisted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium tracking-wide text-violet-300">
            S2I PLANS
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
            One platform.
            <span className="block bg-gradient-to-r from-violet-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
              Different value for every user.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Students get the core internship experience free. Colleges pay for
            the institutional workflow. Students who want deeper guidance can
            opt into a planned premium layer with personalized support and
            accountability.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {/* Student Free */}
          <PricingCard>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Student
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold">Student Free</h2>

            <div className="mt-3 text-4xl font-bold">
              ₹0
              <span className="ml-1 text-sm font-medium text-slate-400">
                / always
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              The essential S2I experience for every student.
            </p>

            <ul className="mt-6 flex-1">
              <Feature>Student profile</Feature>
              <Feature>Internship opportunities</Feature>
              <Feature>Internship Passport</Feature>
              <Feature>Self-placed internship submission</Feature>
              <Feature>Application tracking</Feature>
              <Feature>Basic internship progress tracking</Feature>
            </ul>

            <div className="mt-6">
              <a
                href="/signin?role=student"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </PricingCard>

          {/* Student Premium */}
          <PricingCard featured>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-300" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Student Premium
                </span>
              </div>

              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Planned
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold">
              Personalized Career Execution
            </h2>

            <div className="mt-3 text-4xl font-bold">
              ₹199–₹399
              <span className="ml-1 text-sm font-medium text-slate-400">
                / month
              </span>
            </div>

            <p className="mt-2 text-xs font-medium text-amber-300">
              Indicative / Planned Pricing
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              For students who don't just want recommendations — they want a
              personalized plan and accountability to actually reach the
              internship they want.
            </p>

            <ul className="mt-6 flex-1">
              <Feature>Personalized internship recommendations</Feature>
              <Feature>Target-role skill gap analysis</Feature>
              <Feature>Course & certification roadmap</Feature>
              <Feature>Project recommendations based on target roles</Feature>
              <Feature>GitHub improvement guidance</Feature>
              <Feature>LinkedIn profile improvement</Feature>
              <Feature>30/60-day internship roadmap</Feature>
              <Feature>Weekly progress reminders</Feature>
              <Feature>WhatsApp accountability support</Feature>
              <Feature>Human progress check-in</Feature>
            </ul>

            <div className="mt-6">
              {waitlisted ? (
                <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm">
                  <p className="font-semibold text-violet-200">
                    You're on the waitlist.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    We'll contact you when Student Premium opens for pilots.
                    No payment was taken.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWaitlisted(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  Join Premium Waitlist
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </PricingCard>

          {/* College */}
          <PricingCard>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Institution
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold">
              College / T&P Plan
            </h2>

            <div className="mt-3 text-4xl font-bold">
              ₹1.5L–₹4L
              <span className="ml-1 text-sm font-medium text-slate-400">
                / year
              </span>
            </div>

            <p className="mt-2 text-xs font-medium text-amber-300">
              Indicative / Pilot Pricing
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              The primary S2I revenue layer — giving institutions one connected
              workflow for internships, verification, consent and monitoring.
            </p>

            <ul className="mt-6 flex-1">
              <Feature>T&P Action Center</Feature>
              <Feature>College-placed internship management</Feature>
              <Feature>Self-placed internship verification</Feature>
              <Feature>Evidence-based verification workflow</Feature>
              <Feature>Consent & offer tracking</Feature>
              <Feature>Faculty permissions & evaluation</Feature>
              <Feature>Internship progress monitoring</Feature>
              <Feature>Institutional reports & analytics</Feature>
              <Feature>Role-based access for T&P, faculty & company</Feature>
              <Feature>Shared institutional internship records</Feature>
            </ul>

            <div className="mt-6">
              <a
                href="mailto:partnerships@skill2intern.app?subject=S2I%20for%20our%20T%26P%20cell"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Talk to S2I
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </PricingCard>
        </div>

        {/* Revenue logic */}
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <h3 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Revenue Logic
          </h3>

          <div className="mt-5 grid gap-5 text-center sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-white">Students</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Core platform stays free to maximize adoption.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Premium Students</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Planned personalized guidance + accountability layer.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Colleges / T&P
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Primary revenue through institutional SaaS subscriptions.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Pricing shown here is indicative and subject to pilot validation.
        </p>

        <div className="mt-5 text-center">
          <a
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to overview
          </a>
        </div>
      </div>
    </div>
  );
}