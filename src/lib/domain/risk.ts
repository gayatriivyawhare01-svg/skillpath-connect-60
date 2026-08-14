import { REQUIRED_EVIDENCE, type Internship } from "./types";

/**
 * Self-placed internship analysis. This produces an *assessment for the T&P cell*,
 * never a verdict. The platform must never claim a company was proved genuine —
 * only a recorded T&P action can approve an internship.
 */

export type Indicator = {
  label: string;
  status: "ok" | "attention" | "missing";
  detail: string;
};

export type SelfPlacedAnalysis = {
  completeness: number;
  attentionCount: number;
  indicators: Indicator[];
  summary: string;
  disclaimer: string;
};

const FREE_MAIL = ["gmail.", "yahoo.", "outlook.", "hotmail.", "rediffmail.", "proton."];

function domainOf(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function analyseSelfPlaced(internship: Internship): SelfPlacedAnalysis {
  const d = internship.selfPlaced;
  const indicators: Indicator[] = [];

  const site = d?.companyWebsite ?? "";
  const domain = domainOf(site);
  indicators.push(
    domain
      ? {
          label: "Company website",
          status: "ok",
          detail: `Resolvable domain provided: ${domain}. Manual confirmation still required.`,
        }
      : {
          label: "Company website",
          status: "missing",
          detail: "No usable company website was supplied, so the employer cannot be looked up.",
        },
  );

  const email = (d?.companyEmail ?? "").toLowerCase();
  if (!email) {
    indicators.push({
      label: "Company contact email",
      status: "missing",
      detail: "No official contact email provided for verification correspondence.",
    });
  } else if (FREE_MAIL.some((f) => email.includes(f))) {
    indicators.push({
      label: "Company contact email",
      status: "attention",
      detail: `${email} is a free personal mail provider, not a company domain. Ask for a domain email.`,
    });
  } else if (domain && !email.endsWith(domain)) {
    indicators.push({
      label: "Company contact email",
      status: "attention",
      detail: `Email domain does not match the stated website (${domain}).`,
    });
  } else {
    indicators.push({
      label: "Company contact email",
      status: "ok",
      detail: `Email domain aligns with the stated website (${domain}).`,
    });
  }

  indicators.push(
    d?.companyContactPhone
      ? { label: "Contact person", status: "ok", detail: `${d.companyContactName} · ${d.companyContactPhone}` }
      : { label: "Contact person", status: "missing", detail: "No named contact and phone number to reach out to." },
  );

  indicators.push(
    d?.companyAddress
      ? { label: "Company address", status: "ok", detail: d.companyAddress }
      : { label: "Company address", status: "attention", detail: "No physical address supplied." },
  );

  indicators.push(
    internship.location
      ? {
          label: "Internship location & mode",
          status: "ok",
          detail: `${internship.location} · ${internship.workMode}`,
        }
      : {
          label: "Internship location & mode",
          status: "missing",
          detail: "Location is mandatory for institutional monitoring.",
        },
  );

  if (internship.durationMonths < 1) {
    indicators.push({
      label: "Duration",
      status: "attention",
      detail: "Duration under a month rarely satisfies credit requirements.",
    });
  } else {
    indicators.push({
      label: "Duration",
      status: "ok",
      detail: `${internship.durationMonths} months · ${internship.startDate} to ${internship.endDate}`,
    });
  }

  if (internship.stipend === 0) {
    indicators.push({
      label: "Stipend",
      status: "attention",
      detail: "Unpaid internship. Not disqualifying, but confirm no fee is being charged.",
    });
  } else if (internship.stipend > 90000) {
    indicators.push({
      label: "Stipend",
      status: "attention",
      detail: "Stipend is unusually high for an intern role — worth confirming with the employer.",
    });
  } else {
    indicators.push({
      label: "Stipend",
      status: "ok",
      detail: `₹${internship.stipend.toLocaleString("en-IN")} per month as declared.`,
    });
  }

  const present = new Set(internship.evidence.map((e) => e.type));
  const hasOffer = present.has("Offer letter");
  indicators.push(
    hasOffer
      ? { label: "Offer letter", status: "ok", detail: "Offer document is on file for review." }
      : { label: "Offer letter", status: "missing", detail: "No offer or selection evidence uploaded yet." },
  );

  const missingEvidence = REQUIRED_EVIDENCE.filter((t) => !present.has(t));
  indicators.push({
    label: "Evidence trail",
    status: missingEvidence.length === 0 ? "ok" : missingEvidence.length > 3 ? "missing" : "attention",
    detail:
      missingEvidence.length === 0
        ? "All required evidence types are present."
        : `Still missing: ${missingEvidence.join(", ")}.`,
  });

  const ok = indicators.filter((i) => i.status === "ok").length;
  const attentionCount = indicators.filter((i) => i.status !== "ok").length;

  return {
    completeness: Math.round((ok / indicators.length) * 100),
    attentionCount,
    indicators,
    summary:
      attentionCount === 0
        ? "All declared information is present and internally consistent. Ready for T&P decision."
        : `${attentionCount} item${attentionCount > 1 ? "s" : ""} need attention before this submission can be approved.`,
    disclaimer:
      "This is an automated completeness and consistency check on student-declared information. It is not proof that the company or offer is genuine. Institutional verification is recorded only when the T&P cell acts on this record.",
  };
}
