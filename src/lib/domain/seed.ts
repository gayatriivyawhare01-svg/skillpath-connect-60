import type {
  Application,
  Company,
  DB,
  EvidenceItem,
  Faculty,
  HistoryEntry,
  Institution,
  Internship,
  Notification,
  Opportunity,
  Student,
  TnpUser,
} from "./types";

const TODAY = new Date();
function offset(days: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function stamp(days: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function h(days: number, actor: HistoryEntry["actor"], actorName: string, event: string, note?: string): HistoryEntry {
  return note ? { at: stamp(days), actor, actorName, event, note } : { at: stamp(days), actor, actorName, event };
}

/** Single institution demo. */
export const INSTITUTIONS: Institution[] = [
  {
    id: "inst_1",
    name: "Sardar Institute of Technology",
    code: "SIT001",
    city: "Pune",
    tnpHead: "Dr. Meena Rathore",
    tnpEmail: "tnp@sit.edu.in",
    departments: ["Computer Engineering", "Information Technology"],
    degrees: ["B.E.", "B.Tech"],
  },
];

/** Kept for backwards compatibility with the single-institution version. */
export const COLLEGE = INSTITUTIONS[0]!;

export const TNP_USERS: TnpUser[] = [
  {
    id: "tnp_1",
    institutionId: "inst_1",
    name: "Dr. Meena Rathore",
    email: "tnp@sit.edu.in",
    designation: "Head — Training & Placement Cell",
    accessCode: "SIT-TNP-2026",
  },
];

export const FACULTY: Faculty[] = [
  {
    id: "fac_1",
    name: "Prof. Anand Deshmukh",
    email: "anand.d@sit.edu.in",
    institutionId: "inst_1",
    department: "Computer Engineering",
    designation: "Associate Professor · Internship Coordinator",
    assignedYears: [3, 4],
    accessCode: "SIT-FAC-1",
  },
  {
    id: "fac_2",
    name: "Dr. Kavita Iyer",
    email: "kavita.i@sit.edu.in",
    institutionId: "inst_1",
    department: "Information Technology",
    designation: "Professor · Internship Coordinator",
    assignedYears: [3, 4],
    accessCode: "SIT-FAC-2",
  },
];

type SeedCompany = Omit<Company, "accessCode">;

const RAW_COMPANIES: SeedCompany[] = [
  {
    id: "com_1", name: "Nexawave Analytics", website: "https://nexawave.io", industry: "Data & Analytics",
    hqLocation: "Pune, Maharashtra", size: "180-250 employees",
    about: "Analytics consultancy building reporting and forecasting products for retail and BFSI clients.",
    contactName: "Shreya Kulkarni", contactEmail: "shreya@nexawave.io", contactPhone: "+91 98220 41188",
    approval: "T&P Approved", registeredAt: stamp(-40),
  },
  {
    id: "com_2", name: "Torqbit Systems", website: "https://torqbit.dev", industry: "Product Engineering",
    hqLocation: "Bengaluru, Karnataka", size: "60-90 employees",
    about: "Product engineering studio shipping React and Node platforms for logistics customers.",
    contactName: "Vikram Rao", contactEmail: "vikram@torqbit.dev", contactPhone: "+91 90080 22194",
    approval: "Under Review", registeredAt: stamp(-2),
  },
];

export const COMPANIES: Company[] = RAW_COMPANIES.map((c, i) => ({
  ...c,
  accessCode: `COMPANY-${i + 1}`,
}));

type SeedStudent = Omit<
  Student,
  "collegeId" | "institutionId" | "degree" | "semester" | "graduationYear"
>;

const RAW_STUDENTS: SeedStudent[] = [
  {
    id: "stu_1", name: "Aarav Kulkarni", email: "aarav.k@sit.edu.in", rollNo: "CE21-014", phone: "+91 98765 41230",
    department: "Computer Engineering", year: 3, cgpa: 8.4, city: "Pune",
    skills: ["Python", "SQL", "Excel", "Power BI", "Pandas", "Git"],
    softSkills: ["Communication", "Ownership", "Problem solving"],
    projects: [
      { title: "Retail Sales Insight Dashboard", description: "Cleaned 2 years of POS data and built a Power BI dashboard used by a local retail chain to cut dead stock.", skills: ["Python", "SQL", "Power BI"] },
    ],
    certifications: ["Google Data Analytics", "SQL for Data Science (Coursera)"],
    interests: ["Data analytics", "Business intelligence"],
    preferredRoles: ["Data Analyst", "Business Analyst"], preferredDomain: "Data & Analytics",
    preferredLocation: "Pune", preferredModes: ["Onsite", "Hybrid"],
    availableFrom: offset(-10), availableMonths: 6, previousInternships: 1,
    resumeSummary: "Third-year computer engineering student focused on analytics; comfortable with SQL, Python and dashboarding.",
    facultyId: "fac_1", assessmentComplete: true, assessmentUpdatedAt: stamp(-24), readinessIndex: 78,
  },
  {
    id: "stu_2", name: "Ishita Sharma", email: "ishita.s@sit.edu.in", rollNo: "IT21-032", phone: "+91 98191 55420",
    department: "Information Technology", year: 3, cgpa: 9.1, city: "Pune",
    skills: ["JavaScript", "React", "HTML", "CSS", "Git"],
    softSkills: ["Analytical thinking", "Presentation"],
    projects: [
      { title: "Campus Marketplace", description: "React front end for a second-hand book exchange, deployed with auth.", skills: ["React", "JavaScript"] },
    ],
    certifications: ["Meta Front-End Developer"],
    interests: ["Web development", "Product engineering"],
    preferredRoles: ["Frontend Developer"], preferredDomain: "Product Engineering",
    preferredLocation: "Remote", preferredModes: ["Remote", "Hybrid"],
    availableFrom: offset(-5), availableMonths: 6, previousInternships: 0,
    resumeSummary: "IT undergraduate building depth in front-end engineering.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-18), readinessIndex: 74,
  },
];

function withInstitution(list: SeedStudent[], institutionId: string): Student[] {
  const inst = INSTITUTIONS.find((i) => i.id === institutionId)!;
  return list.map((s) => ({
    ...s,
    collegeId: institutionId,
    institutionId,
    degree: inst.degrees[0] ?? "B.E.",
    semester: s.year * 2 - 1,
    graduationYear: new Date().getFullYear() + Math.max(0, 4 - s.year),
  }));
}

export const STUDENTS: Student[] = withInstitution(RAW_STUDENTS, "inst_1");

/**
 * opp_1 is already Live so /student/opportunities has something to apply to.
 * opp_2 is still Submitted to T&P so /tnp/actions has an opening to approve.
 */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp_1", institutionIds: ["inst_1"], companyId: "com_1", pathway: "college-placed",
    role: "Data Analyst", domain: "Data & Analytics", location: "Pune, Maharashtra", workMode: "Hybrid",
    durationMonths: 6, stipend: 25000, openings: 3,
    description: "Work with the client analytics pod on retail reporting: build SQL models, maintain Power BI dashboards and support monthly forecasting reviews.",
    responsibilities: ["Write and optimise SQL for reporting models", "Maintain Power BI dashboards", "Prepare monthly insight summaries for client reviews"],
    requiredSkills: ["Python", "SQL", "Excel", "Data Analytics"],
    preferredSkills: ["Power BI", "Statistics"],
    minCgpa: 7, departments: ["Computer Engineering", "Information Technology"], years: [3, 4],
    startDate: offset(21), deadline: offset(7), status: "Live", createdAt: stamp(-14),
    history: [
      h(-14, "company", "Nexawave Analytics", "Opportunity submitted for T&P approval"),
      h(-13, "tnp", "Dr. Meena Rathore", "Approved for circulation"),
      h(-13, "system", "S2I Matching Engine", "Requirements parsed and eligible students ranked", "Python, SQL, Excel, Data Analytics · min CGPA 7"),
    ],
  },
  {
    id: "opp_2", institutionIds: ["inst_1"], companyId: "com_1", pathway: "college-placed",
    role: "Frontend Developer", domain: "Product Engineering", location: "Remote", workMode: "Remote",
    durationMonths: 4, stipend: 18000, openings: 2,
    description: "Build and ship UI components for an internal analytics console using React and Tailwind.",
    responsibilities: ["Build React components against Figma specs", "Fix reported UI bugs", "Write basic component tests"],
    requiredSkills: ["JavaScript", "React", "Git"],
    preferredSkills: ["TypeScript", "Tailwind"],
    minCgpa: 6.5, departments: ["Computer Engineering", "Information Technology"], years: [3, 4],
    startDate: offset(25), deadline: offset(10), status: "Submitted to T&P", createdAt: stamp(-2),
    history: [
      h(-2, "company", "Nexawave Analytics", "Opportunity submitted for T&P approval"),
      h(-2, "system", "S2I Matching Engine", "Requirements parsed and eligible students ranked", "JavaScript, React, Git · min CGPA 6.5"),
    ],
  },
];

