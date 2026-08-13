import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, ShieldCheck, Lock, Unlock, Eye, EyeOff, X, Search,
  Users, UserCheck, TrendingUp, Award, ChevronDown, ChevronUp,
  Activity, BarChart3, ArrowUpRight, ArrowDownRight, Calendar,
  Mail, MapPin, Briefcase, GraduationCap, Star, LogOut, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Megaphone, Bell, Pin, Trash2,
  CheckCircle, AlertTriangle, Info, Zap, Send, ToggleLeft, ToggleRight,
  BookOpen, Brain, FileText, Hash, Clock
} from 'lucide-react';
import {
  subscribeToAllUsers,
  subscribeToAnnouncements,
  postAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement
} from '../utils/adminService';

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'hk786412345';
const SESSION_KEY    = 'careerpilot_admin_auth';

// ─── Helper: format Firestore timestamp or ISO string ─────────────────────────
function formatDate(val) {
  if (!val) return '—';
  let d;
  if (val?.toDate) d = val.toDate();
  else if (val?.seconds) d = new Date(val.seconds * 1000);
  else d = new Date(val);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysAgo(val) {
  if (!val) return Infinity;
  let d;
  if (val?.toDate) d = val.toDate();
  else if (val?.seconds) d = new Date(val.seconds * 1000);
  else d = new Date(val);
  if (isNaN(d)) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data, width = 500, height = 200 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
        Not enough data to render chart
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
    label: d.label,
    value: d.value,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padding.top + chartH * (1 - pct);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4,4" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-primary)">
              {Math.round(minVal + (maxVal - minVal) * pct)}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#lineGrad)" className="admin-chart-area" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="admin-chart-line" />

      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#1e1b4b" strokeWidth="2" className="admin-chart-dot" style={{ animationDelay: `${i * 0.05}s` }} />
          <title>{`${p.label}: ${p.value}`}</title>
        </g>
      ))}

      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 7)) === 0 || i === points.length - 1).map((p, i) => (
        <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-primary)">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, width = 500, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(50, (chartW / data.length) * 0.6);
  const gap = (chartW - barW * data.length) / (data.length + 1);

  const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#6366f1'];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padding.top + chartH * (1 - pct);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4,4" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-primary)">
              {Math.round(maxVal * pct)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = padding.left + gap + i * (barW + gap);
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity="0.9" />
                <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={`url(#barGrad${i})`} className="admin-bar-animate" style={{ animationDelay: `${i * 0.1}s` }}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600" fontFamily="var(--font-primary)">
              {d.value}
            </text>
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--text-subtle)" fontFamily="var(--font-primary)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Completion Radar ─────────────────────────────────────────────────────────
function CompletionRadar({ user }) {
  const fields = [
    { label: 'Summary', filled: !!user.summary },
    { label: 'Skills', filled: (user.skills?.length || 0) > 0 },
    { label: 'Experience', filled: (user.experience?.length || 0) > 0 },
    { label: 'Education', filled: (user.education?.length || 0) > 0 },
    { label: 'Projects', filled: (user.projects?.length || 0) > 0 },
    { label: 'Certs', filled: (user.certifications?.length || 0) > 0 },
    { label: 'Target Role', filled: !!user.targetRole },
    { label: 'Location', filled: !!user.location },
  ];

  const cx = 100, cy = 100, r = 70;
  const total = fields.length;

  const points = fields.map((f, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const radius = f.filled ? r : r * 0.25;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      labelX: cx + Math.cos(angle) * (r + 18),
      labelY: cy + Math.sin(angle) * (r + 18),
      ...f,
    };
  });

  const shapePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: '220px', height: 'auto' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((pct, i) => (
        <polygon
          key={i}
          points={fields.map((_, fi) => {
            const a = (Math.PI * 2 * fi) / total - Math.PI / 2;
            return `${cx + Math.cos(a) * r * pct},${cy + Math.sin(a) * r * pct}`;
          }).join(' ')}
          fill="none" stroke="var(--border-color)" strokeWidth="0.5"
        />
      ))}

      {/* Spokes */}
      {fields.map((_, i) => {
        const a = (Math.PI * 2 * i) / total - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke="var(--border-color)" strokeWidth="0.5" />;
      })}

      {/* Shape */}
      <path d={shapePath} fill="rgba(99,102,241,0.15)" stroke="#818cf8" strokeWidth="1.5" className="admin-radar-shape" />

      {/* Dots + Labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={p.filled ? '#10b981' : '#ef4444'} />
          <text x={p.labelX} y={p.labelY + 3} textAnchor="middle" fontSize="7" fill="var(--text-muted)" fontFamily="var(--font-primary)">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN PANEL — Main Export
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [authError, setAuthError] = useState('');
  const [shaking, setShaking]     = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortField, setSortField]       = useState('updatedAt');
  const [sortDir, setSortDir]           = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const ROWS_PER_PAGE = 10;

  // ── Announcements state ─────────────────────────────────────────────────────
  const [announcements, setAnnouncements]   = useState([]);
  const [annTitle, setAnnTitle]             = useState('');
  const [annMessage, setAnnMessage]         = useState('');
  const [annType, setAnnType]               = useState('info');  // info | warning | success | urgent
  const [annPinned, setAnnPinned]           = useState(false);
  const [annSending, setAnnSending]         = useState(false);
  const [annToast, setAnnToast]             = useState('');
  const [adminTab, setAdminTab]             = useState('users'); // 'users' | 'announcements' | 'study-companion'

  // ── Password submission ─────────────────────────────────────────────────────
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthError('');
      setUnlocking(true);
      setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        setIsAuthenticated(true);
      }, 800);
    } else {
      setAuthError('Invalid password. Access denied.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [password]);

  // ── Sign out ────────────────────────────────────────────────────────────────
  const handleAdminSignOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
    setUnlocking(false);
    setUsers([]);
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Load users (Real-time listener) ─────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError('');

    const unsubscribe = subscribeToAllUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load users. ' + (err?.message || ''));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // ── Load announcements (Real-time) ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = subscribeToAnnouncements(
      (data) => setAnnouncements(data),
      (err) => console.error('Announcements error:', err)
    );
    return () => unsub();
  }, [isAuthenticated]);

  // ── Post announcement ────────────────────────────────────────────────────────
  const handlePostAnnouncement = useCallback(async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      setAnnToast('Please fill in both title and message.');
      setTimeout(() => setAnnToast(''), 3000);
      return;
    }
    setAnnSending(true);
    try {
      await postAnnouncement({ title: annTitle.trim(), message: annMessage.trim(), type: annType, pinned: annPinned });
      setAnnTitle(''); setAnnMessage(''); setAnnPinned(false); setAnnType('info');
      setAnnToast('✅ Announcement broadcast to all users!');
    } catch (e) {
      setAnnToast('❌ Failed to send: ' + e.message);
    } finally {
      setAnnSending(false);
      setTimeout(() => setAnnToast(''), 4000);
    }
  }, [annTitle, annMessage, annType, annPinned]);

  const handleDeleteAnnouncement = useCallback(async (id) => {
    try { await deleteAnnouncement(id); } catch (e) { console.error(e); }
  }, []);

  const handleToggleAnnouncement = useCallback(async (id, field, current) => {
    try { await toggleAnnouncement(id, field, !current); } catch (e) { console.error(e); }
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!users.length) return { total: 0, active: 0, avgAts: 0, avgReadiness: 0 };
    const active = users.filter(u => daysAgo(u.updatedAt) <= 7).length;
    const avgAts = Math.round(users.reduce((sum, u) => sum + (u.currentAtsScore || 0), 0) / users.length);
    const avgReadiness = Math.round(users.reduce((sum, u) => sum + (u.readinessIndex || 0), 0) / users.length);
    return { total: users.length, active, avgAts, avgReadiness };
  }, [users]);

  // ── User growth chart data ─────────────────────────────────────────────────
  const growthData = useMemo(() => {
    if (!users.length) return [];
    const buckets = {};
    users.forEach(u => {
      const d = u.createdAt;
      let dt;
      if (d?.toDate) dt = d.toDate();
      else if (d?.seconds) dt = new Date(d.seconds * 1000);
      else dt = new Date(d);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
    let cum = 0;
    return sorted.map(([k, v]) => { cum += v; return { label: k, value: cum }; });
  }, [users]);

  // ── ATS score distribution ─────────────────────────────────────────────────
  const atsDistribution = useMemo(() => {
    const ranges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-80', min: 61, max: 80 },
      { label: '81-100', min: 81, max: 100 },
    ];
    return ranges.map(r => ({
      label: r.label,
      value: users.filter(u => {
        const s = u.currentAtsScore || 0;
        return s >= r.min && s <= r.max;
      }).length,
    }));
  }, [users]);

  // ── Filtered & sorted users ─────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.targetRole || '').toLowerCase().includes(q) ||
        (u.targetIndustry || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let valA = a[sortField], valB = b[sortField];
      if (sortField === 'updatedAt' || sortField === 'createdAt') {
        const getTime = v => {
          if (!v) return 0;
          if (v?.toDate) return v.toDate().getTime();
          if (v?.seconds) return v.seconds * 1000;
          return new Date(v).getTime() || 0;
        };
        valA = getTime(valA); valB = getTime(valB);
      }
      if (typeof valA === 'number' && typeof valB === 'number') return sortDir === 'asc' ? valA - valB : valB - valA;
      valA = String(valA || '').toLowerCase(); valB = String(valB || '').toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return list;
  }, [users, searchQuery, sortField, sortDir]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };


  // ═══════════════════════════════════════════════════════════════════════════
  //  PASSWORD GATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="admin-login-backdrop">
        {/* Background glow orbs */}
        <div className="admin-orb admin-orb-1" />
        <div className="admin-orb admin-orb-2" />
        <div className="admin-orb admin-orb-3" />

        <form
          onSubmit={handlePasswordSubmit}
          className={`admin-login-card ${shaking ? 'admin-shake' : ''} ${unlocking ? 'admin-unlock' : ''}`}
        >
          {/* Lock icon */}
          <div className={`admin-lock-icon ${unlocking ? 'unlocked' : ''}`}>
            {unlocking ? <Unlock size={28} /> : <Lock size={28} />}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '16px 0 4px', letterSpacing: '-0.02em' }}>
            Admin Access
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: 1.5 }}>
            Enter the admin password to access<br />the control center.
          </p>

          {/* Password field */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <Shield size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: '100%',
                padding: '13px 44px 13px 40px',
                background: 'var(--bg-input)',
                border: `1px solid ${authError ? 'rgba(239,68,68,0.5)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-primary)',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => { if (!authError) e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = authError ? 'rgba(239,68,68,0.5)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: 'var(--text-subtle)', display: 'flex', alignItems: 'center',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error message */}
          {authError && (
            <p style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={13} /> {authError}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              color: '#fff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; }}
          >
            <ShieldCheck size={18} />
            Authenticate
          </button>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '20px', textAlign: 'center' }}>
            🔒 Secured access · Session expires on tab close
          </p>
        </form>
      </div>
    );
  }


  // ═══════════════════════════════════════════════════════════════════════════
  //  ADMIN DASHBOARD (authenticated)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="admin-dashboard fade-in">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}>
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Admin Control Center
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Monitor users, track progress & manage platform
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="admin-btn-secondary"
          >
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
            Refresh
          </button>
          <button onClick={handleAdminSignOut} className="admin-btn-danger">
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Admin Tab Navigation ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'var(--bg-card)', borderRadius: '14px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        overflowX: 'auto',
        flexWrap: 'wrap',
        WebkitOverflowScrolling: 'touch',
      }}>
        {[
          { id: 'users', label: 'Users & Analytics', icon: Users },
          { id: 'announcements', label: 'Broadcast Announcements', icon: Megaphone },
          { id: 'study-companion', label: 'AI Study Companion', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const active = adminTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '10px', border: 'none',
              background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(37,99,235,0.1))' : 'transparent',
              color: active ? '#818cf8' : 'var(--text-muted)',
              fontSize: '0.84rem', fontWeight: active ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s ease',
              borderBottom: active ? '2px solid #818cf8' : '2px solid transparent',
              whiteSpace: 'nowrap',
            }}>
              <Icon size={15} /> {tab.label}
              {tab.id === 'announcements' && announcements.filter(a => a.active).length > 0 && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  background: '#6366f1', color: '#fff',
                  padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center'
                }}>{announcements.filter(a => a.active).length}</span>
              )}
            </button>
          );
        })}
      </div>


      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Shield size={16} /> {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           ANNOUNCEMENTS TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {adminTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Toast */}
          {annToast && (
            <div style={{
              padding: '12px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
              background: annToast.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${annToast.startsWith('✅') ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: annToast.startsWith('✅') ? '#10b981' : '#f87171',
              animation: 'fadeIn 0.3s ease'
            }}>{annToast}</div>
          )}

          {/* ── Compose Panel ── */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(99,102,241,0.35)'
              }}>
                <Megaphone size={18} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Compose Announcement</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Broadcast a message to all users on their dashboard</p>
              </div>
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message Type</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'info',    label: 'Info',    icon: Info,          color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
                  { id: 'success', label: 'Success', icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
                  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                  { id: 'urgent',  label: 'Urgent',  icon: Zap,           color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)'  },
                ].map(t => {
                  const Icon = t.icon;
                  const active = annType === t.id;
                  return (
                    <button key={t.id} onClick={() => setAnnType(t.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '10px', border: `1px solid ${active ? t.border : 'var(--border-color)'}`,
                      background: active ? t.bg : 'transparent',
                      color: active ? t.color : 'var(--text-muted)',
                      fontSize: '0.8rem', fontWeight: active ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}>
                      <Icon size={13} /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
              <input
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                placeholder="e.g. New Feature Available!"
                maxLength={80}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</label>
              <textarea
                value={annMessage}
                onChange={e => setAnnMessage(e.target.value)}
                placeholder="Write your announcement message here…"
                rows={4}
                maxLength={500}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'inherit',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s', lineHeight: 1.6
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textAlign: 'right', marginTop: '3px' }}>{annMessage.length}/500</div>
            </div>

            {/* Options row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                onClick={() => setAnnPinned(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', borderRadius: '10px',
                  border: `1px solid ${annPinned ? 'rgba(245,158,11,0.35)' : 'var(--border-color)'}`,
                  background: annPinned ? 'rgba(245,158,11,0.08)' : 'transparent',
                  color: annPinned ? '#f59e0b' : 'var(--text-muted)',
                  fontSize: '0.8rem', fontWeight: annPinned ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                <Pin size={13} /> {annPinned ? 'Pinned (top priority)' : 'Pin to top'}
              </button>

              <button
                onClick={handlePostAnnouncement}
                disabled={annSending || !annTitle.trim() || !annMessage.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '10px', border: 'none',
                  background: (!annTitle.trim() || !annMessage.trim()) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #2563eb)',
                  color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                  cursor: (!annTitle.trim() || !annMessage.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: (!annTitle.trim() || !annMessage.trim()) ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { if (annTitle.trim() && annMessage.trim()) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = (annTitle.trim() && annMessage.trim()) ? '0 4px 14px rgba(99,102,241,0.35)' : 'none'; }}
              >
                {annSending
                  ? <><RefreshCw size={14} className="admin-spin" /> Sending…</>
                  : <><Send size={14} /> Broadcast to All Users</>}
              </button>
            </div>
          </div>

          {/* ── Live Announcements Feed ── */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#818cf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Live Announcements</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                  {announcements.length} total
                </span>
              </div>
            </div>

            {announcements.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Megaphone size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No announcements yet. Compose one above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(ann => {
                  const typeMap = {
                    info:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.2)',  icon: Info,          label: 'Info' },
                    success: { color: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle,   label: 'Success' },
                    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', icon: AlertTriangle, label: 'Warning' },
                    urgent:  { color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',  icon: Zap,           label: 'Urgent' },
                  };
                  const t = typeMap[ann.type] || typeMap.info;
                  const TypeIcon = t.icon;
                  let createdStr = '—';
                  if (ann.createdAt?.toDate) createdStr = ann.createdAt.toDate().toLocaleString();
                  else if (ann.createdAt?.seconds) createdStr = new Date(ann.createdAt.seconds * 1000).toLocaleString();

                  return (
                    <div key={ann.id} style={{
                      padding: '16px 18px', borderRadius: '14px',
                      background: ann.active ? t.bg : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${ann.active ? t.border : 'var(--border-color)'}`,
                      opacity: ann.active ? 1 : 0.55,
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                          {/* Type Icon */}
                          <div style={{
                            width: '32px', height: '32px', flexShrink: 0, borderRadius: '9px',
                            background: `${t.color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: '1px'
                          }}>
                            <TypeIcon size={15} color={t.color} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{ann.title}</span>
                              {ann.pinned && (
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '1px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Pin size={9} /> PINNED
                                </span>
                              )}
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: t.color, background: `${t.color}15`, border: `1px solid ${t.border}`, padding: '1px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                {t.label}
                              </span>
                              {!ann.active && (
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-subtle)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', padding: '1px 7px', borderRadius: '4px' }}>HIDDEN</span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{ann.message}</p>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Sent: {createdStr}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          {/* Toggle visible */}
                          <button
                            onClick={() => handleToggleAnnouncement(ann.id, 'active', ann.active)}
                            title={ann.active ? 'Hide from users' : 'Show to users'}
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border-color)',
                              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: ann.active ? '#10b981' : 'var(--text-subtle)', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            {ann.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          {/* Toggle pin */}
                          <button
                            onClick={() => handleToggleAnnouncement(ann.id, 'pinned', ann.pinned)}
                            title={ann.pinned ? 'Unpin' : 'Pin to top'}
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border-color)',
                              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: ann.pinned ? '#f59e0b' : 'var(--text-subtle)', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Pin size={13} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            title="Delete announcement"
                            style={{
                              width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)',
                              background: 'rgba(239,68,68,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#f87171', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           AI STUDY COMPANION TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {adminTab === 'study-companion' && (() => {
        const studyUsers = users.filter(u => (u.studyKitsGeneratedCount || 0) > 0);
        const totalKits = users.reduce((sum, u) => sum + (u.studyKitsGeneratedCount || 0), 0);
        const avgKits = studyUsers.length > 0 ? (totalKits / studyUsers.length).toFixed(1) : 0;
        const topLearners = [...users]
          .filter(u => u.studyKitsGeneratedCount > 0)
          .sort((a, b) => (b.studyKitsGeneratedCount || 0) - (a.studyKitsGeneratedCount || 0))
          .slice(0, 8);
        const recentKits = [];
        users.forEach(u => {
          (u.studyKitsHistory || []).forEach(kit => {
            recentKits.push({ ...kit, userName: u.name || u.email || 'Unknown', userEmail: u.email });
          });
        });
        recentKits.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
        const recentTop = recentKits.slice(0, 12);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Stats cards ── */}
            <div className="admin-stats-grid">
              {[
                { label: 'Total Study Kits Generated', value: totalKits, icon: BookOpen, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
                { label: 'Active Learners', value: studyUsers.length, icon: Brain, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                { label: 'Total Users', value: users.length, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                { label: 'Avg Kits / Learner', value: parseFloat(avgKits), icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="admin-stat-card glass-panel" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={s.color} />
                      </div>
                    </div>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      <AnimatedCounter value={s.value} />
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 0', fontWeight: 500 }}>{s.label}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* ── Top Learners ── */}
              <div className="glass-panel" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(124,58,237,0.3)' }}>
                    <Award size={17} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Top Learners</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Most study kits generated</p>
                  </div>
                </div>
                {topLearners.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookOpen size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>No study kits generated yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topLearners.map((u, i) => {
                      const initial = (u.name || u.email || '?').charAt(0).toUpperCase();
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div key={u.uid || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: i < 3 ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.01)', border: `1px solid ${i < 3 ? 'rgba(124,58,237,0.15)' : 'var(--border-color)'}` }}>
                          <span style={{ fontSize: '1rem', minWidth: '24px' }}>{medals[i] || `${i + 1}.`}</span>
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `hsl(${(initial.charCodeAt(0) * 37) % 360}, 60%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                            {initial}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || 'Unnamed'}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', flexShrink: 0 }}>
                            <BookOpen size={11} color="#818cf8" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>{u.studyKitsGeneratedCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Recent Generations ── */}
              <div className="glass-panel" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }}>
                    <Clock size={17} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Recent Generations</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Latest platform-wide activity</p>
                  </div>
                </div>
                {recentTop.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Activity size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>No recent study kit activity.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', maxHeight: '380px', overflowY: 'auto' }}>
                    {recentTop.map((kit, i) => {
                      let timeStr = '—';
                      try {
                        const dt = new Date(kit.generatedAt);
                        const diff = Math.floor((Date.now() - dt.getTime()) / 60000);
                        if (diff < 60) timeStr = `${diff}m ago`;
                        else if (diff < 1440) timeStr = `${Math.floor(diff / 60)}h ago`;
                        else timeStr = `${Math.floor(diff / 1440)}d ago`;
                      } catch (_) {}
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '11px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: kit.type === 'URL' ? 'rgba(14,165,233,0.1)' : 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {kit.type === 'URL' ? <Hash size={13} color="#60a5fa" /> : <FileText size={13} color="#a78bfa" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kit.topic}</p>
                            <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{kit.userName} · {kit.questionCount}Q · {(kit.charCount || 0).toLocaleString()} chars</p>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '3px' }}>{timeStr}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Adoption Banner ── */}
            <div style={{ padding: '18px 22px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.05))', border: '1px solid rgba(124,58,237,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={22} color="#a78bfa" />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>AI Study Companion Adoption</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {users.length > 0 ? `${Math.round((studyUsers.length / users.length) * 100)}%` : '0%'} of users have used the Study Companion feature
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Users with Kits', value: studyUsers.length },
                  { label: 'Total Kits', value: totalKits },
                  { label: 'Avg per Learner', value: avgKits },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa' }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
           USERS & ANALYTICS TAB
         ══════════════════════════════════════════════════════════════════════ */}
      {adminTab === 'users' && (
      <div>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="admin-stats-grid">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', trend: null },
          { label: 'Active (7d)', value: stats.active, icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)', trend: stats.total ? `${Math.round(stats.active / stats.total * 100)}%` : '0%' },
          { label: 'Avg ATS Score', value: stats.avgAts, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', trend: null },
          { label: 'Avg Readiness', value: stats.avgReadiness, icon: Award, color: '#ec4899', bg: 'rgba(236,72,153,0.1)', trend: null },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="admin-stat-card glass-panel" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={s.color} />
                </div>
                {s.trend && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ArrowUpRight size={11} /> {s.trend}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                <AnimatedCounter value={s.value} />
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 0', fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="admin-charts-grid">
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>User Growth</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Cumulative registrations over time</p>
            </div>
            <Activity size={18} color="var(--text-subtle)" />
          </div>
          <LineChart data={growthData} width={500} height={220} />
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>ATS Score Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Score ranges across all users</p>
            </div>
            <BarChart3 size={18} color="var(--text-subtle)" />
          </div>
          <BarChart data={atsDistribution} width={500} height={220} />
        </div>
      </div>

      {/* ── Users Table ─────────────────────────────────────────────────────── */}
      <div className="glass-panel admin-table-container" style={{ padding: '20px 24px' }}>
        {/* Table header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              All Users
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '10px' }}>
                ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
              </span>
            </h3>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="admin-spin" style={{ marginBottom: '12px', color: '#6366f1' }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>Loading users from database...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    <span>User</span> <SortIcon field="name" />
                  </th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    <span>Email</span> <SortIcon field="email" />
                  </th>
                  <th onClick={() => handleSort('targetRole')} style={{ cursor: 'pointer' }}>
                    <span>Target Role</span> <SortIcon field="targetRole" />
                  </th>
                  <th onClick={() => handleSort('experienceLevel')} style={{ cursor: 'pointer' }}>
                    <span>Level</span> <SortIcon field="experienceLevel" />
                  </th>
                  <th onClick={() => handleSort('currentAtsScore')} style={{ cursor: 'pointer' }}>
                    <span>ATS</span> <SortIcon field="currentAtsScore" />
                  </th>
                  <th onClick={() => handleSort('readinessIndex')} style={{ cursor: 'pointer' }}>
                    <span>Readiness</span> <SortIcon field="readinessIndex" />
                  </th>
                  <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>
                    <span>Last Active</span> <SortIcon field="updatedAt" />
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
                {pagedUsers.map((user, idx) => {
                  const isActive = daysAgo(user.updatedAt) <= 7;
                  const ats = user.currentAtsScore || 0;
                  const atsColor = ats >= 80 ? '#10b981' : ats >= 60 ? '#f59e0b' : ats >= 40 ? '#eab308' : '#ef4444';
                  const readiness = user.readinessIndex || 0;
                  const initial = (user.name || user.email || '?').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={user.uid || idx}
                      onClick={() => setSelectedUser(user)}
                      className="admin-table-row"
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: `hsl(${(initial.charCodeAt(0) * 37) % 360}, 60%, 55%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0,
                          }}>
                            {initial}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                              {user.name || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.targetRole || '—'}</td>
                      <td>
                        {user.experienceLevel ? (
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                            background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)',
                            textTransform: 'capitalize',
                          }}>
                            {user.experienceLevel}
                          </span>
                        ) : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700, color: atsColor,
                          background: `${atsColor}15`, padding: '3px 10px', borderRadius: '6px',
                          border: `1px solid ${atsColor}30`,
                        }}>
                          {ats}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, maxWidth: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{
                              height: '100%', borderRadius: '3px',
                              width: `${Math.min(readiness, 100)}%`,
                              background: readiness >= 70 ? '#10b981' : readiness >= 40 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '28px' }}>{readiness}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(user.updatedAt)}</td>
                      <td>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                          color: isActive ? '#10b981' : '#ef4444',
                          border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Page {currentPage} of {totalPages}
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="admin-btn-secondary admin-btn-sm"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`admin-btn-sm ${page === currentPage ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="admin-btn-secondary admin-btn-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
         USER DETAIL MODAL (slide-over)
         ═══════════════════════════════════════════════════════════════════════ */}
      {selectedUser && (
        <>
          <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)} />
          <div className="admin-detail-panel fade-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'absolute', top: '18px', right: '18px',
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid var(--border-color)', background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'all 0.15s ease', zIndex: 2,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={16} />
            </button>

            {/* User header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingRight: '40px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: `hsl(${((selectedUser.name || 'U').charCodeAt(0) * 37) % 360}, 60%, 55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                {(selectedUser.name || selectedUser.email || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {selectedUser.name || 'Unnamed User'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedUser.title || 'No title set'}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {[
                { icon: Mail, label: 'Email', value: selectedUser.email },
                { icon: MapPin, label: 'Location', value: selectedUser.location },
                { icon: Briefcase, label: 'Target Role', value: selectedUser.targetRole },
                { icon: Star, label: 'Industry', value: selectedUser.targetIndustry },
                { icon: GraduationCap, label: 'Experience', value: selectedUser.experienceLevel },
                { icon: Calendar, label: 'Joined', value: formatDate(selectedUser.createdAt) },
                { icon: Activity, label: 'Last Active', value: formatDate(selectedUser.updatedAt) },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <Icon size={14} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', minWidth: '70px', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>{row.value || '—'}</span>
                  </div>
                );
              })}
            </div>

            {/* Score cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#818cf8' }}>{selectedUser.currentAtsScore || 0}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 600 }}>ATS Score</p>
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#10b981' }}>{selectedUser.readinessIndex || 0}%</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 600 }}>Readiness</p>
              </div>
            </div>

            {/* Profile Completion Radar */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px' }}>Profile Completion</h4>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CompletionRadar user={selectedUser} />
              </div>
            </div>

            {/* Study Companion Stats */}
            {(selectedUser.studyKitsGeneratedCount > 0 || (selectedUser.studyKitsHistory || []).length > 0) && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BookOpen size={14} color="#a78bfa" />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>AI Study Companion</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#a78bfa' }}>{selectedUser.studyKitsGeneratedCount || 0}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 600 }}>Kits Generated</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#60a5fa' }}>{(selectedUser.studyKitsHistory || []).reduce((sum, k) => sum + (k.questionCount || 0), 0)}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 600 }}>Questions Practiced</p>
                  </div>
                </div>
                {(selectedUser.studyKitsHistory || []).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Recent Study Sessions</p>
                    {(selectedUser.studyKitsHistory || []).slice(0, 4).map((kit, i) => {
                      let timeStr = '—';
                      try {
                        const dt = new Date(kit.generatedAt);
                        timeStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } catch (_) {}
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '9px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: kit.type === 'URL' ? 'rgba(14,165,233,0.12)' : 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {kit.type === 'URL' ? <Hash size={11} color="#60a5fa" /> : <FileText size={11} color="#a78bfa" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kit.topic || 'General'}</p>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{kit.questionCount || 0}Q · {(kit.charCount || 0).toLocaleString()} chars</p>
                          </div>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', flexShrink: 0 }}>{timeStr}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {selectedUser.skills?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px' }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedUser.skills.map((skill, i) => (
                    <span key={i} style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
                      background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      {typeof skill === 'string' ? skill : skill.name || skill.label || JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedUser.summary && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px' }}>Summary</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {selectedUser.summary}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
