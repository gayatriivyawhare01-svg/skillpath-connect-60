import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { generateCareerAudit } from "@/lib/intel.functions";
import type { AuditReport } from "@/lib/report-types";
import type { AuditSubmission } from "@/lib/audit-evidence";
import { STORE, usePersistedState } from "@/lib/storage";
import { GlassCard, Loading } from "@/components/report-ui";
import { AuditForm } from "@/components/audit/audit-form";
import { AuditReportView } from "@/components/audit/audit-report";
import { PageHeader } from "@/components/app-shell";


export const Route = createFileRoute("/student/career-audit")({
  head: () => ({
    meta: [
      { title: "AI Career Audit — S2I — Skill2Intern" },
      {
        name: "description",
        content:
          "An 8-step AI career consultation that scores your internship readiness, maps your skill gaps and builds a 30-day sprint.",
      },
      { property: "og:title", content: "AI Career Audit — S2I — Skill2Intern" },
      {
        property: "og:description",
        content: "Career Readiness Index, Career GPS, skill-gap matrix and a daily 30-day sprint.",
      },
    ],
  }),
  component: CareerAuditPage,
});

function CareerAuditPage() {
  const [report, setReport] = usePersistedState<AuditReport | null>(STORE.audit, null);
  const run = useServerFn(generateCareerAudit);
  const mutation = useMutation({
    mutationFn: (submission: AuditSubmission) => run({ data: { submission } }),
    onSuccess: (data) => {
      setReport(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: Error) => toast.error(error.message),
  });


  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageHeader
        eyebrow="Feature 01 · Hero"
        title="AI Career Audit"
        description="Eight structured steps, reviewed by an AI panel modelled on a career coach, a technical recruiter, a placement officer and a hiring manager. You get a report, not a score."
      />
      {mutation.isPending ? (
        <Loading message="Building your career audit report…" />
      ) : report ? (
        <AuditReportView
          report={report}
          onRestart={() => {
            setReport(null);
            mutation.reset();
          }}
        />
      ) : (
        <>
          <AuditForm onSubmit={(submission) => mutation.mutate(submission)} />
          <GlassCard className="mt-10 flex flex-wrap items-center gap-3 p-5 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            Every recommendation cites your own inputs — projects, links, year and target role.
          </GlassCard>
        </>
      )}
    </div>
  );
}
