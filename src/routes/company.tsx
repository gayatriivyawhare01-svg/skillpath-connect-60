import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Briefcase, Building2, LayoutDashboard, PlusCircle, Users } from "lucide-react";
import { IdentityPicker, RoleShell, type NavItem } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { actions, useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/company")({
  component: CompanyLayout,
});

const NAV: NavItem[] = [
  { to: "/company", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/company/post", label: "Post Internship", icon: PlusCircle },
  { to: "/company/candidates", label: "Candidates", icon: Users },
  { to: "/company/interns", label: "Interns & Feedback", icon: Briefcase },
  { to: "/company/profile", label: "Company Profile", icon: Building2 },
];

function CompanyLayout() {
  const db = useDB();
  return (
    <RoleGate role="company">
      <RoleShell
        role="company"
        nav={NAV}
        identity={
          <IdentityPicker
            label="Signed in as"
            value={db.session.companyId}
            onChange={(companyId) => actions.setIdentity({ companyId })}
            options={db.companies.map((c) => ({ value: c.id, label: c.name }))}
            note="Company users never see institutional records outside their own hiring."
          />
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}
