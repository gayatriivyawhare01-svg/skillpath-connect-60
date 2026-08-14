import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ClipboardList, GraduationCap, LayoutDashboard, ShieldCheck } from "lucide-react";
import { IdentityPicker, RoleShell, type NavItem } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { actions, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/faculty")({
  component: FacultyLayout,
});

const NAV: NavItem[] = [
  { to: "/faculty", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/faculty/students", label: "Assigned Students", icon: GraduationCap },
  { to: "/faculty/permissions", label: "Pending Permissions", icon: ShieldCheck },
  { to: "/faculty/evaluations", label: "Evaluations", icon: ClipboardList },
];

function FacultyLayout() {
  const db = useDB();
  return (
    <RoleGate role="faculty">
      <RoleShell
        role="faculty"
        nav={NAV}
        identity={
          <IdentityPicker
            label="Faculty coordinator"
            value={db.session.facultyId}
            onChange={(facultyId) => actions.setIdentity({ facultyId })}
            options={db.faculty.map((f) => ({ value: f.id, label: `${f.name} · ${f.department}` }))}
            note="You only see records the T&P cell has approved."
          />
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}
