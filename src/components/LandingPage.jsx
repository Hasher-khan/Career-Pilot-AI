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
// ── Hero Mockup (SaaS Dashboard & Resume ATS Preview) ─────────────────────────
function HeroMockup() {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      aspectRatio: '1/0.85', 
      minHeight: '340px', 
      maxHeight: '480px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px'
    }}>
      {/* Glow Effects */}
      <div style={{ 
        position: 'absolute', 
        width: '80%', 
        height: '80%', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(30px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Behind Card (Interview Coach Mockup) */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '2%',
        width: '68%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '16px',
        zIndex: 1,
        transform: 'rotate(-2deg) translateY(10px)',
        transition: 'transform 0.3s ease',
        pointerEvents: 'none'
      }} className="glass-panel">
        {/* Window controls */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Live Coaching Session</span>
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px' }}>"What is your approach to clinic workflow optimization?"</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
          <Sparkles size={14} color="#818cf8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.76rem', color: '#c4b5fd', lineHeight: 1.4 }}>Analyzing answer... Detected: Structured layout, Good use of data points.</span>
        </div>
      </div>

      {/* Main Front Card (ATS Analyzer & Builder Mockup) */}
      <div style={{
        position: 'relative',
        width: '85%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '20px',
        zIndex: 2,
        transform: 'rotate(1deg) translateY(-10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }} className="glass-panel">
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ats_optimizer.pdf</span>
          </div>
          <span style={{ fontSize: '0.74rem', background: 'rgba(16,185,129,0.12)', color: '#34d399', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>ATS Scanned</span>
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          {/* Resume Preview Representation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
            <div style={{ height: '14px', width: '70%', backgroundColor: 'var(--text-main)', borderRadius: '3px' }} />
            <div style={{ height: '8px', width: '40%', backgroundColor: 'var(--text-muted)', borderRadius: '2px', marginBottom: '8px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ height: '6px', width: '90%', backgroundColor: 'var(--text-subtle)', borderRadius: '2px' }} />
              <div style={{ height: '6px', width: '85%', backgroundColor: 'var(--text-subtle)', borderRadius: '2px' }} />
              <div style={{ height: '6px', width: '95%', backgroundColor: 'var(--text-subtle)', borderRadius: '2px' }} />
            </div>
            
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #10b981' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 600 }}>✓ AI Enhancement Added</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>"Spearheaded patient intake workflow re-design, reducing wait times by 22%."</p>
            </div>
          </div>

          {/* Scoring panel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ 
              position: 'relative', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'conic-gradient(#6366f1 94%, var(--border-color) 0%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Inner Circle for donut effect */}
              <div style={{ 
                position: 'absolute', 
                width: '66px', 
                height: '66px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>94%</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ATS Match</span>
              </div>
            </div>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resume Strength:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Excellent</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Keyword Match:</span>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>24 / 26</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tag Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
          {['Healthcare IT', 'Clinical Operations', 'Compliance', 'Budget Management'].map((tag, i) => (
            <span key={i} style={{ 
              fontSize: '0.68rem', 
              background: 'rgba(99,102,241,0.1)', 
              border: '1px solid rgba(99,102,241,0.2)', 
              color: '#818cf8', 
              padding: '2px 8px', 
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Floating Badges */}
      <div style={{
        position: 'absolute',
        bottom: '8%',
        right: '4%',
        background: 'rgba(245,158,11,0.14)',
        border: '1px solid rgba(251,191,36,0.28)',
        color: '#fcd34d',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(8px)',
        zIndex: 3,
        animation: 'lp-float 3s ease-in-out infinite'
      }}>
        ✨ Optimized for Google ATS
      </div>

      <style>{`
        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
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

      {/* ── Announcement Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #6366f1, #ec4899)',
        color: '#ffffff',
        padding: '10px 20px',
        textAlign: 'center',
        fontSize: '0.86rem',
        fontWeight: 700,
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        position: 'relative',
        zIndex: 101
      }}>
        <Sparkles size={16} style={{ animation: 'lp-pulse 1.5s infinite' }} />
        <span>🎉 careerpilotai is now free by Owner Hasher Khan</span>
      </div>

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
          <button onClick={openSignIn} className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '9px 18px' }}>Get Started</button>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px, 7vw, 96px) clamp(16px, 4vw, 48px)', maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center' }}>
        {/* Hero Text */}
        <div style={{ flex: '1 1 300px' }}>


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
        <div style={{ flex: '1 1 280px', minWidth: 0 }}><HeroMockup /></div>
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
              {['10 Chat Boot Queries / day', 'Basic Cover Letter Generator', 'AI Email Generator'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#10b981" />
                  </div>
                  {item}
                </li>
              ))}
              {['Transcript Generator', 'AI Practice Quizzes'].map((item, i) => (
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
              <div style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 900, lineHeight: 1 }}>$0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ month</span></div>
              <p style={{ fontSize: '0.82rem', color: '#10b981', marginTop: '6px', fontWeight: 700 }}>Temporarily Free Promo</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem' }}>
              {['Unlimited Chat Boot Queries', 'Gemini 3.7 Flash Model access', 'Cover Letter Generator', 'AI Email Generator', 'Transcript Generator', 'AI Practice Quizzes'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#818cf8" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={openSignIn} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '14px', fontWeight: 800 }}>🚀 Get Started Free</button>
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

      {/* ── Developer Attribution Card ───────────────────────────────────── */}
      <section style={{ padding: '0 clamp(16px,4vw,48px) 30px clamp(16px,4vw,48px)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px', 
          background: 'rgba(99, 102, 241, 0.03)', 
          borderColor: 'rgba(99, 102, 241, 0.15)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              HK
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Built by
              </p>
              <h4 style={{ margin: '2px 0 4px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Hashir Khan
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                AI & Web Solutions Engineer dedicated to building smart, responsive, and high-impact digital products.
              </p>
            </div>
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
            <span><strong style={{ color: 'var(--text-main)' }}>Chat Boot</strong> &nbsp;© 2026. Advanced AI Chat Assistant.</span>
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
        @media (max-width:480px) {
          .lp-btn-signin { display: none !important; }
        }
      `}</style>
    </div>
  );
}
