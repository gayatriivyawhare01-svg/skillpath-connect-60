import { createFileRoute, Outlet } from "@tanstack/react-router";

import {
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { RoleShell, type NavItem } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty")({
  component: FacultyLayout,
});

const NAV: NavItem[] = [
  {
    to: "/faculty",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/faculty/students",
    label: "Assigned Students",
    icon: GraduationCap,
  },
  {
    to: "/faculty/permissions",
    label: "Pending Permissions",
    icon: ShieldCheck,
  },
  {
    to: "/faculty/evaluations",
    label: "Evaluations",
    icon: ClipboardList,
  },
];

function FacultyLayout() {
  const db = useDB();

  const faculty = db.faculty.find(
    (f) => f.id === db.session.facultyId,
  );

  return (
    <RoleGate role="faculty">
      <RoleShell
        role="faculty"
        nav={NAV}
        identity={
          <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Signed in as
            </p>

            <p className="mt-1 text-sm font-medium">
              {faculty?.name ?? "Faculty"}
            </p>

            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {faculty?.department ?? "Verified faculty coordinator"}
            </p>
          </div>
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}