import { createFileRoute, Outlet } from "@tanstack/react-router";
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
import { IdentityPicker, RoleShell } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { actions, useDB } from "@/lib/domain/store";
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
  return (
    <RoleGate role="student">
      <RoleShell
        role="student"
        nav={NAV}
        identity={
          <IdentityPicker
            label="Signed in as"
            value={db.session.studentId}
            onChange={(studentId) => actions.setIdentity({ studentId })}
            options={db.students.map((s) => ({
              value: s.id,
              label: `${s.name} · ${s.rollNo}`,
            }))}
            note="Demo: switch student to see different pipeline states."
          />
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}
