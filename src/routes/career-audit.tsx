import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path from the single-role version — preserved so old links keep working. */
export const Route = createFileRoute("/career-audit")({
  beforeLoad: () => {
    throw redirect({ to: "/student/career-audit" });
  },
});
