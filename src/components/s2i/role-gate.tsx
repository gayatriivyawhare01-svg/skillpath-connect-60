import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Pill } from "@/components/report-ui";
import { actions, useDB } from "@/lib/domain/store";
import { ROLE_LABEL, type Role } from "@/lib/domain/types";

/**
 * Role-based access gate. The selected role lives in client state, so the gate is
 * rendered rather than resolved in beforeLoad — an SSR redirect would fire before
 * the browser has told us who the visitor is.
 */
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const db = useDB();
  const current = db.session.role;

  if (current === role) return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <div className="glass rounded-2xl p-8 text-center">
        <Pill tone="warn">Restricted workspace</Pill>
        <h1 className="mt-4 text-xl font-semibold">{ROLE_LABEL[role]} workspace</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {current
            ? `You are currently signed in as ${ROLE_LABEL[current]}. Each role has its own permissions and data visibility in S2I.`
            : "Select a role before entering a workspace so S2I can apply the right permissions and data visibility."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => actions.setRole(role)}
            className="gradient-brand rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Continue as {ROLE_LABEL[role]}
          </button>
          <Link
            to="/"
            className="rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-medium"
          >
            Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
}
