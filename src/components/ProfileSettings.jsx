import React, { useState, useRef } from 'react';
import { 
  User, 
  Settings, 
  Briefcase, 
  ShieldAlert, 
  Bell, 
  Globe, 
  Camera, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Check, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function ProfileSettings({ userData, setUserData, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'skills' | 'experience' | 'security' | 'notifications'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState(userData.avatarPhoto || null);
  const photoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: userData.name || 'Alex Chen',
    email: userData.email || 'alex.chen@design.co',
    title: userData.title || 'Senior Product Designer',
    bio: userData.summary || 'Senior Product Designer with 8+ years of experience building AI-driven consumer products. Passionate about minimalism, glassmorphism, and high-performance user interfaces.',
    language: 'English (US)',
    careerAlerts: true
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPhoto(ev.target.result);
      setUserData(prev => ({ ...prev, avatarPhoto: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      title: formData.title,
      summary: formData.bio
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.4px' }}>
          Profile & Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage your professional identity, career experience, and application preferences.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'personal', label: 'Personal Info' },
          { id: 'skills', label: 'Skills & Keywords' },
          { id: 'experience', label: 'Work Experience' },
          { id: 'security', label: 'Security & Privacy' },
          { id: 'notifications', label: 'Notifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              paddingBottom: '12px',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'personal' && (
            <>
              {/* Profile Personal Card */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '24px' }}>
                    {/* Avatar Container */}
                    <div style={{ position: 'relative' }}>
                      {/* Hidden file input */}
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoChange}
                      />

                      {/* Avatar circle */}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: avatarPhoto ? 'transparent' : 'var(--gradient-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '2.2rem',
                        fontWeight: 800,
                        boxShadow: 'var(--shadow-glow)',
                        overflow: 'hidden'
                      }}>
                        {avatarPhoto
                          ? <img src={avatarPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : formData.name.charAt(0)
                        }
                      </div>

                      {/* Camera button triggers file picker */}
                      <button 
                        type="button"
                        onClick={() => photoInputRef.current && photoInputRef.current.click()}
                        title="Upload profile photo"
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          border: '2px solid var(--bg-card)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(99,102,241,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    {/* Inputs */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '240px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Full Name</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Email Address</label>
                          <input 
                            type="email" 
                            className="form-input" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Professional Role Title</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Professional Bio</label>
                        <textarea 
                          className="form-textarea" 
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        {savedSuccess ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={16} /> Changes Saved Successfully!
                          </span>
                        ) : <span></span>}

                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Experience Card */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Work Experience History</h3>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    <PlusCircle size={14} color="var(--accent-primary)" /> Add Role
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userData.experience.map((exp) => (
                    <div 
                      key={exp.id} 
                      style={{
                        padding: '16px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-primary)'
                        }}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{exp.role}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            {exp.company} • {exp.period}
                          </p>
                        </div>
                      </div>

                      <button className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'skills' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Skills & Core Competencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {userData.skills.map((skill, i) => (
                  <span key={i} className="badge badge-purple" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Full Employment History</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Keep your career history up to date so CareerPilot AI can tailor your resumes and cover letters automatically.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-danger)' }}>
                Privacy & Danger Zone
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                CareerPilot AI enforces strict data confidentiality. Your personal information is encrypted and never sold.
              </p>
              <button className="btn btn-outline" style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}>
                <ShieldAlert size={16} /> Delete Account & Clear Data
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Notification Preferences</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Daily AI Coaching Tips</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Receive personalized interview and resume recommendations daily.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.careerAlerts} 
                  onChange={(e) => setFormData({ ...formData, careerAlerts: e.target.checked })} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Preferences & Pro Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* App Preferences */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              App Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Theme Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Display Theme</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                  </p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6366f1" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* Language Selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Interface Language</label>
                <select className="form-select" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                  <option value="English (US)">English (US)</option>
                  <option value="French (FR)">French (FR)</option>
                  <option value="German (DE)">German (DE)</option>
                  <option value="Spanish (ES)">Spanish (ES)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pro Promo Card */}
          <div className="glass-panel glow-card" style={{
            padding: '24px',
            background: 'var(--gradient-brand)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)'
          }}>
            <Sparkles size={24} color="#fff" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
              Master your career trajectory.
            </h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '16px' }}>
              Get CareerPilot AI Pro today for unlimited ATS scans and 24/7 mock interview coaching.
            </p>
            <button className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--accent-primary)', fontWeight: 800, width: '100%' }}>
              Upgrade to Pro
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
