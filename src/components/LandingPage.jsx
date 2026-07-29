import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Check, Star, ArrowRight,
  FileText, FileCheck, MessageSquare, Compass,
  Zap, Shield, TrendingUp, Users, Menu, X
} from 'lucide-react';

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── 3D Web Globe ─────────────────────────────────────────────────────────────
function HeroWeb3D() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.37;

    const nodes = Array.from({ length: 100 }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / 100);
      const theta = Math.sqrt(100 * Math.PI) * phi;
      return { phi, theta };
    });

    let rotX = 0.28, rotY = 0;

    const proj = (x, y, z) => {
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);
      const x1 = x * cY - z * sY, z1 = x * sY + z * cY;
      const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      const fov = 640, s = fov / (fov + z2 + R);
      return { sx: cx + x1 * s, sy: cy + y2 * s, z: z2, scale: s };
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
      bg.addColorStop(0, 'rgba(99,102,241,0.10)');
      bg.addColorStop(0.6, 'rgba(139,92,246,0.05)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const pts = nodes.map(({ phi, theta }) => {
        const x = R * Math.sin(phi) * Math.cos(theta);
        const y = R * Math.cos(phi);
        const z = R * Math.sin(phi) * Math.sin(theta);
        return proj(x, y, z);
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < R * 0.54) {
            const dep = ((a.z + b.z) / 2 + R) / (2 * R);
            const alpha = (1 - dist / (R * 0.54)) * (0.12 + 0.22 * dep);
            ctx.strokeStyle = `hsla(${220 + dep * 35},85%,68%,${alpha})`;
            ctx.lineWidth = 0.5 + dep * 0.45;
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        const bright = (p.z + R) / (2 * R);
        const r = 2.6 * p.scale * (0.4 + bright * 0.6);
        const alpha = 0.2 + bright * 0.8;
        const hue = 220 + bright * 40;
        if (bright > 0.55) {
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 7);
          g.addColorStop(0, `hsla(${hue},90%,70%,${alpha * 0.26})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 7, 0, Math.PI * 2); ctx.fill();
        }
        const dg = ctx.createRadialGradient(p.sx - r * 0.3, p.sy - r * 0.3, 0, p.sx, p.sy, r);
        dg.addColorStop(0, `hsla(${hue + 20},95%,88%,${alpha})`);
        dg.addColorStop(1, `hsla(${hue},80%,60%,${alpha * 0.55})`);
        ctx.fillStyle = dg;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(r, 0.8), 0, Math.PI * 2); ctx.fill();
      }

      rotY += 0.0013 + mouseRef.current.x * 0.00013;
      rotX += 0.0006 + mouseRef.current.y * 0.00006;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left - cx, y: e.clientY - rect.top - cy };
    };
    const onLeave = () => { mouseRef.current = { x: 0, y: 0 }; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1/0.88', minHeight: '260px', maxHeight: '480px' }}>
      <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: '1px solid rgba(96,165,250,0.15)', top: '15%', left: '15%', animation: 'lp-spin 20s linear infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '53%', height: '53%', borderRadius: '50%', border: '1px dashed rgba(167,139,250,0.10)', top: '23.5%', left: '23.5%', animation: 'lp-spin 32s linear infinite reverse', pointerEvents: 'none' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', cursor: 'crosshair', borderRadius: '20px' }} />
      {[
        { text: '⚡ AI-Powered', style: { top: '7%', right: '3%', background: 'rgba(37,99,235,0.20)', border: '1px solid rgba(96,165,250,0.35)', color: '#93c5fd' }, delay: '0s' },
        { text: '🌐 Global Network', style: { bottom: '14%', left: '2%', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(52,211,153,0.3)', color: '#6ee7b7' }, delay: '1.2s' },
        { text: '🚀 Career OS', style: { bottom: '26%', right: '1%', background: 'rgba(139,92,246,0.17)', border: '1px solid rgba(167,139,250,0.32)', color: '#c4b5fd' }, delay: '0.6s' },
        { text: '✨ 50K+ Hired', style: { top: '30%', left: '1%', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(251,191,36,0.28)', color: '#fcd34d' }, delay: '1.8s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', padding: '7px 15px', borderRadius: '999px',
          fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          animation: `lp-float 3.5s ease-in-out ${b.delay} infinite`,
          letterSpacing: '0.5px', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          ...b.style
        }}>{b.text}</div>
      ))}
      <style>{`
        @keyframes lp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
      `}</style>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted, openSignIn }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', title: 'Intelligent Resume Builder', desc: 'AI-driven suggestions for bullets, skills, and summaries that match your target roles and beat ATS filters.' },
    { icon: FileCheck, color: '#10b981', bg: 'rgba(16,185,129,0.12)', title: 'Real-Time ATS Checker', desc: 'Scan your resume against any job description. See your exact match score and get instant fix suggestions.' },
    { icon: MessageSquare, color: '#ec4899', bg: 'rgba(236,72,153,0.12)', title: 'AI Interview Coach', desc: 'Simulate pressure interviews with AI tailored to your specific role, company, and industry level.' },
    { icon: Compass, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: 'Personal Career Advisor', desc: '24/7 strategic career advice, salary benchmarks, and negotiation tactics from your AI co-pilot.' },
    { icon: Zap, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', title: 'AI CV Maker & PDF Studio', desc: 'Answer a few questions. Our AI writes, designs, and exports a beautiful CV in under 3 minutes.' },
    { icon: Shield, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', title: 'Privacy-First Platform', desc: 'Your data is encrypted, never sold, and never shared. You own your career story — always.' },
  ];

  const testimonials = [
    { init: 'S', name: 'Sarah Jenkins', role: 'Senior PM @ Google', bg: '#6366f1', text: 'CareerPilot\'s interview coach is uncanny. It asked exactly what the hiring manager at Google asked the next day. Landed the L5 offer!' },
    { init: 'D', name: 'David Chen', role: 'Software Engineer @ Meta', bg: '#8b5cf6', text: 'The ATS Checker was a game changer. My old resume was invisible. After the AI tweaks, I got 4 interviews in one week.' },
    { init: 'M', name: 'Marcus Thorne', role: 'Marketing Director @ Stripe', bg: '#10b981', text: 'This feels like having a $500/hr executive coach in your pocket 24/7. Strategic, precise, and worth every penny.' },
  ];

  const stats = [
    { value: 50000, suffix: '+', label: 'Professionals hired' },
    { value: 94, suffix: '%', label: 'Average ATS score' },
    { value: 3, suffix: 'min', label: 'To build your CV' },
    { value: 4.9, suffix: '/5', label: 'Average user rating', prefix: '' },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-primary)', overflowX: 'hidden' }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-sidebar)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
            Career<span style={{ color: 'var(--accent-primary)' }}>Pilot AI</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="lp-desktop-nav">
          {['Features', 'Social Proof', 'Pricing'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{label}</a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={openSignIn || onGetStarted} className="btn btn-secondary" style={{ border: 'none', fontSize: '0.88rem', padding: '9px 18px' }}>Sign In</button>
          <button onClick={openSignIn || onGetStarted} className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '9px 18px' }}>Get Started</button>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 7vw, 96px) clamp(16px, 4vw, 48px)', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center' }}>
        {/* Hero Text */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '24px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)', animation: 'lp-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>V1.0 — AI Interview Integration Live</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Navigate Your Career<br />
            with <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Precision.</span>
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '520px' }}>
            Build resumes that get past ATS, ace every interview, and land your dream job — with your personal AI career co-pilot working 24/7.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button onClick={onGetStarted} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 800, gap: '10px', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              <Sparkles size={18} /> Get Started Free
            </button>
            <button onClick={onGetStarted} className="btn btn-secondary" style={{ padding: '14px 22px', fontSize: '1rem', gap: '8px' }}>
              Watch Demo <ArrowRight size={16} />
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 600 }}>4.9/5 rating</span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>No credit card required</span>
            <span style={{ color: 'var(--border-color)' }}>·</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Free forever plan</span>
          </div>
        </div>

        {/* Globe */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}><HeroWeb3D /></div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 clamp(16px, 4vw, 48px) clamp(40px,5vw,60px)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: 'clamp(20px,3vw,32px) 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '6px', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix || ''} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: 'clamp(40px,5vw,80px) clamp(16px,4vw,48px)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '16px' }}>
            <Zap size={13} color="#818cf8" /><span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Everything you need</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '12px' }}>Tools Built for High-Performance Careers</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>Everything you need to outperform the competition in a digital-first job market.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={f.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Logos / Social Proof ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(20px,3vw,40px) clamp(16px,4vw,48px)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Trusted by high-performers at</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(16px, 4vw, 48px)', flexWrap: 'wrap', opacity: 0.45 }}>
          {['GOOGLE', 'AMAZON', 'META', 'MICROSOFT', 'STRIPE', 'APPLE'].map(name => (
            <span key={name} style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)', fontWeight: 900, letterSpacing: '1.5px', color: 'var(--text-main)' }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="social-proof" style={{ padding: 'clamp(40px,5vw,80px) clamp(16px,4vw,48px)', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '16px' }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" /><span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Real results, real people</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>What our users are saying</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {testimonials.map((r, i) => (
            <div key={i} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={15} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.7, flex: 1 }}>&#34;{r.text}&#34;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem', flexShrink: 0 }}>{r.init}</div>
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{r.name}</p>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: 'clamp(40px,5vw,80px) clamp(16px,4vw,48px)', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
            <TrendingUp size={13} color="#10b981" /><span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Simple pricing</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>Invest in Your Career Growth</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No hidden fees. Cancel anytime.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Free */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Basic</p>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 900, lineHeight: 1 }}>$0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ month</span></div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>Perfect to get started</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem' }}>
              {['1 ATS Resume Build', '1 AI CV Creation', 'Basic Cover Letter Generator'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#10b981" />
                  </div>
                  {item}
                </li>
              ))}
              {['AI Email Generator', '24/7 Career Assistant'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.35 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="var(--text-muted)" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>Start Free</button>
          </div>

          {/* Pro */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', borderColor: 'rgba(99,102,241,0.5)', boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 16px 48px rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.5px' }}>MOST POPULAR</div>
            {/* Gradient accent top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)' }} />
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Pro</p>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 900, lineHeight: 1 }}>$19 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ month</span></div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>For serious career growth</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem' }}>
              {['Unlimited ATS Resume & Builder', 'Unlimited AI CV Maker & Exports', 'Cover Letter Generator', 'AI Email Generator', '24/7 CareerPilot Assistant', 'Priority support & updates'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#818cf8" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '14px', fontWeight: 800, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>Go Premium →</button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(20px,3vw,40px) clamp(16px,4vw,48px)', maxWidth: '1100px', margin: '0 auto 60px auto', width: '100%' }}>
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', padding: 'clamp(40px,6vw,72px) clamp(24px,4vw,56px)', textAlign: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #be185d 100%)' }}>
          {/* Background dots */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', marginBottom: '20px' }}>
              <Users size={13} color="#fff" /><span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Join 50,000+ professionals</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 900, marginBottom: '14px', color: '#ffffff', letterSpacing: '-0.5px' }}>Ready to accelerate your career?</h2>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', opacity: 0.9, maxWidth: '540px', margin: '0 auto 32px auto', lineHeight: 1.65, color: '#fff' }}>Use AI to write your resume, ace your interviews, and land high-paying jobs with confidence.</p>
            <button onClick={onGetStarted} style={{ backgroundColor: '#ffffff', color: '#4f46e5', fontWeight: 900, padding: '16px 36px', fontSize: '1rem', border: 'none', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', WebkitTapHighlightColor: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <Sparkles size={20} color="#4f46e5" /> Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '28px clamp(16px,4vw,48px)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span><strong style={{ color: 'var(--text-main)' }}>CareerPilot AI</strong> &nbsp;© 2026. Precision Career Growth.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us'].map(link => (
              <a key={link} href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
                onMouseLeave={e => e.target.style.color = ''}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @media (max-width:768px) {
          .lp-desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
