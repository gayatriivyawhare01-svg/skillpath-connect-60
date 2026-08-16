import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, GraduationCap, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { GlassCard, Pill } from "@/components/report-ui";
import { ActionButton, FieldLabel, Notice, inputCls } from "@/components/s2i/ui";
import { useDB } from "@/lib/domain/store";
import {
  institutionOptions,
  signInCompany,
  signInFaculty,
  signInStudent,
  signInTnp,
  type SignInResult,
} from "@/lib/domain/auth";
import { ROLE_LABEL, type Role } from "@/lib/domain/types";

const ROLES: { role: Role; icon: typeof GraduationCap; blurb: string }[] = [
  {
    role: "student",
    icon: GraduationCap,
    blurb: "Institution + roll number from your institutional student record.",
  },
  { role: "tnp", icon: Users, blurb: "Institution + T&P cell access code." },
  { role: "faculty", icon: ShieldCheck, blurb: "Institution + faculty email and access code." },
  { role: "company", icon: Building2, blurb: "Recruiter email + company access code." },
];

const DEST: Record<Role, "/student" | "/tnp" | "/faculty" | "/company"> = {
  student: "/student",
  tnp: "/tnp",
  faculty: "/faculty",
  company: "/company",
};

function parseRole(value: unknown): Role {
  return value === "tnp" || value === "faculty" || value === "company" ? value : "student";
}

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>) => ({ role: parseRole(search["role"]) }),
  head: () => ({
    meta: [
      { title: "Sign in — S2I Skill2Intern" },
      {
        name: "description",
        content:
          "Enter S2I as a student, T&P cell officer, faculty coordinator or company recruiter. Institution and identity are verified before any workspace opens.",
      },
      { property: "og:title", content: "Sign in — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Institution-scoped sign in for students, T&P cells, faculty and companies.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const db = useDB();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [role, setRole] = useState<Role>(search.role);
  const [institutionId, setInstitutionId] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const institutions = institutionOptions(db);

  function switchRole(next: Role) {
    setRole(next);
    setError("");
    setCode("");
    setEmail("");
    setRollNo("");
  }

  async function submit() {
    let result: SignInResult;
    if (role === "student") result = signInStudent(db, institutionId, rollNo);
    else if (role === "tnp") result = signInTnp(db, institutionId, code);
    else if (role === "faculty") result = signInFaculty(db, institutionId, email, code);
    else result = signInCompany(db, email, code);

    if (!result.ok) {
      // Never a lock-out: the field stays editable and the user simply retries.
      setError(result.message);
      return;
    }
    setError("");
    navigate({ to: DEST[role] });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="text-center">
        <Pill tone="brand">Institutional access</Pill>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">Sign in to S2I</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Choosing a role is not authorisation. Every role proves its identity before the workspace
          opens, and each institution only ever sees its own records.
        </p>
      </div>

      <div className="mt-7 grid gap-2 sm:grid-cols-4">
        {ROLES.map((r) => (
          <button
            key={r.role}
            type="button"
            onClick={() => switchRole(r.role)}
            className={
              role === r.role
                ? "flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-[13px] font-medium text-primary"
                : "flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            <r.icon className="size-4 shrink-0" />
            {ROLE_LABEL[r.role]}
          </button>
        ))}
      </div>

      <GlassCard className="mt-5 p-6">
        <p className="text-[12px] text-muted-foreground">
          {ROLES.find((r) => r.role === role)?.blurb}
        </p>

        <div className="mt-5 grid gap-4">
          {role !== "company" ? (
            <div>
              <FieldLabel required>Step 1 — Select your institution</FieldLabel>
              <select
                className={inputCls}
                value={institutionId}
                onChange={(e) => {
                  setInstitutionId(e.target.value);
                  setError("");
                }}
              >
                <option value="">Search / select institution…</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id} className="bg-card">
                    {i.name} — {i.code} ({i.city})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {role === "student" ? (
            <div>
              <FieldLabel required>Step 2 — Roll number</FieldLabel>
              <input
                className={inputCls}
                value={rollNo}
                placeholder="e.g. SIT21CE014"
                onChange={(e) => {
                  setRollNo(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Your record is created by your institution. S2I never creates a student record from
                a roll number that does not exist.
              </p>
            </div>
          ) : null}

          {role === "faculty" || role === "company" ? (
            <div>
              <FieldLabel required>{role === "company" ? "Recruiter email" : "Faculty email"}</FieldLabel>
              <input
                className={inputCls}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>
          ) : null}

          {role !== "student" ? (
            <div>
              <FieldLabel required>Access code</FieldLabel>
              <input
                className={inputCls}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Demo stand-in for institutional SSO / recruiter credentials.
              </p>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4">
            <Notice tone="danger" title="Could not sign you in">
              {error}
            </Notice>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ActionButton onClick={submit}>
            Continue <ArrowRight className="size-3.5" />
          </ActionButton>
          <Link to="/" className="text-[12px] text-muted-foreground hover:text-foreground">
            Back to overview
          </Link>
        </div>
      </GlassCard>

      <GlassCard className="mt-4 p-5">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Demo credentials
        </p>
        <div className="mt-3 grid gap-3 text-[12px] text-muted-foreground sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Student</p>
            {db.students.slice(0, 2).map((s) => (
              <p key={s.id}>
                {db.institutions?.find((i) => i.id === s.institutionId)?.code} · roll {s.rollNo}
              </p>
            ))}
          </div>
          <div>
            <p className="font-medium text-foreground">T&amp;P cell</p>
            {(db.tnpUsers ?? []).map((t) => (
              <p key={t.id}>
                {db.institutions?.find((i) => i.id === t.institutionId)?.code} · {t.accessCode}
              </p>
            ))}
          </div>
          <div>
            <p className="font-medium text-foreground">Faculty</p>
            {db.faculty.slice(0, 2).map((f) => (
              <p key={f.id}>
                {f.email} · {f.accessCode}
              </p>
            ))}
          </div>
          <div>
            <p className="font-medium text-foreground">Company</p>
            {db.companies.slice(0, 2).map((c) => (
              <p key={c.id}>
                {c.contactEmail} · {c.accessCode}
              </p>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
