# S2I — Evolving the existing app into a multi-role platform

## What I found in your ZIP (now restored into the project)

Stack: TanStack Start v1 + React 19 + Tailwind v4 + shadcn/ui. No backend/database — all state is `localStorage` via `src/lib/storage.ts`.

Existing routes: `/` (landing), `/career-audit`, `/resume-intelligence`, `/internship-xray`, `/internship-passport`, `/profile`.

Existing logic worth keeping as-is:
- `src/lib/audit-evidence.ts` — deterministic readiness scoring, gaps, "insufficient evidence" states.
- `src/lib/role-requirements.ts` — role → required skills map. This is already the seed of a matching engine.
- `src/lib/passport.ts` — internship + verification status enums, document types.
- `src/lib/ai.server.ts` + `src/lib/intel.functions.ts` — server functions for audit / resume / X-Ray, with rule-based numbers overriding the model.
- `src/components/report-ui.tsx`, `audit/*`, `app-shell.tsx` and the dark blue/violet glass design system in `src/styles.css`.

Conflicts / gaps to resolve:
- Branding in the UI says "InternHub AI", not S2I. I'll rename copy only, keeping the visual identity.
- Everything is single-role and single-user; there is no student record other than the current browser's.
- No company, T&P, faculty, opportunity, application, offer, consent, evidence, evaluation or notification entities.
- `role-requirements.ts` maps roles to skills but nothing scores a student against a company posting.
- Verification states exist but nothing can move a record beyond self-reported.

## Approach

Keep localStorage as the store (no Cloud) so the demo runs instantly and is fully seedable. Add a single typed data layer with realistic seeded demo data that every role reads from, so all four dashboards look at **one evidence trail**.

### Data layer (new)
`src/lib/domain/` — types + seed + store:
`Student, Company, Faculty, College, Opportunity, Application, Internship (collegePlaced | selfPlaced), Offer, Consent, EvidenceItem, Evaluation, Feedback, Notification`.
- `types.ts`, `seed.ts` (≈12 students, 4 companies, 3 faculty, 5 opportunities, internships spread across every lifecycle stage), `store.ts` (load/save/reset + a `useS2I()` hook with mutation actions), `lifecycle.ts` (the 12-stage tracker: APPLICATION → SHORTLISTED → INTERVIEW → SELECTED → CONSENT → OFFER → JOINING → ACTIVE → PROGRESS → COMPLETION → FACULTY EVALUATION → VERIFIED).
- `matching.ts` — rule-based scoring (skills, CGPA, department, projects, certifications, preference, location, availability) returning score + strong / partial / missing reasons. Reuses `role-requirements.ts`.
- `risk.ts` — self-placed company analysis: website/domain checks, missing-evidence flags, stipend/duration sanity, producing an assessment report with the explicit review states you specified (never "AI proved this is genuine").

### Routes (new, role-based)
- `/` → S2I landing + role selector (STUDENT / T&P CELL / FACULTY / COMPANY), persists chosen role + identity.
- `/student` (layout + `index`) — dashboard, plus the four preserved features moved under it: `/student/career-audit`, `/student/resume`, `/student/xray`, `/student/passport`, `/student/opportunities`, `/student/self-placed`, `/student/notifications`, `/student/profile`.
  Old paths `/career-audit`, `/resume-intelligence`, `/internship-xray`, `/internship-passport`, `/profile` stay working as redirects so nothing breaks.
- `/tnp` — overview, action-center, students, companies, internships (college-placed / self-placed tabs), verification-queue, offers, monitoring, reports.
- `/faculty` — assigned students, pending permissions, evidence review, evaluation.
- `/company` — profile, post opportunity, matched candidates, interviews, offers, feedback.
Each role subtree gets a `beforeLoad` guard that redirects to `/` when the selected role doesn't match, plus its own sidebar/nav.

### Preserved and connected
The four student features keep their current UI and server functions. New wiring only: career-assessment output writes into the student's matching profile; X-Ray feeds the self-placed submission; the passport reads the real internship + evidence + evaluation records instead of local-only entries.

### Enforcement details
- Career assessment gets real required-field validation: blocking submit, listing exactly what is missing and why each field is needed for eligibility/matching.
- Location and work mode are mandatory on opportunities and internship records.
- Evidence is a collection with a completeness meter — one document never marks an internship complete.
- Joining/location confirmation is consent-based check-ins only; no continuous tracking.
- AI stays advisory: match explanations and risk reports are labelled as assistance, institutional verification only comes from a T&P/faculty action.

### Build order
1. Domain types + seed + store + lifecycle.
2. Landing role selector, role layouts, guards, redirects for old paths.
3. Student module (dashboard + assessment enforcement + opportunities + self-placed submission), reusing existing feature pages.
4. Company module (post opportunity → requirement analysis → matched candidates).
5. T&P module (overview, recommendations, shortlisting, verification queue, offers, monitoring, analytics).
6. Faculty module (permissions, evidence review, evaluation, completion).
7. Notifications, per-route metadata, S2I copy rename, end-to-end demo pass of both pathways.

P1 (notifications feed, analytics charts) lands in step 7. P2 is out of scope.
