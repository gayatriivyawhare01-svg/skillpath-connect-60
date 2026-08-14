import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  Building2,
  ClipboardCheck,
  FileCheck2,
  GaugeCircle,
  LayoutDashboard,
  ListChecks,
  PieChart,
  ShieldCheck,
  Users,
} from "lucide-react";
import { IdentityPicker, RoleShell, type NavItem } from "@/components/s2i/role-shell";
import { RoleGate } from "@/components/s2i/role-gate";
import { useDB } from "@/lib/domain/store";

export const Route = createFileRoute("/tnp")({
  component: TnpLayout,
});

const NAV: NavItem[] = [
  { to: "/tnp", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/tnp/actions", label: "Action Center", icon: ListChecks },
  { to: "/tnp/students", label: "Students", icon: Users },
  { to: "/tnp/companies", label: "Companies", icon: Building2 },
  { to: "/tnp/internships", label: "Internships", icon: ClipboardCheck },
  { to: "/tnp/verification", label: "Verification Queue", icon: ShieldCheck },
  { to: "/tnp/offers", label: "Offers & Consent", icon: FileCheck2 },
  { to: "/tnp/monitoring", label: "Progress Monitoring", icon: GaugeCircle },
  { to: "/tnp/reports", label: "Reports", icon: PieChart },
];

function TnpLayout() {
  const db = useDB();
  return (
    <RoleGate role="tnp">
      <RoleShell
        role="tnp"
        nav={NAV}
        identity={
          <IdentityPicker
            label="Training & Placement Cell"
            value="tnp"
            onChange={() => {}}
            options={[{ value: "tnp", label: `${db.college.tnpHead} · Head T&P` }]}
            note={db.college.name}
          />
        }
      >
        <Outlet />
      </RoleShell>
    </RoleGate>
  );
}
