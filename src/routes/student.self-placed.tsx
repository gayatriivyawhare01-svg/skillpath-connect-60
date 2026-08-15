import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import {
  ActionButton,
  AiDisclaimer,
  FieldLabel,
  Notice,
  ReasonRow,
  inputCls,
} from "@/components/s2i/ui";
import { InternshipPanel } from "@/components/s2i/internship-panel";
import { actions, studentById, studentInternships, useDB } from "@/lib/domain/store";
import { analyseSelfPlaced } from "@/lib/domain/risk";
import { WORK_MODES, todayISO, type WorkMode } from "@/lib/domain/types";

export const Route = createFileRoute("/student/self-placed")({
  head: () => ({
    meta: [
      { title: "Self-Placed Internship — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "Declare an internship you found yourself and build the evidence trail the T&P cell needs to verify it.",
      },
      { property: "og:title", content: "Self-Placed Internship — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Submit a self-placed internship for institutional review and verification.",
      },
    ],
  }),
  component: SelfPlacedPage,
});

const EMPTY = {
  companyName: "",
  companyWebsite: "",
  companyEmail: "",
  companyContactName: "",
  companyContactPhone: "",
  companyAddress: "",
  description: "",
  howFound: "",
  hasOfferLetter: false,
  role: "",
  domain: "",
  location: "",
  workMode: "Onsite" as WorkMode,
  startDate: todayISO(),
  durationMonths: 3,
  stipend: 0,
};

