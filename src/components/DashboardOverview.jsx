import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Send,
  MessageSquare,
  Compass,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle2,
  ChevronRight,
  Zap,
  Award,
  BookOpen,
  Activity,
  Clock,
  Star,
  Mail,
  FileEdit,
  Bell,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';
import { analyzeResumeATS } from '../utils/atsAnalyzer';
import { subscribeToAnnouncements } from '../utils/adminService';

/* ─── Animated Ring Component ─────────────────────────────────────────────── */
function AnimatedRing({ score, color, trackColor, size = 120, stroke = 9 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * animatedScore) / 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="ringGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor || 'rgba(255,255,255,0.06)'}
        strokeWidth={stroke}
      />
      {/* Progress Arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        filter="url(#ringGlow)"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

/* ─── Metric Progress Bar ─────────────────────────────────────────────────── */
function MetricBar({ label, value, color, icon: Icon }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 200);
    return () => clearTimeout(t);
  }, [value]);

  const getStatusLabel = (v) => {
    if (v >= 85) return { text: 'Excellent', color: '#10b981' };
    if (v >= 65) return { text: 'Good', color: '#6366f1' };
    if (v >= 40) return { text: 'Fair', color: '#f59e0b' };
    return { text: 'Needs Work', color: '#ef4444' };
  };

  const status = getStatusLabel(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && (
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '6px',
              backgroundColor: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={12} color={color} />
            </div>
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 600,
            color: status.color,
            backgroundColor: `${status.color}15`,
            padding: '2px 7px',
            borderRadius: '20px',
            letterSpacing: '0.02em'
          }}>
            {status.text}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', minWidth: '32px', textAlign: 'right' }}>
            {value}%
          </span>
        </div>
      </div>
      {/* Track */}
      <div style={{
        height: '5px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Fill */}
        <div style={{
          width: `${animated}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: '10px',
          transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${color}60`
        }} />
      </div>
    </div>
  );
}

/* ─── Quick Action Card ───────────────────────────────────────────────────── */
function QuickActionCard({ action, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '22px',
        borderRadius: '14px',
        cursor: 'pointer',
        background: hovered
          ? `linear-gradient(135deg, ${action.color}10, ${action.color}06)`
          : 'var(--bg-card)',
        border: `1px solid ${hovered ? action.color + '35' : 'var(--border-color)'}`,
        boxShadow: hovered
          ? `0 8px 32px ${action.color}20, 0 2px 8px rgba(0,0,0,0.15)`
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${action.color}80, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease'
      }} />

      {/* Icon */}
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${action.color}22, ${action.color}12)`,
        border: `1px solid ${action.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.25s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)'
      }}>
        <Icon size={20} color={action.color} strokeWidth={1.75} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '5px',
          color: 'var(--text-main)',
          letterSpacing: '-0.01em'
        }}>
          {action.title}
        </h4>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          fontWeight: 400
        }}>
          {action.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: action.color,
        fontSize: '0.72rem',
        fontWeight: 600,
        opacity: hovered ? 1 : 0.4,
        transition: 'all 0.25s ease',
        letterSpacing: '0.03em'
      }}>
        Launch <ChevronRight size={13} />
      </div>
    </div>
  );
}

/* ─── Recommendation Item ─────────────────────────────────────────────────── */
function RecommendationItem({ text, index }) {
  const [hovered, setHovered] = useState(false);
  const priorities = ['High', 'Medium', 'Low'];
  const colors = ['#ef4444', '#f59e0b', '#6366f1'];
  const priority = priorities[index % 3];
  const color = colors[index % 3];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: '10px',
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.2s ease',
        cursor: 'default'
      }}
    >
      {/* Index number */}
      <div style={{
        width: '28px', height: '28px',
        borderRadius: '8px',
        background: `${color}15`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: color,
        fontSize: '0.72rem',
        fontWeight: 700
      }}>
        {index + 1}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-main)',
          lineHeight: 1.55,
          fontWeight: 400,
          margin: 0
        }}>
          {text}
        </p>
      </div>

      {/* Priority badge */}
      <span style={{
        flexShrink: 0,
        fontSize: '0.62rem',
        fontWeight: 700,
        color: color,
        background: `${color}12`,
        border: `1px solid ${color}25`,
        padding: '3px 8px',
        borderRadius: '20px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginTop: '2px'
      }}>
        {priority}
      </span>
    </div>
  );
}

