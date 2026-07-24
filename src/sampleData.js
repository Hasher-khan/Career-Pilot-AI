export const sampleUserData = {
  name: "Alex Morgan",
  title: "Full Stack Software Engineer",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  targetRole: "Senior Frontend Engineer / Full Stack Lead",
  targetIndustry: "Technology / SaaS",
  experienceLevel: "Mid-Senior (4+ Years)",
  currentAtsScore: 78,
  readinessIndex: 85,
  summary: "Results-driven Software Engineer with 4 years of experience building scalable web applications using React, Node.js, and TypeScript. Reduced web application load time by 42% and implemented CI/CD pipelines that accelerated deployment cycles.",
  skills: [
    "React.js", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS",
    "REST APIs", "Jest & Cypress", "Docker", "Git / GitHub", "Web Performance Optimization"
  ],
  experience: [
    {
      id: 1,
      role: "Software Engineer",
      company: "CloudScale Tech",
      period: "2022 - Present",
      location: "San Francisco, CA",
      highlights: [
        "Architected micro-frontend dashboards serving 150k daily active users with 99.9% uptime.",
        "Engineered real-time data streaming features using WebSockets and React Query, improving UI refresh rates by 60%.",
        "Collaborated with product designers to establish a reusable component library, cutting sprint execution time by 25%."
      ]
    },
    {
      id: 2,
      role: "Frontend Developer",
      company: "Apex Digital Solutions",
      period: "2020 - 2022",
      location: "San Jose, CA",
      highlights: [
        "Developed responsive web interfaces across 12 SaaS client applications.",
        "Refactored legacy JavaScript codebase into TypeScript, reducing runtime production bugs by 35%.",
        "Optimized web page assets and bundles, boosting Lighthouse performance scores from 64 to 96."
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      year: "2016 - 2020",
      gpa: "3.8/4.0"
    }
  ],
  projects: [
    {
      id: 1,
      name: "DevHub Analytics Dashboard",
      tech: "React, Node.js, PostgreSQL, Recharts",
      description: "An open-source performance analytics platform for developer teams with automated GitHub API integrations."
    }
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "Meta Front-End Developer Professional Certificate"
  ]
};

export const actionVerbsLibrary = {
  Leadership: ["Spearheaded", "Architected", "Orchestrated", "Directed", "Pioneered", "Championed", "Guided", "Supervised"],
  Technical: ["Engineered", "Implemented", "Refactored", "Optimized", "Deployed", "Automated", "Integrated", "Debugged"],
  Achievement: ["Accelerated", "Boosted", "Maximised", "Generated", "Outperformed", "Surpassed", "Decreased", "Expanded"],
  Collaborative: ["Partnered", "Fostered", "Negotiated", "Coordinated", "Cross-functionally led", "Mentored"]
};

export const sampleJobDescriptions = [
  {
    id: "jd1",
    title: "Senior React / Frontend Engineer",
    company: "Veloce Systems",
    location: "Remote / New York",
    description: `We are looking for a Senior Frontend Engineer proficient in React, TypeScript, Redux Toolkit, and performance optimization. 
Required Qualifications:
- 4+ years of professional React and Web UI experience.
- Strong mastery of TypeScript, State Management, and Next.js.
- Experience with Unit testing (Jest, React Testing Library), CI/CD pipelines, and AWS cloud deployment.
- Track record of improving Core Web Vitals and Web Accessibility (WCAG 2.1 compliance).
- Excellent cross-functional communication and agile sprint leadership.`
  },
  {
    id: "jd2",
    title: "Full Stack Software Developer",
    company: "InnovateAI Labs",
    location: "San Francisco, CA",
    description: `Join InnovateAI to build high-concurrency AI analytics platforms!
Requirements:
- Deep expertise in Node.js, Express, Python, and React.
- Solid background with PostgreSQL, Redis caching, and GraphQL endpoints.
- Familiarity with AI API integrations (OpenAI, Gemini), Docker containerization, and Kubernetes.
- Experience writing clean, modular code with TDD practices.`
  }
];
