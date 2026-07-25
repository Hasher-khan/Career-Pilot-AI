import React from 'react';
import { 
  FileText, 
  Send, 
  MessageSquare, 
  Compass, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Target,
  Briefcase
} from 'lucide-react';
import { analyzeResumeATS } from '../utils/atsAnalyzer';

export default function DashboardOverview({ userData, setActiveTab, openAiChat }) {
  const atsResult = analyzeResumeATS(userData);

  const quickActions = [
    {
      id: 'resume-builder',
      title: 'ATS Resume Audit',
      description: 'Run live ATS scan & enhance action verbs',
      icon: FileText,
      color: '#6366f1'
    },
    {
      id: 'cover-letter',
      title: 'Generate Cover Letter',
      description: 'Create tailored cover letter for target role',
      icon: Send,
      color: '#8b5cf6'
    },
    {
      id: 'interview-coach',
      title: 'Practice Interview',
      description: 'Simulate mock interview & get 5-metric scoring',
      icon: MessageSquare,
      color: '#ec4899'
    },
    {
      id: 'career-advisor',
      title: 'Skill Gap & Roadmap',
      description: 'Explore personalized skill learning path',
      icon: Compass,
      color: '#10b981'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome Card */}
      <div className="glass-panel glow-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '10px' }}>
              <Sparkles size={12} /> AI Career Pilot Active
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
              Welcome back, {userData.name}! 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
              Your resume is optimized for <strong style={{ color: 'var(--text-main)' }}>{userData.targetRole}</strong>. You have 3 recommended actions to boost your interview callback rate.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAiChat} style={{ padding: '12px 20px' }}>
            <Sparkles size={16} /> Consult CareerPilot AI
          </button>
        </div>
      </div>

      {/* Metrics Row: ATS Score Ring & Readiness */}
      <div className="grid-2col-responsive">
        {/* ATS Score Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Custom Score Meter Ring */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="var(--border-color)" strokeWidth="10" fill="none" />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke={atsResult.statusColor} 
                strokeWidth="10" 
                fill="none" 
                strokeDasharray="264" 
                strokeDashoffset={264 - (264 * atsResult.score) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{atsResult.score}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>/100</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>ATS Match Score</h3>
            <p style={{ fontSize: '0.8rem', color: atsResult.statusColor, fontWeight: 700, marginBottom: '8px' }}>
              {atsResult.statusGrade}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {atsResult.suggestions.length} actionable suggestions to reach 90+ ATS compliance.
            </p>
            <button 
              className="btn btn-outline" 
              onClick={() => setActiveTab('resume-builder')}
              style={{ marginTop: '10px', fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Fix Formatting & Verbs <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Career Readiness Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--accent-secondary)" /> Career Readiness Index
            </h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
              {userData.readinessIndex}%
            </span>
          </div>

          {/* Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span>Resume ATS Quality</span>
                <span>{atsResult.score}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${atsResult.score}%`, height: '100%', background: 'var(--gradient-brand)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span>Cover Letter Readiness</span>
                <span>90%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', background: 'var(--accent-success)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span>Interview Practice Completion</span>
                <span>65%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--accent-warning)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-primary)" /> Quick Tools & Workflows
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div 
                key={action.id} 
                className="glass-panel" 
                onClick={() => setActiveTab(action.id)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${action.color}15`,
                  border: `1px solid ${action.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={action.color} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{action.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{action.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Improvement Tips */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-success)" /> Priority Recommendations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {atsResult.suggestions.map((sug, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--accent-primary)'
              }}
            >
              <AlertTriangle size={18} color="var(--accent-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {sug}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
