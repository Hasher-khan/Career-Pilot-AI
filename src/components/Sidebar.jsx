import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Send,
  Mail,
  FileEdit,
  Bot,
  Sparkles,
  Settings,
  LogOut,
  ChevronUp,
  X,
  Zap,
  ShieldCheck,
  BookOpen,
  Brain,
  AlignLeft
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, openAiChat, currentUser, onSignOut, isOpen, onClose }) {
  const [profileExpanded, setProfileExpanded] = useState(false);

  const navItems = [
    { id: 'dashboard',        label: 'Dashboard',             icon: LayoutDashboard },
    { id: 'ask-gemini',        label: 'Chat Boot',             icon: Sparkles,    badge: 'AI' },
    { id: 'ai-cv-maker',      label: 'AI CV Maker',           icon: FileText,    badge: 'New' },
    { id: 'cover-letter',     label: 'Cover Letter',          icon: Send },
    { id: 'email-generator',  label: 'AI Email Generator',    icon: Mail,        badge: 'New' },

    { id: 'ai-quizzes',       label: 'AI Quizzes',            icon: Brain,       badge: 'Quiz' },
    { id: 'settings',         label: 'Profile & Settings',    icon: Settings },
    { id: 'admin-panel',      label: 'Admin Panel',           icon: ShieldCheck, badge: 'Admin' },
  ];

  const displayName = currentUser?.displayName
    || currentUser?.email?.split('@')[0]
    || 'User';

  const avatarLetter = displayName.charAt(0).toUpperCase();
  const photoURL = currentUser?.photoURL || null;

  const badgeColors = {
    ATS:     { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8',  border: 'rgba(99,102,241,0.25)' },
    New:     { bg: 'rgba(16,185,129,0.12)', color: '#34d399',  border: 'rgba(16,185,129,0.25)' },
    AI:      { bg: 'rgba(236,72,153,0.12)', color: '#f472b6',  border: 'rgba(236,72,153,0.25)' },
    Admin:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171',  border: 'rgba(239,68,68,0.25)' },
    Student: { bg: 'rgba(124,58,237,0.12)', color: '#a78bfa',  border: 'rgba(124,58,237,0.25)' },
    Quiz:    { bg: 'rgba(236,72,153,0.12)', color: '#f472b6',  border: 'rgba(236,72,153,0.25)' },
  };

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'open' : ''}`}
      style={{
        width: '252px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '200px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* ── Brand Header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 20px 18px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          {/* Logo mark */}
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            flexShrink: 0
          }}>
            <Sparkles size={17} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--text-main)',
              lineHeight: 1.2
            }}>
              Chat<span style={{
                background: 'linear-gradient(135deg, #818cf8, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}> Boot</span>
            </h1>
            <p style={{
              fontSize: '0.62rem',
              color: 'var(--text-subtle)',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Advanced AI Assistant
            </p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="mobile-only-close"
          style={{
            width: '30px', height: '30px', padding: 0,
            borderRadius: '8px',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Section Label ─────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 8px' }}>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'var(--text-subtle)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          Navigation
        </span>
      </div>

      {/* ── Navigation Items ──────────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '0 12px',
        flex: 1
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const bc = item.badge ? badgeColors[item.badge] : null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '9px 10px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: isActive ? '#818cf8' : 'var(--text-muted)',
                fontSize: '0.84rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
                position: 'relative',
                letterSpacing: isActive ? '-0.01em' : '0'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {/* Active indicator accent line */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '6px', bottom: '6px',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #818cf8, #60a5fa)',
                  marginLeft: '-10px'
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: '30px', height: '30px',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                transition: 'background-color 0.15s ease',
                flexShrink: 0
              }}>
                <Icon
                  size={16}
                  color={isActive ? '#818cf8' : 'var(--text-subtle)'}
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </div>

              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Badge */}
              {bc && (
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  color: bc.color,
                  background: bc.bg,
                  border: `1px solid ${bc.border}`,
                  padding: '2px 6px',
                  borderRadius: '5px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Section ────────────────────────────────────────────── */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: 'auto',
        position: 'relative'
      }}>

        {/* AI Assistant CTA */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(37,99,235,0.07))',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '6px',
              background: 'rgba(99,102,241,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={13} color="#818cf8" />
            </div>
             <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>
              Chat Boot Assistant
            </span>
          </div>
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            fontWeight: 400,
            margin: 0
          }}>
            Instant coding, writing, analysis & general tasks support.
          </p>
          <button
            onClick={() => setActiveTab('ask-gemini')}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none'; }}
          >
            <Zap size={13} strokeWidth={2.5} />
            Launch Assistant
          </button>
        </div>

        {/* User profile area */}
        {currentUser && (
          <div style={{ position: 'relative' }}>
            {/* Profile popover */}
            {profileExpanded && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0, right: 0,
                marginBottom: '8px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
                zIndex: 10,
                animation: 'fadeIn 0.15s ease'
              }}>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 400 }}>
                  {currentUser.email}
                </p>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239,68,68,0.25)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#f87171',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </div>
            )}

            {/* Trigger row */}
            <button
              onClick={() => setProfileExpanded(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: profileExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => {
                if (!profileExpanded) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px', height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.78rem',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
              }}>
                {photoURL
                  ? <img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : avatarLetter
                }
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <p style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3
                }}>
                  {displayName}
                </p>
                <p style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-subtle)',
                  margin: 0,
                  fontWeight: 400,
                  lineHeight: 1
                }}>
                  Pro Account
                </p>
              </div>

              <ChevronUp
                size={14}
                color="var(--text-subtle)"
                style={{ transform: profileExpanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
              />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
