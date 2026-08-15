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

export const INSTITUTIONS: Institution[] = [
  {
    id: "inst_1",
    name: "Sardar Institute of Technology",
    code: "SIT001",
    city: "Pune",
    tnpHead: "Dr. Meena Rathore",
    tnpEmail: "tnp@sit.edu.in",
    departments: ["Computer Engineering", "Information Technology", "Electronics & Telecom"],
    degrees: ["B.E.", "B.Tech"],
  },
  {
    id: "inst_2",
    name: "Deccan College of Science & Commerce",
    code: "DCS002",
    city: "Nagpur",
    tnpHead: "Prof. Sameer Wankhede",
    tnpEmail: "placements@deccancollege.ac.in",
    departments: ["Computer Science", "Commerce & Analytics"],
    degrees: ["B.Sc.", "BCA", "B.Com"],
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
  {
    id: "tnp_2",
    institutionId: "inst_2",
    name: "Prof. Sameer Wankhede",
    email: "placements@deccancollege.ac.in",
    designation: "Placement Officer",
    accessCode: "DCS-TNP-2026",
  },
];

type SeedFaculty = Omit<Faculty, "institutionId" | "accessCode">;

const RAW_FACULTY: SeedFaculty[] = [
  { id: "fac_1", name: "Prof. Anand Deshmukh", email: "anand.d@sit.edu.in", department: "Computer Engineering", designation: "Associate Professor · Internship Coordinator", assignedYears: [3, 4] },
  { id: "fac_2", name: "Dr. Kavita Iyer", email: "kavita.i@sit.edu.in", department: "Information Technology", designation: "Professor · Internship Coordinator", assignedYears: [3, 4] },
  { id: "fac_3", name: "Prof. Rajeev Nair", email: "rajeev.n@sit.edu.in", department: "Electronics & Telecom", designation: "Assistant Professor", assignedYears: [3, 4] },
];

export const FACULTY: Faculty[] = [
  ...RAW_FACULTY.map((f, i) => ({
    ...f,
    institutionId: "inst_1",
    accessCode: `SIT-FAC-${i + 1}`,
  })),
  {
    id: "fac_9", name: "Dr. Shalini Bhatt", email: "shalini.b@deccancollege.ac.in",
    institutionId: "inst_2", department: "Computer Science",
    designation: "Associate Professor · Internship Coordinator", assignedYears: [2, 3],
    accessCode: "DCS-FAC-1",
  },
];

type SeedCompany = Omit<Company, "accessCode">;

const RAW_COMPANIES: SeedCompany[] = [
  {
    id: "com_1", name: "Nexawave Analytics", website: "https://nexawave.io", industry: "Data & Analytics",
    hqLocation: "Pune, Maharashtra", size: "180-250 employees",
    about: "Analytics consultancy building reporting and forecasting products for retail and BFSI clients.",
    contactName: "Shreya Kulkarni", contactEmail: "shreya@nexawave.io", contactPhone: "+91 98220 41188",
    approval: "T&P Approved", registeredAt: stamp(-120),
  },
  {
    id: "com_2", name: "Torqbit Systems", website: "https://torqbit.dev", industry: "Product Engineering",
    hqLocation: "Bengaluru, Karnataka", size: "60-90 employees",
    about: "Product engineering studio shipping React and Node platforms for logistics customers.",
    contactName: "Vikram Rao", contactEmail: "vikram@torqbit.dev", contactPhone: "+91 90080 22194",
    approval: "T&P Approved", registeredAt: stamp(-95),
  },
  {
    id: "com_3", name: "Medhaan Health Tech", website: "https://medhaan.health", industry: "Health Technology",
    hqLocation: "Hyderabad, Telangana", size: "300+ employees",
    about: "Hospital information systems and clinical decision support tooling.",
    contactName: "Farhan Qureshi", contactEmail: "farhan@medhaan.health", contactPhone: "+91 96660 71230",
    approval: "T&P Approved", registeredAt: stamp(-70),
  },
  {
    id: "com_4", name: "Grid & Volt Energy", website: "https://gridnvolt.in", industry: "Clean Energy",
    hqLocation: "Pune, Maharashtra", size: "40-60 employees",
    about: "Rooftop solar monitoring hardware and embedded telemetry firmware.",
    contactName: "Ananya Bose", contactEmail: "ananya@gridnvolt.in", contactPhone: "+91 88060 55012",
    approval: "Under Review", registeredAt: stamp(-12),
  },
];

type SeedStudent = Omit<Student, "collegeId">;

const RAW_STUDENTS: SeedStudent[] = [
  {
    id: "stu_1", name: "Aarav Kulkarni", email: "aarav.k@sit.edu.in", rollNo: "CE21-014", phone: "+91 98765 41230",
    department: "Computer Engineering", year: 3, cgpa: 8.4, city: "Pune",
    skills: ["Python", "SQL", "Excel", "Power BI", "Pandas", "Git"],
    softSkills: ["Communication", "Ownership", "Problem solving"],
    projects: [
      { title: "Retail Sales Insight Dashboard", description: "Cleaned 2 years of POS data and built a Power BI dashboard used by a local retail chain to cut dead stock.", skills: ["Python", "SQL", "Power BI"] },
      { title: "College Attendance Analyzer", description: "Automated attendance defaulter reports with Pandas and scheduled email digests.", skills: ["Python", "Pandas"] },
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
    skills: ["Python", "SQL", "Excel", "Tableau", "Statistics", "scikit-learn", "Git"],
    softSkills: ["Analytical thinking", "Presentation"],
    projects: [
      { title: "Churn Prediction for Telecom", description: "Trained a logistic regression baseline and gradient boosting model, reported precision/recall against a baseline.", skills: ["Python", "scikit-learn", "Statistics"] },
      { title: "Public Health Data Story", description: "Tableau story on district level immunisation coverage using open government data.", skills: ["Tableau", "SQL"] },
    ],
    certifications: ["IBM Data Analyst", "Tableau Desktop Specialist"],
    interests: ["Machine learning", "Analytics"],
    preferredRoles: ["Data Analyst", "ML Engineer"], preferredDomain: "Data & Analytics",
    preferredLocation: "Pune", preferredModes: ["Onsite", "Hybrid", "Remote"],
    availableFrom: offset(-5), availableMonths: 6, previousInternships: 0,
    resumeSummary: "IT undergraduate with a strong statistics base and two end-to-end analytics projects.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-18), readinessIndex: 84,
  },
  {
    id: "stu_3", name: "Rohan Patil", email: "rohan.p@sit.edu.in", rollNo: "CE21-051", phone: "+91 90210 33470",
    department: "Computer Engineering", year: 3, cgpa: 7.6, city: "Pune",
    skills: ["JavaScript", "React", "HTML", "CSS", "Tailwind", "Git", "Node.js"],
    softSkills: ["Teamwork", "Curiosity"],
    projects: [
      { title: "Campus Marketplace", description: "React and Node marketplace for second-hand books, deployed with auth and image upload.", skills: ["React", "Node.js", "MongoDB"] },
    ],
    certifications: ["Meta Front-End Developer"],
    interests: ["Web development", "Product engineering"],
    preferredRoles: ["Frontend Developer", "Full Stack Developer"], preferredDomain: "Product Engineering",
    preferredLocation: "Bengaluru", preferredModes: ["Remote", "Hybrid"],
    availableFrom: offset(0), availableMonths: 6, previousInternships: 0,
    resumeSummary: "Frontend-leaning full stack student with one deployed production-style project.",
    facultyId: "fac_1", assessmentComplete: true, assessmentUpdatedAt: stamp(-30), readinessIndex: 71,
  },
  {
    id: "stu_4", name: "Sneha Deshpande", email: "sneha.d@sit.edu.in", rollNo: "IT21-008", phone: "+91 99700 12234",
    department: "Information Technology", year: 4, cgpa: 8.9, city: "Pune",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Git", "REST APIs"],
    softSkills: ["Leadership", "Documentation"],
    projects: [
      { title: "Hostel Complaint Tracker", description: "Full stack ticketing system with role based access, used by 400 hostel residents.", skills: ["Next.js", "PostgreSQL", "Docker"] },
      { title: "Open Source Contributions", description: "Merged three PRs to a popular form library including a bug fix with tests.", skills: ["TypeScript", "Testing"] },
    ],
    certifications: ["AWS Cloud Practitioner"],
    interests: ["Full stack", "Developer tooling"],
    preferredRoles: ["Full Stack Developer", "Backend Developer"], preferredDomain: "Product Engineering",
    preferredLocation: "Bengaluru", preferredModes: ["Hybrid", "Remote"],
    availableFrom: offset(-20), availableMonths: 6, previousInternships: 1,
    resumeSummary: "Final-year IT student with production-grade full stack work and cloud fundamentals.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-40), readinessIndex: 88,
  },
  {
    id: "stu_5", name: "Karthik Menon", email: "karthik.m@sit.edu.in", rollNo: "CE21-077", phone: "+91 97010 88123",
    department: "Computer Engineering", year: 4, cgpa: 7.2, city: "Nashik",
    skills: ["Python", "Linux", "Docker", "AWS", "Git", "CI/CD"],
    softSkills: ["Persistence"],
    projects: [
      { title: "CI Pipeline for Student Projects", description: "GitHub Actions pipeline with containerised builds and staging deploys.", skills: ["Docker", "CI/CD", "AWS"] },
    ],
    certifications: ["Docker Foundations"],
    interests: ["DevOps", "Cloud"],
    preferredRoles: ["Cloud / DevOps"], preferredDomain: "Cloud Infrastructure",
    preferredLocation: "Pune", preferredModes: ["Onsite", "Hybrid"],
    availableFrom: offset(5), availableMonths: 5, previousInternships: 0,
    resumeSummary: "Infrastructure-focused student comfortable with Linux, containers and pipelines.",
    facultyId: "fac_1", assessmentComplete: true, assessmentUpdatedAt: stamp(-15), readinessIndex: 66,
  },
  {
    id: "stu_6", name: "Priya Nagar", email: "priya.n@sit.edu.in", rollNo: "IT22-019", phone: "+91 88880 45611",
    department: "Information Technology", year: 3, cgpa: 8.0, city: "Pune",
    skills: ["Python", "SQL", "Excel", "Statistics"],
    softSkills: ["Communication"],
    projects: [
      { title: "Placement Trends Report", description: "Analysed five years of departmental placement data and presented findings to the T&P cell.", skills: ["Excel", "SQL"] },
    ],
    certifications: ["Excel for Business (Coursera)"],
    interests: ["Analytics", "Consulting"],
    preferredRoles: ["Data Analyst"], preferredDomain: "Data & Analytics",
    preferredLocation: "Pune", preferredModes: ["Onsite"],
    availableFrom: offset(-2), availableMonths: 6, previousInternships: 0,
    resumeSummary: "Analytics-oriented student building depth in SQL and spreadsheet modelling.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-9), readinessIndex: 62,
  },
  {
    id: "stu_7", name: "Aditya Rane", email: "aditya.r@sit.edu.in", rollNo: "ET21-024", phone: "+91 93700 71145",
    department: "Electronics & Telecom", year: 4, cgpa: 7.9, city: "Pune",
    skills: ["C++", "Python", "Linux", "Git"],
    softSkills: ["Precision"],
    projects: [
      { title: "Solar Telemetry Logger", description: "Embedded firmware logging panel voltage and pushing telemetry over MQTT.", skills: ["C++", "Linux"] },
    ],
    certifications: ["Embedded C Fundamentals"],
    interests: ["Embedded systems", "Clean energy"],
    preferredRoles: ["Embedded Engineer"], preferredDomain: "Clean Energy",
    preferredLocation: "Pune", preferredModes: ["Onsite"],
    availableFrom: offset(-30), availableMonths: 6, previousInternships: 1,
    resumeSummary: "Electronics student with hands-on embedded telemetry work.",
    facultyId: "fac_3", assessmentComplete: true, assessmentUpdatedAt: stamp(-60), readinessIndex: 69,
  },
  {
    id: "stu_8", name: "Meher Fatima", email: "meher.f@sit.edu.in", rollNo: "CE21-102", phone: "+91 90040 33098",
    department: "Computer Engineering", year: 3, cgpa: 8.6, city: "Pune",
    skills: ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Git"],
    softSkills: ["Research", "Writing"],
    projects: [
      { title: "Medical Report Summariser", description: "Fine-tuned a small model to summarise discharge notes, with an evaluation harness.", skills: ["Python", "Machine Learning"] },
    ],
    certifications: ["DeepLearning.AI ML Specialisation"],
    interests: ["Health tech", "Applied ML"],
    preferredRoles: ["ML Engineer", "AI Engineer"], preferredDomain: "Health Technology",
    preferredLocation: "Hyderabad", preferredModes: ["Hybrid", "Remote"],
    availableFrom: offset(-1), availableMonths: 6, previousInternships: 0,
    resumeSummary: "Applied ML student with an evaluation-first approach to model work.",
    facultyId: "fac_1", assessmentComplete: true, assessmentUpdatedAt: stamp(-11), readinessIndex: 79,
  },
  {
    id: "stu_9", name: "Nikhil Bhosale", email: "nikhil.b@sit.edu.in", rollNo: "CE22-045", phone: "+91 91300 66412",
    department: "Computer Engineering", year: 2, cgpa: 6.8, city: "Satara",
    skills: ["HTML", "CSS", "JavaScript"],
    softSkills: [],
    projects: [],
    certifications: [],
    interests: ["Web development"],
    preferredRoles: ["Frontend Developer"], preferredDomain: "Product Engineering",
    preferredLocation: "Pune", preferredModes: ["Remote"],
    availableFrom: offset(60), availableMonths: 3, previousInternships: 0,
    resumeSummary: "",
    facultyId: "fac_1", assessmentComplete: false,
  },
  {
    id: "stu_10", name: "Tanvi Joshi", email: "tanvi.j@sit.edu.in", rollNo: "IT21-061", phone: "+91 89990 21178",
    department: "Information Technology", year: 4, cgpa: 8.2, city: "Pune",
    skills: ["Figma", "Wireframing", "Design systems", "User research", "Prototyping", "HTML", "CSS"],
    softSkills: ["Empathy", "Storytelling"],
    projects: [
      { title: "Rural Banking App Case Study", description: "Field interviews with 12 users, redesigned the onboarding flow, measured task completion.", skills: ["Figma", "User research"] },
    ],
    certifications: ["Google UX Design"],
    interests: ["Product design"],
    preferredRoles: ["UI UX Designer"], preferredDomain: "Product Design",
    preferredLocation: "Remote", preferredModes: ["Remote", "Hybrid"],
    availableFrom: offset(-15), availableMonths: 6, previousInternships: 1,
    resumeSummary: "Product design student with a research-led case study portfolio.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-45), readinessIndex: 74,
  },
  {
    id: "stu_11", name: "Vivek Chourasia", email: "vivek.c@sit.edu.in", rollNo: "ET21-090", phone: "+91 87670 45521",
    department: "Electronics & Telecom", year: 3, cgpa: 6.5, city: "Pune",
    skills: ["Python", "Excel"],
    softSkills: ["Willingness to learn"],
    projects: [],
    certifications: [],
    interests: ["Analytics"],
    preferredRoles: ["Data Analyst"], preferredDomain: "Data & Analytics",
    preferredLocation: "Pune", preferredModes: ["Onsite"],
    availableFrom: offset(10), availableMonths: 4, previousInternships: 0,
    resumeSummary: "Beginning analytics journey with spreadsheet and Python basics.",
    facultyId: "fac_3", assessmentComplete: true, assessmentUpdatedAt: stamp(-6), readinessIndex: 41,
  },
  {
    id: "stu_12", name: "Ayesha Khan", email: "ayesha.k@sit.edu.in", rollNo: "IT21-077", phone: "+91 98333 90014",
    department: "Information Technology", year: 4, cgpa: 8.7, city: "Pune",
    skills: ["Java", "SQL", "REST APIs", "Spring Boot", "Git", "Docker"],
    softSkills: ["Mentoring", "Ownership"],
    projects: [
      { title: "Library Microservice", description: "Spring Boot service with JWT auth, OpenAPI docs and integration tests.", skills: ["Java", "REST APIs", "Docker"] },
    ],
    certifications: ["Oracle Java Foundations"],
    interests: ["Backend engineering"],
    preferredRoles: ["Backend Developer"], preferredDomain: "Product Engineering",
    preferredLocation: "Bengaluru", preferredModes: ["Hybrid", "Onsite"],
    availableFrom: offset(-25), availableMonths: 6, previousInternships: 1,
    resumeSummary: "Backend-focused final year student with documented API work.",
    facultyId: "fac_2", assessmentComplete: true, assessmentUpdatedAt: stamp(-33), readinessIndex: 82,
  },
];

export const STUDENTS: Student[] = RAW_STUDENTS.map((s) => ({ ...s, collegeId: COLLEGE.id }));

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp_1", companyId: "com_1", pathway: "college-placed",
    role: "Data Analyst", domain: "Data & Analytics", location: "Pune, Maharashtra", workMode: "Hybrid",
    durationMonths: 6, stipend: 25000, openings: 3,
    description: "Work with the client analytics pod on retail reporting: build SQL models, maintain Power BI dashboards and support monthly forecasting reviews.",
    responsibilities: ["Write and optimise SQL for reporting models", "Maintain Power BI dashboards", "Prepare monthly insight summaries for client reviews"],
    requiredSkills: ["Python", "SQL", "Excel", "Data Analytics"],
    preferredSkills: ["Power BI", "Statistics"],
    minCgpa: 7, departments: ["Computer Engineering", "Information Technology"], years: [3, 4],
    startDate: offset(21), deadline: offset(7), status: "Live", createdAt: stamp(-14),
    history: [
      h(-14, "company", "Nexawave Analytics", "Opportunity posted"),
      h(-13, "tnp", "Dr. Meena Rathore", "Reviewed and approved for circulation"),
      h(-13, "system", "S2I Matching Engine", "Eligible students ranked", "9 profiles evaluated against posted requirements"),
    ],
  },
  {
    id: "opp_2", companyId: "com_2", pathway: "college-placed",
    role: "Full Stack Developer", domain: "Product Engineering", location: "Bengaluru, Karnataka", workMode: "Remote",
    durationMonths: 6, stipend: 30000, openings: 2,
    description: "Ship features on a logistics dashboard built with React, TypeScript and Node. You will own small end-to-end slices with code review from senior engineers.",
    responsibilities: ["Build React components against Figma specs", "Write Node API endpoints with tests", "Participate in code review"],
    requiredSkills: ["JavaScript", "React", "Node.js", "Git"],
    preferredSkills: ["TypeScript", "PostgreSQL", "Docker"],
    minCgpa: 7, departments: ["Computer Engineering", "Information Technology"], years: [3, 4],
    startDate: offset(14), deadline: offset(3), status: "Live", createdAt: stamp(-20),
    history: [
      h(-20, "company", "Torqbit Systems", "Opportunity posted"),
      h(-19, "tnp", "Dr. Meena Rathore", "Approved for circulation"),
    ],
  },
  {
    id: "opp_3", companyId: "com_3", pathway: "college-placed",
    role: "ML Engineer", domain: "Health Technology", location: "Hyderabad, Telangana", workMode: "Hybrid",
    durationMonths: 6, stipend: 35000, openings: 1,
    description: "Support the clinical NLP team: dataset preparation, baseline models and evaluation harnesses for discharge summary tooling. CGPA above 8 expected.",
    responsibilities: ["Prepare and document datasets", "Build baseline models", "Report evaluation metrics honestly"],
    requiredSkills: ["Python", "Machine Learning", "Statistics", "Git"],
    preferredSkills: ["PyTorch", "SQL"],
    minCgpa: 8, departments: ["Computer Engineering", "Information Technology"], years: [3, 4],
    startDate: offset(30), deadline: offset(12), status: "Live", createdAt: stamp(-8),
    history: [
      h(-8, "company", "Medhaan Health Tech", "Opportunity posted"),
      h(-7, "tnp", "Dr. Meena Rathore", "Approved for circulation"),
    ],
  },
  {
    id: "opp_4", companyId: "com_2", pathway: "college-placed",
    role: "Backend Developer", domain: "Product Engineering", location: "Bengaluru, Karnataka", workMode: "Hybrid",
    durationMonths: 5, stipend: 28000, openings: 2,
    description: "Own service endpoints for the partner integrations platform. Java or Node background accepted.",
    responsibilities: ["Design and document REST endpoints", "Write integration tests", "Debug production issues with a mentor"],
    requiredSkills: ["SQL", "REST APIs", "Git"],
    preferredSkills: ["Docker", "Java", "Node.js"],
    minCgpa: 7.5, departments: ["Computer Engineering", "Information Technology"], years: [4],
    startDate: offset(25), deadline: offset(10), status: "Live", createdAt: stamp(-6),
    history: [h(-6, "company", "Torqbit Systems", "Opportunity posted"), h(-5, "tnp", "Dr. Meena Rathore", "Approved for circulation")],
  },
  {
    id: "opp_5", companyId: "com_4", pathway: "college-placed",
    role: "Embedded Engineer", domain: "Clean Energy", location: "Pune, Maharashtra", workMode: "Onsite",
    durationMonths: 6, stipend: 18000, openings: 2,
    description: "Firmware and telemetry work on rooftop solar monitoring units. Onsite at the Hinjewadi lab.",
    responsibilities: ["Write and test firmware routines", "Bench-test telemetry hardware", "Document test results"],
    requiredSkills: ["C++", "Linux", "Git"],
    preferredSkills: ["Python"],
    minCgpa: 6.5, departments: ["Electronics & Telecom", "Computer Engineering"], years: [3, 4],
    startDate: offset(20), deadline: offset(9), status: "Submitted to T&P", createdAt: stamp(-3),
    history: [h(-3, "company", "Grid & Volt Energy", "Opportunity submitted for T&P approval")],
  },
];

