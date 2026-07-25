import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, Check, Star, ArrowRight,
  FileText, FileCheck, MessageSquare, Compass,
  ShieldCheck, Globe, Share2 
} from 'lucide-react';

// -- 3D Web Globe -------------------------------------------------------------
function HeroWeb3D() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'light'
  );

  useEffect(() => {
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.37;

    const LABELS = ['AI','Resume','Career','ATS','Jobs','Skills','CV','Interview','Hire','Goals','Network','Grow','Strategy','LinkedIn'];
    const nodes = Array.from({ length: 100 }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / 100);
      const theta = Math.sqrt(100 * Math.PI) * phi;
      return { phi, theta, label: i < LABELS.length ? LABELS[i] : null };
    });

    let rotX = 0.28, rotY = 0;

    const proj = (x, y, z) => {
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);
      const x1 = x*cY - z*sY, z1 = x*sY + z*cY;
      const y2 = y*cX - z1*sX, z2 = y*sX + z1*cX;
      const fov = 640, s = fov / (fov + z2 + R);
      return { sx: cx + x1*s, sy: cy + y2*s, z: z2, scale: s };
    };

    const draw = () => {
      // Re-read theme on every frame so it reacts instantly
      const light = document.documentElement.getAttribute('data-theme') === 'light';

      ctx.clearRect(0, 0, W, H);

      // Background glow — stronger in dark, subtle in light
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
      if (light) {
        bg.addColorStop(0, 'rgba(37,99,235,0.10)');
        bg.addColorStop(0.6, 'rgba(99,102,241,0.06)');
        bg.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        bg.addColorStop(0, 'rgba(37,99,235,0.09)');
        bg.addColorStop(0.6, 'rgba(139,92,246,0.04)');
        bg.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const pts = nodes.map(({ phi, theta, label }) => {
        const x = R * Math.sin(phi) * Math.cos(theta);
        const y = R * Math.cos(phi);
        const z = R * Math.sin(phi) * Math.sin(theta);
        return { ...proj(x, y, z), label };
      });

      // Draw edges
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < R * 0.54) {
            const dep = ((a.z + b.z) / 2 + R) / (2 * R);
            // Light mode: much higher alpha and darker hue lightness so edges are clearly visible
            const alpha = light
              ? (1 - dist/(R*0.54)) * (0.35 + 0.45*dep)
              : (1 - dist/(R*0.54)) * (0.12 + 0.20*dep);
            const hue = 220 + dep * 35;
            const lightness = light ? '45%' : '68%';
            ctx.strokeStyle = 'hsla('+hue+',85%,'+lightness+','+alpha+')';
            ctx.lineWidth = light ? (0.8 + dep * 0.7) : (0.5 + dep * 0.45);
            ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of pts) {
        const bright = (p.z + R) / (2 * R);
        const r = 2.6 * p.scale * (0.4 + bright * 0.6);
        const alpha = light ? (0.5 + bright * 0.5) : (0.2 + bright * 0.8);
        const hue = 220 + bright * 40;

        // Glow halo — bigger & more opaque in light mode so it's visible on white
        if (bright > 0.55) {
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 7);
          const glowAlpha = light ? alpha * 0.22 : alpha * 0.26;
          const glowL = light ? '45%' : '70%';
          g.addColorStop(0, 'hsla('+hue+',90%,'+glowL+','+glowAlpha+')');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r * 7, 0, Math.PI * 2); ctx.fill();
        }

        // Core dot — dark and vivid in light mode
        const dg = ctx.createRadialGradient(p.sx - r*0.3, p.sy - r*0.3, 0, p.sx, p.sy, r);
        if (light) {
          dg.addColorStop(0, 'hsla('+(hue+10)+',90%,42%,'+alpha+')');
          dg.addColorStop(1, 'hsla('+hue+',80%,30%,'+(alpha*0.7)+')');
        } else {
          dg.addColorStop(0, 'hsla('+(hue+20)+',95%,88%,'+alpha+')');
          dg.addColorStop(1, 'hsla('+hue+',80%,60%,'+(alpha*0.55)+')');
        }
        ctx.fillStyle = dg;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(r, 0.8), 0, Math.PI * 2); ctx.fill();

        // Labels removed

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
  }, [isLight]);

  // Theme-aware badge styles
  const badge = (text, darkStyle, lightStyle, delay) => (
    <div style={{
      position:'absolute', padding:'7px 15px', borderRadius:'999px',
      fontSize:'0.72rem', fontWeight:700, backdropFilter:'blur(10px)',
      animation:'web3d-float 3.5s ease-in-out infinite '+delay+'s',
      letterSpacing:'0.5px', whiteSpace:'nowrap',
      ...(isLight ? lightStyle : darkStyle)
    }}>{text}</div>
  );

  return (
    <div style={{ position:'relative', width:'100%', aspectRatio:'1/0.88', minHeight:'320px', maxHeight:'520px' }}>
      {/* Decorative rings — more visible in light mode */}
      <div style={{ position:'absolute', width:'70%', height:'70%', borderRadius:'50%', border: isLight ? '1px solid rgba(37,99,235,0.25)' : '1px solid rgba(96,165,250,0.15)', top:'15%', left:'15%', animation:'web3d-spin 20s linear infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:'53%', height:'53%', borderRadius:'50%', border: isLight ? '1px dashed rgba(99,102,241,0.20)' : '1px dashed rgba(167,139,250,0.10)', top:'23.5%', left:'23.5%', animation:'web3d-spin 32s linear infinite reverse', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:'88%', height:'88%', borderRadius:'50%', border: isLight ? '1px solid rgba(37,99,235,0.12)' : '1px solid rgba(37,99,235,0.07)', top:'6%', left:'6%', animation:'web3d-spin 48s linear infinite', pointerEvents:'none' }} />
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', display:'block', cursor:'crosshair', borderRadius:'20px' }} />
      {badge(
        '⚡ AI-Powered',
        { background:'rgba(37,99,235,0.20)', border:'1px solid rgba(96,165,250,0.35)', color:'#93c5fd', boxShadow:'0 4px 16px rgba(37,99,235,0.18)', top:'7%', right:'3%' },
        { background:'rgba(37,99,235,0.12)', border:'1px solid rgba(37,99,235,0.40)', color:'#1d4ed8', boxShadow:'0 4px 16px rgba(37,99,235,0.15)', top:'7%', right:'3%' },
        0
      )}
      {badge(
        '🌐 Global Network',
        { background:'rgba(16,185,129,0.16)', border:'1px solid rgba(52,211,153,0.3)', color:'#6ee7b7', boxShadow:'0 4px 16px rgba(16,185,129,0.15)', bottom:'14%', left:'2%' },
        { background:'rgba(5,150,105,0.12)', border:'1px solid rgba(5,150,105,0.35)', color:'#065f46', boxShadow:'0 4px 16px rgba(5,150,105,0.12)', bottom:'14%', left:'2%' },
        1.2
      )}
      {badge(
        '🚀 Career OS',
        { background:'rgba(139,92,246,0.17)', border:'1px solid rgba(167,139,250,0.32)', color:'#c4b5fd', boxShadow:'0 4px 16px rgba(139,92,246,0.16)', bottom:'26%', right:'1%' },
        { background:'rgba(109,40,217,0.10)', border:'1px solid rgba(109,40,217,0.30)', color:'#5b21b6', boxShadow:'0 4px 16px rgba(109,40,217,0.12)', bottom:'26%', right:'1%' },
        0.6
      )}
      {badge(
        '✨ 50K+ Hired',
        { background:'rgba(245,158,11,0.14)', border:'1px solid rgba(251,191,36,0.28)', color:'#fcd34d', boxShadow:'0 4px 16px rgba(245,158,11,0.12)', top:'30%', left:'1%' },
        { background:'rgba(217,119,6,0.12)', border:'1px solid rgba(217,119,6,0.30)', color:'#92400e', boxShadow:'0 4px 16px rgba(217,119,6,0.10)', top:'30%', left:'1%' },
        1.8
      )}
      <style>{`@keyframes web3d-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes web3d-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}`}</style>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted, openSignIn }) {
  return (
    <div style={{ width:'100%', minHeight:'100vh', backgroundColor:'var(--bg-app)', color:'var(--text-main)', display:'flex', flexDirection:'column', fontFamily:'var(--font-primary)' }}>

      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px clamp(16px, 4vw, 48px)', borderBottom:'1px solid var(--border-color)', backgroundColor:'var(--bg-sidebar)', position:'sticky', top:0, zIndex:100, gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'8px', backgroundColor:'var(--accent-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <span style={{ fontSize:'1.2rem', fontWeight:800, letterSpacing:'-0.3px' }}>Career<span style={{ color:'var(--accent-primary)' }}>Pilot AI</span></span>
        </div>
        <nav style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
          <a href="#features" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600 }}>Features</a>
          <a href="#testimonials" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600 }}>Social Proof</a>
          <a href="#pricing" style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.9rem', fontWeight:600 }}>Pricing</a>
        </nav>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink: 0 }}>
          <button onClick={openSignIn || onGetStarted} className="btn btn-secondary" style={{ border:'none' }}>Sign In</button>
          <button onClick={openSignIn || onGetStarted} className="btn btn-primary">Get Started</button>
        </div>
      </header>

      <section style={{ padding:'clamp(40px,6vw,76px) clamp(16px,4vw,48px)', maxWidth:'1280px', margin:'0 auto', width:'100%', display:'flex', flexWrap:'wrap', gap:'48px', alignItems:'center' }}>
        <div style={{ flex:'1 1 300px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'5px 12px', borderRadius:'6px', backgroundColor:'var(--accent-primary-light)', border:'1px solid rgba(37,99,235,0.25)', marginBottom:'20px' }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'var(--accent-primary)' }}></span>
            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--accent-primary)', textTransform:'uppercase', letterSpacing:'0.5px' }}>V1.0 — AI INTERVIEW INTEGRATION</span>
          </div>
          <h1 style={{ fontSize:'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight:800, lineHeight:1.15, letterSpacing:'-1px', marginBottom:'20px' }}>
            Navigate Your Career with <span style={{ color:'var(--accent-primary)' }}>AI Precision.</span>
          </h1>
          <p style={{ fontSize:'clamp(0.9rem, 2vw, 1.05rem)', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'32px', maxWidth:'540px' }}>
            Build resumes, ace interviews, and land your dream job with your personal AI career co-pilot.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
            <button onClick={onGetStarted} className="btn btn-primary" style={{ padding:'12px 24px', fontSize:'0.95rem' }}>Get Started Free</button>
            <button onClick={onGetStarted} className="btn btn-secondary" style={{ padding:'12px 20px', fontSize:'0.95rem' }}>
              <Play size={16} fill="currentColor" /> Watch Demo
            </button>
          </div>
        </div>
        <div style={{ flex:'1 1 280px', minWidth: 0 }}><HeroWeb3D /></div>
      </section>

      <section id="features" style={{ padding:'clamp(40px,5vw,70px) clamp(16px,4vw,48px)', maxWidth:'1280px', margin:'0 auto', width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <h2 style={{ fontSize:'2rem', fontWeight:800, letterSpacing:'-0.5px', marginBottom:'8px' }}>Tools for High-Performance Success</h2>
          <p style={{ fontSize:'0.95rem', color:'var(--text-muted)', maxWidth:'600px', margin:'0 auto' }}>Everything you need to outperform the competition in a digital-first market.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px' }}>
          <div className="glass-panel" style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', backgroundColor:'var(--accent-primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}><FileText size={20} color="var(--accent-primary)" /></div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700 }}>Intelligent Resume Builder</h3>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', lineHeight:1.6 }}>AI-driven suggestions for bullets, skills, and summaries that match your target roles.</p>
          </div>
          <div className="glass-panel" style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', backgroundColor:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}><FileCheck size={20} color="var(--accent-success)" /></div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700 }}>ATS Checker</h3>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', lineHeight:1.6 }}>Scan your resume against any job description to see your exact match score.</p>
            <div style={{ marginTop:'auto', textAlign:'center', padding:'10px', background:'var(--bg-input)', borderRadius:'var(--radius-sm)' }}><span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--accent-success)' }}>94%</span></div>
          </div>
          <div className="glass-panel" style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', backgroundColor:'rgba(236,72,153,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}><MessageSquare size={20} color="#ec4899" /></div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700 }}>Interview Coach</h3>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', lineHeight:1.6 }}>Simulate high-pressure interviews with AI tailored to specific industries.</p>
          </div>
          <div className="glass-panel" style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', backgroundColor:'var(--accent-primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}><Compass size={20} color="var(--accent-primary)" /></div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700 }}>Personal Career Advisor</h3>
            <p style={{ fontSize:'0.88rem', color:'var(--text-muted)', lineHeight:1.6 }}>24/7 access to strategic career advice, negotiation tips, and salary benchmarks.</p>
          </div>
        </div>
      </section>

      <section id="testimonials" style={{ padding:'clamp(30px,4vw,50px) clamp(16px,4vw,48px) clamp(40px,5vw,70px)', maxWidth:'1280px', margin:'0 auto', width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <h2 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:'8px' }}>Used by high-performers at</h2>
          <div style={{ display:'flex', justifyContent:'center', gap:'24px', opacity:0.6, fontSize:'0.95rem', fontWeight:700, margin:'16px 0' }}>
            <span>GOOGLE</span> <span>•</span> <span>AMAZON</span> <span>•</span> <span>META</span> <span>•</span> <span>MICROSOFT</span> <span>•</span> <span>STRIPE</span>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px' }}>
          {[
            { init:'S', name:'Sarah Jenkins', role:'Senior Product Manager', bg:'var(--accent-primary)', text:'CareerPilot interview coach is uncanny. It asked exactly what the hiring manager at Google asked the next day. Landed the L5 position!' },
            { init:'D', name:'David Chen', role:'Software Engineer', bg:'var(--accent-secondary)', text:'The ATS Checker was a game changer. My old resume was invisible. After the AI tweaks, I got 4 interviews in a week.' },
            { init:'M', name:'Marcus Thorne', role:'Marketing Director', bg:'var(--accent-success)', text:'Strategic, clear, and highly effective. This feels like having a $500/hr executive coach in your pocket 24/7.' }
          ].map((r, i) => (
            <div key={i} className="glass-panel" style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ display:'flex', gap:'4px' }}>{[...Array(5)].map((_, j) => <Star key={j} size={15} fill="#f59e0b" color="#f59e0b" />)}</div>
              <p style={{ fontSize:'0.9rem', color:'var(--text-main)', lineHeight:1.6 }}>&#34;{r.text}&#34;</p>
              <div style={{ marginTop:'auto', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:r.bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'0.8rem' }}>{r.init}</div>
                <div><h5 style={{ fontSize:'0.85rem', fontWeight:700, margin:0 }}>{r.name}</h5><span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{r.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ padding:'clamp(40px,5vw,70px) clamp(16px,4vw,48px)', maxWidth:'960px', margin:'0 auto', width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <h2 style={{ fontSize:'2rem', fontWeight:800, marginBottom:'6px' }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize:'0.95rem', color:'var(--text-muted)' }}>Invest in your career growth today</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'24px', alignItems:'center' }}>
          <div className="glass-panel" style={{ padding:'32px', display:'flex', flexDirection:'column', gap:'18px' }}>
            <div><h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-muted)', marginBottom:'6px' }}>Basic</h3><div style={{ fontSize:'2.5rem', fontWeight:800 }}>$0 <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>/ month</span></div></div>
            <ul style={{ display:'flex', flexDirection:'column', gap:'10px', listStyle:'none', padding:0, fontSize:'0.88rem' }}>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-success)" /> 1 AI Resume Build</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-success)" /> 3 ATS Score Checks</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-success)" /> Basic Cover Letter Drafts</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px', opacity:0.5 }}><Check size={16} /> 1 AI Mock Interview Session</li>
            </ul>
            <button onClick={onGetStarted} className="btn btn-secondary" style={{ width:'100%', marginTop:'auto', padding:'10px' }}>Start Free</button>
          </div>
          <div className="glass-panel" style={{ padding:'36px 32px', display:'flex', flexDirection:'column', gap:'18px', borderColor:'var(--accent-primary)', boxShadow:'var(--shadow-md)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div><h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--accent-primary)', marginBottom:'6px' }}>Pro</h3><div style={{ fontSize:'2.7rem', fontWeight:800 }}>$19 <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>/ month</span></div></div>
              <span className="badge badge-purple" style={{ padding:'5px 10px' }}>MOST POPULAR</span>
            </div>
            <ul style={{ display:'flex', flexDirection:'column', gap:'10px', listStyle:'none', padding:0, fontSize:'0.88rem' }}>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> Unlimited AI Resume & CV Builder</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> Unlimited ATS Score Checks & Optimization</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> AI Cover Letter & Cold Email Generator</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> AI Mock Interview Coach & Scoring</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> 24/7 AI Career Advisor & Roadmap Generator</li>
              <li style={{ display:'flex', alignItems:'center', gap:'8px' }}><Check size={16} color="var(--accent-primary)" /> Premium Templates & Multi-Format Exports</li>
            </ul>
            <button onClick={onGetStarted} className="btn btn-primary" style={{ width:'100%', marginTop:'auto', padding:'12px' }}>Go Premium</button>
          </div>
        </div>
      </section>

      <section style={{ padding:'clamp(30px,4vw,50px) clamp(16px,4vw,48px)', maxWidth:'1050px', margin:'0 auto 50px auto', width:'100%' }}>
        <div style={{ backgroundColor:'var(--accent-primary)', borderRadius:'var(--radius-xl)', padding:'48px 36px', textAlign:'center', color:'#ffffff' }}>
          <h2 style={{ fontSize:'2.2rem', fontWeight:800, marginBottom:'12px', letterSpacing:'-0.5px' }}>Ready to accelerate your career?</h2>
          <p style={{ fontSize:'1rem', opacity:0.9, maxWidth:'560px', margin:'0 auto 28px auto', lineHeight:1.6 }}>Join 50,000+ professionals using AI to land high-paying jobs with confidence.</p>
          <button onClick={onGetStarted} className="btn" style={{ backgroundColor:'#ffffff', color:'var(--accent-primary)', fontWeight:800, padding:'12px 28px', fontSize:'0.95rem' }}>Get Started for Free</button>
        </div>
      </section>

      <footer style={{ borderTop:'1px solid var(--border-color)', padding:'24px clamp(16px,4vw,48px)', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--text-muted)', fontSize:'0.82rem', flexWrap:'wrap', gap:'12px' }}>
        <div><strong style={{ color:'var(--text-main)' }}>CareerPilot AI</strong><span style={{ margin:'0 8px' }}>•</span>© 2026 CareerPilot AI. Precision Career Growth.</div>
        <div style={{ display:'flex', gap:'18px' }}>
          <a href="#" style={{ color:'inherit', textDecoration:'none' }}>Privacy Policy</a>
          <a href="#" style={{ color:'inherit', textDecoration:'none' }}>Terms of Service</a>
          <a href="#" style={{ color:'inherit', textDecoration:'none' }}>Help Center</a>
          <a href="#" style={{ color:'inherit', textDecoration:'none' }}>Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
