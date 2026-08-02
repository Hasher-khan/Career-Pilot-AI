/**
 * ResumeTemplates.jsx
 * Shared template definitions and live JSX renderers for Resume & CV documents.
 * Used by: ResumeAtsBuilder, AICVMaker
 */

import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

// ── Template Metadata ───────────────────────────────────────────────────────
export const RESUME_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    icon: '🏆',
    desc: 'Classic ATS-optimized layout',
    colors: ['#2563eb', '#1e3a8a'],
  },
  {
    id: 'sidebar-dark',
    name: 'Sidebar Dark',
    icon: '🌑',
    desc: 'Dark sidebar with clean content area',
    colors: ['#1e293b', '#6366f1'],
  },
  {
    id: 'elegant',
    name: 'Elegant Minimal',
    icon: '✦',
    desc: 'Ultra-clean centered typography',
    colors: ['#111827', '#d1d5db'],
  },
  {
    id: 'executive',
    name: 'Executive Bold',
    icon: '👔',
    desc: 'Deep header band for senior roles',
    colors: ['#0f172a', '#f59e0b'],
  },
  {
    id: 'creative',
    name: 'Creative Accent',
    icon: '🎨',
    desc: 'Vivid left bar with modern pills',
    colors: ['#db2777', '#f9a8d4'],
  },
  {
    id: 'academic',
    name: 'Academic',
    icon: '📖',
    desc: 'Compact paper-style for academic CVs',
    colors: ['#374151', '#9ca3af'],
  },
];

// ── Common style helpers ────────────────────────────────────────────────────
const SectionTitle = ({ children, color, style = {} }) => (
  <h3 style={{
    fontSize: '0.82rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color,
    marginBottom: '8px',
    marginTop: 0,
    ...style,
  }}>
    {children}
  </h3>
);

const Divider = ({ color = '#e2e8f0', style = {} }) => (
  <hr style={{ border: 'none', borderTop: `1.5px solid ${color}`, margin: '0 0 12px 0', ...style }} />
);