/* ─── Stat Chip ───────────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      borderRadius: '10px',
      background: `${color}0d`,
      border: `1px solid ${color}20`,
      flex: '1 1 auto',
      minWidth: '120px'
    }}>
      <Icon size={14} color={color} strokeWidth={2} />
      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 500, lineHeight: 1, marginBottom: '2px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Dashboard Overview ──────────────────────────────────────────────────── */
export default function DashboardOverview({ userData, setActiveTab, openAiChat }) {
  const atsResult = analyzeResumeATS(userData);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnns, setDismissedAnns] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissed_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const unsub = subscribeToAnnouncements(
      (data) => {
        setAnnouncements(data);
      },
      (err) => console.error('Dashboard announcements sync error:', err)
    );
    return () => unsub();
  }, []);

  const handleDismissAnn = (id) => {
    const updated = [...dismissedAnns, id];
    setDismissedAnns(updated);
    try {
      localStorage.setItem('dismissed_announcements', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const activeAnnouncements = announcements
    .filter(ann => ann.active && !dismissedAnns.includes(ann.id))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0; // maintain original chronological order (newest first)
    });

  const quickActions = [
    {
      id: 'ask-gemini',
      title: 'Ask Gemini Assistant',
      description: 'Consult Google\'s latest Gemini 3.7 Flash model for coding, writing & analysis',
      icon: Sparkles,
      color: '#6366f1'
    },
    {
      id: 'cover-letter',
      title: 'Generate Cover Letter',
      description: 'Create a tailored cover letter for your target role',
      icon: Send,
      color: '#2563eb'
    },
    {
      id: 'email-generator',
      title: 'AI Email Generator',
      description: 'Craft professional follow-ups, networking & application emails',
      icon: Mail,
      color: '#ec4899'
    }
  ];

  const metrics = [
    { label: 'Gemini AI Performance', value: 98,              color: '#6366f1', icon: Sparkles },
    { label: 'Cover Letter Quality',  value: 90,              color: '#10b981', icon: Send },
    { label: 'AI Email Quality',      value: 85,              color: '#f59e0b', icon: Mail },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.4s ease forwards' }}>

      {/* ── Active Announcements Feed ── */}
      {activeAnnouncements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeAnnouncements.map(ann => {
            const typeMap = {
              info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.2)',  icon: Info },
              success: { color: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle2 },
              warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle },
              urgent:  { color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',  icon: Zap },
            };
            const t = typeMap[ann.type] || typeMap.info;
            const AnnIcon = t.icon;

            return (
              <div
                key={ann.id}
                style={{
                  position: 'relative',
                  padding: '16px 44px 16px 18px',
                  borderRadius: '14px',
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  animation: 'fadeIn 0.3s ease forwards',
                  boxShadow: ann.pinned ? '0 4px 16px rgba(99,102,241,0.08)' : 'none',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(99,102,241,0.25)',
                  flexShrink: 0, marginTop: '2px'
                }}>
                  <Sparkles size={15} color="#ffffff" strokeWidth={2.5} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {ann.title}
                    </span>
                    {ann.pinned && (
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b',
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                        padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px'
                      }}>
                        Pinned
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {ann.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismissAnn(ann.id)}
                  style={{
                    position: 'absolute', top: '50%', right: '14px',
                    transform: 'translateY(-50%)',
                    width: '26px', height: '26px', borderRadius: '6px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '32px 36px',
        borderRadius: '18px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}>
        {/* Ambient mesh background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 80% at 85% 50%, rgba(99,102,241,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 20%, rgba(37,99,235,0.05) 0%, transparent 60%)',
          borderRadius: 'inherit'
        }} />
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          borderRadius: 'inherit'
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              marginBottom: '14px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'block' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AI Career Pilot Active
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--text-main)',
              marginBottom: '8px',
              lineHeight: 1.2
            }}>
              Welcome back,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {userData.name || 'there'}
              </span>{' '}👋
            </h2>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              maxWidth: '520px',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Your resume is optimized for{' '}
              <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {userData.targetRole || 'your target role'}
              </strong>
              . You have{' '}
              <span style={{ color: '#6366f1', fontWeight: 600 }}>
                {atsResult.suggestions.length} recommended actions
              </span>{' '}
              to boost your interview callback rate.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setActiveTab('ask-gemini')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '13px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)'; }}
          >
            <Sparkles size={16} strokeWidth={2} />
            Consult Ask Gemini
          </button>
        </div>

        {/* Bottom stat row */}
        <div style={{
          position: 'relative',
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <StatChip icon={Award}    label="AI Model"     value="Gemini 3.7 Flash" color="#6366f1" />
          <StatChip icon={Activity}  label="AI Uptime"    value="100% Online"      color="#10b981" />
          <StatChip icon={Clock}     label="Last Active"  value="Today"            color="#2563eb" />
          <StatChip icon={Star}      label="AI Services"  value="Unlimited"        color="#f59e0b" />
        </div>
      </div>

      {/* ── Metrics Row ─────────────────────────────────────────────────── */}
      <div className="grid-2col-responsive">
        {/* ATS Score Card */}
        {/* Ask Gemini Engine Card */}
        <div className="dashboard-stats-card" style={{
          padding: '28px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          {/* Ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <AnimatedRing score={98} size={110} stroke={8} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--text-main)' }}>
                98%
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-subtle)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Active
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                Ask Gemini Assistant
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '6px', fontWeight: 500 }}>
              Gemini 3.7 Flash Model
            </p>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              Consult Google's latest model to write code, compose text, analyze documents, and execute general tasks.
            </p>
            <button
              onClick={() => setActiveTab('ask-gemini')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                color: '#fff', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(99,102,241,0.3)'
              }}
            >
              <Sparkles size={13} /> Chat with Gemini <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* AI Services Status Card */}
        <div style={{
          padding: '28px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(37,99,235,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Target size={16} color="#818cf8" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                AI Services Status
              </h3>
            </div>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em'
            }}>
              91% avg
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {metrics.map((m, i) => (
              <MetricBar key={i} {...m} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Tools Grid ─────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '8px',
              background: 'rgba(99,102,241,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={14} color="#818cf8" />
            </div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em'
            }}>
              Quick Tools & Workflows
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
            4 tools available
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onClick={() => setActiveTab(action.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Priority Recommendations ─────────────────────────────────────── */}
      <div style={{
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Card Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px',
              borderRadius: '8px',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={15} color="#10b981" strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em', margin: 0 }}>
                Priority Recommendations
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', margin: 0, marginTop: '1px', fontWeight: 400 }}>
                AI-generated improvement actions
              </p>
            </div>
          </div>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '0.7rem', fontWeight: 600,
            color: '#10b981',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.03em'
          }}>
            <CheckCircle2 size={11} />
            Active
          </span>
        </div>

        {/* Recommendation list */}
        <div style={{ padding: '8px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <RecommendationItem text="Ask Gemini to write, refactor, or explain complex code snippets." index={0} />
            <RecommendationItem text="Generate a custom, ATS-optimized Cover Letter for your target position." index={1} />
            <RecommendationItem text="Use AI Email Generator to compose networking and follow-up emails." index={2} />
            <RecommendationItem text="Upload a video transcript into Transcript Generator to structure notes." index={3} />
          </div>
        </div>

        {/* Footer action */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setActiveTab('ask-gemini')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#818cf8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Chat with Gemini <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
