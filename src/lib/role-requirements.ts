/**
 * Role rubric used to produce evidence-based gap analysis.
 * These are requirement definitions (not AI output) so a gap can always be
 * explained as: "target role requires X, your inputs do not demonstrate X".
 */
export type RoleRequirement = {
  key: string;
  match: string[];
  core: string[];
  supporting: string[];
  signals: string[];
};

export const ROLE_REQUIREMENTS: RoleRequirement[] = [
  {
    key: "Frontend Developer",
    match: ["frontend", "front end", "ui developer", "web developer"],
    core: ["HTML", "CSS", "JavaScript", "React", "Git"],
    supporting: ["TypeScript", "Next.js", "Tailwind", "REST APIs", "Testing", "Accessibility"],
    signals: ["deployed live URL", "responsive UI", "component reuse", "state management"],
  },
  {
    key: "Backend Developer",
    match: ["backend", "back end", "api developer"],
    core: ["A programming language (Python/Java/Node.js)", "SQL", "REST APIs", "Git", "Databases"],
    supporting: ["Docker", "Authentication", "Caching", "Testing", "Cloud deployment"],
    signals: ["API documentation", "schema design", "error handling", "load handling"],
  },
  {
    key: "Full Stack Developer",
    match: ["full stack", "fullstack", "mern", "mean"],
    core: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs"],
    supporting: ["TypeScript", "MongoDB", "Docker", "Deployment", "Testing"],
    signals: ["end-to-end project", "auth flow", "deployed app", "database schema"],
  },
  {
    key: "AI Engineer",
    match: ["ai engineer", "genai", "llm", "ai developer"],
    core: ["Python", "APIs", "Prompt engineering", "Git", "Data handling"],
    supporting: ["LangChain", "Vector databases", "PyTorch", "Evaluation", "Deployment"],
    signals: ["working AI demo", "evaluation of outputs", "cost/latency awareness"],
  },
  {
    key: "ML Engineer",
    match: ["ml engineer", "machine learning", "deep learning"],
    core: ["Python", "Statistics", "scikit-learn", "Pandas/NumPy", "Git"],
    supporting: ["PyTorch", "TensorFlow", "SQL", "Model deployment", "MLOps"],
    signals: ["dataset description", "metrics reported", "baseline comparison"],
  },
  {
    key: "Data Analyst",
    match: ["data analyst", "business analyst", "analytics"],
    core: ["SQL", "Excel/Sheets", "Python or R", "Data visualisation", "Statistics"],
    supporting: ["Power BI", "Tableau", "Pandas", "A/B testing", "Storytelling"],
    signals: ["dashboard link", "insight stated as a decision", "real dataset used"],
  },
  {
    key: "Data Engineer",
    match: ["data engineer", "etl", "pipeline"],
    core: ["SQL", "Python", "ETL pipelines", "Databases", "Git"],
    supporting: ["Airflow", "Spark", "Cloud warehouse", "Docker", "Data modelling"],
    signals: ["pipeline diagram", "data volume handled", "scheduling"],
  },
  {
    key: "Cyber Security",
    match: ["cyber", "security", "soc", "pentest"],
    core: ["Networking", "Linux", "Security fundamentals", "Python", "Git"],
    supporting: ["Burp Suite", "Wireshark", "OWASP Top 10", "Cryptography", "Cloud security"],
    signals: ["CTF write-ups", "vulnerability report", "lab practice"],
  },
  {
    key: "Cloud / DevOps",
    match: ["devops", "cloud", "sre", "platform"],
    core: ["Linux", "Docker", "CI/CD", "A cloud provider (AWS/GCP/Azure)", "Git"],
    supporting: ["Kubernetes", "Terraform", "Monitoring", "Bash/Python scripting", "Networking"],
    signals: ["working pipeline", "infrastructure as code", "uptime/monitoring evidence"],
  },
  {
    key: "UI UX Designer",
    match: ["ui ux", "ux", "ui designer", "product design"],
    core: ["Figma", "Wireframing", "Design systems", "User research", "Prototyping"],
    supporting: ["Usability testing", "Accessibility", "Interaction design", "HTML/CSS basics"],
    signals: ["case study with problem framing", "before/after screens", "portfolio link"],
  },
  {
    key: "Mobile Developer",
    match: ["mobile", "android", "ios", "flutter", "react native"],
    core: ["A mobile framework (Flutter/React Native/Android)", "Git", "REST APIs", "State management"],
    supporting: ["Firebase", "App store deployment", "Offline storage", "Testing"],
    signals: ["published app or APK", "screenshots", "crash/perf awareness"],
  },
  {
    key: "QA / Automation",
    match: ["qa", "automation", "tester", "sdet"],
    core: ["Manual testing fundamentals", "A programming language", "Test automation tool", "Git"],
    supporting: ["Selenium", "Playwright", "API testing", "CI integration", "Bug reporting"],
    signals: ["test cases written", "automation repo", "defect documentation"],
  },
];