function ev(
  id: string, type: EvidenceItem["type"], title: string, days: number,
  by: EvidenceItem["submittedBy"], byName: string, status: EvidenceItem["status"] = "Accepted", note?: string,
): EvidenceItem {
  return {
    id, type, title, submittedBy: by, submittedByName: byName, submittedAt: stamp(days), status,
    ...(note ? { note } : {}), fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
  };
}

export const INTERNSHIPS: Internship[] = [
  // 1. College-placed, fully verified — the completed evidence trail for the demo.
  {
    id: "int_1", pathway: "college-placed", studentId: "stu_4", companyId: "com_2", applicationId: "app_1",
    role: "Full Stack Developer", domain: "Product Engineering", location: "Bengaluru, Karnataka", workMode: "Remote",
    startDate: offset(-190), endDate: offset(-10), durationMonths: 6, stipend: 30000,
    stage: "Verified", review: "Institutionally Verified", verification: "Completed", facultyPermission: "Granted", facultyId: "fac_2",
    evidence: [
      ev("evd_1", "Offer letter", "Torqbit offer letter", -200, "company", "Vikram Rao"),
      ev("evd_2", "Consent letter", "Student and parent consent", -196, "student", "Sneha Deshpande"),
      ev("evd_3", "Joining confirmation", "Day one joining confirmation", -190, "student", "Sneha Deshpande"),
      ev("evd_4", "Progress report", "Monthly progress report — month 3", -100, "student", "Sneha Deshpande"),
      ev("evd_5", "Project submission", "Carrier rate-card module", -40, "student", "Sneha Deshpande"),
      ev("evd_6", "Company feedback", "End of internship feedback", -14, "company", "Vikram Rao"),
      ev("evd_7", "Completion certificate", "Internship completion certificate", -12, "company", "Vikram Rao"),
      ev("evd_8", "Faculty evaluation", "Faculty evaluation sheet", -8, "faculty", "Dr. Kavita Iyer"),
    ],
    checkIns: [
      { id: "chk_1", date: offset(-190), kind: "Joining confirmation", reportedLocation: "Remote — Pune residence", workMode: "Remote", summary: "Joined remotely, laptop and access provisioned.", consentGiven: true, confirmedBy: "student", confirmedByName: "Sneha Deshpande" },
      { id: "chk_2", date: offset(-120), kind: "Company confirmation", reportedLocation: "Remote", workMode: "Remote", summary: "Attendance and delivery on track for the quarter.", consentGiven: true, confirmedBy: "company", confirmedByName: "Vikram Rao" },
    ],
    offer: { id: "off_1", issuedBy: "company", issuedAt: stamp(-200), stipend: 30000, joiningDate: offset(-190), reportingLocation: "Remote (Bengaluru HQ)", workMode: "Remote", fileName: "torqbit-offer.pdf", recordedByTnp: true, recordedAt: stamp(-198) },
    consent: { id: "con_1", studentDeclaration: true, parentGuardianName: "Mr. Prakash Deshpande", parentContact: "+91 98220 11009", academicAcknowledgement: true, locationSharingConsent: true, submittedAt: stamp(-196), tnpVerified: true, tnpVerifiedAt: stamp(-195) },
    companyFeedback: { id: "fbk_1", by: "company", byName: "Vikram Rao", at: stamp(-14), technical: 5, communication: 4, ownership: 5, punctuality: 5, teamwork: 4, remarks: "Owned the rate-card module end to end and wrote the tests without being asked. Would take her back full time.", wouldHire: true, skillsDemonstrated: ["React", "Node.js", "PostgreSQL", "Testing"] },
    facultyEvaluation: { id: "eval_1", facultyId: "fac_2", facultyName: "Dr. Kavita Iyer", at: stamp(-8), learningOutcome: 5, documentation: 4, relevance: 5, remarks: "Strong industrial exposure, documentation complete and aligned to the syllabus outcomes.", verdict: "Approved", creditsRecommended: 4 },
    riskFlags: [], createdAt: stamp(-215),
    history: [
      h(-215, "student", "Sneha Deshpande", "Applied through T&P shortlist"),
      h(-210, "company", "Vikram Rao", "Shortlisted for interview"),
      h(-205, "company", "Vikram Rao", "Interview cleared"),
      h(-200, "company", "Vikram Rao", "Offer issued"),
      h(-196, "student", "Sneha Deshpande", "Consent submitted"),
      h(-195, "tnp", "Dr. Meena Rathore", "Consent verified and offer recorded"),
      h(-190, "student", "Sneha Deshpande", "Joining confirmed"),
      h(-14, "company", "Vikram Rao", "Company feedback submitted"),
      h(-8, "faculty", "Dr. Kavita Iyer", "Faculty evaluation completed", "Approved with 4 credits"),
      h(-6, "tnp", "Dr. Meena Rathore", "Institutionally verified", "All required evidence present"),
    ],
  },
  // 2. College-placed, active with a progress gap.
  {
    id: "int_2", pathway: "college-placed", studentId: "stu_1", companyId: "com_1", applicationId: "app_2",
    role: "Data Analyst", domain: "Data & Analytics", location: "Pune, Maharashtra", workMode: "Hybrid",
    startDate: offset(-58), endDate: offset(120), durationMonths: 6, stipend: 25000,
    stage: "Progress", review: "T&P Approved", verification: "Evidence Submitted", facultyPermission: "Granted", facultyId: "fac_1",
    evidence: [
      ev("evd_10", "Offer letter", "Nexawave offer letter", -70, "company", "Shreya Kulkarni"),
      ev("evd_11", "Consent letter", "Student and parent consent", -66, "student", "Aarav Kulkarni"),
      ev("evd_12", "Joining confirmation", "Joining confirmation — Hinjewadi office", -58, "student", "Aarav Kulkarni"),
      ev("evd_13", "Task log", "Weeks 1-4 task log", -30, "student", "Aarav Kulkarni"),
    ],
    checkIns: [
      { id: "chk_3", date: offset(-58), kind: "Joining confirmation", reportedLocation: "Nexawave, Hinjewadi Phase 2, Pune", workMode: "Hybrid", summary: "Reported onsite, ID card issued.", consentGiven: true, confirmedBy: "student", confirmedByName: "Aarav Kulkarni" },
      { id: "chk_4", date: offset(-24), kind: "Weekly check-in", reportedLocation: "Nexawave, Hinjewadi Phase 2, Pune", workMode: "Hybrid", summary: "Three days onsite this week, working on the forecast model refresh.", consentGiven: true, confirmedBy: "student", confirmedByName: "Aarav Kulkarni" },
    ],
    offer: { id: "off_2", issuedBy: "company", issuedAt: stamp(-70), stipend: 25000, joiningDate: offset(-58), reportingLocation: "Hinjewadi Phase 2, Pune", workMode: "Hybrid", fileName: "nexawave-offer.pdf", recordedByTnp: true, recordedAt: stamp(-68) },
    consent: { id: "con_2", studentDeclaration: true, parentGuardianName: "Mrs. Vaishali Kulkarni", parentContact: "+91 98220 77341", academicAcknowledgement: true, locationSharingConsent: true, submittedAt: stamp(-66), tnpVerified: true, tnpVerifiedAt: stamp(-65) },
    riskFlags: ["Monthly progress report overdue"], createdAt: stamp(-80),
    history: [
      h(-80, "tnp", "Dr. Meena Rathore", "Shortlisted from matching engine recommendations"),
      h(-76, "company", "Shreya Kulkarni", "Interview scheduled"),
      h(-72, "company", "Shreya Kulkarni", "Selected"),
      h(-66, "student", "Aarav Kulkarni", "Consent submitted"),
      h(-65, "tnp", "Dr. Meena Rathore", "Consent verified, offer recorded"),
      h(-58, "student", "Aarav Kulkarni", "Joining confirmed"),
      h(-30, "student", "Aarav Kulkarni", "Task log submitted"),
    ],
  },
  // 3. Self-placed, sitting in the T&P verification queue.
  {
    id: "int_3", pathway: "self-placed", studentId: "stu_3",
    selfPlaced: {
      companyName: "BrightPath Labs", companyWebsite: "https://brightpathlabs.co",
      companyEmail: "brightpathhr2024@gmail.com", companyContactName: "Rahul Sinha", companyContactPhone: "+91 99999 12345",
      companyAddress: "", description: "Frontend internship building marketing pages and a component library.",
      howFound: "LinkedIn post", hasOfferLetter: true,
    },
    role: "Frontend Developer", domain: "Product Engineering", location: "Remote", workMode: "Remote",
    startDate: offset(7), endDate: offset(97), durationMonths: 3, stipend: 8000,
    stage: "Application", review: "Under Review", verification: "Evidence Submitted", facultyPermission: "Not Required", facultyId: "fac_1",
    evidence: [ev("evd_20", "Offer letter", "BrightPath selection email screenshot", -4, "student", "Rohan Patil", "Submitted", "Emailed from a Gmail address, no letterhead.")],
    checkIns: [], riskFlags: ["Free-mail company contact", "No registered address supplied"], createdAt: stamp(-4),
    history: [
      h(-4, "student", "Rohan Patil", "Self-placed internship submitted"),
      h(-3, "system", "S2I", "Completeness and consistency check generated for T&P review"),
      h(-2, "tnp", "Dr. Meena Rathore", "Marked under review"),
    ],
  },
  // 4. Self-placed, approved by T&P, now with faculty.
  {
    id: "int_4", pathway: "self-placed", studentId: "stu_10",
    selfPlaced: {
      companyName: "Kalaa Design Studio", companyWebsite: "https://kalaastudio.in",
      companyEmail: "careers@kalaastudio.in", companyContactName: "Neelam Shetty", companyContactPhone: "+91 98450 33210",
      companyAddress: "3rd Floor, Indiranagar 100ft Road, Bengaluru 560038",
      description: "Product design internship covering research synthesis and design system work for a fintech client.",
      howFound: "Alumni referral", hasOfferLetter: true,
    },
    role: "UI UX Designer", domain: "Product Design", location: "Bengaluru, Karnataka", workMode: "Hybrid",
    startDate: offset(-35), endDate: offset(55), durationMonths: 3, stipend: 15000,
    stage: "Active", review: "T&P Approved", verification: "T&P Verified", facultyPermission: "Pending", facultyId: "fac_2",
    evidence: [
      ev("evd_30", "Offer letter", "Kalaa Studio offer letter", -45, "student", "Tanvi Joshi"),
      ev("evd_31", "Consent letter", "Student and parent consent", -40, "student", "Tanvi Joshi"),
      ev("evd_32", "Joining confirmation", "Joining confirmation", -35, "student", "Tanvi Joshi"),
    ],
    checkIns: [
      { id: "chk_5", date: offset(-35), kind: "Joining confirmation", reportedLocation: "Kalaa Design Studio, Indiranagar, Bengaluru", workMode: "Hybrid", summary: "Reported to the studio, assigned to the fintech pod.", consentGiven: true, confirmedBy: "student", confirmedByName: "Tanvi Joshi" },
    ],
    offer: { id: "off_4", issuedBy: "student-upload", issuedAt: stamp(-45), stipend: 15000, joiningDate: offset(-35), reportingLocation: "Indiranagar, Bengaluru", workMode: "Hybrid", fileName: "kalaa-offer.pdf", recordedByTnp: true, recordedAt: stamp(-42) },
    consent: { id: "con_4", studentDeclaration: true, parentGuardianName: "Mr. Sanjay Joshi", parentContact: "+91 98600 21114", academicAcknowledgement: true, locationSharingConsent: true, submittedAt: stamp(-40), tnpVerified: true, tnpVerifiedAt: stamp(-39) },
    riskFlags: [], createdAt: stamp(-50),
    history: [
      h(-50, "student", "Tanvi Joshi", "Self-placed internship submitted"),
      h(-48, "tnp", "Dr. Meena Rathore", "Marked under review"),
      h(-46, "tnp", "Dr. Meena Rathore", "Requested offer letter on company letterhead"),
      h(-45, "student", "Tanvi Joshi", "Offer letter uploaded"),
      h(-42, "tnp", "Dr. Meena Rathore", "T&P approved and released to faculty"),
      h(-35, "student", "Tanvi Joshi", "Joining confirmed"),
    ],
  },
  // 5. College-placed awaiting consent — the pending action for the demo.
  {
    id: "int_5", pathway: "college-placed", studentId: "stu_12", companyId: "com_2", applicationId: "app_5",
    role: "Backend Developer", domain: "Product Engineering", location: "Bengaluru, Karnataka", workMode: "Hybrid",
    startDate: offset(25), endDate: offset(175), durationMonths: 5, stipend: 28000,
    stage: "Selected", review: "T&P Approved", verification: "Self Reported", facultyPermission: "Not Required", facultyId: "fac_2",
    evidence: [], checkIns: [], riskFlags: ["Consent pending", "Offer letter not yet recorded"], createdAt: stamp(-5),
    history: [
      h(-12, "tnp", "Dr. Meena Rathore", "Shortlisted from matching recommendations"),
      h(-8, "company", "Vikram Rao", "Interview cleared"),
      h(-5, "company", "Vikram Rao", "Selected — consent requested from student"),
    ],
  },
];

