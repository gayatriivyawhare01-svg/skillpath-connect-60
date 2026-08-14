import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Wand2 } from "lucide-react";
import { GlassCard, Pill } from "@/components/report-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { AuditSubmission } from "@/lib/audit-evidence";
import type { ResumeReport } from "@/lib/report-types";
import { loadJSON, STORE } from "@/lib/storage";


const STEPS = [
  "Personal Details",
  "Target Career",
  "Technical Skills",
  "Projects",
  "Professional Profiles",
  "Experience",
  "Soft Skills",
  "Career Preferences",
];

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "ML Engineer",
  "Data Analyst",
  "Data Engineer",
  "Cyber Security",
  "Cloud / DevOps",
  "UI UX Designer",
  "Mobile Developer",
  "QA / Automation",
];

const SKILL_GROUPS: Record<string, string[]> = {
  Programming: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "SQL"],
  Frameworks: ["React", "Next.js", "Node.js", "Express", "Django", "FastAPI", "Spring Boot"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase"],
  "AI Tools": ["OpenAI API", "LangChain", "PyTorch", "TensorFlow", "scikit-learn", "Hugging Face"],
  Cloud: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Cloudflare"],
  "Git & Workflow": ["Git", "GitHub Actions", "Code Review", "Agile"],
  Deployment: ["Vercel", "Netlify", "Render", "CI/CD", "Nginx"],
  Testing: ["Jest", "Vitest", "Playwright", "PyTest", "Postman"],
};

const CONFIDENCE = ["Beginner", "Intermediate", "Advanced"] as const;

const EXPERIENCE_TYPES = [
  "Internships",
  "Hackathons",
  "Open Source",
  "Freelancing",
  "Leadership",
  "Clubs",
  "Volunteer Work",
];

const SOFT_SKILLS = [
  "Communication",
  "Problem Solving",
  "Presentation",
  "Leadership",
  "Adaptability",
  "Teamwork",
  "Time Management",
];

const COMM_QUESTIONS = [
  "Tell us about yourself the way you would in an interview",
  "Explain your strongest project to a non-technical interviewer",
  "Describe a problem you got stuck on and how you solved it",
];



type Project = {
  name: string;
  description: string;
  problemSolved: string;
  technologies: string;
  github: string;
  live: string;
  contribution: string;
  challenges: string;
  lessons: string;
};

const emptyProject = (): Project => ({
  name: "",
  description: "",
  problemSolved: "",
  technologies: "",
  github: "",
  live: "",
  contribution: "",
  challenges: "",
  lessons: "",
});

