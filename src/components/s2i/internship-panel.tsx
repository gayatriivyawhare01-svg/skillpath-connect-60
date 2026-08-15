import { GlassCard } from "@/components/report-ui";
import {
  EvidenceList,
  EvidenceMeter,
  PathwayBadge,
  ReviewBadge,
  StageTracker,
  Timeline,
  VerificationBadge,
} from "@/components/s2i/ui";
import { companyOf, useDB } from "@/lib/domain/store";
import { formatDate, inr, type EvidenceItem, type Internship } from "@/lib/domain/types";

/** One evidence trail, rendered identically for every role. */
export function InternshipPanel({
  internship,
  onReviewEvidence,
  children,
}: {
  internship: Internship;
  onReviewEvidence?: (item: EvidenceItem, status: "Accepted" | "Rejected") => void;
  children?: React.ReactNode;
}) {
  const db = useDB();
  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PathwayBadge pathway={internship.pathway} />
            <ReviewBadge state={internship.review} />
            <VerificationBadge state={internship.verification} />
          </div>
          <h3 className="mt-2 text-lg font-semibold">{internship.role}</h3>
          <p className="text-sm text-muted-foreground">
            {companyOf(db, internship)} · {internship.location} · {internship.workMode} ·{" "}
            {inr(internship.stipend)}/mo
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatDate(internship.startDate)} → {formatDate(internship.endDate)} ·{" "}
            {internship.durationMonths} months · Faculty permission: {internship.facultyPermission}
          </p>
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] tracking-wide text-muted-foreground uppercase">
            Lifecycle
          </p>
          <StageTracker stage={internship.stage} />
        </div>
        <div className="space-y-4">
          <EvidenceMeter internship={internship} />
          {internship.riskFlags.length ? (
            <ul className="rounded-xl border border-warning/35 bg-warning/8 p-3 text-[11px] text-warning">
              {internship.riskFlags.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">Evidence</p>
          <EvidenceList
            items={internship.evidence}
            {...(onReviewEvidence ? { onReview: onReviewEvidence } : {})}
          />
        </div>
        <div>
          <p className="mb-3 text-[11px] tracking-wide text-muted-foreground uppercase">
            Audit history
          </p>
          <Timeline entries={internship.history} />
        </div>
      </div>
    </GlassCard>
  );
}