/**
 * S2I identity layer.
 *
 * Role selection is NOT authorization. Each role proves identity before the
 * workspace opens:
 *
 *   student  -> institution + roll number (institutional student record)
 *   T&P      -> institution + T&P access code
 *   faculty  -> institution + email + faculty access code
 *   company  -> recruiter email + company access code
 *
 * Access codes are the demo stand-in for institutional SSO / recruiter
 * passwords. Integration point: replace the `verify*` functions below with a
 * real identity provider call — the session shape stays identical.
 *
 * Failed attempts never lock or mutate anything: the user simply retries.
 */

import { actions } from "./store";
import type { DB, Role } from "./types";

export type SignInResult = { ok: true } | { ok: false; message: string };

const fail = (message: string): SignInResult => ({ ok: false, message });

function norm(v: string) {
  return v.trim().toLowerCase();
}

export function institutionOptions(db: DB) {
  return (db.institutions ?? []).map((i) => ({
    id: i.id,
    label: `${i.name} · ${i.code}`,
    name: i.name,
    code: i.code,
    city: i.city,
  }));
}

/** STEP 1 institution + STEP 2 roll number. The pair must uniquely identify a student. */
export function signInStudent(db: DB, institutionId: string, rollNo: string): SignInResult {
  if (!institutionId) return fail("Select your institution before continuing.");
  if (!rollNo.trim()) return fail("Enter the roll number printed on your institutional ID.");

  const matches = db.students.filter(
    (s) => s.institutionId === institutionId && norm(s.rollNo) === norm(rollNo),
  );
  if (matches.length === 0) {
    return fail(
      "Student record not found. Please check your institution and roll number, then try again.",
    );
  }
  if (matches.length > 1) {
    return fail(
      "This roll number matches more than one record. Contact your T&P cell so the duplicate can be merged.",
    );
  }

  const student = matches[0]!;
  actions.setIdentity({
    role: "student",
    signedIn: true,
    institutionId,
    studentId: student.id,
    facultyId: student.facultyId,
  });
  return { ok: true };
}

export function signInTnp(db: DB, institutionId: string, accessCode: string): SignInResult {
  if (!institutionId) return fail("Select the institution whose T&P cell you administer.");
  const user = (db.tnpUsers ?? []).find(
    (t) => t.institutionId === institutionId && norm(t.accessCode) === norm(accessCode),
  );
  if (!user) {
    return fail(
      "That T&P access code is not valid for the selected institution. Check the code and try again.",
    );
  }
  actions.setIdentity({
    role: "tnp",
    signedIn: true,
    institutionId,
    tnpUserId: user.id,
  });
  return { ok: true };
}

export function signInFaculty(
  db: DB,
  institutionId: string,
  email: string,
  accessCode: string,
): SignInResult {
  if (!institutionId) return fail("Select your institution before continuing.");
  const f = db.faculty.find(
    (x) =>
      x.institutionId === institutionId &&
      norm(x.email) === norm(email) &&
      norm(x.accessCode) === norm(accessCode),
  );
  if (!f) {
    return fail(
      "No faculty account matched that email and access code for the selected institution. Please try again.",
    );
  }
  actions.setIdentity({
    role: "faculty",
    signedIn: true,
    institutionId,
    facultyId: f.id,
  });
  return { ok: true };
}

export function signInCompany(db: DB, email: string, accessCode: string): SignInResult {
  const c = db.companies.find(
    (x) => norm(x.contactEmail) === norm(email) && norm(x.accessCode) === norm(accessCode),
  );
  if (!c) {
    return fail(
      "No recruiter account matched that email and access code. Companies are onboarded by the T&P cell.",
    );
  }
  actions.setIdentity({
    role: "company",
    signedIn: true,
    // Companies are global tenants — no institution scope of their own.
    institutionId: "",
    companyId: c.id,
  });
  return { ok: true };
}

export function isSignedInAs(db: DB, role: Role) {
  const s = db.session;
  if (!s.signedIn || s.role !== role) return false;
  if (role === "student") return Boolean(s.studentId);
  if (role === "faculty") return Boolean(s.facultyId);
  if (role === "company") return Boolean(s.companyId);
  return Boolean(s.tnpUserId);
}