// ── Template 1: The Professional (default) ──────────────────────────────────
export function TemplateProfessional({ userData, primaryColor, handlers = {} }) {
  const { handleInlineBlur, handleExperienceChange } = handlers;
  const editable = !!handleInlineBlur;

  const editProps = (field) => editable ? {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e) => handleInlineBlur(field, e.target.innerText),
    style: { outline: 'none', cursor: 'text' },
  } : {};

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#0b1c30', lineHeight: 1.55 }}>
      {/* Header */}
      <header style={{ borderBottom: `2.5px solid ${primaryColor}`, paddingBottom: '16px', marginBottom: '24px' }}>
        <h1
          {...editProps('name')}
          style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0b1c30', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.15, ...(editable ? { outline: 'none', cursor: 'text' } : {}) }}
        >
          {userData.name || 'Your Name'}
        </h1>
        <p
          {...editProps('targetRole')}
          style={{ fontSize: '1.1rem', fontWeight: 600, color: primaryColor, margin: '6px 0 12px', ...(editable ? { outline: 'none', cursor: 'text' } : {}) }}
        >
          {userData.targetRole || userData.title || 'Target Job Role'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
          {userData.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={13} color={primaryColor} /> {userData.email}</span>}
          {userData.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={13} color={primaryColor} /> {userData.phone}</span>}
          {userData.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} color={primaryColor} /> {userData.location}</span>}
          {userData.portfolio && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Globe size={13} color={primaryColor} /> {userData.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {userData.summary && (
        <section style={{ marginBottom: '18px' }}>
          <SectionTitle color={primaryColor}>Professional Summary</SectionTitle>
          <p
            {...editProps('summary')}
            style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.65, margin: 0, ...(editable ? { outline: 'none', cursor: 'text' } : {}) }}
          >
            {userData.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {userData.experience?.length > 0 && (
        <section style={{ marginBottom: '18px' }}>
          <SectionTitle color={primaryColor}>Experience</SectionTitle>
          {userData.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{exp.company}</h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: primaryColor, margin: '2px 0 6px', fontWeight: 600 }}>{exp.role}</p>
              {Array.isArray(exp.highlights) && (
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.55 }}>
                  {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '3px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {userData.education?.length > 0 && (
        <section style={{ marginBottom: '18px' }}>
          <SectionTitle color={primaryColor}>Education</SectionTitle>
          {userData.education.map((edu, idx) => (
            <div key={edu.id || idx} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{edu.school}</h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{edu.year}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0 0' }}>{edu.degree} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {userData.skills?.length > 0 && (
        <section style={{ marginBottom: '18px' }}>
          <SectionTitle color={primaryColor}>Skills</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px 14px', fontSize: '0.85rem', color: '#334155' }}>
            {userData.skills.map((skill, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: primaryColor, fontWeight: 800 }}>•</span> {skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {userData.projects?.length > 0 && (
        <section>
          <SectionTitle color={primaryColor}>Projects</SectionTitle>
          {userData.projects.map((proj, idx) => (
            <div key={proj.id || idx} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0b1c30', margin: 0 }}>{proj.name}</h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{proj.tech}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ── Template 2: Sidebar Dark ────────────────────────────────────────────────
export function TemplateSidebarDark({ userData, primaryColor }) {
  const sidebarBg = '#1e293b';
  const accent = primaryColor || '#6366f1';

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", display: 'flex', minHeight: '100%', lineHeight: 1.55 }}>
      {/* Left Sidebar */}
      <aside style={{
        width: '32%',
        backgroundColor: sidebarBg,
        padding: '32px 20px',
        color: '#e2e8f0',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {/* Avatar circle */}
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 800, color: '#fff',
          marginBottom: '4px',
        }}>
          {(userData.name || 'Y')[0].toUpperCase()}
        </div>

        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', lineHeight: 1.2 }}>
            {userData.name || 'Your Name'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: accent, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {userData.targetRole || userData.title || 'Professional'}
          </p>
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.78rem', color: '#cbd5e1' }}>
            {userData.email && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={11} color={accent} />{userData.email}</span>}
            {userData.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={11} color={accent} />{userData.phone}</span>}
            {userData.location && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={11} color={accent} />{userData.location}</span>}
            {userData.portfolio && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}><Globe size={11} color={accent} />{userData.portfolio}</span>}
          </div>
        </div>

        {/* Skills */}
        {userData.skills?.length > 0 && (
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Skills</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {userData.skills.map((skill, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education in sidebar */}
        {userData.education?.length > 0 && (
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Education</p>
            {userData.education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px' }}>{edu.school}</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{edu.degree}</p>
                <p style={{ fontSize: '0.68rem', color: accent, margin: '2px 0 0', fontWeight: 600 }}>{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Content */}
      <main style={{ flex: 1, padding: '32px 28px', backgroundColor: '#ffffff', color: '#0f172a' }}>
        {/* Summary */}
        {userData.summary && (
          <section style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.63rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>About Me</p>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px', marginBottom: '10px' }} />
            <p style={{ fontSize: '0.87rem', color: '#334155', lineHeight: 1.7, margin: 0 }}>{userData.summary}</p>
          </section>
        )}

        {/* Experience */}
        {userData.experience?.length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.63rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Experience</p>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px', marginBottom: '12px' }} />
            {userData.experience.map((exp, idx) => (
              <div key={exp.id || idx} style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: idx < userData.experience.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{exp.company}</h4>
                    <p style={{ fontSize: '0.82rem', color: accent, fontWeight: 600, margin: '0 0 6px' }}>{exp.role}</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.period}</span>
                </div>
                {Array.isArray(exp.highlights) && (
                  <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                    {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '3px' }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {userData.projects?.length > 0 && (
          <section>
            <p style={{ fontSize: '0.63rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Projects</p>
            <div style={{ width: '32px', height: '3px', backgroundColor: accent, borderRadius: '2px', marginBottom: '12px' }} />
            {userData.projects.map((proj, idx) => (
              <div key={proj.id || idx} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{proj.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: accent, fontWeight: 600 }}>{proj.tech}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// ── Template 3: Elegant Minimal ─────────────────────────────────────────────
export function TemplateElegant({ userData, primaryColor }) {
  const accent = primaryColor || '#374151';

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: '#111827', lineHeight: 1.6, padding: '8px 0' }}>
      {/* Centered Header */}
      <header style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: `1px solid #d1d5db`, marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#111827', margin: '0 0 6px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          {userData.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: accent, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 14px' }}>
          {userData.targetRole || userData.title || 'Professional'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '18px', fontSize: '0.8rem', color: '#6b7280' }}>
          {userData.email && <span>{userData.email}</span>}
          {userData.phone && <><span style={{ color: '#d1d5db' }}>|</span><span>{userData.phone}</span></>}
          {userData.location && <><span style={{ color: '#d1d5db' }}>|</span><span>{userData.location}</span></>}
          {userData.portfolio && <><span style={{ color: '#d1d5db' }}>|</span><span>{userData.portfolio}</span></>}
        </div>
      </header>

      {/* Summary */}
      {userData.summary && (
        <section style={{ marginBottom: '22px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, fontStyle: 'italic', maxWidth: '80%', margin: '0 auto' }}>
            {userData.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {userData.experience?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: accent, margin: 0, whiteSpace: 'nowrap', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              Experience
            </h3>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          </div>
          {userData.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{exp.company}</h4>
                <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '0.83rem', color: accent, margin: '2px 0 6px', fontStyle: 'italic' }}>{exp.role}</p>
              {Array.isArray(exp.highlights) && (
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.83rem', color: '#4b5563', lineHeight: 1.65 }}>
                  {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '4px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {userData.education?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: accent, margin: 0, whiteSpace: 'nowrap', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              Education
            </h3>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          </div>
          {userData.education.map((edu, idx) => (
            <div key={edu.id || idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{edu.school}</h4>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', margin: '2px 0 0', fontStyle: 'italic' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {userData.skills?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: accent, margin: 0, whiteSpace: 'nowrap', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              Skills
            </h3>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#374151', lineHeight: 2 }}>
            {userData.skills.join('  ·  ')}
          </div>
        </section>
      )}

      {/* Projects */}
      {userData.projects?.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: accent, margin: 0, whiteSpace: 'nowrap', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              Projects
            </h3>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          </div>
          {userData.projects.map((proj, idx) => (
            <div key={proj.id || idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{proj.name}</h4>
                <span style={{ fontSize: '0.75rem', color: accent, fontStyle: 'italic' }}>{proj.tech}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '3px 0 0' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ── Template 4: Executive Bold ──────────────────────────────────────────────
export function TemplateExecutive({ userData, primaryColor }) {
  const headerBg = primaryColor || '#0f172a';
  const accent = primaryColor || '#f59e0b';

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#0f172a', lineHeight: 1.55 }}>
      {/* Full-bleed header band */}
      <header style={{
        backgroundColor: headerBg,
        color: '#ffffff',
        padding: '32px 40px',
        margin: '-40px -40px 28px -40px',
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 6px', color: '#fff' }}>
          {userData.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', letterSpacing: '0.5px' }}>
          {userData.targetRole || userData.title || 'Senior Professional'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
          {userData.email && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {userData.email}</span>}
          {userData.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} /> {userData.phone}</span>}
          {userData.location && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} /> {userData.location}</span>}
          {userData.portfolio && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={12} /> {userData.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {userData.summary && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#334155', margin: 0 }}>
              Executive Summary
            </h3>
            <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, ${headerBg}, transparent)` }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.75, margin: 0, borderLeft: `3px solid ${headerBg}`, paddingLeft: '14px' }}>
            {userData.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {userData.experience?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#334155', margin: 0 }}>
              Professional Experience
            </h3>
            <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, ${headerBg}, transparent)` }} />
          </div>
          {userData.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={{ marginBottom: '18px', paddingBottom: '16px', borderBottom: idx < userData.experience.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{exp.company}</h4>
                  <p style={{ fontSize: '0.85rem', color: headerBg, fontWeight: 700, margin: '0 0 8px' }}>{exp.role}</p>
                </div>
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px',
                  backgroundColor: `${headerBg}15`,
                  color: headerBg,
                  borderRadius: '20px', fontWeight: 600,
                  whiteSpace: 'nowrap', marginLeft: '8px'
                }}>
                  {exp.period}
                </span>
              </div>
              {Array.isArray(exp.highlights) && (
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.65 }}>
                  {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '4px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education + Skills in 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {userData.education?.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#334155', margin: 0 }}>Education</h3>
              <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, ${headerBg}, transparent)` }} />
            </div>
            {userData.education.map((edu, idx) => (
              <div key={edu.id || idx} style={{ marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{edu.school}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{edu.degree}</p>
                <p style={{ fontSize: '0.75rem', color: headerBg, fontWeight: 600, margin: '2px 0 0' }}>{edu.year}</p>
              </div>
            ))}
          </section>
        )}

        {userData.skills?.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#334155', margin: 0 }}>Core Skills</h3>
              <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, ${headerBg}, transparent)` }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {userData.skills.map((skill, idx) => (
                <span key={idx} style={{
                  fontSize: '0.75rem', padding: '4px 10px',
                  backgroundColor: `${headerBg}12`,
                  color: headerBg,
                  borderRadius: '4px', fontWeight: 600,
                  border: `1px solid ${headerBg}25`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Template 5: Creative Accent ─────────────────────────────────────────────
export function TemplateCreative({ userData, primaryColor }) {
  const accent = primaryColor || '#db2777';

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1f2937', lineHeight: 1.55, position: 'relative', paddingLeft: '20px' }}>
      {/* Left vivid bar */}
      <div style={{
        position: 'absolute', left: '-40px', top: '-40px',
        width: '6px', bottom: '-40px',
        backgroundColor: accent,
        borderRadius: '0',
      }} />

      {/* Header */}
      <header style={{ marginBottom: '26px' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {userData.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: accent, margin: '0 0 14px', letterSpacing: '0.5px' }}>
          {userData.targetRole || userData.title || 'Creative Professional'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            userData.email && { icon: <Mail size={11} />, text: userData.email },
            userData.phone && { icon: <Phone size={11} />, text: userData.phone },
            userData.location && { icon: <MapPin size={11} />, text: userData.location },
            userData.portfolio && { icon: <Globe size={11} />, text: userData.portfolio },
          ].filter(Boolean).map((item, idx) => (
            <span key={idx} style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.78rem', color: '#6b7280',
              backgroundColor: '#f3f4f6', padding: '4px 10px',
              borderRadius: '20px', fontWeight: 500,
            }}>
              <span style={{ color: accent }}>{item.icon}</span> {item.text}
            </span>
          ))}
        </div>
      </header>

      {/* Summary */}
      {userData.summary && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: accent, margin: 0 }}>About</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.75, margin: 0 }}>{userData.summary}</p>
        </section>
      )}

      {/* Experience */}
      {userData.experience?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: accent, margin: 0 }}>Experience</h3>
          </div>
          {userData.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={{ marginBottom: '16px', position: 'relative', paddingLeft: '14px' }}>
              <div style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: accent }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{exp.company}</h4>
                  <p style={{ fontSize: '0.82rem', color: accent, fontWeight: 600, margin: '0 0 6px' }}>{exp.role}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{exp.period}</span>
              </div>
              {Array.isArray(exp.highlights) && (
                <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '0.83rem', color: '#4b5563', lineHeight: 1.6 }}>
                  {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '3px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills as pill badges */}
      {userData.skills?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: accent, margin: 0 }}>Skills</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {userData.skills.map((skill, idx) => (
              <span key={idx} style={{
                fontSize: '0.78rem', padding: '5px 13px',
                backgroundColor: `${accent}15`,
                color: accent,
                border: `1px solid ${accent}30`,
                borderRadius: '20px', fontWeight: 600,
              }}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {userData.education?.length > 0 && (
        <section style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: accent, margin: 0 }}>Education</h3>
          </div>
          {userData.education.map((edu, idx) => (
            <div key={edu.id || idx} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: 0 }}>{edu.school}</h4>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: accent, fontWeight: 600 }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {userData.projects?.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: accent, borderRadius: '2px' }} />
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: accent, margin: 0 }}>Projects</h3>
          </div>
          {userData.projects.map((proj, idx) => (
            <div key={proj.id || idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0 }}>{proj.name}</h4>
                <span style={{ fontSize: '0.72rem', backgroundColor: `${accent}15`, color: accent, padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{proj.tech}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '3px 0 0' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ── Template 6: Academic / Functional ───────────────────────────────────────
export function TemplateAcademic({ userData, primaryColor }) {
  const accent = primaryColor || '#374151';

  return (
    <div style={{ fontFamily: "'Times New Roman', Georgia, serif", color: '#111827', lineHeight: 1.6 }}>
      {/* Header — no background, pure typography */}
      <header style={{ borderBottom: `2px double #374151`, paddingBottom: '12px', marginBottom: '18px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', fontFamily: "'Times New Roman', serif", letterSpacing: '1px' }}>
          {userData.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '0 0 10px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          {userData.targetRole || userData.title || 'Researcher / Academic'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 18px', fontSize: '0.8rem', color: '#374151', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          {userData.email && <span>{userData.email}</span>}
          {userData.phone && <span>{userData.phone}</span>}
          {userData.location && <span>{userData.location}</span>}
          {userData.portfolio && <span>{userData.portfolio}</span>}
        </div>
      </header>

      {/* Summary */}
      {userData.summary && (
        <section style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', margin: '0 0 6px', fontFamily: "'Segoe UI', Arial, sans-serif", borderBottom: `1px solid ${accent}`, paddingBottom: '4px' }}>
            Research Objective / Summary
          </h3>
          <p style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.8, margin: 0, textAlign: 'justify' }}>
            {userData.summary}
          </p>
        </section>
      )}

      {/* Education first (academic priority) */}
      {userData.education?.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', margin: '0 0 8px', fontFamily: "'Segoe UI', Arial, sans-serif", borderBottom: `1px solid ${accent}`, paddingBottom: '4px' }}>
            Education
          </h3>
          {userData.education.map((edu, idx) => (
            <div key={edu.id || idx} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: 0 }}>{edu.degree}</h4>
                <p style={{ fontSize: '0.85rem', color: accent, margin: '1px 0 0', fontStyle: 'italic' }}>{edu.school}</p>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, fontFamily: "'Segoe UI', Arial, sans-serif" }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {userData.experience?.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', margin: '0 0 8px', fontFamily: "'Segoe UI', Arial, sans-serif", borderBottom: `1px solid ${accent}`, paddingBottom: '4px' }}>
            Professional Experience
          </h3>
          {userData.experience.map((exp, idx) => (
            <div key={exp.id || idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                  {exp.role} — <span style={{ color: accent }}>{exp.company}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: "'Segoe UI', Arial, sans-serif" }}>{exp.period}</span>
              </div>
              {Array.isArray(exp.highlights) && (
                <ul style={{ paddingLeft: '20px', margin: '4px 0 0', fontSize: '0.85rem', color: '#374151', lineHeight: 1.7 }}>
                  {exp.highlights.map((b, bi) => <li key={bi} style={{ marginBottom: '3px' }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {userData.skills?.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', margin: '0 0 8px', fontFamily: "'Segoe UI', Arial, sans-serif", borderBottom: `1px solid ${accent}`, paddingBottom: '4px' }}>
            Skills & Competencies
          </h3>
          <p style={{ fontSize: '0.87rem', color: '#374151', margin: 0, lineHeight: 1.8 }}>
            {userData.skills.join(' • ')}
          </p>
        </section>
      )}

      {/* Projects */}
      {userData.projects?.length > 0 && (
        <section>
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', margin: '0 0 8px', fontFamily: "'Segoe UI', Arial, sans-serif", borderBottom: `1px solid ${accent}`, paddingBottom: '4px' }}>
            Research / Projects
          </h3>
          {userData.projects.map((proj, idx) => (
            <div key={proj.id || idx} style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                {proj.name}
                {proj.tech && <span style={{ fontWeight: 400, fontStyle: 'italic', color: accent, fontSize: '0.82rem' }}> [{proj.tech}]</span>}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '3px 0 0', textAlign: 'justify', lineHeight: 1.7 }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ── Template Router ──────────────────────────────────────────────────────────
export function renderTemplate(templateId, userData, primaryColor, handlers) {
  const props = { userData, primaryColor, handlers };
  switch (templateId) {
    case 'professional':  return <TemplateProfessional {...props} />;
    case 'sidebar-dark':  return <TemplateSidebarDark  {...props} />;
    case 'elegant':       return <TemplateElegant       {...props} />;
    case 'executive':     return <TemplateExecutive     {...props} />;
    case 'creative':      return <TemplateCreative      {...props} />;
    case 'academic':      return <TemplateAcademic      {...props} />;
    default:              return <TemplateProfessional {...props} />;
  }
}
