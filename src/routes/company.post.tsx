import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GlassCard } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { ActionButton, FieldLabel, Notice, inputCls } from "@/components/s2i/ui";
import { actions, companyById, useDB } from "@/lib/domain/store";
import { WORK_MODES, todayISO, type WorkMode } from "@/lib/domain/types";

export const Route = createFileRoute("/company/post")({
  head: () => ({
    meta: [
      { title: "Post an Internship — S2I Skill2Intern" },
      {
        name: "description",
        content: "Submit an internship opening for T&P cell approval and student matching.",
      },
      { property: "og:title", content: "Post an Internship — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Openings go live only after the T&P cell approves them.",
      },
    ],
  }),
  component: PostOpportunity,
});

function list(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function PostOpportunity() {
  const db = useDB();
  const company = companyById(db, db.session.companyId);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    role: "",
    domain: "",
    location: "",
    workMode: "Onsite" as WorkMode,
    durationMonths: 3,
    stipend: 15000,
    openings: 2,
    description: "",
    responsibilities: "",
    requiredSkills: "",
    preferredSkills: "",
    minCgpa: 6.5,
    departments: "",
    years: "3,4",
    startDate: todayISO(),
    deadline: todayISO(),
  });
  if (!company) return null;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  function submit() {
    const missing = [
      ["Role", f.role],
      ["Domain", f.domain],
      ["Location", f.location],
      ["Description", f.description],
      ["Required skills", f.requiredSkills],
      ["Departments", f.departments],
    ].filter(([, v]) => !String(v).trim());
    if (missing.length) {
      setError(`Please complete: ${missing.map(([k]) => k).join(", ")}.`);
      setDone(false);
      return;
    }
    actions.postOpportunity({
      companyId: company.id,
      role: f.role,
      domain: f.domain,
      location: f.location,
      workMode: f.workMode,
      durationMonths: f.durationMonths,
      stipend: f.stipend,
      openings: f.openings,
      description: f.description,
      responsibilities: list(f.responsibilities),
      requiredSkills: list(f.requiredSkills),
      preferredSkills: list(f.preferredSkills),
      minCgpa: f.minCgpa,
      departments: list(f.departments),
      years: list(f.years).map(Number),
      startDate: f.startDate,
      deadline: f.deadline,
    });
    setError("");
    setDone(true);
  }

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Company workspace"
        title="Post an internship"
        description="Submissions go to the T&P cell first. Only approved openings reach students."
      />
      <GlassCard className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel required>Role</FieldLabel>
            <input className={inputCls} value={f.role} onChange={(e) => set("role", e.target.value)} />
          </div>
          <div>
            <FieldLabel required>Domain</FieldLabel>
            <input
              className={inputCls}
              value={f.domain}
              onChange={(e) => set("domain", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>Location</FieldLabel>
            <input
              className={inputCls}
              value={f.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Work mode</FieldLabel>
            <select
              className={inputCls}
              value={f.workMode}
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
            <FieldLabel>Duration (months)</FieldLabel>
            <input
              type="number"
              className={inputCls}
              value={f.durationMonths}
              onChange={(e) => set("durationMonths", Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Stipend (₹ / month)</FieldLabel>
            <input
              type="number"
              className={inputCls}
              value={f.stipend}
              onChange={(e) => set("stipend", Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Openings</FieldLabel>
            <input
              type="number"
              className={inputCls}
              value={f.openings}
              onChange={(e) => set("openings", Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Minimum CGPA</FieldLabel>
            <input
              type="number"
              step="0.1"
              className={inputCls}
              value={f.minCgpa}
              onChange={(e) => set("minCgpa", Number(e.target.value))}
            />
          </div>
          <div>
            <FieldLabel>Start date</FieldLabel>
            <input
              type="date"
              className={inputCls}
              value={f.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Application deadline</FieldLabel>
            <input
              type="date"
              className={inputCls}
              value={f.deadline}
              onChange={(e) => set("deadline", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>Required skills (comma separated)</FieldLabel>
            <input
              className={inputCls}
              value={f.requiredSkills}
              onChange={(e) => set("requiredSkills", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Preferred skills (comma separated)</FieldLabel>
            <input
              className={inputCls}
              value={f.preferredSkills}
              onChange={(e) => set("preferredSkills", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel required>Eligible departments (comma separated)</FieldLabel>
            <input
              className={inputCls}
              value={f.departments}
              onChange={(e) => set("departments", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Eligible years (comma separated)</FieldLabel>
            <input
              className={inputCls}
              value={f.years}
              onChange={(e) => set("years", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel required>Description</FieldLabel>
            <textarea
              rows={3}
              className={inputCls}
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Responsibilities (comma separated)</FieldLabel>
            <textarea
              rows={2}
              className={inputCls}
              value={f.responsibilities}
              onChange={(e) => set("responsibilities", e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Notice tone="danger" title="Incomplete posting">
              {error}
            </Notice>
          </div>
        ) : null}
        {done ? (
          <div className="mt-4">
            <Notice tone="info" title="Submitted to the T&P cell">
              Requirements were parsed and eligible students ranked for the T&P cell to review.
            </Notice>
          </div>
        ) : null}

        <div className="mt-5">
          <ActionButton onClick={submit}>Submit to T&amp;P cell</ActionButton>
        </div>
      </GlassCard>
    </Page>
  );
}