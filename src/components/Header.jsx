import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, Search, ShieldCheck, LogOut, Loader, Info, CheckCircle2, Sparkles, Menu } from 'lucide-react';

export default function Header({ theme, toggleTheme, userData, activeTab, setActiveTab, currentUser, onSignOut, isDataLoading, toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef(null);

  const titles = {
    'dashboard':      'Dashboard Overview',
    'resume-builder': 'ATS Resume Analyzer & Builder',
    'cover-letter':   'AI Cover Letter Generator',
    'email-generator':'AI Email Generator',
    'career-advisor': 'Career Advisor & Skills Roadmap',
    'settings':       'Profile & Settings'
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
      title: 'ATS Scanner Active',
      description: 'Audit your resume against target roles under the Resume Builder tab.',
      time: '15m ago',
      icon: CheckCircle2,
      color: '#10b981'
    },
    {
      id: 3,
      title: 'Welcome to CareerPilot!',
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
            {titles[activeTab] || 'CareerPilot AI'}
          </h2>
          <p className="header-subtitle" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Personalized AI application optimization & career guidance
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

        {/* Notification Bell Dropdown Container */}
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

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '44px',
              right: 0,
              width: '320px',
              zIndex: 999,
              boxShadow: '0 20px 40px rgba(11, 28, 48, 0.25)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-sidebar)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>Workspace Notifications</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 alerts</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {notificationList.map((notif) => {
                  const IconComponent = notif.icon;
                  return (
                    <div 
                      key={notif.id} 
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-input)',
                        transition: 'background-color 0.15s ease',
                        cursor: 'default'
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: `${notif.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={14} color={notif.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{notif.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '3px 0 0 0', lineHeight: 1.35 }}>
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
