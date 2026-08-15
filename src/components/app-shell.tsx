import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/career-audit", label: "Career Audit" },
  { to: "/resume-intelligence", label: "Resume Intelligence" },
  { to: "/internship-xray", label: "Internship X-Ray" },
  { to: "/internship-passport", label: "Internship Passport" },
  { to: "/profile", label: "Profile" },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-brand flex size-8 items-center justify-center rounded-xl">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            InternHub <span className="gradient-text">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              activeProps={{ className: "bg-secondary/80 text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/career-audit"
          className="gradient-brand rounded-lg px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start Audit
        </Link>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
            activeProps={{ className: "bg-secondary/80 text-foreground" }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="animate-rise mb-10">
      <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>InternHub AI — Internship Intelligence for Tier-2 & Tier-3 India.</p>
        <p>Know Yourself. Verify the Opportunity. Build Your Career.</p>
      </div>
    </footer>
  );
}