const GENERIC: RoleRequirement = {
  key: "General Engineering",
  match: [],
  core: ["A programming language", "Git", "Problem solving", "One deployed project"],
  supporting: ["Databases", "APIs", "Testing", "Cloud basics"],
  signals: ["deployed project", "clear contribution", "documented README"],
};

export function requirementForRole(role: string): RoleRequirement {
  const r = (role || "").toLowerCase();
  return (
    ROLE_REQUIREMENTS.find((req) => req.match.some((m) => r.includes(m))) ??
    ROLE_REQUIREMENTS.find((req) => r.includes(req.key.toLowerCase())) ??
    GENERIC
  );
}

/** Aliases so a selected skill can satisfy a requirement phrased differently. */
export const SKILL_ALIASES: Record<string, string[]> = {
  "a programming language": [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "go",
  ],
  "a programming language (python/java/node.js)": ["python", "java", "node.js", "javascript", "typescript"],
  "a mobile framework (flutter/react native/android)": ["flutter", "react native", "android", "kotlin", "swift"],
  "a cloud provider (aws/gcp/azure)": ["aws", "gcp", "azure", "cloudflare"],
  "rest apis": ["express", "fastapi", "node.js", "django", "spring boot", "postman"],
  databases: ["postgresql", "mysql", "mongodb", "redis", "supabase", "firebase", "sql"],
  sql: ["postgresql", "mysql", "sql", "supabase"],
  git: ["git", "github actions", "code review"],
  testing: ["jest", "vitest", "playwright", "pytest", "postman"],
  "test automation tool": ["selenium", "playwright", "cypress", "vitest", "jest"],
  "ci/cd": ["ci/cd", "github actions", "jenkins"],
  docker: ["docker", "kubernetes"],
  "data visualisation": ["power bi", "tableau", "matplotlib", "seaborn"],
  "pandas/numpy": ["pandas", "numpy", "python"],
  "scikit-learn": ["scikit-learn", "sklearn"],
  "python or r": ["python", "r"],
  "excel/sheets": ["excel", "google sheets", "sheets"],
  tailwind: ["tailwind", "tailwind css"],
  html: ["html", "html5"],
  css: ["css", "tailwind", "sass"],
  apis: ["openai api", "rest apis", "postman", "fastapi", "express"],
  "prompt engineering": ["openai api", "langchain", "hugging face"],
  "data handling": ["pandas", "numpy", "sql"],
  linux: ["linux", "bash", "nginx"],
};

export function skillSatisfied(requirement: string, evidenceText: string, selected: string[]) {
  const req = requirement.toLowerCase();
  const pool = [...selected.map((s) => s.toLowerCase()), evidenceText.toLowerCase()];
  const candidates = [req.replace(/\s*\(.*\)\s*/, "").trim(), ...(SKILL_ALIASES[req] ?? [])];
  return candidates.some((c) => c.length > 1 && pool.some((p) => p.includes(c)));
}
