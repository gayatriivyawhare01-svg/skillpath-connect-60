const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

async function callGateway(system: string, content: string | ContentBlock[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "content-type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429)
      throw new Error("Too many requests right now — please retry in a minute.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted for this workspace. Add credits to continue.");
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "");
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    throw new Error("The AI returned an unreadable report. Please try again.");
  }
}

const PERSONA = `You are a panel of four experts working as one: a veteran career coach, a senior technical recruiter, a college placement officer, and a hiring manager who has interviewed thousands of Tier-2/Tier-3 Indian engineering students.

EVIDENCE RULES — these override everything else:
- Use ONLY the information supplied in the user message. Never invent skills, companies, numbers, certifications, achievements, dates or experience.
- When a fact is absent, write exactly "Not found in resume." (resume tasks) or "Insufficient evidence." (other tasks) instead of guessing.
- Every weakness, gap and risk MUST cite the specific input it came from (a named project, a selected skill, a missing link, a quoted line).
- Never claim certainty you do not have. No "100% genuine" / "100% fake" style claims.
- Indian internship context: stipend in INR, PPO culture, hackathons (Smart India Hackathon, Devfolio), open source (GSoC, Hacktoberfest).
- Be honest and specific. No generic filler ("learn DSA", "improve communication") without the exact reason and this week's action.
- Return ONLY valid JSON matching the requested shape. No markdown, no commentary.`;

/* ------------------------------------------------------------------ *
 * 1. Career audit — narrative built on deterministic evidence
 * ------------------------------------------------------------------ */

export async function runCareerAudit(payload: {
  submission: unknown;
  evidence: unknown;
}) {
  const schema = `{
 "verdict": one honest sentence that references the student's actual situation,
 "careerGps": { "currentPosition": string, "targetRole": string, "distanceRemaining": string, "estimatedPreparationTime": string, "confidence": string },
 "roadmap": [{ "milestone": string, "timeframe": string, "outcome": string, "tasks": [string x3] }] (4-6, ordered, derived from the gap list),
 "strengths": [{ "title": string, "why": string cites the exact input, "leverage": string }] (3-5; if there is little evidence, return fewer items rather than inventing),
 "weaknesses": [{ "title": string, "evidence": "what was found in the inputs", "why": "why it is a gap for the target role", "cost": string, "fix": "what to do this week" }] (4-6, each mapped to a supplied gap or low category),
 "skillGapMatrix": [{ "skill": string, "current": "None|Beginner|Intermediate|Advanced", "required": string, "priority": "Critical|High|Medium", "learningTime": string, "difficulty": "Easy|Moderate|Hard", "resources": [string x2] }] (one row per supplied gap, keep the supplied priority),
 "projectAnalysis": [{ "name": exact project name supplied, "scores": { "complexity": 0-10, "businessValue": 0-10, "technicalDepth": 0-10, "industryRelevance": 0-10, "portfolioStrength": 0-10 }, "verdict": string, "missing": [string from the supplied missing list], "upgrade": string }] (only for projects actually supplied; empty array if none),
 "suggestedProjects": [{ "title": string, "why": string naming the gap it closes, "stack": [string], "difficulty": string, "timeToBuild": string }] (3, each must close a listed gap),
 "professionalPresence": { "github": { "score": 0-100, "review": string, "actions": [string] }, "linkedin": {same}, "portfolio": {same}, "networkingReadiness": {same} } (score 0 with review "Insufficient evidence." when the link was not provided),
 "communicationReview": { "interviewReadiness": 0-100, "presentationSkills": 0-100, "professionalConfidence": 0-100, "review": string that references their written answers if any, "drills": [string x3] },
 "industryReadiness": [{ "segment": "Startup|Product Company|Service Company|MNC|Research Lab", "fit": 0-100, "reason": string }] (5),
 "recommendations": { "skillsToLearn": [string x4], "projectsToBuild": [string x3], "resumeActions": [string x3], "communicationActions": [string x3], "immediateNextSteps": [string x4] } (each item must trace to a gap or low category),
 "finalSummary": 150-220 words stating exactly where this student stands, citing their own inputs,
 "sprint30Day": [{ "day": 1..30, "focus": string, "tasks": [string x2-3], "deliverable": string }] (ALL 30 days, no gaps)
}`;

  return callGateway(
    PERSONA,
    `Write the AI Career Assessment narrative for this student.

The numeric analysis has ALREADY been computed deterministically from their inputs and is given below as "evidence". Do NOT invent your own scores — explain the ones given, and build every recommendation from the listed gaps, focus areas and low-scoring categories.

Sprint rule (critical): the 30-day sprint must be generated FROM the listed gaps and focus areas only. Allocate days in proportion to how weak each area is — a Python gap gets Python days, shallow projects get project-building days, weak communication gets interview/communication days, a missing GitHub gets profile days. Never output a generic sprint.

If a category is flagged as insufficient evidence, say "Insufficient evidence." rather than scoring it in prose.

Return JSON exactly in this shape:
${schema}

=== DETERMINISTIC EVIDENCE ===
${JSON.stringify(payload.evidence, null, 2)}

=== RAW STUDENT SUBMISSION ===
${JSON.stringify(payload.submission, null, 2)}`,
  );
}

