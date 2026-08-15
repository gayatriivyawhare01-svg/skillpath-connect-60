import { cn } from "@/lib/utils";
import { GlassCard, Pill } from "@/components/report-ui";
import {
  LIFECYCLE,
  PATHWAY_LABEL,
  REVIEW_NOTE,
  evidenceCompleteness,
  formatDate,
  stageIndex,
  type EvidenceItem,
  type HistoryEntry,
  type Internship,
  type Pathway,
  type ReviewState,
  type Stage,
  type VerificationState,
} from "@/lib/domain/types";
import { AlertTriangle, Check, CircleDot, Info, Minus, X } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "neutral" | "good" | "warn" | "bad" | "brand";

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const accent: Record<Tone, string> = {
    neutral: "text-foreground",
    good: "text-success",
    warn: "text-warning",
    bad: "text-destructive",
    brand: "text-primary",
  };
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-tight tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? <Icon className={cn("size-4 shrink-0", accent[tone])} /> : null}
      </div>
      <p className={cn("font-display mt-2 text-2xl font-semibold tabular-nums", accent[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </GlassCard>
  );
}

export function PathwayBadge({ pathway }: { pathway: Pathway }) {
  return (
    <Pill tone={pathway === "college-placed" ? "brand" : "warn"}>{PATHWAY_LABEL[pathway]}</Pill>
  );
}

export function ReviewBadge({ state }: { state: ReviewState }) {
  const tone: Record<ReviewState, Tone> = {
    "Student Submitted": "neutral",
    "Under Review": "warn",
    "Needs More Evidence": "warn",
    "T&P Approved": "good",
    "T&P Rejected": "bad",
    "Institutionally Verified": "good",
  };
  return (
    <span title={REVIEW_NOTE[state]}>
      <Pill tone={tone[state]}>{state}</Pill>
    </span>
  );
}

export function VerificationBadge({ state }: { state: VerificationState }) {
  const tone: Record<VerificationState, Tone> = {
    "Self Reported": "neutral",
    "Evidence Submitted": "neutral",
    "Under Review": "warn",
    "T&P Verified": "brand",
    "Faculty Verified": "brand",
    Completed: "good",
  };
  return <Pill tone={tone[state]}>{state}</Pill>;
}

export function StageTracker({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const current = stageIndex(stage);
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LIFECYCLE.map((s, i) => (
          <span
            key={s}
            title={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < current ? "bg-primary/60" : i === current ? "bg-primary" : "bg-secondary",
            )}
          />
        ))}
      </div>
    );
  }
  return (
    <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
      {LIFECYCLE.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-start gap-3 py-2">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                done && "border-success/50 bg-success/20 text-success",
                active && "border-primary bg-primary/20 text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3" /> : active ? <CircleDot className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs leading-5",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function EvidenceMeter({ internship }: { internship: Internship }) {
  const { percent, missing, present } = evidenceCompleteness(internship);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Evidence trail</p>
        <p className="text-xs tabular-nums text-muted-foreground">{percent}% complete</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent === 100 ? "bg-success" : percent >= 50 ? "bg-primary" : "bg-warning",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {present.length} of {present.length + missing.length} required evidence types on file.
        {missing.length ? ` Missing: ${missing.join(", ")}.` : " No single document decides completion — the whole trail does."}
      </p>
    </div>
  );
}

export function EvidenceList({
  items,
  onReview,
}: {
  items: EvidenceItem[];
  onReview?: (item: EvidenceItem, status: "Accepted" | "Rejected") => void;
}) {
  if (!items.length) {
    return <EmptyState message="No evidence submitted yet." />;
  }
  return (
    <ul className="divide-y divide-border/60">
      {items.map((e) => (
        <li key={e.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{e.title}</p>
              <Pill tone={e.status === "Accepted" ? "good" : e.status === "Rejected" ? "bad" : "warn"}>
                {e.status}
              </Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {e.type} · {e.submittedByName} ({e.submittedBy}) · {formatDate(e.submittedAt)}
              {e.fileName ? ` · ${e.fileName}` : ""}
            </p>
            {e.note ? <p className="mt-1 text-[11px] text-warning">{e.note}</p> : null}
            {e.reviewNote ? (
              <p className="mt-1 text-[11px] text-muted-foreground">Review: {e.reviewNote}</p>
            ) : null}
          </div>
          {onReview && e.status === "Submitted" ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onReview(e, "Accepted")}
                className="rounded-lg border border-success/40 px-2.5 py-1 text-[11px] text-success transition-colors hover:bg-success/10"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onReview(e, "Rejected")}
                className="rounded-lg border border-destructive/40 px-2.5 py-1 text-[11px] text-destructive transition-colors hover:bg-destructive/10"
              >
                Reject
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function Timeline({ entries }: { entries: HistoryEntry[] }) {
  const sorted = [...entries].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <ol className="relative space-y-4 border-l border-border/70 pl-5">
      {sorted.map((e, i) => (
        <li key={`${e.at}-${i}`} className="relative">
          <span className="absolute top-1.5 -left-[23px] size-2 rounded-full bg-primary" />
          <p className="text-sm font-medium">{e.event}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {e.actorName} · {e.actor} · {formatDate(e.at)}
          </p>
          {e.note ? <p className="mt-1 text-xs text-muted-foreground">{e.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground/80">{hint}</p> : null}
    </div>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === "info" ? Info : AlertTriangle;
  const styles = {
    info: "border-primary/30 bg-primary/8 text-primary",
    warn: "border-warning/35 bg-warning/8 text-warning",
    danger: "border-destructive/35 bg-destructive/8 text-destructive",
  }[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", styles)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        <div className="text-xs leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function ReasonRow({
  kind,
  label,
  detail,
}: {
  kind: "strong" | "partial" | "missing";
  label: string;
  detail: string;
}) {
  const map = {
    strong: { Icon: Check, cls: "text-success" },
    partial: { Icon: Minus, cls: "text-warning" },
    missing: { Icon: X, cls: "text-destructive" },
  }[kind];
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <map.Icon className={cn("mt-0.5 size-3.5 shrink-0", map.cls)} />
      <span className="text-xs leading-relaxed">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground"> — {detail}</span>
      </span>
    </li>
  );
}

export function AiDisclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex gap-2 rounded-lg border border-border/60 bg-secondary/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <span>{children}</span>
    </p>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end gap-3">{children}</div>;
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium">
      {children}
      {required ? <span className="ml-1 text-destructive">*</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60";

export function ActionButton({
  children,
  onClick,
  tone = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger" | "success";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const tones = {
    primary: "gradient-brand text-primary-foreground hover:opacity-90",
    ghost: "border border-border bg-secondary/40 hover:bg-secondary/70",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
    success: "border border-success/40 text-success hover:bg-success/10",
  }[tone];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tones,
        className,
      )}
    >
      {children}
    </button>
  );
}
