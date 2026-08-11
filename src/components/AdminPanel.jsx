import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, ShieldCheck, Lock, Unlock, Eye, EyeOff, X, Search,
  Users, UserCheck, TrendingUp, Award, ChevronDown, ChevronUp,
  Activity, BarChart3, ArrowUpRight, ArrowDownRight, Calendar,
  Mail, MapPin, Briefcase, GraduationCap, Star, LogOut, RefreshCw,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { loadAllUsers } from '../utils/adminService';

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

  // ── Load users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, fetchUsers]);

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
            onClick={fetchUsers}
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
