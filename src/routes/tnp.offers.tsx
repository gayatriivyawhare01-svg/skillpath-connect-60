import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, EmptyState, FieldLabel, inputCls } from "@/components/s2i/ui";
import { actions, companyOf, studentById, useDB } from "@/lib/domain/store";
import { WORK_MODES, formatDate, inr, todayISO, type WorkMode } from "@/lib/domain/types";

export const Route = createFileRoute("/tnp/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Consent — T&P Cell — S2I" },
      {
        name: "description",
        content: "Verify student consent declarations and record official offer letters.",
      },
      { property: "og:title", content: "Offers & Consent — T&P Cell — S2I" },
      { property: "og:description", content: "Consent verification and offer letter records." },
    ],
  }),
  component: TnpOffers,
});

function TnpOffers() {
  const db = useDB();
  const [drafts, setDrafts] = useState<
    Record<string, { joiningDate: string; reportingLocation: string; workMode: WorkMode; stipend: number; fileName: string }>
  >({});
  const records = db.internships.filter((i) => i.consent || i.offer || i.stage === "Selected");

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Training & Placement cell"
        title="Offers & consent"
        description="Consent is a student declaration; the offer letter is an institutional record. Both must exist before joining is confirmed."
      />
      <div className="space-y-4">
        {records.length ? (
          records.map((i) => {
            const draft =
              drafts[i.id] ??
              {
                joiningDate: i.offer?.joiningDate ?? i.startDate ?? todayISO(),
                reportingLocation: i.offer?.reportingLocation ?? i.location,
                workMode: i.offer?.workMode ?? i.workMode,
                stipend: i.offer?.stipend ?? i.stipend,
                fileName: i.offer?.fileName ?? "",
              };
            const set = (patch: Partial<typeof draft>) =>
              setDrafts((d) => ({ ...d, [i.id]: { ...draft, ...patch } }));
            return (
              <GlassCard key={i.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {studentById(db, i.studentId)?.name} · {i.role}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {companyOf(db, i)} · {i.location} · {inr(i.stipend)}/mo · stage {i.stage}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone={i.consent ? (i.consent.tnpVerified ? "good" : "warn") : "neutral"}>
                      {i.consent
                        ? i.consent.tnpVerified
                          ? "Consent verified"
                          : "Consent submitted"
                        : "No consent yet"}
                    </Pill>
                    <Pill tone={i.offer ? (i.offer.recordedByTnp ? "good" : "warn") : "neutral"}>
                      {i.offer
                        ? i.offer.recordedByTnp
                          ? "Offer recorded"
                          : "Offer uploaded by student"
                        : "No offer letter"}
                    </Pill>
                  </div>
                </div>

                {i.consent ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Guardian: {i.consent.parentGuardianName} ({i.consent.parentContact}) · submitted{" "}
                    {formatDate(i.consent.submittedAt)} · location sharing consent:{" "}
                    {i.consent.locationSharingConsent ? "given" : "declined"}
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <FieldLabel>Joining date</FieldLabel>
                    <input
                      type="date"
                      className={inputCls}
                      value={draft.joiningDate}
                      onChange={(e) => set({ joiningDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Reporting location</FieldLabel>
                    <input
                      className={inputCls}
                      value={draft.reportingLocation}
                      onChange={(e) => set({ reportingLocation: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Work mode</FieldLabel>
                    <select
                      className={inputCls}
                      value={draft.workMode}
                      onChange={(e) => set({ workMode: e.target.value as WorkMode })}
                    >
                      {WORK_MODES.map((m) => (
                        <option key={m} value={m} className="bg-card">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Stipend</FieldLabel>
                    <input
                      type="number"
                      className={inputCls}
                      value={draft.stipend}
                      onChange={(e) => set({ stipend: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Offer letter file</FieldLabel>
                    <input
                      className={inputCls}
                      placeholder="offer-letter.pdf"
                      value={draft.fileName}
                      onChange={(e) => set({ fileName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton
                    tone="success"
                    disabled={!i.consent || i.consent.tnpVerified}
                    onClick={() => actions.verifyConsent(i.id)}
                  >
                    Verify consent
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      actions.recordOffer(
                        i.id,
                        {
                          issuedBy: "company",
                          issuedAt: new Date().toISOString(),
                          stipend: draft.stipend,
                          joiningDate: draft.joiningDate,
                          reportingLocation: draft.reportingLocation,
                          workMode: draft.workMode,
                          ...(draft.fileName ? { fileName: draft.fileName } : {}),
                        },
                        true,
                      )
                    }
                  >
                    Record offer letter
                  </ActionButton>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <EmptyState message="No offers or consent declarations to process." />
        )}
      </div>
    </Page>
  );
}