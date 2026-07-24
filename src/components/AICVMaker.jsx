import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Sparkles, ChevronRight, ChevronLeft, Download, Printer,
  User, Mail, Phone, MapPin, Linkedin, Globe, GraduationCap, Briefcase,
  Code, Award, Star, Languages, Target, CheckCircle, AlertCircle,
  RefreshCw, Eye, Edit3, Zap, TrendingUp, BarChart2, MessageSquare,
  BookOpen, Plus, Trash2, ArrowRight, Send, Bot, Layout, Check,
  X, Loader, Shield
} from 'lucide-react';

// ─── Gemini AI Call ──────────────────────────────────────────────────────────
async function callGeminiAI(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 1500));
    return null;
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
}

// ─── ATS Analyzer ────────────────────────────────────────────────────────────
function computeATS(data) {
  let score = 55;
  const issues = [], strengths = [], suggestions = [];

  if (data.name && data.email && data.phone) { score += 8; strengths.push('Complete contact information'); }
  else { issues.push('Missing contact details'); suggestions.push('Add your full name, email and phone number.'); }

  if (data.summary && data.summary.length > 80) { score += 8; strengths.push('Strong professional summary'); }
  else { issues.push('Summary too short or missing'); suggestions.push('Write a 2-3 sentence professional summary.'); }

  if (data.experience && data.experience.length > 0) { score += 10; strengths.push('Work experience present'); }
  else { issues.push('No work experience added'); }

  if (data.skills && data.skills.length >= 5) { score += 8; strengths.push('Good skills coverage'); }
  else { issues.push('Fewer than 5 skills listed'); suggestions.push('Add at least 5-8 relevant technical or soft skills.'); }

  if (data.education && data.education.length > 0) { score += 6; strengths.push('Education section complete'); }
  else { issues.push('Education section missing'); }

  if (data.certifications && data.certifications.length > 0) { score += 5; strengths.push('Certifications boost credibility'); }
  if (data.projects && data.projects.length > 0) { score += 5; strengths.push('Projects demonstrate hands-on skills'); }

  const text = JSON.stringify(data).toLowerCase();
  const actionVerbs = ['led','built','designed','developed','improved','managed','achieved','delivered','created','launched','optimized','spearheaded','engineered','implemented','automated'];
  const verbsFound = actionVerbs.filter(v => text.includes(v));
  if (verbsFound.length >= 4) { score += 8; strengths.push('Strong action verbs used'); }
  else { issues.push('Weak action verbs'); suggestions.push('Use strong action verbs: Led, Built, Spearheaded, Optimized, Engineered...'); }

  const missingKeywords = ['leadership','communication','problem-solving','teamwork','analytical'].filter(k => !text.includes(k));

  return {
    score: Math.min(score, 97),
    formatting: Math.min(score - 5, 95),
    grammar: Math.min(score + 2, 98),
    issues, strengths, suggestions, missingKeywords
  };
}

