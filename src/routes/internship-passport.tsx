import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  FileCheck2,
  GraduationCap,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard, KeyValue, Pill, SectionTitle } from "@/components/report-ui";
import { PageHeader } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { STORE, usePersistedState } from "@/lib/storage";
import {
  DOCUMENT_TYPES,
  INTERNSHIP_STATUSES,
  formatDate,
  nextStatus,
  newId,
  statusProgress,
  todayISO,
  verificationNote,
  verificationOf,
  type DocumentType,
  type InternshipRecord,
  type InternshipStatus,
} from "@/lib/passport";

export const Route = createFileRoute("/internship-passport")({
  head: () => ({
    meta: [
      { title: "Internship Passport — Skill2Intern" },
      {
        name: "description",
        content:
          "Record every internship you apply to, track it from Applied to Completed, attach your offer letter and certificate, and keep an honest verification status.",
      },
      { property: "og:title", content: "Internship Passport — Skill2Intern" },
      {
        property: "og:description",
        content: "Your own proof record: real status changes, real dates, real documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportPage,
});

function PassportPage() {
  const [view, setView] = useState<"student" | "college">("student");
  const [records, setRecords, hydrated] = usePersistedState<InternshipRecord[]>(
    STORE.passport,
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageHeader
        eyebrow="Feature 04"
        title="Internship Passport"
        description="Your internship proof record. Add each internship, move it through Applied → Selected → In Progress → Completed, and attach the documents that back it up."
      />

      <div className="mb-7 inline-flex rounded-xl border border-border bg-secondary/30 p-1">
        {(
          [
            ["student", "Student passport", UserRound],
            ["college", "College view", GraduationCap],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all",
              view === key
                ? "gradient-brand text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <GlassCard className="p-7 text-sm text-muted-foreground">Loading your records…</GlassCard>
      ) : view === "student" ? (
        <StudentPassport records={records} setRecords={setRecords} />
      ) : (
        <CollegeView records={records} />
      )}
    </div>
  );
}

const EMPTY_FORM = {
  company: "",
  role: "",
  url: "",
  startDate: "",
  endDate: "",
  stipend: "",
  mode: "",
  description: "",
  githubLink: "",
  projectLink: "",
};

function StudentPassport({
  records,
  setRecords,
}: {
  records: InternshipRecord[];
  setRecords: (updater: InternshipRecord[] | ((prev: InternshipRecord[]) => InternshipRecord[])) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const addRecord = () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required.");
      return;
    }
    const record: InternshipRecord = {
      id: newId(),
      ...form,
      status: "Applied",
      documents: [],
      timeline: [
        { id: newId(), label: "Marked as Applied", date: todayISO(), kind: "status" },
      ],
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [record, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    toast.success("Internship added to your passport.");
  };

  const update = (id: string, fn: (r: InternshipRecord) => InternshipRecord) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {records.length
            ? `${records.length} internship record${records.length > 1 ? "s" : ""} saved on this device.`
            : "No internships recorded yet."}
        </p>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="gradient-brand inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> {showForm ? "Close" : "Add internship"}
        </button>
      </div>

      {showForm ? (
        <GlassCard className="p-7">
          <SectionTitle title="Add an internship" subtitle="Only company and role are required — add the rest as it happens." />
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["company", "Company", "Nexbyte Technologies Pvt. Ltd."],
                ["role", "Role", "Frontend Developer Intern"],
                ["url", "Internship URL", "https://…"],
                ["mode", "Work mode", "Remote / Hybrid · Pune"],
                ["stipend", "Stipend", "₹15,000 / month"],
                ["githubLink", "GitHub link", "https://github.com/…"],
                ["projectLink", "Project / demo link", "https://…"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">End date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label className="text-xs text-muted-foreground">Description / responsibilities</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What you were hired to do, in your own words."
            />
          </div>
          <button
            onClick={addRecord}
            className="gradient-brand mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Save to passport
          </button>
        </GlassCard>
      ) : null}

      {!records.length && !showForm ? (
        <GlassCard className="p-9 text-center">
          <p className="text-sm font-medium">Your passport is empty</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            Add the first internship you applied to. Every status change and document you record here
            is stored on this device and stays after a refresh.
          </p>
        </GlassCard>
      ) : null}

      {records.map((record) => (
        <RecordCard key={record.id} record={record} update={update} setRecords={setRecords} />
      ))}
    </div>
  );
}

function RecordCard({
  record,
  update,
  setRecords,
}: {
  record: InternshipRecord;
  update: (id: string, fn: (r: InternshipRecord) => InternshipRecord) => void;
  setRecords: (updater: (prev: InternshipRecord[]) => InternshipRecord[]) => void;
}) {
  const [docType, setDocType] = useState<DocumentType>("Offer letter");
  const [docName, setDocName] = useState("");
  const verification = verificationOf(record);
  const next = nextStatus(record.status);

  const setStatus = (status: InternshipStatus) =>
    update(record.id, (r) => ({
      ...r,
      status,
      timeline: [
        ...r.timeline,
        { id: newId(), label: `Status changed to ${status}`, date: todayISO(), kind: "status" },
      ],
    }));

  const addDocument = () => {
    if (!docName.trim()) {
      toast.error("Give the document a name.");
      return;
    }
    update(record.id, (r) => ({
      ...r,
      documents: [
        ...r.documents,
        { id: newId(), type: docType, name: docName.trim(), addedAt: todayISO() },
      ],
      timeline: [
        ...r.timeline,
        { id: newId(), label: `${docType} recorded: ${docName.trim()}`, date: todayISO(), kind: "document" },
      ],
    }));
    setDocName("");
  };

  return (
    <GlassCard className="relative overflow-hidden p-7 sm:p-9">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={record.status === "Completed" ? "good" : "brand"}>{record.status}</Pill>
            <Pill
              tone={
                verification === "Organization Verified"
                  ? "good"
                  : verification === "Verification Pending"
                    ? "warn"
                    : "neutral"
              }
            >
              <ShieldCheck className="mr-1 size-3" /> {verification}
            </Pill>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{record.role}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4" /> {record.company}
          </p>
        </div>
        <button
          onClick={() => setRecords((prev) => prev.filter((r) => r.id !== record.id))}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Remove
        </button>
      </div>

      <div className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KeyValue label="Work mode" value={record.mode || "Not recorded"} />
        <KeyValue label="Stipend" value={record.stipend || "Not recorded"} />
        <KeyValue
          label="Window"
          value={`${formatDate(record.startDate)} → ${formatDate(record.endDate)}`}
        />
        <KeyValue label="Documents" value={`${record.documents.length} recorded`} />
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Lifecycle progress</span>
          <span className="text-primary tabular-nums">{statusProgress(record.status)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="gradient-brand h-full" style={{ width: `${statusProgress(record.status)}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {INTERNSHIP_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => (s === record.status ? undefined : setStatus(s))}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                s === record.status
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
          {next ? (
            <span className="text-xs text-muted-foreground">Next step: {next}</span>
          ) : (
            <span className="text-xs text-success">Lifecycle complete</span>
          )}
        </div>
      </div>

      <div className="relative mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle title="Timeline" subtitle="Built from your actual status changes and uploads." />
          <div className="space-y-4">
            {record.timeline.map((t) => (
              <div key={t.id} className="relative border-l border-border pl-6">
                <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-success" />
                <p className="text-sm font-medium">{t.label}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3" /> {formatDate(t.date)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle title="Evidence & documents" subtitle="Private to this device." />
            <div className="space-y-2">
              {record.documents.length ? (
                record.documents.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <FileCheck2 className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Pill>{d.type}</Pill>
                      <span className="text-xs text-muted-foreground">{formatDate(d.addedAt)}</span>
                      <button
                        onClick={() =>
                          update(record.id, (r) => ({
                            ...r,
                            documents: r.documents.filter((x) => x.id !== d.id),
                          }))
                        }
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${d.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No documents recorded. Add your offer letter, joining letter or certificate as you
                  receive them.
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Input
                className="w-56"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name"
              />
              <button
                onClick={addDocument}
                className="rounded-xl border border-border px-3 py-2 text-xs hover:border-primary/50"
              >
                Add document
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
            <p className="text-sm font-medium">Verification: {verification}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">{verificationNote(verification)}</p>
            {!record.verificationRequested ? (
              <button
                onClick={() =>
                  update(record.id, (r) => ({
                    ...r,
                    verificationRequested: true,
                    timeline: [
                      ...r.timeline,
                      {
                        id: newId(),
                        label: "Organisation verification requested",
                        date: todayISO(),
                        kind: "note",
                      },
                    ],
                  }))
                }
                className="mt-3 rounded-xl border border-border px-3 py-2 text-xs hover:border-primary/50"
              >
                Request organisation verification
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function CollegeView({ records }: { records: InternshipRecord[] }) {
  const rows = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        verification: verificationOf(r),
        hasOffer: r.documents.some((d) => d.type === "Offer letter"),
        hasCertificate: r.documents.some((d) => d.type === "Certificate"),
      })),
    [records],
  );

  if (!rows.length) {
    return (
      <GlassCard className="animate-rise p-9 text-center">
        <p className="text-sm font-medium">Nothing to review yet</p>
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
          The college view reads the same records as the student passport. Add an internship first —
          no sample data is shown here.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="animate-rise space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {(
          [
            ["Records", rows.length, ""],
            ["In progress", rows.filter((r) => r.status === "In Progress").length, ""],
            ["Completed", rows.filter((r) => r.status === "Completed").length, "text-success"],
            [
              "Awaiting verification",
              rows.filter((r) => r.verification !== "Organization Verified").length,
              "text-warning",
            ],
          ] as const
        ).map(([label, value, tone]) => (
          <GlassCard key={label} className="p-6">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
            <p className={cn("font-display mt-2 text-3xl font-semibold", tone)}>{value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-7">
        <SectionTitle
          title="Placement cell view"
          subtitle="Every column below comes from records the student entered. Nothing is marked verified without an organisation confirming it."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-[11px] tracking-wide text-muted-foreground uppercase">
              <tr>
                {[
                  "Company",
                  "Role",
                  "Status",
                  "Verification",
                  "Offer letter",
                  "Certificate",
                  "Window",
                  "Documents",
                ].map((h) => (
                  <th key={h} className="pr-4 pb-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="py-3.5 pr-4 font-medium">{r.company}</td>
                  <td className="py-3.5 pr-4 text-muted-foreground">{r.role}</td>
                  <td className="py-3.5 pr-4">
                    <Pill tone={r.status === "Completed" ? "good" : "brand"}>{r.status}</Pill>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Pill
                      tone={
                        r.verification === "Organization Verified"
                          ? "good"
                          : r.verification === "Verification Pending"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {r.verification}
                    </Pill>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Pill tone={r.hasOffer ? "good" : "neutral"}>
                      {r.hasOffer ? "Recorded" : "Not recorded"}
                    </Pill>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Pill tone={r.hasCertificate ? "good" : "neutral"}>
                      {r.hasCertificate ? "Recorded" : "Not recorded"}
                    </Pill>
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground">
                    {formatDate(r.startDate)} → {formatDate(r.endDate)}
                  </td>
                  <td className="py-3.5 text-muted-foreground">{r.documents.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
