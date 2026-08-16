/**
 * S2I identity layer.
 *
 * Demo identity verification:
 *   student -> institution + roll number
 *   T&P     -> institution + access code
 *   faculty -> institution + email + access code
 *   company -> recruiter email + company access code
 *
 * Firebase authentication will be connected separately.
 */

import { actions } from "./store";
import type { DB, Role } from "./types";

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string };

const fail = (message: string): SignInResult => ({
  ok: false,
  message,
});

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

export function signInStudent(
  db: DB,
  institutionId: string,
  rollNo: string,
): SignInResult {
  if (!institutionId) {
    return fail("Select your institution before continuing.");
  }

  if (!rollNo.trim()) {
    return fail(
      "Enter the roll number printed on your institutional ID.",
    );
  }

  const matches = db.students.filter(
    (s) =>
      s.institutionId === institutionId &&
      norm(s.rollNo) === norm(rollNo),
  );

  if (matches.length === 0) {
    // Deliberately generic: never reveal whether the institution or the
    // roll number was the part that didn't match.
    return fail("Invalid institution code or roll number.");
  }

  if (matches.length > 1) {
    return fail(
      "This roll number matches more than one record. Contact your T&P cell.",
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

export function signInTnp(
  db: DB,
  institutionId: string,
  accessCode: string,
): SignInResult {
  if (!institutionId) {
    return fail(
      "Select the institution whose T&P cell you administer.",
    );
  }

  if (!accessCode.trim()) {
    return fail("Enter your T&P access code.");
  }

  const user = (db.tnpUsers ?? []).find(
    (t) =>
      t.institutionId === institutionId &&
      norm(t.accessCode) === norm(accessCode),
  );

  if (!user) {
    return fail(
      "That T&P access code is not valid for the selected institution.",
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
  if (!institutionId) {
    return fail("Select your institution before continuing.");
  }

  if (!email.trim()) {
    return fail("Enter your faculty email.");
  }

  if (!accessCode.trim()) {
    return fail("Enter your faculty access code.");
  }

  const faculty = db.faculty.find(
    (f) =>
      f.institutionId === institutionId &&
      norm(f.email) === norm(email) &&
      norm(f.accessCode) === norm(accessCode),
  );

  if (!faculty) {
    return fail(
      "No faculty account matched that email and access code.",
    );
  }

  actions.setIdentity({
    role: "faculty",
    signedIn: true,
    institutionId,
    facultyId: faculty.id,
  });

  return { ok: true };
}

export function signInCompany(
  db: DB,
  email: string,
  accessCode: string,
): SignInResult {
  if (!email.trim()) {
    return fail("Enter your recruiter email.");
  }

  if (!accessCode.trim()) {
    return fail("Enter your company access code.");
  }

  const company = db.companies.find(
    (c) =>
      norm(c.contactEmail) === norm(email) &&
      norm(c.accessCode) === norm(accessCode),
  );

  if (!company) {
    return fail(
      "No recruiter account matched that email and access code.",
    );
  }

  actions.setIdentity({
    role: "company",
    signedIn: true,
    institutionId: "",
    companyId: company.id,
  });

  return { ok: true };
}

export function isSignedInAs(
  db: DB,
  role: Role,
) {
  const session = db.session;

  if (!session.signedIn || session.role !== role) {
    return false;
  }

  if (role === "student") {
    return Boolean(session.studentId);
  }

  if (role === "faculty") {
    return Boolean(session.facultyId);
  }

  if (role === "company") {
    return Boolean(session.companyId);
  }

  return Boolean(session.tnpUserId);
}