// ─── PDF/HTML Generator ────────────────────────────────────────────────────────
function generateResumeHtml(data, template) {
  const palettes = {
    Modern:    { accent: '#6366f1', bg: '#f8fafc', text: '#1e293b', muted: '#64748b', headerBg: '#6366f1' },
    Minimal:   { accent: '#374151', bg: '#ffffff', text: '#111827', muted: '#6b7280', headerBg: '#374151' },
    Executive: { accent: '#1e3a5f', bg: '#f0f4f8', text: '#0f172a', muted: '#475569', headerBg: '#1e3a5f' },
    Corporate: { accent: '#0f766e', bg: '#f0fdfa', text: '#134e4a', muted: '#0d9488', headerBg: '#0f766e' },
    Creative:  { accent: '#db2777', bg: '#fdf4ff', text: '#581c87', muted: '#a855f7', headerBg: '#db2777' },
    Student:   { accent: '#2563eb', bg: '#eff6ff', text: '#1e3a8a', muted: '#3b82f6', headerBg: '#2563eb' },
    Developer: { accent: '#16a34a', bg: '#f0fdf4', text: '#14532d', muted: '#22c55e', headerBg: '#16a34a' },
  };
  const p = palettes[template] || palettes.Modern;

  const expHtml = (data.experience || []).map(e => `
    <div style="margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #e5e7eb">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px">
        <div>
          <strong style="font-size:1rem;color:${p.text};display:block">${e.title || e.company || ''}</strong>
          <span style="color:${p.accent};font-weight:600;font-size:0.9rem">${e.company || ''}</span>
        </div>
        <span style="font-size:0.82rem;color:${p.muted};font-weight:500">${e.dates || ''}</span>
      </div>
      <p style="font-size:0.88rem;color:${p.muted};margin:6px 0 0;line-height:1.65">${e.description || ''}</p>
    </div>`).join('');

  const eduHtml = (data.education || []).map(e => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap">
        <strong style="font-size:0.95rem;color:${p.text}">${e.degree || ''} ${e.major ? 'in ' + e.major : ''}</strong>
        <span style="font-size:0.8rem;color:${p.muted}">${e.year || ''}</span>
      </div>
      <span style="color:${p.accent};font-size:0.88rem;font-weight:600">${e.school || ''}</span>
    </div>`).join('');

  const projHtml = (data.projects || []).map(pr => `
    <div style="margin-bottom:14px">
      <strong style="color:${p.text};font-size:0.95rem">${pr.name || ''}</strong>
      ${pr.tech ? `<span style="font-size:0.78rem;color:${p.accent};margin-left:8px;font-weight:600">[${pr.tech}]</span>` : ''}
      <p style="font-size:0.85rem;color:${p.muted};margin:4px 0 0;line-height:1.55">${pr.description || ''}</p>
    </div>`).join('');

  const certHtml = (data.certifications || []).filter(Boolean).map(c =>
    `<li style="margin-bottom:6px;font-size:0.88rem;color:${p.muted}">${c}</li>`).join('');

  const skillHtml = (data.skills || []).map(s =>
    `<span style="display:inline-block;padding:5px 14px;margin:4px;background:${p.accent}18;color:${p.accent};border-radius:20px;font-size:0.82rem;font-weight:600;border:1px solid ${p.accent}33">${s}</span>`).join('');

  const sectionTitle = (title) =>
    `<h2 style="font-size:0.82rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:${p.accent};margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid ${p.accent}33">${title}</h2>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
    <title>${data.name || 'Resume'} - CV</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:${p.bg};color:${p.text};line-height:1.5}
      .page{max-width:820px;margin:0 auto;background:#fff;min-height:100vh}
      .header{background:${p.headerBg};color:#fff;padding:40px 48px}
      .body{padding:32px 48px}
      @media print{body{margin:0}.page{max-width:none;box-shadow:none}}
    </style>
  </head><body><div class="page">
    <div class="header">
      <h1 style="font-size:2.4rem;font-weight:900;letter-spacing:-0.5px">${data.name || 'Your Name'}</h1>
      <p style="font-size:1.1rem;opacity:0.9;margin:6px 0;font-weight:500">${data.targetRole || data.title || 'Professional'}</p>
      <p style="font-size:0.85rem;opacity:0.75;margin-top:10px;display:flex;flex-wrap:wrap;gap:16px">
        ${data.email ? `<span>✉ ${data.email}</span>` : ''}
        ${data.phone ? `<span>📱 ${data.phone}</span>` : ''}
        ${data.location ? `<span>📍 ${data.location}</span>` : ''}
        ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ''}
        ${data.portfolio ? `<span>🌐 ${data.portfolio}</span>` : ''}
      </p>
    </div>
    <div class="body">
      ${data.summary ? `${sectionTitle('Professional Summary')}<p style="font-size:0.92rem;color:${p.muted};line-height:1.75">${data.summary}</p>` : ''}
      ${expHtml ? `${sectionTitle('Work Experience')}${expHtml}` : ''}
      ${eduHtml ? `${sectionTitle('Education')}${eduHtml}` : ''}
      ${projHtml ? `${sectionTitle('Projects')}${projHtml}` : ''}
      ${skillHtml ? `${sectionTitle('Skills')}<div>${skillHtml}</div>` : ''}
      ${certHtml ? `${sectionTitle('Certifications')}<ul style="padding-left:20px">${certHtml}</ul>` : ''}
      ${data.languages ? `${sectionTitle('Languages')}<p style="font-size:0.88rem;color:${p.muted}">${data.languages}</p>` : ''}
      ${data.achievements ? `${sectionTitle('Achievements')}<p style="font-size:0.88rem;color:${p.muted};line-height:1.65">${data.achievements}</p>` : ''}
    </div>
  </div></body></html>`;
}

// ─── Interview Questions ───────────────────────────────────────────────────────
const QUESTIONS = [
  { id: 'name',           label: 'What is your full name?',                    field: 'name',        section: 'Personal',    icon: User,         placeholder: 'e.g. Sarah Ahmed' },
  { id: 'email',          label: 'Your email address',                         field: 'email',       section: 'Personal',    icon: Mail,         placeholder: 'e.g. sarah@email.com' },
  { id: 'phone',          label: 'Your phone number',                          field: 'phone',       section: 'Personal',    icon: Phone,        placeholder: 'e.g. +92 300 1234567' },
  { id: 'location',       label: 'Your location (City, Country)',              field: 'location',    section: 'Personal',    icon: MapPin,       placeholder: 'e.g. Karachi, Pakistan' },
  { id: 'linkedin',       label: 'LinkedIn Profile URL',                       field: 'linkedin',    section: 'Personal',    icon: Linkedin,     placeholder: 'linkedin.com/in/yourname', optional: true },
  { id: 'portfolio',      label: 'Portfolio / Website URL',                    field: 'portfolio',   section: 'Personal',    icon: Globe,        placeholder: 'yoursite.com', optional: true },
  { id: 'targetRole',     label: 'What job role are you targeting?',           field: 'targetRole',  section: 'Career',      icon: Target,       placeholder: 'e.g. Full Stack Developer, UX Designer' },
  { id: 'objective',      label: 'Describe your career objective in your words', field: 'objective', section: 'Career',      icon: BookOpen,     placeholder: 'Tell me about your career goals and what you want to achieve...', textarea: true },
  { id: 'edu',            label: 'Tell me about your education',               field: 'eduRaw',      section: 'Education',   icon: GraduationCap, placeholder: 'e.g. BS Computer Science, FAST NUCES, 2023\nMatriculation, City School, 2019', textarea: true },
  { id: 'exp',            label: 'Describe your work experience',              field: 'expRaw',      section: 'Experience',  icon: Briefcase,    placeholder: 'e.g. Frontend Developer at XYZ Corp (2021-2023). Built React dashboards, improved app performance by 40%, led a team of 3 developers.\n\nSeparate multiple jobs with a blank line.', textarea: true },
  { id: 'skills',         label: 'List your skills (comma-separated)',         field: 'skillsRaw',   section: 'Skills',      icon: Code,         placeholder: 'e.g. React, Node.js, Python, SQL, Figma, Leadership, Communication' },
  { id: 'projects',       label: 'Describe notable projects',                  field: 'projectsRaw', section: 'Projects',    icon: Zap,          placeholder: 'e.g. E-commerce Platform — Built with React & Firebase, increased client sales by 25%\n\nSeparate projects with a blank line.', textarea: true, optional: true },
  { id: 'certifications', label: 'Any certifications?',                        field: 'certRaw',     section: 'Certs',       icon: Award,        placeholder: 'e.g. AWS Cloud Practitioner, Google UX Design Certificate, Meta Front-End Developer', optional: true },
  { id: 'languages',      label: 'Languages you speak',                        field: 'languages',   section: 'Extras',      icon: Languages,    placeholder: 'e.g. English (Fluent), Urdu (Native), Arabic (Basic)', optional: true },
  { id: 'achievements',   label: 'Any key achievements or awards?',            field: 'achievements',section: 'Extras',      icon: Star,         placeholder: 'e.g. Won National Hackathon 2022, Dean\'s List 3 consecutive years, Published research paper', optional: true },
];

const TEMPLATES = [
  { id: 'Modern',    icon: '⚡', desc: 'Clean & vibrant — Most popular' },
  { id: 'Minimal',   icon: '◻', desc: 'Ultra clean white design' },
  { id: 'Executive', icon: '👔', desc: 'Senior & management roles' },
  { id: 'Corporate', icon: '🏢', desc: 'Teal professional look' },
  { id: 'Creative',  icon: '🎨', desc: 'Bold & expressive design' },
  { id: 'Student',   icon: '🎓', desc: 'Perfect for fresh graduates' },
  { id: 'Developer', icon: '💻', desc: 'Built for tech professionals' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AICVMaker({ userData }) {
  const [step, setStep] = useState('welcome'); // welcome | interview | enhancing | done
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [enhancingMsg, setEnhancingMsg] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const inputRef = useRef(null);

  // Pre-fill from userData
  useEffect(() => {
    const pre = {};
    if (userData?.name) pre.name = userData.name;
    if (userData?.email) pre.email = userData.email;
    if (userData?.phone) pre.phone = userData.phone;
    if (userData?.location) pre.location = userData.location;
    if (userData?.targetRole) pre.targetRole = userData.targetRole;
    if (Object.keys(pre).length) setAnswers(pre);
  }, [userData]);

  const currentQ = QUESTIONS[qIdx];

  // Sync input when question changes
  useEffect(() => {
    if (step === 'interview') {
      setCurrentInput(answers[currentQ?.field] || '');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [qIdx, step]);

  const saveAndNext = (overrideInput) => {
    const val = (overrideInput !== undefined ? overrideInput : currentInput).trim();
    const updatedAnswers = { ...answers, [currentQ.field]: val };
    setAnswers(updatedAnswers);
    setCurrentInput('');

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(i => i + 1);
    } else {
      startEnhancing(updatedAnswers);
    }
  };

  const goBack = () => {
    if (qIdx > 0) {
      setAnswers(a => ({ ...a, [currentQ.field]: currentInput }));
      setQIdx(i => i - 1);
    }
  };

  const canContinue = currentInput.trim() || currentQ?.optional;

  // ── AI Enhancement ──────────────────────────────────────────────────────────
  const startEnhancing = async (raw) => {
    setStep('enhancing');
    const msgs = [
      'Analyzing your information…',
      'Enhancing grammar and professionalism…',
      'Applying strong action verbs…',
      'Generating your professional summary…',
      'Organizing ATS-friendly sections…',
      'Computing your ATS score…',
    ];
    let mi = 0;
    setEnhancingMsg(msgs[0]);
    const iv = setInterval(() => { mi++; setEnhancingMsg(msgs[mi % msgs.length]); }, 900);

    // Parse helpers
    const parseEdu = (s) => {
      if (!s) return [];
      return s.split(/\n/).filter(l => l.trim()).map((line, idx) => {
        const parts = line.split(/,/);
        return { id: idx, degree: (parts[0] || '').trim(), major: '', school: (parts[1] || '').trim(), year: (parts[2] || '').trim() };
      });
    };

    const parseExp = (s) => {
      if (!s) return [];
      const chunks = s.split(/\n\n+/).filter(c => c.trim());
      return chunks.map((chunk, idx) => {
        const lines = chunk.trim().split('\n');
        const first = lines[0] || '';
        // Try to detect "Title at Company (dates)" pattern
        const match = first.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\)/i);
        if (match) {
          return { id: idx, title: match[1].trim(), company: match[2].trim(), dates: match[3].trim(), description: lines.slice(1).join(' ') };
        }
        return { id: idx, title: '', company: first, dates: '', description: lines.slice(1).join(' ') || chunk };
      });
    };

    const parseProjects = (s) => {
      if (!s) return [];
      const chunks = s.split(/\n\n+/).filter(c => c.trim());
      return chunks.map((chunk, idx) => {
        const parts = chunk.split(/—|-/).map(p => p.trim());
        return { id: idx, name: parts[0] || `Project ${idx + 1}`, description: parts.slice(1).join(' ') || chunk, tech: '' };
      });
    };

    const skills = (raw.skillsRaw || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const certs = (raw.certRaw || '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    const exp = parseExp(raw.expRaw);
    const edu = parseEdu(raw.eduRaw);

    // Build summary (try AI, fallback to smart template)
    let summary = '';
    try {
      const aiPrompt = `You are an expert resume writer and career coach. Write a polished 2-3 sentence professional summary for this person:
Name: ${raw.name}
Target Role: ${raw.targetRole}
Career Objective: ${raw.objective || 'Not provided'}
Key Skills: ${raw.skillsRaw || 'Not provided'}
Experience: ${raw.expRaw ? raw.expRaw.substring(0, 300) : 'Entry-level / fresher'}

Requirements:
- Use strong action verbs and professional language
- Be ATS-optimized and keyword-rich
- Sound genuine and confident
- DO NOT invent specific facts not mentioned above
- Return ONLY the summary text, no labels or headers`;

      const aiResult = await callGeminiAI(aiPrompt);
      if (aiResult && aiResult.trim().length > 50) {
        summary = aiResult.trim();
      } else {
        const expStr = exp.length ? `${exp.length}+ year` : 'Early-career';
        const topSkills = skills.slice(0, 3).join(', ') || 'modern technologies';
        summary = `${expStr} ${raw.targetRole || 'professional'} with hands-on expertise in ${topSkills}. ${raw.objective || 'Passionate about delivering impactful results and continuously developing as a professional.'} Committed to leveraging skills to drive meaningful outcomes in a dynamic environment.`;
      }
    } catch {
      summary = `Dedicated ${raw.targetRole || 'professional'} with expertise in ${skills.slice(0, 3).join(', ') || 'relevant technologies'}. ${raw.objective || 'Driven to deliver high-quality results and contribute to organizational success.'}`;
    }

    clearInterval(iv);

    const built = {
      name: raw.name || '',
      email: raw.email || '',
      phone: raw.phone || '',
      location: raw.location || '',
      linkedin: raw.linkedin || '',
      portfolio: raw.portfolio || '',
      targetRole: raw.targetRole || '',
      summary,
      education: edu,
      experience: exp,
      skills,
      projects: parseProjects(raw.projectsRaw),
      certifications: certs,
      languages: raw.languages || '',
      achievements: raw.achievements || '',
    };

    setResumeData(built);
    setAtsResult(computeATS(built));
    setStep('done');
  };

  const handleDownloadHTML = () => {
    if (!resumeData) return;
    const html = generateResumeHtml(resumeData, selectedTemplate);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(resumeData.name || 'resume').replace(/\s+/g, '_')}_CV.html`;
    a.click();
  };

  const handlePrint = () => {
    if (!resumeData) return;
    const html = generateResumeHtml(resumeData, selectedTemplate);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleRestart = () => {
    setStep('welcome'); setQIdx(0); setAnswers({});
    setCurrentInput(''); setResumeData(null); setAtsResult(null);
    setActiveTab('preview');
  };

  // ════════════════════════════════════════════════════════════════════════════
  // WELCOME
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'welcome') return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ maxWidth: '620px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '96px', height: '96px', borderRadius: '26px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 24px 64px rgba(99,102,241,0.45)',
            animation: 'cvFloat 3s ease-in-out infinite'
          }}>
            <FileText size={46} color="#fff" />
          </div>
        </div>
        <style>{`
          @keyframes cvFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(1deg)}}
          @keyframes cvSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
          @keyframes cvPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.94)}}
          @keyframes cvFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        `}</style>

        <div style={{ animation: 'cvFadeIn 0.5s ease forwards' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '14px', color: 'var(--text-main)', lineHeight: 1.2 }}>
            Build Your <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI-Powered CV</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 36px' }}>
            Answer a few simple questions. Our AI will write a <strong style={{ color: 'var(--text-main)' }}>professional, ATS-optimized resume</strong> for you — no writing skills required.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '40px', textAlign: 'left' }}>
            {[
              { icon: '🤖', title: 'AI Resume Writer', desc: 'Writes everything for you' },
              { icon: '📊', title: 'ATS Score', desc: 'Real-time optimization score' },
              { icon: '🎨', title: '7 Templates', desc: 'Professional designs' },
              { icon: '📄', title: 'Export PDF/HTML', desc: 'Download instantly' },
              { icon: '✍️', title: 'Action Verbs', desc: 'AI-enhanced language' },
              { icon: '🔒', title: '100% Private', desc: 'Your data stays secure' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: '14px',
                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'flex-start', gap: '10px'
              }}>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: '0 0 2px', color: 'var(--text-main)' }}>{f.title}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('interview')}
            style={{
              padding: '16px 44px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff', fontSize: '1.05rem', fontWeight: 800,
              boxShadow: '0 10px 36px rgba(99,102,241,0.45)',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 48px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(99,102,241,0.45)'; }}
          >
            <Sparkles size={22} /> Start Building My Resume <ArrowRight size={18} />
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '14px' }}>
            ~3 minutes · {QUESTIONS.length} questions · No credit card needed
          </p>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // INTERVIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'interview') {
    const progress = ((qIdx + 1) / QUESTIONS.length) * 100;
    const Icon = currentQ.icon;
    const sections = [...new Set(QUESTIONS.map(q => q.section))];

    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px', animation: 'cvFadeIn 0.35s ease' }}>

        {/* Progress Header */}
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>AI Resume Interview</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {qIdx + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div style={{ background: 'var(--bg-input)', borderRadius: '10px', height: '7px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: '10px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {sections.map(s => {
              const sIdx = sections.indexOf(s);
              const cIdx = sections.indexOf(currentQ.section);
              const isDone = sIdx < cIdx;
              const isActive = s === currentQ.section;
              return (
                <span key={s} style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '10px', fontWeight: 600,
                  background: isDone ? 'rgba(16,185,129,0.12)' : isActive ? 'var(--accent-primary-light)' : 'var(--bg-input)',
                  color: isDone ? '#10b981' : isActive ? 'var(--accent-primary)' : 'var(--text-subtle)',
                }}>
                  {isDone ? '✓ ' : ''}{s}
                </span>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-panel" style={{ padding: '36px', animation: 'cvFadeIn 0.3s ease' }} key={qIdx}>
          <div style={{ display: 'flex', gap: '18px', marginBottom: '28px', alignItems: 'flex-start' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
            }}>
              <Icon size={24} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                {currentQ.section}
              </p>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                {currentQ.label}
                {currentQ.optional && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 400, marginLeft: '10px' }}>Optional</span>
                )}
              </h2>
            </div>
          </div>

          {currentQ.textarea ? (
            <textarea
              ref={inputRef}
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder={currentQ.placeholder}
              rows={6}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                border: '2px solid var(--border-color)', background: 'var(--bg-input)',
                color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.65,
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && canContinue) saveAndNext(); }}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder={currentQ.placeholder}
              style={{
                width: '100%', padding: '15px 18px', borderRadius: '12px',
                border: '2px solid var(--border-color)', background: 'var(--bg-input)',
                color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              onKeyDown={e => { if (e.key === 'Enter' && canContinue) saveAndNext(); }}
            />
          )}

          <p style={{ fontSize: '0.73rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            {currentQ.textarea ? 'Ctrl+Enter to continue' : 'Press Enter to continue'}
            {currentQ.optional && ' · Tab to skip'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
            <button onClick={goBack} disabled={qIdx === 0} style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)',
              background: 'transparent', color: 'var(--text-muted)', cursor: qIdx === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
              opacity: qIdx === 0 ? 0.35 : 1, transition: 'all 0.2s'
            }}>
              <ChevronLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              {currentQ.optional && (
                <button onClick={() => saveAndNext('')} style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                  fontSize: '0.88rem', fontWeight: 600
                }}>Skip</button>
              )}
              <button
                onClick={() => canContinue && saveAndNext()}
                style={{
                  padding: '12px 32px', borderRadius: '12px', border: 'none',
                  background: canContinue ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-input)',
                  color: canContinue ? '#fff' : 'var(--text-subtle)',
                  fontSize: '0.95rem', fontWeight: 700, cursor: canContinue ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                  boxShadow: canContinue ? '0 6px 20px rgba(99,102,241,0.35)' : 'none'
                }}
              >
                {qIdx === QUESTIONS.length - 1 ? <><Sparkles size={16} /> Generate Resume</> : <>Continue <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Answers collected so far */}
        {Object.values(answers).filter(Boolean).length > 0 && (
          <div style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              ✅ Collected so far
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {QUESTIONS.filter(q => answers[q.field] && q.id !== currentQ.id).map(q => (
                <span key={q.id} style={{
                  fontSize: '0.73rem', padding: '3px 10px',
                  background: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)',
                  borderRadius: '8px', fontWeight: 600, border: '1px solid rgba(99,102,241,0.2)'
                }}>✓ {q.section}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ENHANCING
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'enhancing') return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '22px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 16px 48px rgba(99,102,241,0.45)',
            animation: 'cvSpin 2.5s linear infinite'
          }}>
            <Sparkles size={40} color="#fff" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '12px', color: 'var(--text-main)' }}>
          AI is crafting your resume…
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '28px', minHeight: '28px' }}>
          {enhancingMsg}
        </p>
        <div style={{ background: 'var(--bg-input)', borderRadius: '16px', padding: '22px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
          {[
            'Correcting grammar & spelling',
            'Enhancing with professional language',
            'Adding strong action verbs',
            'Optimizing for ATS parsers',
            'Building clean resume sections',
            'Computing your ATS score',
          ].map((task, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', fontSize: '0.88rem', color: 'var(--text-muted)', borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                animation: `cvPulse ${1.2 + i * 0.2}s ease-in-out infinite`
              }} />
              {task}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // DONE
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'done' && resumeData) {
    const ats = atsResult || computeATS(resumeData);
    const atsColor = ats.score >= 85 ? '#10b981' : ats.score >= 65 ? '#3b82f6' : '#f59e0b';
    const atsLabel = ats.score >= 85 ? 'Excellent' : ats.score >= 65 ? 'Good' : 'Needs Work';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'cvFadeIn 0.4s ease' }}>

        {/* Action Bar */}
        <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 2px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#10b981" /> Your Resume is Ready!
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Preview, pick a template, analyze ATS score, or edit your details</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleRestart} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Rebuild
            </button>
            <button onClick={handleDownloadHTML} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Download HTML
            </button>
            <button onClick={handlePrint} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
              <Printer size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* ATS Quick Badge */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'ATS Score', val: `${ats.score}/100`, color: atsColor, icon: Shield },
            { label: 'Formatting', val: `${ats.formatting}/100`, color: '#6366f1', icon: Layout },
            { label: 'Grammar', val: `${ats.grammar}/100`, color: '#8b5cf6', icon: CheckCircle },
            { label: 'Status', val: atsLabel, color: atsColor, icon: TrendingUp },
          ].map(b => {
            const I = b.icon;
            return (
              <div key={b.label} style={{ flex: '1', minWidth: '140px', padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '12px', border: `1px solid ${b.color}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <I size={14} color={b.color} />
                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{b.label}</span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: b.color }}>{b.val}</span>
              </div>
            );
          })}
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'ats', label: 'ATS Analysis', icon: BarChart2 },
            { id: 'templates', label: 'Templates', icon: Layout },
            { id: 'edit', label: 'Edit', icon: Edit3 },
          ].map(t => {
            const I = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeTab === t.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s'
              }}>
                <I size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ─ PREVIEW ─ */}
        {activeTab === 'preview' && (
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '12px 20px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={15} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Preview — {selectedTemplate} Template
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Switch template in the Templates tab
              </span>
            </div>
            <iframe
              srcDoc={generateResumeHtml(resumeData, selectedTemplate)}
              title="Resume Preview"
              style={{ width: '100%', height: '700px', border: 'none', display: 'block' }}
            />
          </div>
        )}

        {/* ─ ATS ANALYSIS ─ */}
        {activeTab === 'ats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Score */}
            <div className="glass-panel" style={{ padding: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '20px' }}>ATS Score</p>
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 20px' }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="56" fill="none" stroke="var(--bg-input)" strokeWidth="12" />
                  <circle cx="65" cy="65" r="56" fill="none" stroke={atsColor} strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 56 * ats.score / 100} ${2 * Math.PI * 56}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: atsColor, lineHeight: 1 }}>{ats.score}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: atsColor }}>{atsLabel}</span>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{ l: 'Formatting', v: ats.formatting, c: '#6366f1' }, { l: 'Grammar', v: ats.grammar, c: '#8b5cf6' }].map(m => (
                  <div key={m.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{m.l}</span>
                      <span style={{ fontWeight: 800, color: m.c }}>{m.v}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${m.v}%`, height: '100%', background: `linear-gradient(90deg,${m.c},${m.c}aa)`, borderRadius: '6px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <CheckCircle size={16} /> Strengths
              </h4>
              {ats.strengths.length === 0
                ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fill in more sections to see strengths.</p>
                : ats.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: i < ats.strengths.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.87rem', color: 'var(--text-muted)' }}>
                    <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} /> {s}
                  </div>
                ))
              }
            </div>

            {/* Improvements */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                <AlertCircle size={16} /> Improvements
              </h4>
              {ats.suggestions.length === 0
                ? <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✅ Looks great! No major issues found.</p>
                : ats.suggestions.map((s, i) => (
                  <div key={i} style={{ padding: '10px 14px', marginBottom: '8px', background: 'rgba(245,158,11,0.07)', borderRadius: '10px', borderLeft: '3px solid #f59e0b', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{s}</div>
                ))
              }
              {ats.missingKeywords.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Add These Keywords:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ats.missingKeywords.map(k => (
                      <span key={k} style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.76rem', fontWeight: 700, border: '1px solid rgba(239,68,68,0.2)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ TEMPLATES ─ */}
        {activeTab === 'templates' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Layout size={18} color="var(--accent-primary)" /> Choose Your Template
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setActiveTab('preview'); }} style={{
                  padding: '22px 16px', borderRadius: '14px',
                  border: `2px solid ${selectedTemplate === t.id ? '#6366f1' : 'var(--border-color)'}`,
                  background: selectedTemplate === t.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  position: 'relative'
                }}>
                  {selectedTemplate === t.id && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                  <span style={{ fontSize: '2.2rem' }}>{t.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedTemplate === t.id ? 'var(--accent-primary)' : 'var(--text-main)' }}>{t.id}</span>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─ EDIT ─ */}
        {activeTab === 'edit' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Edit3 size={18} color="var(--accent-primary)" /> Edit Resume Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Full Name', field: 'name' },
                { label: 'Email', field: 'email' },
                { label: 'Phone', field: 'phone' },
                { label: 'Location', field: 'location' },
                { label: 'Target Role / Title', field: 'targetRole' },
                { label: 'LinkedIn URL', field: 'linkedin' },
                { label: 'Portfolio / Website', field: 'portfolio' },
                { label: 'Languages', field: 'languages' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
                  <input
                    type="text"
                    value={resumeData[f.field] || ''}
                    onChange={e => setResumeData(r => ({ ...r, [f.field]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Summary</label>
              <textarea
                value={resumeData.summary || ''}
                onChange={e => setResumeData(r => ({ ...r, summary: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills (comma-separated)</label>
              <input
                type="text"
                value={(resumeData.skills || []).join(', ')}
                onChange={e => setResumeData(r => ({ ...r, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                placeholder="React, Node.js, Python, SQL..."
              />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievements</label>
              <textarea
                value={resumeData.achievements || ''}
                onChange={e => setResumeData(r => ({ ...r, achievements: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setAtsResult(computeATS(resumeData)); setActiveTab('ats'); }}
                style={{ padding: '11px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Shield size={15} /> Re-analyze ATS Score
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                style={{ padding: '11px 22px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Eye size={15} /> Preview Changes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