function SelfPlacedPage() {
  const db = useDB();
  const student = studentById(db, db.session.studentId);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const existing = studentInternships(db, db.session.studentId).filter(
    (i) => i.pathway === "self-placed",
  );
  if (!student) return null;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit() {
    const required: [string, string][] = [
      ["Company name", form.companyName],
      ["Company website", form.companyWebsite],
      ["Company email", form.companyEmail],
      ["Contact person", form.companyContactName],
      ["Contact phone", form.companyContactPhone],
      ["Company address", form.companyAddress],
      ["Role", form.role],
      ["Domain", form.domain],
      ["Location", form.location],
      ["How you found it", form.howFound],
      ["Work description", form.description],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([k]) => k);
    if (missing.length) {
      setError(`Please complete: ${missing.join(", ")}.`);
      return;
    }
    const end = new Date(form.startDate);
    end.setMonth(end.getMonth() + form.durationMonths);
    actions.submitSelfPlaced({
      pathway: "self-placed",
      studentId: student.id,
      selfPlaced: {
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        companyEmail: form.companyEmail,
        companyContactName: form.companyContactName,
        companyContactPhone: form.companyContactPhone,
        companyAddress: form.companyAddress,
        description: form.description,
        howFound: form.howFound,
        hasOfferLetter: form.hasOfferLetter,
      },
      role: form.role,
      domain: form.domain,
      location: form.location,
      workMode: form.workMode,
      startDate: form.startDate,
      endDate: end.toISOString().slice(0, 10),
      durationMonths: form.durationMonths,
      stipend: form.stipend,
      stage: "Application",
      review: "Student Submitted",
      verification: "Self Reported",
      facultyPermission: "Pending",
      facultyId: student.facultyId,
      evidence: [],
      checkIns: [],
      riskFlags: form.hasOfferLetter ? [] : ["Offer letter not yet recorded"],
    });
    setForm(EMPTY);
    setError("");
  }

  const preview = analyseSelfPlaced({
    id: "preview",
    pathway: "self-placed",
    studentId: student.id,
    selfPlaced: {
      companyName: form.companyName,
      companyWebsite: form.companyWebsite,
      companyEmail: form.companyEmail,
      companyContactName: form.companyContactName,
      companyContactPhone: form.companyContactPhone,
      companyAddress: form.companyAddress,
      description: form.description,
      howFound: form.howFound,
      hasOfferLetter: form.hasOfferLetter,
    },
    role: form.role,
    domain: form.domain,
    location: form.location,
    workMode: form.workMode,
    startDate: form.startDate,
    endDate: form.startDate,
    durationMonths: form.durationMonths,
    stipend: form.stipend,
    stage: "Application",
    review: "Student Submitted",
    verification: "Self Reported",
    facultyPermission: "Pending",
    facultyId: student.facultyId,
    evidence: [],
    checkIns: [],
    riskFlags: [],
    createdAt: new Date().toISOString(),
    history: [],
  });

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Self-placed pathway"
        title="Declare a self-placed internship"
        description="Internships you arranged yourself follow the same evidence trail. The T&P cell decides the review state — nothing here is auto-approved."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel required>Company name</FieldLabel>
              <input
                className={inputCls}
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Company website</FieldLabel>
              <input
                className={inputCls}
                placeholder="company.com"
                value={form.companyWebsite}
                onChange={(e) => set("companyWebsite", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Official company email</FieldLabel>
              <input
                className={inputCls}
                value={form.companyEmail}
                onChange={(e) => set("companyEmail", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Contact person</FieldLabel>
              <input
                className={inputCls}
                value={form.companyContactName}
                onChange={(e) => set("companyContactName", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Contact phone</FieldLabel>
              <input
                className={inputCls}
                value={form.companyContactPhone}
                onChange={(e) => set("companyContactPhone", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Company address</FieldLabel>
              <input
                className={inputCls}
                value={form.companyAddress}
                onChange={(e) => set("companyAddress", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Role</FieldLabel>
              <input
                className={inputCls}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Domain</FieldLabel>
              <input
                className={inputCls}
                value={form.domain}
                onChange={(e) => set("domain", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Work location</FieldLabel>
              <input
                className={inputCls}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Work mode</FieldLabel>
              <select
                className={inputCls}
                value={form.workMode}
                onChange={(e) => set("workMode", e.target.value as WorkMode)}
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m} className="bg-card">
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel required>Start date</FieldLabel>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Duration (months)</FieldLabel>
              <input
                type="number"
                min={1}
                max={12}
                className={inputCls}
                value={form.durationMonths}
                onChange={(e) => set("durationMonths", Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel>Stipend (₹ / month)</FieldLabel>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.stipend}
                onChange={(e) => set("stipend", Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel required>How did you find this internship?</FieldLabel>
              <input
                className={inputCls}
                placeholder="Referral, LinkedIn, campus alumni…"
                value={form.howFound}
                onChange={(e) => set("howFound", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>What work will you do?</FieldLabel>
              <textarea
                rows={3}
                className={inputCls}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={form.hasOfferLetter}
                onChange={(e) => set("hasOfferLetter", e.target.checked)}
              />
              I already have an official offer letter and can upload it as evidence
            </label>
          </div>

          {error ? (
            <div className="mt-4">
              <Notice tone="danger" title="Incomplete submission">
                {error}
              </Notice>
            </div>
          ) : null}

          <div className="mt-5">
            <ActionButton onClick={submit}>Submit for T&P review</ActionButton>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-semibold">Automated completeness check</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{preview.summary}</p>
          <ul className="mt-3">
            {preview.indicators.map((ind) => (
              <ReasonRow
                key={ind.label}
                kind={ind.status === "ok" ? "strong" : ind.status === "attention" ? "partial" : "missing"}
                label={ind.label}
                detail={ind.detail}
              />
            ))}
          </ul>
          <AiDisclaimer>{preview.disclaimer}</AiDisclaimer>
        </GlassCard>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">My self-placed submissions</h2>
      <div className="space-y-5">
        {existing.map((i) => (
          <InternshipPanel key={i.id} internship={i} />
        ))}
        {!existing.length ? (
          <p className="text-xs text-muted-foreground">No self-placed internships submitted yet.</p>
        ) : null}
      </div>
    </Page>
  );
}