function ev(
  id: string, type: EvidenceItem["type"], title: string, days: number,
  by: EvidenceItem["submittedBy"], byName: string, status: EvidenceItem["status"] = "Submitted", note?: string,
): EvidenceItem {
  return {
    id, type, title, submittedBy: by, submittedByName: byName, submittedAt: stamp(days), status,
    ...(note ? { note } : {}), fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
  };
}

/**
 * The single application in the demo. It starts unreleased so the whole
 * company -> T&P -> student -> T&P -> faculty chain can be walked live:
 * T&P Action Center -> shortlist -> Company Candidates -> interview/select ->
 * Student consent -> T&P verifies -> Faculty permission -> evidence -> T&P verify.
 */
export const APPLICATIONS: Application[] = [
  {
    id: "app_1", opportunityId: "opp_1", studentId: "stu_1", status: "APPLIED", stage: "Application", matchScore: 88,
    source: "Student applied", tnpApproved: false, documents: [], createdAt: stamp(-1),
    history: [h(-1, "student", "Aarav Kulkarni", "Applied — awaiting T&P review")],
  },
];


/** The single self-placed internship, sitting in the T&P verification queue. */
export const INTERNSHIPS: Internship[] = [
  {
    id: "int_1", pathway: "self-placed", studentId: "stu_2",
    selfPlaced: {
      companyName: "BrightPath Labs", companyWebsite: "https://brightpathlabs.co",
      companyEmail: "brightpathhr2024@gmail.com", companyContactName: "Rahul Sinha", companyContactPhone: "+91 99999 12345",
      companyAddress: "", description: "Frontend internship building marketing pages and a component library.",
      howFound: "LinkedIn post", hasOfferLetter: true,
    },
    role: "Frontend Developer", domain: "Product Engineering", location: "Remote", workMode: "Remote",
    startDate: offset(7), endDate: offset(97), durationMonths: 3, stipend: 8000,
    stage: "Application", review: "Student Submitted", verification: "Evidence Submitted", facultyPermission: "Pending", facultyId: "fac_2",
    evidence: [ev("evd_1", "Offer letter", "BrightPath selection email screenshot", -1, "student", "Ishita Sharma", "Submitted", "Emailed from a Gmail address, no letterhead.")],
    checkIns: [], riskFlags: ["Free-mail company contact", "No registered address supplied"], createdAt: stamp(-1),
    history: [
      h(-1, "student", "Ishita Sharma", "Self-placed internship submitted"),
      h(-1, "system", "S2I", "Completeness and consistency check generated for T&P review", "Automated check only — this is not institutional verification."),
    ],
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "not_1", audience: "tnp", audienceId: "tnp", kind: "opportunity", title: "New opportunity from Nexawave Analytics", body: "Frontend Developer · Remote · Remote. Awaiting T&P approval before circulation.", createdAt: stamp(-2), read: false },
  { id: "not_2", audience: "tnp", audienceId: "tnp", kind: "review", title: "Aarav Kulkarni applied to Data Analyst", body: "Awaiting T&P review before the company sees this candidate.", applicationId: "app_1", createdAt: stamp(-1), read: false },
  { id: "not_3", audience: "tnp", audienceId: "tnp", kind: "verification", title: "Self-placed internship awaiting decision — Ishita Sharma", body: "BrightPath Labs · Frontend Developer · Remote", internshipId: "int_1", createdAt: stamp(-1), read: false },
  { id: "not_4", audience: "student", audienceId: "stu_2", kind: "review", title: "Self-placed submission received", body: "Your submission is queued with the T&P cell. Status will move to Under Review shortly.", internshipId: "int_1", createdAt: stamp(-1), read: false },
];

export function buildSeed(): DB {
  return {
    version: 2,
    session: {
      role: null,
      signedIn: false,
      institutionId: "inst_1",
      studentId: "stu_1",
      facultyId: "fac_1",
      companyId: "com_1",
      tnpUserId: "tnp_1",
    },
    institutions: INSTITUTIONS,
    tnpUsers: TNP_USERS,
    college: COLLEGE,
    students: STUDENTS,
    companies: COMPANIES,
    faculty: FACULTY,
    opportunities: OPPORTUNITIES,
    applications: APPLICATIONS,
    internships: INTERNSHIPS,
    notifications: NOTIFICATIONS,
  };
}