/* ------------------------------------------------------------------ *
 * 2. Resume intelligence — extraction first, then analysis
 * ------------------------------------------------------------------ */

export async function runResumeIntel(input: {
  role: string;
  jobDescription?: string;
  resumeText?: string;
  file?: { filename: string; mime: string; base64: string };
}) {
  const hasJd = Boolean(input.jobDescription && input.jobDescription.trim().length > 60);

  const schema = `{
 "mode": ${hasJd ? '"match"' : '"health"'},
 "extracted": {
   "skills": [string exactly as written in the resume],
   "projects": [{ "name": string, "summary": string }],
   "education": [string], "experience": [string], "certifications": [string],
   "achievements": [string], "measurableResults": [string containing the actual number found]
 } (any empty list must contain the single string "Not found in resume."),
 "atsScore": number 0-100 (parsing/formatting/ATS friendliness only),
 "resumeQualityScore": number 0-100 (Resume Health: structure, clarity, evidence, impact — NOT job match),
 "targetRoleMatch": { "score": ${hasJd ? "number 0-100 based ONLY on the supplied job description" : "null"}, "note": ${hasJd ? "string explaining the match calculation" : '"No job description supplied, so no job-match score was calculated. This report measures Resume Health only."'} },
 ${hasJd
   ? `"jdComparison": {
   "roleAlignment": string,
   "matchedSkills": [string present in BOTH resume and JD],
   "missingSkills": [string required by the JD and absent from the resume],
   "missingKeywords": [string important JD keywords absent from the resume],
   "relevantProjects": [resume project names that support this JD],
   "weakOrIrrelevantSections": [string],
   "missingEvidence": [string the JD expects proof of but the resume does not prove],
   "weakBullets": [{ "bullet": exact bullet from the resume, "problem": string, "rewritten": string using only facts already in the resume }] (3-5)
 },`
   : `"jdComparison": null,`}
 "scores": [{ "label": string, "score": 0-100, "note": string citing the resume }] (Keyword Match, Impact, Project Quality, Formatting, Achievements, Grammar, Technical Coverage, Soft Skill Coverage),
 "keywordMatch": { "matched": [string], "missing": [string], "note": string that states whether the comparison is against a job description or against general expectations for the target role },
 "formattingReview": { "verdict": string, "issues": [string], "wins": [string] },
 "missingSections": [string],
 "redFlags": [{ "flag": string, "why": string, "fix": string }] (only real, observed issues; empty array if none),
 "recruiterPerspective": { "firstSixSeconds": string, "shortlistOdds": string, "honestTake": string },
 "topImprovements": [{ "priority": 1..5, "change": string, "why": string, "impact": string }] (5),
 "weakProjectDescriptions": [{ "original": exact text from the resume, "problem": string, "rewritten": string }],
 "improvedBullets": [{ "before": exact bullet from the resume, "after": string, "why": string }] (up to 5; "before" must be a real line from the resume),
 "actionVerbs": [string x8],
 "summary": 120-180 words, honest, citing only what the resume actually contains
}`;

  const instruction = `Step 1 — read the attached/pasted resume and extract only what is literally present.
Step 2 — analyse it for the target internship role "${input.role}".
${hasJd ? "Step 3 — compare the resume against the supplied job description and report matched/missing skills, missing keywords, relevant projects and missing evidence." : "No job description was supplied. Report Resume Health only, and do NOT present any score as a job-match score."}

Never rewrite a bullet using facts the resume does not contain. If the resume text is unreadable or nearly empty, set every score to 0 and put "Not found in resume." everywhere instead of inventing content.

Return JSON exactly in this shape:
${schema}`;

  const jdBlock = hasJd ? `\n\n=== JOB DESCRIPTION ===\n${input.jobDescription}` : "";

  if (input.file) {
    return callGateway(PERSONA, [
      { type: "text", text: instruction + jdBlock },
      {
        type: "file",
        file: {
          filename: input.file.filename,
          file_data: `data:${input.file.mime};base64,${input.file.base64}`,
        },
      },
    ]);
  }
  return callGateway(
    PERSONA,
    `${instruction}${jdBlock}\n\n=== RESUME TEXT ===\n${input.resumeText ?? ""}`,
  );
}

