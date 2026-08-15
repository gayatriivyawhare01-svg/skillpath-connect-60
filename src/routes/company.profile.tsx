import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, FieldLabel, Notice, inputCls } from "@/components/s2i/ui";
import { actions, companyById, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/company/profile")({
  head: () => ({
    meta: [
      { title: "Company Profile — S2I Skill2Intern" },
      {
        name: "description",
        content: "Maintain the recruiter profile the T&P cell uses to approve your openings.",
      },
      { property: "og:title", content: "Company Profile — S2I Skill2Intern" },
      { property: "og:description", content: "Recruiter details reviewed by the T&P cell." },
    ],
  }),
  component: CompanyProfile,
});

function CompanyProfile() {
  const db = useDB();
  const company = companyById(db, db.session.companyId);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    website: company?.website ?? "",
    industry: company?.industry ?? "",
    hqLocation: company?.hqLocation ?? "",
    size: company?.size ?? "",
    about: company?.about ?? "",
    contactName: company?.contactName ?? "",
    contactEmail: company?.contactEmail ?? "",
    contactPhone: company?.contactPhone ?? "",
  });
  if (!company) return null;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Company workspace"
        title={company.name}
        description="Editing these details resets nothing — the T&P cell keeps the approval decision recorded in its own log."
        actions={<Pill tone={company.approval === "T&P Approved" ? "good" : "warn"}>{company.approval}</Pill>}
      />
      <GlassCard className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Website</FieldLabel>
            <input className={inputCls} value={f.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Industry</FieldLabel>
            <input className={inputCls} value={f.industry} onChange={(e) => set("industry", e.target.value)} />
          </div>
          <div>
            <FieldLabel>HQ location</FieldLabel>
            <input
              className={inputCls}
              value={f.hqLocation}
              onChange={(e) => set("hqLocation", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Company size</FieldLabel>
            <input className={inputCls} value={f.size} onChange={(e) => set("size", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Contact person</FieldLabel>
            <input
              className={inputCls}
              value={f.contactName}
              onChange={(e) => set("contactName", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Contact email</FieldLabel>
            <input
              className={inputCls}
              value={f.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Contact phone</FieldLabel>
            <input
              className={inputCls}
              value={f.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>About</FieldLabel>
            <textarea
              rows={3}
              className={inputCls}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
            />
          </div>
        </div>
        {saved ? (
          <div className="mt-4">
            <Notice tone="info" title="Profile updated">
              The T&P cell will see the updated details in its company register.
            </Notice>
          </div>
        ) : null}
        <div className="mt-5">
          <ActionButton
            onClick={() => {
              actions.updateCompany(company.id, f);
              setSaved(true);
            }}
          >
            Save profile
          </ActionButton>
        </div>
      </GlassCard>
    </Page>
  );
}