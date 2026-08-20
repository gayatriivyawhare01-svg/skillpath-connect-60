import { createFileRoute, Outlet } from "@tanstack/react-router";

import {
  Briefcase,
  Building2,
  LayoutDashboard,
  PlusCircle,
  Users,
} from "lucide-react";

import { RoleShell, type NavItem } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/company")({
  component: CompanyLayout,
});

const NAV: NavItem[] = [
  {
    to: "/company",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/company/post",
    label: "Post Internship",
    icon: PlusCircle,
  },
  {
    to: "/company/candidates",
    label: "Candidates",
    icon: Users,
  },
  {
    to: "/company/interns",
    label: "Interns & Feedback",
    icon: Briefcase,
  },
  {
    to: "/company/profile",
    label: "Company Profile",
    icon: Building2,
  },
];

function CompanyLayout() {
  const db = useDB();

  const company = db.companies.find(
    (c) => c.id === db.session.companyId,
  );

  return (
    <RoleGate role="company">
      <RoleShell
        role="company"
        nav={NAV}
        identity={
          <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Signed in as
            </p>

            <p className="mt-1 text-sm font-medium">
              {company?.name ?? "Company"}
            </p>

            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {company?.contactEmail ?? "Verified recruiter"}
            </p>
          </div>
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}