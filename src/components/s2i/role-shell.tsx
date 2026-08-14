import { Link, type LinkProps } from "@tanstack/react-router";
import { Bell, LayoutGrid, LogOut, RotateCcw } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { actions, notificationsFor, resetDemoData, useDB } from "@/lib/domain/store";
import { ROLE_LABEL, type Role } from "@/lib/domain/types";
import { Pill } from "@/components/report-ui";

export type NavItem = {
  to: LinkProps["to"];
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

function NavLink({ item }: { item: NavItem }) {
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
      activeProps={{ className: "bg-secondary/80 text-foreground font-medium" }}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

/**
 * Shared workspace chrome. Each role gets its own nav, identity picker and
 * notification feed — the visual language stays consistent across the platform.
 */
export function RoleShell({
  role,
  nav,
  identity,
  children,
}: {
  role: Role;
  nav: NavItem[];
  identity: ReactNode;
  children: ReactNode;
}) {
  const db = useDB();
  const audienceId =
    role === "student"
      ? db.session.studentId
      : role === "faculty"
        ? db.session.facultyId
        : role === "company"
          ? db.session.companyId
          : "tnp";
  const unread = notificationsFor(db, role, audienceId).filter((n) => !n.read).length;

  return (
    <div className="min-h-screen lg:flex">
      <aside className="glass sticky top-0 z-40 shrink-0 border-b border-border/60 lg:h-screen lg:w-64 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 lg:flex-col lg:items-stretch lg:gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="gradient-brand grid size-8 shrink-0 place-items-center rounded-xl">
              <LayoutGrid className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-[15px] leading-none font-semibold tracking-tight">
              S2I <span className="gradient-text">Skill2Intern</span>
              <span className="mt-1 block text-[10px] font-normal tracking-wide text-muted-foreground">
                {ROLE_LABEL[role]} workspace
              </span>
            </span>
          </Link>
          <div className="hidden lg:block">{identity}</div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {nav.map((item) => (
            <div key={String(item.to)} className="shrink-0 lg:shrink">
              <NavLink item={item} />
            </div>
          ))}
        </nav>

        <div className="hidden gap-1 px-3 py-4 lg:flex lg:flex-col">
          {unread > 0 ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/8 px-3 py-2 text-[11px] text-primary">
              <Bell className="size-3.5" />
              {unread} unread notification{unread > 1 ? "s" : ""}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => resetDemoData()}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> Reset demo data
          </button>
          <Link
            to="/"
            onClick={() => actions.setRole(null)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Switch role
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="lg:hidden">{identity}</div>
        {children}
      </main>
    </div>
  );
}

export function IdentityPicker({
  label,
  value,
  onChange,
  options,
  note,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  note?: string;
}) {
  return (
    <div className="border-t border-border/60 px-4 py-3 lg:rounded-xl lg:border lg:border-border/60 lg:bg-secondary/25 lg:px-3 lg:py-2.5">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-[13px] font-medium outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card">
            {o.label}
          </option>
        ))}
      </select>
      {note ? <p className="mt-1 text-[10px] text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  actions: actionSlot,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actionSlot ? <div className="flex flex-wrap gap-2">{actionSlot}</div> : null}
    </div>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-5 py-8", className)}>{children}</div>;
}

export function RoleGateNotice({ role }: { role: Role }) {
  return (
    <Page>
      <div className="glass rounded-2xl p-10 text-center">
        <Pill tone="warn">Role required</Pill>
        <h1 className="mt-4 text-xl font-semibold">This workspace is for the {ROLE_LABEL[role]} role</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Pick a role on the entry screen so S2I can apply the right permissions and data visibility.
        </p>
        <Link
          to="/"
          className="gradient-brand mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Choose a role
        </Link>
      </div>
    </Page>
  );
}