/* ------------------------------------------------------------------ *
 * 3. Internship X-Ray — real retrieval + deterministic risk signals
 * ------------------------------------------------------------------ */

const RISK_PATTERNS: Array<{
  signal: string;
  severity: "High" | "Moderate" | "Low";
  re: RegExp;
}> = [
  { signal: "Registration or application fee requested", severity: "High", re: /\b(registration|application|enrol(l)?ment|admission)\s+(fee|fees|charges|amount)\b/i },
  { signal: "Security deposit or refundable amount requested", severity: "High", re: /\b(security\s+deposit|refundable\s+(deposit|amount|fee)|caution\s+money)\b/i },
  { signal: "Payment required from the candidate", severity: "High", re: /\b(pay|payment of|deposit|transfer)\s*(rs\.?|inr|₹)\s*\d/i },
  { signal: "Guaranteed placement claimed", severity: "High", re: /\b(100%\s*(job|placement)|guaranteed\s+(placement|job|internship)|assured\s+(placement|job))\b/i },
  { signal: "Unrealistic salary or package claim", severity: "Moderate", re: /\b(\d{2,}\s*(lpa|lakhs?\s*per\s*annum))\b/i },
  { signal: "Paid training presented as an internship", severity: "High", re: /\b(training\s+(fee|program|programme|charges)|course\s+fee|paid\s+training)\b/i },
  { signal: "Offer is centred on a certificate rather than work", severity: "Moderate", re: /\b(certificate\s+(guaranteed|assured|on\s+payment)|only\s+certificate|certificate\s+based\s+internship)\b/i },
  { signal: "Personal email used as official contact", severity: "Moderate", re: /\b[\w.+-]+@(gmail|yahoo|outlook|hotmail|rediffmail)\.com\b/i },
  { signal: "Contact restricted to WhatsApp/Telegram", severity: "Moderate", re: /\b(whatsapp|telegram)\b[^.]{0,40}\b(only|apply|contact|dm)\b/i },
  { signal: "Urgency pressure in the offer", severity: "Low", re: /\b(limited\s+seats|hurry|immediate\s+joining\s+only|apply\s+fast|last\s+date\s+today)\b/i },
  { signal: "Commission or sales-target based 'internship'", severity: "Moderate", re: /\b(commission\s+basis|sales\s+target|performance\s+based\s+stipend\s+only|unpaid\s+until)\b/i },
];

