import { actionVerbsLibrary } from '../sampleData';

/**
 * Evaluates resume text against target job description or industry benchmark.
 */
export function analyzeResumeATS(resumeData, targetJdText = "") {
  // ── Guard: no resume built yet ────────────────────────────────────────────
  const hasContent =
    (resumeData.name  && resumeData.name.trim().length  > 0) ||
    (resumeData.email && resumeData.email.trim().length > 0) ||
    (resumeData.summary && resumeData.summary.trim().length > 0) ||
    (Array.isArray(resumeData.experience)     && resumeData.experience.length     > 0) ||
    (Array.isArray(resumeData.education)      && resumeData.education.length      > 0) ||
    (Array.isArray(resumeData.skills)         && resumeData.skills.length         > 0) ||
    (Array.isArray(resumeData.projects)       && resumeData.projects.length       > 0) ||
    (Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0);

  if (!hasContent) {
    return {
      score: 0,
      statusGrade: 'No Resume Built Yet',
      statusColor: '#4b5563',
      issues: [],
      suggestions: [],
      missingKeywords: [],
      strongKeywordsFound: [],
      verbCount: 0,
      metricsCount: 0,
      isEmpty: true,          // <-- dashboard can key off this flag
    };
  }
  // ─────────────────────────────────────────────────────────────────────────

  let score = 70; // Base score
  const issues = [];
  const suggestions = [];
  const missingKeywords = [];
  const strongKeywordsFound = [];

  const fullText = JSON.stringify(resumeData).toLowerCase();

  // 1. Check Contact Details & Basics
  if (resumeData.name && resumeData.email && resumeData.phone) {
    score += 5;
  } else {
    issues.push("Missing core contact info (Email, Phone, or Name)");
    suggestions.push("Ensure your name, professional email, and phone number are clearly listed at the top.");
  }

  // 2. Summary Analysis
  if (!resumeData.summary || resumeData.summary.length < 50) {
    issues.push("Summary statement is too brief or missing");
    suggestions.push("Write a concise 2–3 sentence professional summary emphasizing your years of experience, core tech stack, and key metric achievements.");
  } else {
    score += 5;
  }

  // 3. Action Verbs Check
  const allActionVerbs = Object.values(actionVerbsLibrary).flat().map(v => v.toLowerCase());
  let verbCount = 0;
  allActionVerbs.forEach(verb => {
    if (fullText.includes(verb)) verbCount++;
  });

  if (verbCount < 4) {
    issues.push("Weak action verbs detected in work experience highlights");
    suggestions.push("Replace passive verbs (like 'worked on', 'responsible for') with powerful impact verbs such as 'Spearheaded', 'Engineered', 'Architected', or 'Optimized'.");
  } else {
    score += 8;
  }

  // 4. Metrics & Quantified Accomplishments
  const metricRegex = /\b(\d+%\b|\$\d+|\b\d+\s*users|\b\d+\s*x|\b\d+\s*ms|\b\d+\s*hrs)\b/gi;
  const metricsFound = fullText.match(metricRegex) || [];
  if (metricsFound.length < 2) {
    issues.push("Few or no quantified metric achievements found");
    suggestions.push("Add concrete numbers, percentages, or time savings to your bullet points (e.g., 'Reduced API latency by 35%').");
  } else {
    score += 7;
  }

  // 5. Keyword Matching if target JD provided
  if (targetJdText && targetJdText.trim().length > 20) {
    const commonTechKeywords = [
      "react", "typescript", "javascript", "node.js", "next.js", "python",
      "graphql", "aws", "docker", "kubernetes", "jest", "cypress",
      "rest api", "ci/cd", "agile", "sql", "postgresql", "tailwind",
      "accessibility", "performance", "state management", "microservices"
    ];

    const jdLower = targetJdText.toLowerCase();

    commonTechKeywords.forEach(kw => {
      if (jdLower.includes(kw)) {
        if (fullText.includes(kw)) {
          strongKeywordsFound.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      }
    });

    if (missingKeywords.length > 0) {
      const kwPenalty = Math.min(missingKeywords.length * 3, 20);
      score -= kwPenalty;
      issues.push(`${missingKeywords.length} high-priority job keywords are missing from your resume`);
      suggestions.push(`Integrate these keywords into your skills or experience bullets: ${missingKeywords.slice(0, 5).join(", ")}`);
    } else {
      score += 10;
    }
  } else {
    // Standard industry keyword fallback check
    const standardKeywords = ["typescript", "react", "testing", "performance", "api", "git"];
    standardKeywords.forEach(kw => {
      if (fullText.includes(kw)) strongKeywordsFound.push(kw);
      else missingKeywords.push(kw);
    });
  }

  // 6. Formatting & Readability
  if (fullText.includes("table") || fullText.includes("<graphics>") || fullText.includes("columns")) {
    issues.push("Complex formatting elements (tables, graphic shapes) may confuse ATS parsers");
    suggestions.push("Use clean single-column or straightforward 2-column layouts without nested tables or background images.");
  } else {
    score += 5;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(Math.max(score, 35), 98);

  let statusGrade = "Needs Improvement";
  let statusColor = "#f59e0b"; // yellow/orange
  if (finalScore >= 85) {
    statusGrade = "Excellent ATS Optimization";
    statusColor = "#10b981"; // green
  } else if (finalScore >= 70) {
    statusGrade = "Good (Ready for submission with minor edits)";
    statusColor = "#3b82f6"; // blue
  }

  return {
    score: finalScore,
    statusGrade,
    statusColor,
    issues,
    suggestions,
    missingKeywords,
    strongKeywordsFound,
    verbCount,
    metricsCount: metricsFound.length
  };
}
