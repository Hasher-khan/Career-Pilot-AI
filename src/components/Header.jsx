import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, Search, ShieldCheck, LogOut, Loader, Info, CheckCircle2, Sparkles, Menu, X, Cloud, CloudOff, WifiOff } from 'lucide-react';

export default function Header({ theme, toggleTheme, userData, activeTab, setActiveTab, currentUser, onSignOut, isDataLoading, toggleSidebar, syncStatus }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const titles = {
    'dashboard':      'Dashboard Overview',
    'ask-gemini':     'Ask Gemini Assistant',
    'cover-letter':   'AI Cover Letter Generator',
    'email-generator':'AI Email Generator',
    'settings':       'Profile & Settings',
    'study-companion':'Transcript Generator',
    'ai-quizzes':      'AI Practice Quizzes'
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setHasUnread(false);
  };

  const notificationList = [
    {
      id: 1,
      title: 'Database Security Check',
      description: 'Make sure your Firestore Database is created in your Firebase Console so data saves.',
      time: '1m ago',
      icon: Info,
      color: '#3b82f6'
    },
    {
      id: 2,
      title: 'Ask Gemini Assistant Ready',
      description: 'Ask any questions regarding coding, writing, analysis or creative tasks.',
      time: '15m ago',
      icon: CheckCircle2,
      color: '#10b981'
    },
    {
      id: 3,
      title: 'Welcome to Ask Gemini!',
      description: 'Head over to Settings to complete your professional summary and skills details.',
      time: '1h ago',
      icon: Sparkles,
      color: '#8b5cf6'
    }
  ];

  // Prefer Firebase displayName → userData.name → email prefix
  const displayName = currentUser?.displayName
    || userData?.name
    || currentUser?.email?.split('@')[0]
    || 'User';

  const avatarLetter = displayName.charAt(0).toUpperCase();

  // Show photo if user has one (Google profile pic or uploaded)
  const photoURL = currentUser?.photoURL || userData?.avatarPhoto || null;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '20px',
      marginBottom: '16px',
      borderBottom: '1px solid var(--border-color)',
      position: 'relative',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={toggleSidebar} 
          className="btn btn-secondary mobile-hamburger-toggle"
          style={{
            display: 'none',
            width: '36px', height: '36px', padding: 0,
            alignItems: 'center', justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0
          }}
          title="Open Menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="header-title" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>
            {titles[activeTab] || 'Ask Gemini'}
          </h2>
          <p className="header-subtitle" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Advanced AI Chat Assistant, writing coach & companion
          </p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Search Bar */}
        <div className="header-search-bar" style={{ position: 'relative', width: '220px' }}>
          <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search tools & tips..." 
            className="form-input"
            style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary"
          title="Toggle Light / Dark Mode"
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#2563eb" />}
        </button>

        {/* Notification Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={toggleNotifications}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, position: 'relative' }}
            title="Notifications"
          >
            <Bell size={17} />
            {hasUnread && (
              <span style={{
                position: 'absolute', top: '7px', right: '7px',
                width: '7px', height: '7px',
                backgroundColor: '#2563eb', borderRadius: '50%'
              }} />
            )}
          </button>

          {/* ── Backdrop (mobile only) */}
          {showNotifications && isMobile && (
            <div
              onClick={() => setShowNotifications(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 1998,
              }}
            />
          )}

          {/* ── Notifications Panel */}
          {showNotifications && (
            <div
              className="glass-panel"
              style={isMobile ? {
                // Mobile: fixed bottom sheet / full-width top-anchored panel
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1999,
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                backgroundColor: 'var(--bg-sidebar)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              } : {
                // Desktop: absolute dropdown
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '320px',
                zIndex: 999,
                boxShadow: '0 20px 40px rgba(11,28,48,0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-sidebar)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Workspace Notifications</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 alerts</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notification items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: isMobile ? '60vh' : '280px', overflowY: 'auto' }}>
                {notificationList.map((notif) => {
                  const IconComponent = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-input)',
                        cursor: 'default',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '8px',
                        backgroundColor: `${notif.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <IconComponent size={15} color={notif.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.3 }}>{notif.title}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{notif.time}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.45, wordBreak: 'break-word' }}>
                          {notif.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div 
          onClick={() => setActiveTab && setActiveTab('settings')}
          className="header-profile-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease'
          }}
          title="Open Profile Settings"
        >
          {/* Avatar */}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.82rem',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {photoURL
              ? <img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatarLetter
            }
          </div>

          <div className="header-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>
              {isDataLoading ? '…' : displayName}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {isDataLoading
                ? <><Loader size={9} /> Loading…</>
                : syncStatus === 'saving'
                  ? <><Loader size={9} style={{ animation: 'spin 1s linear infinite' }} /> Syncing…</>
                  : syncStatus === 'saved'
                    ? <><Cloud size={9} color="var(--accent-success)" /> Saved to cloud</>
                    : syncStatus === 'error'
                      ? <><WifiOff size={9} color="#f59e0b" /> Local only — no sync</>
                      : <><ShieldCheck size={10} color="var(--accent-success)" /> Signed In</>
              }
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="btn btn-secondary header-signout-btn"
            style={{ fontSize: '0.82rem', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-error, #ef4444)' }}
            title="Sign Out"
          >
            <LogOut size={15} /> <span className="header-signout-text">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
