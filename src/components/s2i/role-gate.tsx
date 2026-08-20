import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Pill } from "@/components/report-ui";
import { useDB } from "@/lib/domain/store";
import { ROLE_LABEL, type Role } from "@/lib/domain/types";
import { isSignedInAs } from "@/lib/domain/auth";

export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const db = useDB();

  if (isSignedInAs(db, role)) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-24">
      <div className="glass rounded-2xl p-8 text-center">
        <Pill tone="warn">Restricted workspace</Pill>

        <h1 className="mt-4 text-xl font-semibold">
          {ROLE_LABEL[role]} workspace
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You must sign in with valid {ROLE_LABEL[role].toLowerCase()} credentials
          before accessing this workspace.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/signin"
            search={{ role }}
            className="gradient-brand rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Sign in as {ROLE_LABEL[role]}
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-medium"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}