const POSITIVE_PATTERNS: Array<{ signal: string; re: RegExp }> = [
  { signal: "Stipend amount stated", re: /\b(stipend|salary)\b[^.]{0,40}(₹|rs\.?|inr)\s*[\d,]+/i },
  { signal: "Duration stated", re: /\b(\d+)\s*(weeks?|months?)\b/i },
  { signal: "Named mentor or reporting manager", re: /\b(mentor|reporting to|supervisor|guide)\b/i },
  { signal: "Concrete tech stack listed", re: /\b(react|node|python|java|sql|aws|docker|figma|flutter|django|typescript)\b/i },
  { signal: "Structured interview or assignment process", re: /\b(interview|assignment|technical round|screening)\b/i },
  { signal: "Company website or official domain referenced", re: /https?:\/\/(?!.*(gmail|whatsapp))\S+\.\S+/i },
];

function scanEvidence(text: string) {
  const source = text.replace(/\s+/g, " ");
  const sentences = source.split(/(?<=[.!?;])\s+/);
  const quote = (re: RegExp) =>
    sentences.find((s) => re.test(s))?.trim().slice(0, 240) ?? "";

  const riskSignals = RISK_PATTERNS.filter((p) => p.re.test(source)).map((p) => ({
    signal: p.signal,
    severity: p.severity,
    evidence: quote(p.re) || "Pattern detected in the supplied text.",
  }));
  const positiveSignals = POSITIVE_PATTERNS.filter((p) => p.re.test(source)).map((p) => ({
    signal: p.signal,
    evidence: quote(p.re) || "Pattern detected in the supplied text.",
  }));

  const missing: string[] = [];
  if (!/\b(stipend|salary|unpaid|paid)\b/i.test(source)) missing.push("Stipend / compensation not stated");
  if (!/\b\d+\s*(weeks?|months?)\b/i.test(source)) missing.push("Internship duration not stated");
  if (!/\b(remote|onsite|on-site|hybrid|work from home|wfh)\b/i.test(source))
    missing.push("Work mode (remote/onsite/hybrid) not stated");
  if (!/\b(responsibilit|you will|role involves|day to day|tasks)\b/i.test(source))
    missing.push("Actual responsibilities not described");
  if (!/\b(pvt|private limited|ltd|llp|inc|technologies|labs|solutions|systems)\b/i.test(source))
    missing.push("Registered company identity not clearly stated");
  if (!/[\w.+-]+@[\w-]+\.[\w.]+|\bhttps?:\/\//i.test(source))
    missing.push("Verifiable contact details or official link not provided");
  if (!/\b(mentor|team|reporting|supervisor)\b/i.test(source))
    missing.push("Mentorship / reporting structure not described");

  const wordCount = source.split(" ").filter(Boolean).length;
  return { riskSignals, positiveSignals, missing, wordCount };
}

async function fetchInternshipPage(url: string) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; Skill2InternXray/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false as const, status: res.status };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    return { ok: true as const, text: text.slice(0, 12000) };
  } catch {
    return { ok: false as const, status: 0 };
  }
}

