import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, FileText, Send, FileEdit, Settings, BookOpen, Brain, AlignLeft, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import AskGemini from './components/AskGemini';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import EmailGenerator from './components/EmailGenerator';
import AdminPanel from './components/AdminPanel';
import ProfileSettings from './components/ProfileSettings';
import AiAssistantModal from './components/AiAssistantModal';
import SignInModal from './components/SignInModal';
import LandingPage from './components/LandingPage';

import QuizCompanion from './components/QuizCompanion';

import { useAuth } from './context/AuthContext';
import { loadUserProfile, saveUserProfile, initNewUserProfile } from './utils/firestoreService';
import { notifyUserLogin } from './utils/backendAgent';

// ── Empty profile used for new users (before they fill in their details) ─────
const emptyUserData = {
  name:            '',
  title:           '',
  email:           '',
  phone:           '',
  location:        '',
  targetRole:      '',
  targetIndustry:  '',
  experienceLevel: '',
  summary:         '',
  skills:          [],
  experience:      [],
  education:       [],
  projects:        [],
  certifications:  [],
  currentAtsScore: 0,
  readinessIndex:  0,
};

export default function App() {
  const { currentUser, authLoading, signOut } = useAuth();

  const [theme, setTheme]               = useState('dark');
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [userData, setUserData]         = useState(emptyUserData);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);  // controls sign-in modal on landing page
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 'idle' | 'saving' | 'saved' | 'error'
  const [syncStatus, setSyncStatus] = useState('idle');

  // Close sidebar on navigation (mobile friendly)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  // Debounce timer ref so we don't hammer Firestore on every keystroke
  const saveTimerRef = useRef(null);

  // ── Apply theme to <html> ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // ── Load user data from Firestore when they sign in ───────────────────────
  useEffect(() => {
    if (!currentUser) {
      setUserData(emptyUserData);
      return;
    }

    async function fetchUserData() {
      setIsDataLoading(true);
      try {
        // Initialize profile for brand-new users (no-op if already exists)
        await initNewUserProfile(currentUser.uid, {
          name:  currentUser.displayName || '',
          email: currentUser.email       || '',
        });

        // Load the user's saved profile (Firestore → localStorage fallback)
        const profile = await loadUserProfile(currentUser.uid);

        if (profile) {
          setUserData({ ...emptyUserData, ...profile });
        } else {
          // No profile found — start with user's auth info, rest blank
          setUserData({
            ...emptyUserData,
            name:  currentUser.displayName || '',
            email: currentUser.email       || '',
          });
        }

        // Trigger login notification mail (tracked in sessionStorage to run once per load)
        const sessionKey = `careerpilot_login_notified_${currentUser.uid}`;
        if (!sessionStorage.getItem(sessionKey)) {
          notifyUserLogin(currentUser.email, currentUser.displayName || profile?.name || '');
          sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (err) {
        console.warn('Failed to load user data, using auth fallback:', err.message);
        setUserData({
          ...emptyUserData,
          name:  currentUser.displayName || '',
          email: currentUser.email       || '',
        });
      } finally {
        setIsDataLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);


  // ── Auto-save userData to Firestore (debounced 1.5s) ─────────────────────
  const debouncedSave = useCallback((data) => {
    if (!currentUser) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      saveUserProfile(currentUser.uid, data)
        .then(() => {
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 3000);
        })
        .catch(err => {
          console.error('Auto-save failed:', err);
          // Data is in localStorage — not lost, just not synced to cloud
          setSyncStatus('error');
          setTimeout(() => setSyncStatus('idle'), 5000);
        });
    }, 1500);
  }, [currentUser]);

  // Wrapper for setUserData that also triggers auto-save
  const handleSetUserData = useCallback((updater) => {
    setUserData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      debouncedSave(next);
      return next;
    });
  }, [debouncedSave]);

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    // Flush any pending save before signing out
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      if (currentUser) {
        await saveUserProfile(currentUser.uid, userData).catch(() => {});
      }
    }
    await signOut();
    setActiveTab('dashboard');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING SCREEN — shown while Firebase resolves the auth session
  // ─────────────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        backgroundColor: 'var(--bg-main)'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'var(--gradient-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>CareerPilot AI</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Loading your workspace…</p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.95)} }`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH GATE — show LandingPage with SignIn modal overlay for guests
  // ─────────────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setIsSignInOpen(true)}
          openSignIn={() => setIsSignInOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <SignInModal
          isOpen={isSignInOpen}
          forceOpen={false}
          onClose={() => setIsSignInOpen(false)}
          onAuthSuccess={() => setIsSignInOpen(false)}
        />
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN APP — authenticated
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      {/* Sidebar Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openAiChat={() => setIsAiModalOpen(true)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main View Area */}
      <main className="main-content">
        <Header 
          theme={theme}
          toggleTheme={toggleTheme}
          userData={userData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          isDataLoading={isDataLoading}
          toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          syncStatus={syncStatus}
        />

        {/* Data loading shimmer */}
        {isDataLoading && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.88rem'
          }}>
            ⏳ Loading your saved data…
          </div>
        )}

        {/* Tab Router */}
        {!isDataLoading && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview 
                userData={userData}
                setActiveTab={setActiveTab}
                openAiChat={() => setIsAiModalOpen(true)}
              />
            )}

            {activeTab === 'ask-gemini' && (
              <AskGemini
                userData={userData}
              />
            )}

            {activeTab === 'cover-letter' && (
              <CoverLetterGenerator 
                userData={userData}
              />
            )}

            {activeTab === 'email-generator' && (
              <EmailGenerator 
                userData={userData}
              />
            )}

            {activeTab === 'settings' && (
              <ProfileSettings 
                userData={userData}
                setUserData={handleSetUserData}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            )}

            {activeTab === 'admin-panel' && (
              <AdminPanel />
            )}



            {activeTab === 'ai-quizzes' && (
              <QuizCompanion userData={userData} setUserData={handleSetUserData} />
            )}
          </>
        )}
      </main>

      {/* AI Assistant Modal */}
      <AiAssistantModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        userData={userData}
      />

      {/* ── Mobile Bottom Tab Navigation Bar (visible only on ≤1024px) ── */}
      <nav className="mobile-bottom-nav" role="navigation" aria-label="Main navigation">
        {[
          { id: 'dashboard',      label: 'Home',    icon: LayoutDashboard },
          { id: 'ask-gemini',      label: 'Chat Boot',  icon: Sparkles },
          { id: 'cover-letter',   label: 'Letter',  icon: Send },

          { id: 'ai-quizzes',     label: 'Quizzes', icon: Brain },
          { id: 'settings',       label: 'Profile', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
