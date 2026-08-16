import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Bell,
  BrainCircuit,
  BadgeCheck,
  FileSearch,
  LayoutDashboard,
  ScanSearch,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { RoleShell } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { studentById, useDB } from "@/lib/domain/store";
import type { NavItem } from "@/components/s2i/role-shell";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const NAV: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/student/career-audit", label: "Career Assessment", icon: BrainCircuit },
  { to: "/student/opportunities", label: "Opportunities", icon: Sparkles },
  { to: "/student/self-placed", label: "Self-Placed Internship", icon: Send },
  { to: "/student/passport", label: "Internship Passport", icon: BadgeCheck },
  { to: "/student/resume", label: "Resume Intelligence", icon: FileSearch },
  { to: "/student/xray", label: "Internship X-Ray", icon: ScanSearch },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/profile", label: "Profile", icon: UserRound },
];

function StudentLayout() {
  const db = useDB();
  const navigate = useNavigate();
  const session = db.session;

  // A student may only enter this workspace with a session that (a) was
  // produced by a successful sign-in as "student" and (b) still resolves to
  // a real student record inside the institution recorded at sign-in time.
  // There is no dropdown or URL/session field a person can edit to become a
  // different student — the identity below is read-only, and if the lookup
  // ever fails (missing session, tampered/unknown studentId, institution
  // mismatch) we bounce straight back to sign-in instead of rendering
  // anything from the student workspace.
  const student = session.studentId ? studentById(db, session.studentId) : undefined;
  const authorized =
    session.signedIn &&
    session.role === "student" &&
    !!student &&
    student.institutionId === session.institutionId;

  useEffect(() => {
    if (!authorized) {
      navigate({ to: "/signin", search: { role: "student" } });
    }
  }, [authorized, navigate]);

  if (!authorized || !student) return null;

  return (
    <RoleGate role="student">
      <RoleShell
        role="student"
        nav={NAV}
        identity={
          <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <p className="text-[13px] font-medium text-foreground">{student.name}</p>
            <p className="text-[11px] text-muted-foreground">Roll {student.rollNo}</p>
          </div>
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}