export async function runInternshipXray(input: { url?: string; description?: string }) {
  const url = input.url?.trim();
  const pasted = input.description?.trim() ?? "";
  let retrieved = "";
  let sourceNote = "";

  if (url) {
    const page = await fetchInternshipPage(url);
    if (page.ok && page.text.length > 400) {
      retrieved = page.text;
      sourceNote = `Analysed the page content retrieved from ${url}${pasted ? " plus the description you pasted." : "."}`;
    } else if (!pasted) {
      throw new Error(
        "Unable to retrieve the internship page. Paste the internship description for analysis.",
      );
    } else {
      sourceNote = `The page at ${url} could not be retrieved, so this analysis is based only on the description you pasted. The link itself was not verified.`;
    }
  } else {
    sourceNote = "Analysed only the internship description you pasted. No page was retrieved.";
  }

  const combined = [retrieved, pasted].filter(Boolean).join("\n\n");
  const scan = scanEvidence(combined);
  const insufficient = scan.wordCount < 40;

  const schema = `{
 "companyName": string exactly as it appears, else "Not stated",
 "roleTitle": string as stated, else "Not stated",
 "riskLevel": "LOW RISK|MODERATE RISK|HIGH RISK|INSUFFICIENT EVIDENCE",
 "confidence": "High|Moderate|Low",
 "healthScore": ${insufficient ? "null" : "number 0-100 reflecting learning value and transparency, or null if it cannot be judged"},
 "recommendedAction": one short imperative sentence,
 "recommendation": "Apply|Prepare First|Avoid|Insufficient evidence",
 "recommendationReason": 60-100 words citing the evidence used,
 "trustLevel": "High|Moderate|Low|Suspicious|Insufficient evidence",
 "positiveSignals": [{ "signal": string, "evidence": quoted text from the input }],
 "riskSignals": [{ "signal": string, "evidence": quoted text from the input, "severity": "High|Moderate|Low" }],
 "missingInformation": [string],
 "evidenceUsed": [string describing each piece of information the verdict relies on],
 "metrics": [{ "label": string, "score": 0-100, "note": string }] (Company Transparency, Learning Potential, Career ROI, Resume Value, Mentorship Quality, Growth Potential; use note "Insufficient evidence." and score 0 where unknown),
 "expectedResponsibilities": [string, only those stated; else ["Insufficient evidence."]],
 "skillsActuallyLearned": [{ "skill": string, "depth": "Surface|Working|Deep" }],
 "ppoPossibility": { "likelihood": string, "reason": string },
 "hiddenRisks": [{ "risk": string, "evidence": string }],
 "warningFlags": [string],
 "questionsToAsk": [string x6 specific to this posting],
 "suitableFor": [string x3], "shouldAvoid": [string x3],
 "employabilityImpact": string,
 "valueAfterCompletion": { "resumeValue": string, "skillValue": string, "networkValue": string, "estimatedWorth": string }
}`;

  const rules = `Rules:
- Include every detected risk signal below in "riskSignals" (keep its quoted evidence) and add any further evidence-backed signals you find in the text.
- Never state or imply that an internship is 100% genuine or 100% fake.
- ${insufficient ? 'The supplied text is too short to judge. Set riskLevel to "INSUFFICIENT EVIDENCE", confidence "Low", healthScore null, and explain what the student must paste.' : "Set riskLevel from the severity and number of evidence-backed risk signals, not from tone."}
- Do not invent company details, stipend, duration or contact information. Anything absent belongs in "missingInformation".`;

  return callGateway(
    PERSONA,
    `Run an evidence-based Internship X-Ray. Return JSON exactly in this shape:
${schema}

${rules}

=== SOURCE NOTE (repeat this verbatim in "sourceNote") ===
${sourceNote}

=== DETERMINISTICALLY DETECTED RISK SIGNALS ===
${JSON.stringify(scan.riskSignals, null, 2)}

=== DETERMINISTICALLY DETECTED POSITIVE SIGNALS ===
${JSON.stringify(scan.positiveSignals, null, 2)}

=== INFORMATION NOT PRESENT IN THE TEXT ===
${JSON.stringify(scan.missing, null, 2)}

=== TEXT ANALYSED (${scan.wordCount} words) ===
${combined || "(empty)"}`,
  ).then((raw) => {
    const report = raw as Record<string, unknown>;
    // Deterministic facts win over model prose.
    report["sourceNote"] = sourceNote;
    report["missingInformation"] = scan.missing;
    if (insufficient) {
      report["riskLevel"] = "INSUFFICIENT EVIDENCE";
      report["confidence"] = "Low";
      report["healthScore"] = null;
    }
    return report;
  });
}
