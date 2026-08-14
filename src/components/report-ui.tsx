import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("glass rounded-2xl", hover && "glass-hover", className)}>{children}</div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

function toneFor(score: number) {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--primary)";
  if (score >= 30) return "var(--warning)";
  return "var(--destructive)";
}

export function ScoreRing({
  value,
  label,
  sublabel,
  size = 180,
}: {
  value: number;
  label?: string;
  sublabel?: string;
  size?: number;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${toneFor(v)} ${v}%, color-mix(in oklab, var(--secondary) 80%, transparent) ${v}% 100%)`,
          mask: "radial-gradient(farthest-side, transparent 68%, black 69%)",
          WebkitMask: "radial-gradient(farthest-side, transparent 68%, black 69%)",
        }}
      />
      <div className="text-center">
        <div className="font-display text-4xl font-semibold">{v}</div>
        {label ? <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div> : null}
        {sublabel ? <div className="mt-1 text-[11px] text-primary">{sublabel}</div> : null}
      </div>
    </div>
  );
}

export function ScoreBar({
  label,
  score,
  note,
}: {
  label: string;
  score?: number | undefined;
  note?: string | undefined;
}) {
  const v = Math.max(0, Math.min(100, Math.round(score || 0)));
  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{v}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${v}%`, background: toneFor(v) }}
        />
      </div>
      {note ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "brand";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    good: "bg-success/15 text-success",
    warn: "bg-warning/15 text-warning",
    bad: "bg-destructive/15 text-destructive",
    brand: "bg-primary/15 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function toneFromWord(word?: string) {
  const w = (word || "").toLowerCase();
  if (/(apply|high|deep|critical yes|verified|good|strong|excellent)/.test(w)) return "good";
  if (/(prepare|moderate|medium|working|partial|pending)/.test(w)) return "warn";
  if (/(avoid|low|suspicious|surface|weak|missing|none)/.test(w)) return "bad";
  return "neutral";
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/25 p-4">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export function Bullets({ items, tone }: { items?: string[]; tone?: "good" | "bad" }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span
            className={cn(
              "mt-1.5 size-1.5 shrink-0 rounded-full",
              tone === "bad" ? "bg-destructive" : tone === "good" ? "bg-success" : "bg-primary",
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Loading({ message }: { message: string }) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="mx-auto size-10 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      <p className="mt-5 text-sm font-medium">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Our expert panel is reviewing your inputs. This usually takes 20–60 seconds.
      </p>
    </GlassCard>
  );
}
