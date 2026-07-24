import React, { useState } from 'react';
import { Compass, BookOpen, Award, CheckCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import { generateCareerAdvice } from '../utils/aiEngine';

export default function CareerAdvisor({ userData }) {
  const [targetRole, setTargetRole] = useState(userData.targetRole || 'Senior Frontend Architect');
  const adviceData = generateCareerAdvice(userData.skills, targetRole);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} color="var(--accent-success)" /> Career Advisor & Skill Roadmap
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
          Personalized skill gap analysis, certification paths, and milestone roadmaps for your target role.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Milestone Roadmap */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              12-Week Strategic Progression Roadmap
            </h4>
            <span className="badge badge-purple">Target: {targetRole}</span>
          </div>

          {/* Timeline Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {adviceData.roadmapMilestones.map((m, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--accent-primary)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{m.phase}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.duration}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {m.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Skill Gaps & Certifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Skill Gap Radar */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={18} color="var(--accent-warning)" /> High-Demand Skills to Learn
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adviceData.suggestedSkills.map((sk, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sk.name}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{sk.trend}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sk.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Portfolio */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={18} color="var(--accent-secondary)" /> Recommended Certifications
            </h4>

            <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {adviceData.recommendedCertifications.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{cert}</li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
