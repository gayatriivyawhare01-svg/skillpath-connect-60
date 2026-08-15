import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Page, WorkspaceHeader } from "@/components/s2i/role-shell";
import { EmptyState } from "@/components/s2i/ui";
import { actions, notificationsFor, useDB } from "@/lib/domain/store";
import { formatDate } from "@/lib/domain/types";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — S2I Skill2Intern" },
      {
        name: "description",
        content: "Every institutional update on your applications, offers, evidence and verification.",
      },
      { property: "og:title", content: "Notifications — S2I Skill2Intern" },
      {
        property: "og:description",
        content: "Updates from the T&P cell, faculty and companies in one feed.",
      },
    ],
  }),
  component: StudentNotifications,
});

function StudentNotifications() {
  const db = useDB();
  const studentId = db.session.studentId;
  const items = notificationsFor(db, "student", studentId);

  useEffect(() => {
    actions.markNotificationsRead("student", studentId);
  }, [studentId]);

  return (
    <Page>
      <WorkspaceHeader
        eyebrow="Student workspace"
        title="Notifications"
        description="Institutional updates are recorded here and in the internship history — the same single evidence trail."
      />
      {items.length ? (
        <GlassCard className="divide-y divide-border/60 p-0">
          {items.map((n) => (
            <div key={n.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <Pill tone={n.read ? "neutral" : "brand"}>{n.kind}</Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">{formatDate(n.createdAt)}</p>
            </div>
          ))}
        </GlassCard>
      ) : (
        <EmptyState message="No notifications yet." />
      )}
    </Page>
  );
}