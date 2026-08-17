/**
 * CareerPilot AI Engine - Enforces System Prompt instructions & AI Simulations
 */

export const SYSTEM_PROMPT = `# ROLE AND IDENTITY
You are "Ask Gemini," an advanced AI assistant powered by Google Gemini 2.5 Flash. Your role is to provide clear, helpful, accurate, and concise answers to user queries across coding, creative writing, analysis, and general tasks.

# CORE OPERATING PRINCIPLES
1. Direct Communication: Answer the user's main request immediately in the first 1–2 sentences. Do not use generic filler openings (e.g., "Sure, I can help with that!", "Here is the response:").
2. Tone & Style: Warm, intelligent, objective, and professional. Adapt your depth according to the complexity of the query.
3. Clarity First: Format complex data, comparisons, or step-by-step instructions using Markdown elements (tables, bullet points, code blocks) for high readability.

# FORMATTING INSTRUCTIONS
- Code: Always enclose code snippets in proper Markdown code blocks specifying the language (e.g., \`\`\`python, \`\`\`javascript).
- Structure: Use standalone bold text for subheadings. Keep paragraphs concise and scannable.
- Lists: Prefer bulleted lists over heavy textual blocks when listing features, steps, or components.

# CONSTRAINTS & BOUNDARIES
- Do not fabricate facts, API specifications, or code functions.
- If a query is ambiguous, briefly state your assumption before answering, or ask a single clarifying question.
- Always generate clean, production-ready code free of placeholder comments unless strictly necessary.`;

/**
 * Cover Letter Generator Engine
 */
export function generateCoverLetter({ jobTitle, companyName, applicantSkills, experience, education, tone = "Professional & Enthusiastic" }) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const skillsList = Array.isArray(applicantSkills) ? applicantSkills.join(", ") : applicantSkills;

  let bodyIntro = `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With a solid foundation in ${skillsList} and proven hands-on experience in software development, I am eager to contribute to ${companyName}'s innovative mission.`;

  if (tone.includes("Executive")) {
    bodyIntro = `It is with enthusiasm that I submit my application for the ${jobTitle} role at ${companyName}. Having led key initiatives in ${skillsList}, I am eager to leverage my background to drive measurable outcomes for your engineering organization.`;
  } else if (tone.includes("Direct")) {
    bodyIntro = `I am submitting my resume for the ${jobTitle} role at ${companyName}. Given my experience with ${skillsList}, I can make an immediate impact on your product roadmap.`;
  }

  return `[Your Name]
[Your Contact Information]
${dateStr}

Hiring Manager
${companyName}

Dear Hiring Manager,

${bodyIntro}

Throughout my career, I have focused on delivering high-quality, scalable solutions. ${experience ? `For instance, ${experience}` : 'In my recent endeavors, I have consistently improved performance, optimized codebase architectures, and collaborated cross-functionally to achieve strategic goals.'} My academic background in ${education || 'Computer Science'} provided me with analytical depth and problem-solving discipline.

What excites me most about ${companyName} is your commitment to engineering excellence and user-centered design. I am confident that my experience with ${skillsList} equips me to tackle key challenges on your team from day one.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set and passion align with the needs of ${companyName}.

Sincerely,

[Your Signature]
[Your Name]`;
}

/**
 * Interview Coach Questions Generator
 */
export function generateInterviewQuestions(role, industry, level) {
  return [
    {
      id: 1,
      category: "Behavioral",
      question: `Can you describe a challenging project in ${role} where you had to deal with tight deadlines or shifting requirements? How did you prioritize?`
    },
    {
      id: 2,
      category: "Technical / System Architecture",
      question: `How do you approach performance optimization and state management when building complex frontend or full-stack web applications for ${industry}?`
    },
    {
      id: 3,
      category: "Situational Leadership",
      question: `Describe a situation where you had a technical disagreement with a teammate or product manager regarding architecture. How was it resolved?`
    },
    {
      id: 4,
      category: "Domain Expertise",
      question: `What strategies do you use to ensure software quality, accessibility (WCAG), and robust unit testing during fast-paced deployment cycles?`
    }
  ];
}

