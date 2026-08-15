import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { StatCard } from "@/components/s2i/ui";
import { useDB } from "@/lib/domain/store";
import { LIFECYCLE, PATHWAY_LABEL, REVIEW_STATES, inr } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/reports")({
  head: () => ({
    meta: [
      { title: "Reports — T&P Cell — S2I" },
      {
        name: "description",
        content:
          "Placement reporting: pathway split, lifecycle distribution, review states and stipend averages.",
      },
      { property: "og:title", content: "Reports — T&P Cell — S2I" },
      { property: "og:description", content: "Institutional placement and verification reporting." },
    ],
  }),
  component: TnpReports,
});

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="py-1.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-secondary">
        <div className="gradient-brand h-1.5 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TnpReports() {
  const db = useDB();
  const total = db.internships.length;
  const college = db.internships.filter((i) => i.pathway === "college-placed").length;
  const verified = db.internships.filter((i) => i.review === "Institutionally Verified").length;
  const avgStipend = total
    ? Math.round(db.internships.reduce((sum, i) => sum + i.stipend, 0) / total)
    : 0;

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Reports"
        description="Reporting is derived from the same evidence trail used for verification — no separate numbers."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Internship records" value={total} />
        <StatCard
          label="Verification rate"
          value={`${total ? Math.round((verified / total) * 100) : 0}%`}
          tone="good"
          hint={`${verified} institutionally verified`}
        />
        <StatCard
          label="Pathway split"
          value={`${college}/${total - college}`}
          hint="College-placed / self-placed"
        />
        <StatCard label="Average stipend" value={inr(avgStipend)} hint="Per month, all records" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5">
          <p className="text-sm font-semibold">Lifecycle distribution</p>
          <div className="mt-3">
            {LIFECYCLE.map((s) => (
              <Bar
                key={s}
                label={s}
                value={db.internships.filter((i) => i.stage === s).length}
                total={total}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-semibold">Review states</p>
          <div className="mt-3">
            {REVIEW_STATES.map((r) => (
              <Bar
                key={r}
                label={r}
                value={db.internships.filter((i) => i.review === r).length}
                total={total}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-semibold">By pathway &amp; department</p>
          <div className="mt-3">
            <Bar label={PATHWAY_LABEL["college-placed"]} value={college} total={total} />
            <Bar
              label={PATHWAY_LABEL["self-placed"]}
              value={total - college}
              total={total}
            />
            {[...new Set(db.students.map((s) => s.department))].map((dept) => (
              <Bar
                key={dept}
                label={dept}
                value={
                  db.internships.filter(
                    (i) => db.students.find((s) => s.id === i.studentId)?.department === dept,
                  ).length
                }
                total={total}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    </Page>
  );
}