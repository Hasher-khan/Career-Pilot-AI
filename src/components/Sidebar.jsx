import React from 'react';
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
  User
} from 'lucide-react';


export default function Sidebar({ activeTab, setActiveTab, openAiChat, currentUser, onSignOut }) {
  const navItems = [
    { id: 'dashboard',       label: 'Dashboard Overview',      icon: LayoutDashboard },
    { id: 'resume-builder',  label: 'ATS Resume & Builder',    icon: FileText, badge: 'ATS Engine' },
    { id: 'cover-letter',    label: 'Cover Letter Generator',  icon: Send },
    { id: 'email-generator', label: 'AI Email Generator',      icon: Mail, badge: 'New' },
    { id: 'ai-cv-maker',     label: 'AI CV Maker',             icon: FileEdit, badge: 'AI' },
    { id: 'settings',        label: 'Profile & Settings',      icon: Settings },
  ];

  const displayName = currentUser?.displayName
    || currentUser?.email?.split('@')[0]
    || 'User';

  const avatarLetter = displayName.charAt(0).toUpperCase();
  const photoURL = currentUser?.photoURL || null;

  return (
    <aside className="sidebar-container" style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      flexShrink: 0
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 20px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: 'var(--text-main)' }}>
              Career<span style={{ color: 'var(--accent-primary)' }}>Pilot AI</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', margin: 0, fontWeight: 600 }}>
              Precision Career Platform
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-primary-light)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-subtle)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* User Card */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              overflow: 'hidden', flexShrink: 0
            }}>
              {photoURL
                ? <img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : avatarLetter
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.email}
              </p>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            className="btn btn-secondary"
            style={{
              width: '100%',
              fontSize: '0.82rem',
              padding: '9px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--accent-error, #ef4444)',
              borderColor: 'rgba(239,68,68,0.25)'
            }}
            onClick={onSignOut}
          >
            <LogOut size={15} /> Sign Out
          </button>
        )}

        {/* AI Assistant Callout */}
        <div className="glass-panel" style={{ padding: '14px', background: 'var(--bg-input)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Bot size={16} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>CareerPilot Assistant</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
            Get instant career advice, resume critiques, and interview tips.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '7px 12px' }}
            onClick={openAiChat}
          >
            <Sparkles size={14} /> Launch Assistant
          </button>
        </div>
      </div>
    </aside>
  );
}