export function AuditForm({ onSubmit }: { onSubmit: (submission: AuditSubmission) => void }) {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState({
    name: "",
    college: "",
    degree: "",
    branch: "",
    year: "",
    graduationYear: "",
    cgpa: "",
  });
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [skills, setSkills] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([emptyProject()]);
  const [profiles, setProfiles] = useState({
    linkedin: "",
    github: "",
    portfolio: "",
    leetcode: "",
    hackerrank: "",
    devfolio: "",
  });
  const [experience, setExperience] = useState<Record<string, string>>({});
  const [commAnswers, setCommAnswers] = useState<Record<string, string>>({});
  const [softSkills, setSoftSkills] = useState<Record<string, number>>(
    Object.fromEntries(SOFT_SKILLS.map((s) => [s, 5])),
  );

  const [prefs, setPrefs] = useState({
    mode: "Remote",
    stipend: "",
    industry: "",
    location: "",
    companyType: "Startup",
  });

  const toggleSkill = (skill: string) =>
    setSkills((prev) => {
      const next = { ...prev };
      if (next[skill]) delete next[skill];
      else next[skill] = "Beginner";
      return next;
    });

  const canContinue = () => {
    if (step === 0) return personal.name.trim() && personal.college.trim() && personal.year.trim();
    if (step === 1) return Boolean(targetRole || customRole.trim());
    if (step === 2) return Object.keys(skills).length > 0;
    return true;
  };

  const submit = () => {
    const resume = loadJSON<ResumeReport | null>(STORE.resume, null);
    onSubmit({
      personal,
      targetRole: customRole.trim() || targetRole,
      technicalSkills: skills,
      projects: projects.filter((p) => p.name.trim()),
      professionalProfiles: profiles,
      experience,
      softSkillsRating: softSkills,
      communicationAnswers: Object.fromEntries(
        Object.entries(commAnswers).filter(([, v]) => v.trim().length > 0),
      ),
      careerPreferences: prefs,
      resumeSnapshot: resume
        ? {
            role: resume.role ?? "your target role",
            resumeHealth: resume.resumeQualityScore ?? 0,
            atsScore: resume.atsScore ?? 0,
            date: new Date(resume.generatedAt ?? Date.now()).toLocaleDateString("en-IN"),
          }
        : null,
    });
  };


  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-border/60 p-6">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11px] transition-colors",
                i === step
                  ? "gradient-brand text-primary-foreground"
                  : i < step
                    ? "bg-secondary text-foreground"
                    : "bg-secondary/40 text-muted-foreground",
              )}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="gradient-brand h-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="animate-rise space-y-6 p-6 sm:p-8" key={step}>
        <div>
          <h2 className="text-xl font-semibold">
            Step {step + 1} — {STEPS[step]}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{HINTS[step]}</p>
        </div>

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                placeholder="Aarav Sharma"
              />
            </Field>
            <Field label="College">
              <Input
                value={personal.college}
                onChange={(e) => setPersonal({ ...personal, college: e.target.value })}
                placeholder="ABC Institute of Technology"
              />
            </Field>
            <Field label="Degree">
              <Input
                value={personal.degree}
                onChange={(e) => setPersonal({ ...personal, degree: e.target.value })}
                placeholder="B.Tech"
              />
            </Field>
            <Field label="Branch">
              <Input
                value={personal.branch}
                onChange={(e) => setPersonal({ ...personal, branch: e.target.value })}
                placeholder="Computer Science"
              />
            </Field>
            <Field label="Current year">
              <Choices
                options={["1st", "2nd", "3rd", "4th"]}
                value={personal.year}
                onChange={(v) => setPersonal({ ...personal, year: v })}
              />
            </Field>
            <Field label="Graduation year">
              <Input
                value={personal.graduationYear}
                onChange={(e) => setPersonal({ ...personal, graduationYear: e.target.value })}
                placeholder="2027"
              />
            </Field>
            <Field label="CGPA (optional)">
              <Input
                value={personal.cgpa}
                onChange={(e) => setPersonal({ ...personal, cgpa: e.target.value })}
                placeholder="7.8"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setTargetRole(role);
                    setCustomRole("");
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm transition-all",
                    targetRole === role
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            <Field label="Something else?">
              <Input
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  setTargetRole("");
                }}
                placeholder="e.g. Blockchain Developer"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            {Object.entries(SKILL_GROUPS).map(([group, list]) => (
              <div key={group}>
                <p className="mb-3 text-xs font-medium tracking-wide text-primary uppercase">
                  {group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.map((skill) => {
                    const selected = Boolean(skills[skill]);
                    return (
                      <div
                        key={skill}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all",
                          selected
                            ? "border-primary bg-primary/12"
                            : "border-border bg-secondary/25",
                        )}
                      >
                        <button
                          onClick={() => toggleSkill(skill)}
                          className={selected ? "text-foreground" : "text-muted-foreground"}
                        >
                          {skill}
                        </button>
                        {selected && (
                          <div className="flex gap-1">
                            {CONFIDENCE.map((c) => (
                              <button
                                key={c}
                                onClick={() => setSkills({ ...skills, [skill]: c })}
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px]",
                                  skills[skill] === c
                                    ? "gradient-brand text-primary-foreground"
                                    : "bg-secondary text-muted-foreground",
                                )}
                              >
                                {c[0]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              B = Beginner · I = Intermediate · A = Advanced
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {projects.map((project, index) => (
              <div key={index} className="rounded-2xl border border-border/70 bg-secondary/20 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Pill tone="brand">Project {index + 1}</Pill>
                  {projects.length > 1 && (
                    <button
                      onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["name", "Project name", "AI Attendance System"],
                      ["technologies", "Technologies used", "React, FastAPI, Postgres"],
                      ["github", "GitHub link", "https://github.com/..."],
                      ["live", "Live link", "https://..."],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <Field key={key} label={label}>
                      <Input
                        value={project[key]}
                        placeholder={ph}
                        onChange={(e) =>
                          setProjects(
                            projects.map((p, i) =>
                              i === index ? { ...p, [key]: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </Field>
                  ))}
                  {(
                    [
                      ["description", "Description"],
                      ["problemSolved", "Problem solved"],
                      ["contribution", "Your contribution"],
                      ["challenges", "Challenges faced"],
                      ["lessons", "Lessons learned"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label} className="sm:col-span-2">
                      <Textarea
                        rows={2}
                        value={project[key]}
                        onChange={(e) =>
                          setProjects(
                            projects.map((p, i) =>
                              i === index ? { ...p, [key]: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </Field>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setProjects([...projects, emptyProject()])}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm transition-colors hover:border-primary/50"
            >
              <Plus className="size-4" /> Add another project
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["linkedin", "LinkedIn URL"],
                ["github", "GitHub URL"],
                ["portfolio", "Portfolio URL"],
                ["leetcode", "LeetCode"],
                ["hackerrank", "HackerRank"],
                ["devfolio", "Devfolio"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <Input
                  value={profiles[key]}
                  onChange={(e) => setProfiles({ ...profiles, [key]: e.target.value })}
                  placeholder="https://"
                />
              </Field>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            {EXPERIENCE_TYPES.map((type) => (
              <Field key={type} label={type}>
                <Textarea
                  rows={2}
                  value={experience[type] ?? ""}
                  placeholder="Describe briefly, or leave empty if none"
                  onChange={(e) => setExperience({ ...experience, [type]: e.target.value })}
                />
              </Field>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            {SOFT_SKILLS.map((skill) => (
              <div key={skill}>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-medium">{skill}</span>
                  <span className="tabular-nums text-primary">{softSkills[skill]}/10</span>
                </div>
                <Slider
                  value={[softSkills[skill] ?? 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) => setSoftSkills({ ...softSkills, [skill]: v ?? 5 })}
                />
              </div>
            ))}
            <div className="space-y-4 border-t border-border/60 pt-6">
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                Answer in your own words — this is what your communication score is measured on
              </p>
              {COMM_QUESTIONS.map((q) => (
                <Field key={q} label={q}>
                  <Textarea
                    rows={3}
                    value={commAnswers[q] ?? ""}
                    placeholder="Write 60–100 words. Leave empty and this stays 'insufficient evidence'."
                    onChange={(e) => setCommAnswers({ ...commAnswers, [q]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
          </div>
        )}


        {step === 7 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Work mode">
              <Choices
                options={["Remote", "Hybrid", "Onsite"]}
                value={prefs.mode}
                onChange={(v) => setPrefs({ ...prefs, mode: v })}
              />
            </Field>
            <Field label="Startup vs MNC">
              <Choices
                options={["Startup", "Product Company", "MNC", "No preference"]}
                value={prefs.companyType}
                onChange={(v) => setPrefs({ ...prefs, companyType: v })}
              />
            </Field>
            <Field label="Expected stipend (INR / month)">
              <Input
                value={prefs.stipend}
                onChange={(e) => setPrefs({ ...prefs, stipend: e.target.value })}
                placeholder="10,000"
              />
            </Field>
            <Field label="Preferred industry">
              <Input
                value={prefs.industry}
                onChange={(e) => setPrefs({ ...prefs, industry: e.target.value })}
                placeholder="Fintech, SaaS, Healthtech"
              />
            </Field>
            <Field label="Preferred location">
              <Input
                value={prefs.location}
                onChange={(e) => setPrefs({ ...prefs, location: e.target.value })}
                placeholder="Bengaluru / Anywhere"
              />
            </Field>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 p-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => canContinue() && setStep((s) => s + 1)}
            disabled={!canContinue()}
            className="gradient-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            className="gradient-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Wand2 className="size-4" /> Generate career report
          </button>
        )}
      </div>
    </GlassCard>
  );
}

const HINTS = [
  "Who you are and where you study — this calibrates every benchmark in your report.",
  "What internship are you preparing for? Your entire gap analysis is measured against this role.",
  "Select everything you have touched, then rate your real confidence — honesty produces a better plan.",
  "Add every project. Depth matters more than count; empty fields become 'missing' items in your report.",
  "Your public presence is what recruiters see before your resume.",
  "Anything beyond coursework — even a single hackathon counts.",
  "Rate yourself honestly from 1 to 10.",
  "What you actually want, so recommendations stay realistic.",
];

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Choices({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-all",
            value === o
              ? "border-primary bg-primary/15"
              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