export const APPLICATIONS: Application[] = [
  { id: "app_1", opportunityId: "opp_2", studentId: "stu_4", stage: "Verified", matchScore: 92, source: "T&P shortlist", tnpApproved: true, outcome: "Selected", internshipId: "int_1", createdAt: stamp(-215), history: [h(-215, "tnp", "Dr. Meena Rathore", "Shortlisted")] },
  { id: "app_2", opportunityId: "opp_1", studentId: "stu_1", stage: "Progress", matchScore: 88, source: "T&P shortlist", tnpApproved: true, outcome: "Selected", internshipId: "int_2", createdAt: stamp(-80), history: [h(-80, "tnp", "Dr. Meena Rathore", "Shortlisted")] },
  { id: "app_3", opportunityId: "opp_1", studentId: "stu_2", stage: "Interview", matchScore: 91, source: "T&P shortlist", tnpApproved: true, interview: { scheduledFor: offset(2), mode: "Remote", result: "Pending" }, createdAt: stamp(-9), history: [h(-9, "tnp", "Dr. Meena Rathore", "Shortlisted from matching recommendations"), h(-4, "company", "Shreya Kulkarni", "Interview scheduled")] },
  { id: "app_4", opportunityId: "opp_1", studentId: "stu_6", stage: "Shortlisted", matchScore: 68, source: "T&P shortlist", tnpApproved: true, createdAt: stamp(-9), history: [h(-9, "tnp", "Dr. Meena Rathore", "Shortlisted from matching recommendations")] },
  { id: "app_5", opportunityId: "opp_4", studentId: "stu_12", stage: "Selected", matchScore: 86, source: "T&P shortlist", tnpApproved: true, outcome: "Selected", internshipId: "int_5", createdAt: stamp(-12), history: [h(-12, "tnp", "Dr. Meena Rathore", "Shortlisted")] },
  { id: "app_6", opportunityId: "opp_3", studentId: "stu_8", stage: "Application", matchScore: 83, source: "Student applied", tnpApproved: false, createdAt: stamp(-2), history: [h(-2, "student", "Meher Fatima", "Applied — awaiting T&P review")] },
  { id: "app_7", opportunityId: "opp_2", studentId: "stu_3", stage: "Application", matchScore: 74, source: "Student applied", tnpApproved: false, createdAt: stamp(-1), history: [h(-1, "student", "Rohan Patil", "Applied — awaiting T&P review")] },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "not_1", audience: "student", audienceId: "stu_12", kind: "consent", title: "Consent required for Torqbit Systems", body: "You were selected for the Backend Developer internship. Submit your consent form so the T&P cell can record the offer.", internshipId: "int_5", createdAt: stamp(-5), read: false },
  { id: "not_2", audience: "student", audienceId: "stu_1", kind: "progress", title: "Monthly progress report overdue", body: "Your month-2 progress report for Nexawave Analytics has not been submitted.", internshipId: "int_2", createdAt: stamp(-3), read: false },
  { id: "not_3", audience: "student", audienceId: "stu_2", kind: "interview", title: "Interview scheduled — Nexawave Analytics", body: `Your Data Analyst interview is scheduled for ${offset(2)}.`, applicationId: "app_3", createdAt: stamp(-4), read: false },
  { id: "not_4", audience: "student", audienceId: "stu_3", kind: "review", title: "Self-placed submission under review", body: "The T&P cell is reviewing BrightPath Labs. Two items were flagged for attention.", internshipId: "int_3", createdAt: stamp(-2), read: false },
  { id: "not_5", audience: "tnp", audienceId: "tnp", kind: "verification", title: "Self-placed internship awaiting decision", body: "Rohan Patil submitted BrightPath Labs. Automated checks flagged 2 items.", internshipId: "int_3", createdAt: stamp(-3), read: false },
  { id: "not_6", audience: "tnp", audienceId: "tnp", kind: "consent", title: "Consent pending — Ayesha Khan", body: "Selected at Torqbit Systems but consent has not been submitted.", internshipId: "int_5", createdAt: stamp(-4), read: false },
  { id: "not_7", audience: "faculty", audienceId: "fac_2", kind: "evaluation", title: "Permission pending — Tanvi Joshi", body: "T&P approved a self-placed internship at Kalaa Design Studio. Your permission is required.", internshipId: "int_4", createdAt: stamp(-42), read: false },
  { id: "not_8", audience: "company", audienceId: "com_1", kind: "shortlist", title: "3 candidates shortlisted by T&P", body: "The T&P cell released a shortlist for your Data Analyst posting.", createdAt: stamp(-9), read: false },
];

export function buildSeed(): DB {
  return {
    version: 1,
    session: { role: null, studentId: "stu_1", facultyId: "fac_1", companyId: "com_1" },
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