/**
 * Evaluates candidate answer based on 5 metrics: Clarity, Confidence, Technical Accuracy, Communication, Professionalism.
 */
export function evaluateInterviewAnswer(questionText, userAnswer) {
  const length = userAnswer.trim().length;

  let clarity = Math.min(65 + Math.floor(length / 10), 95);
  let confidence = Math.min(70 + Math.floor(length / 12), 92);
  let techAccuracy = userAnswer.toLowerCase().includes("react") || userAnswer.toLowerCase().includes("test") || userAnswer.toLowerCase().includes("optimize") ? 88 : 74;
  let communication = Math.min(68 + Math.floor(length / 8), 94);
  let professionalism = 90;

  if (length < 30) {
    clarity = 50;
    confidence = 45;
    techAccuracy = 55;
    communication = 50;
  }

  const overallScore = Math.round((clarity + confidence + techAccuracy + communication + professionalism) / 5);

  const keyFeedback = [];
  if (userAnswer.toLowerCase().includes("because") || userAnswer.toLowerCase().includes("result")) {
    keyFeedback.push("Great use of the STAR method (Situation, Task, Action, Result) to contextualize your achievements.");
  } else {
    keyFeedback.push("Try using the STAR format: explicitly mention the Situation, Task, Action you took, and the quantifiable Result.");
  }

  if (length > 150) {
    keyFeedback.push("Strong answer depth! Your explanation demonstrates hands-on domain experience.");
  } else {
    keyFeedback.push("Consider expanding your answer with a specific real-world example from your previous employment or projects.");
  }

  return {
    overallScore,
    metrics: {
      Clarity: clarity,
      Confidence: confidence,
      "Technical Accuracy": techAccuracy,
      Communication: communication,
      Professionalism: professionalism
    },
    strengths: [
      "Structured and polite tone",
      "Relevant industry jargon used appropriately"
    ],
    improvements: keyFeedback
  };
}

/**
 * Career Advisor Roadmap & Skill Gap Engine
 */
export function generateCareerAdvice(currentSkills, targetRole) {
  const suggestedSkills = [
    { name: "Next.js & Server Components", impact: "High Demand", trend: "+38% jobs" },
    { name: "System Design & Micro-frontends", impact: "Critical for Senior Roles", trend: "+25% salary boost" },
    { name: "GraphQL & Schema Stitching", impact: "Moderate", trend: "Modern API standard" },
    { name: "Web Performance & Core Web Vitals", impact: "Essential", trend: "High priority for SaaS" }
  ];

  const roadmapMilestones = [
    {
      phase: "Phase 1: Advanced Frontend Architecture",
      duration: "Weeks 1-3",
      action: "Master Next.js App Router, SSR/SSG caching strategies, and modern TypeScript utility types."
    },
    {
      phase: "Phase 2: Performance & Automated Testing",
      duration: "Weeks 4-6",
      action: "Build end-to-end test suites with Cypress/Playwright and optimize Lighthouse scores to 95+."
    },
    {
      phase: "Phase 3: High-Impact Portfolio Project",
      duration: "Weeks 7-9",
      action: "Construct an AI-augmented workflow dashboard (e.g. real-time telemetry or AI document editor) with live deployment."
    },
    {
      phase: "Phase 4: Targeted Interview Prep & System Design",
      duration: "Weeks 10-12",
      action: "Practice full-stack system design questions (caching, rate limiting, component architecture) using CareerPilot AI Mock Interviewer."
    }
  ];

  const recommendedCertifications = [
    "AWS Certified Developer – Associate",
    "Meta Advanced React Professional Certificate",
    "Certified Kubernetes Application Developer (CKAD)"
  ];

  return {
    targetRole,
    suggestedSkills,
    roadmapMilestones,
    recommendedCertifications
  };
}
