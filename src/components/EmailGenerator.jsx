import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Sparkles, Copy, RefreshCw, Check,
  ChevronDown, User, Briefcase, Building2,
  AlignLeft, Send, Zap, FileText, Edit3, Sliders
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const EMAIL_TYPES = [
  { id: 'job-application',        label: 'Job Application',        icon: '💼', color: '#2563eb' },
  { id: 'internship-application', label: 'Internship Application',  icon: '🎓', color: '#7c3aed' },
  { id: 'interview-request',      label: 'Interview Request',       icon: '📅', color: '#0891b2' },
  { id: 'interview-followup',     label: 'Interview Follow-up',     icon: '🔔', color: '#d97706' },
  { id: 'thank-you',              label: 'Thank You Email',         icon: '🙏', color: '#10b981' },
  { id: 'salary-negotiation',     label: 'Salary Negotiation',      icon: '💰', color: '#059669' },
  { id: 'offer-acceptance',       label: 'Job Offer Acceptance',    icon: '✅', color: '#16a34a' },
  { id: 'offer-rejection',        label: 'Job Offer Rejection',     icon: '❌', color: '#dc2626' },
  { id: 'leave-request',          label: 'Leave Request',           icon: '🏖️', color: '#ea580c' },
  { id: 'resignation',            label: 'Resignation Letter',      icon: '👋', color: '#9333ea' },
  { id: 'business-inquiry',       label: 'Business Inquiry',        icon: '🤝', color: '#0284c7' },
  { id: 'custom',                 label: 'Custom Email',            icon: '✉️', color: '#6366f1' },
];

const TONES = [
  { id: 'Professional', label: 'Professional', desc: 'Balanced & Polished' },
  { id: 'Formal',       label: 'Formal',       desc: 'Structured & Direct' },
  { id: 'Friendly',     label: 'Friendly',     desc: 'Warm & Personable'   },
];

// ─── Engine ───────────────────────────────────────────────────────────────────
function buildEmail({ type, recipient, jobTitle, company, description, tone, senderName }) {
  const r    = recipient   || 'Hiring Manager';
  const jt   = jobTitle    || 'the advertised position';
  const co   = company     || 'your esteemed organization';
  const desc = description ? description.trim() : '';
  const name = senderName  || '[Your Name]';

  const greeting =
    tone === 'Friendly' ? `Hi ${r},` :
    tone === 'Formal'   ? `Dear ${r},` :
                          `Dear ${r},`;

  const closing =
    tone === 'Friendly' ? `Warm regards,\n\n${name}` :
    tone === 'Formal'   ? `Yours faithfully,\n\n${name}` :
                          `Best regards,\n\n${name}`;

  const descLine = desc ? `\n\n${desc}` : '';

  const map = {
    'job-application': {
      subject: `Application for ${jt} – ${name}`,
      body:
`${greeting}

I am writing to express my strong interest in the ${jt} position at ${co}.${descLine}

With a consistent record of delivering measurable impact and a genuine passion for excellence, I am confident my skills and experience align closely with what your team is looking for. I am particularly drawn to ${co} because of its commitment to innovation and industry leadership.

Please find my resume attached for your review. I would welcome the opportunity to discuss how I can contribute to ${co}'s continued growth. I am available at your earliest convenience and look forward to connecting.

Thank you sincerely for your time and consideration.

${closing}`
    },

    'internship-application': {
      subject: `Internship Application – ${jt} | ${name}`,
      body:
`${greeting}

I am a highly motivated student currently pursuing [Your Degree] at [Your University], and I am excited to apply for the ${jt} internship at ${co}.${descLine}

I am eager to contribute meaningfully while gaining hands-on experience in a professional setting. My academic background has equipped me with strong foundational skills, and I am keen to apply and expand them within your dynamic team.

I have attached my resume for your review and would be grateful for the opportunity to discuss my candidacy further. Thank you for considering my application.

${closing}`
    },

    'interview-request': {
      subject: `Interview Request – ${jt} | ${name}`,
      body:
`${greeting}

I hope this message finds you well. I recently submitted my application for the ${jt} role at ${co}, and I am reaching out to express my continued enthusiasm for this opportunity.${descLine}

I would greatly appreciate the chance to speak with you further about the role and how my background can add value to your team. I am fully flexible and happy to accommodate any schedule that works best for you.

Please let me know a convenient time, and I will make it work. Thank you so much for your time.

${closing}`
    },

    'interview-followup': {
      subject: `Follow-Up: ${jt} Interview – ${name}`,
      body:
`${greeting}

Thank you sincerely for the time you dedicated to speaking with me about the ${jt} role at ${co}. I genuinely enjoyed our conversation and left even more enthusiastic about the opportunity.${descLine}

Our discussion reinforced my belief that my skills and professional goals are a strong match for your team's direction. I remain very interested in contributing to ${co} and am excited about what lies ahead.

Please do not hesitate to reach out if you require any additional information. I look forward to hearing from you.

${closing}`
    },

    'thank-you': {
      subject: `Thank You – ${jt} Meeting | ${name}`,
      body:
`${greeting}

I wanted to take a moment to personally thank you for the time you dedicated to our discussion about the ${jt} opportunity at ${co}. It was a genuinely insightful and enjoyable conversation.${descLine}

I walked away with a clearer picture of the team's vision and an even stronger desire to contribute. Your team's passion and the direction of ${co} are truly inspiring.

Thank you again for the warm welcome and thoughtful exchange. I look forward to staying in touch.

${closing}`
    },

    'salary-negotiation': {
      subject: `Re: ${jt} Offer – Compensation Discussion`,
      body:
`${greeting}

Thank you so much for extending the offer to join ${co} as ${jt}. I am genuinely excited about this opportunity and the team I will be working with.${descLine}

After thoughtful consideration of my experience, qualifications, and current market benchmarks for similar roles, I would like to respectfully explore the possibility of adjusting the base compensation to better reflect the value I bring to this position.

I am very enthusiastic about joining ${co}, and I am confident we can arrive at a mutually beneficial arrangement. I appreciate your openness to this conversation and look forward to your thoughts.

${closing}`
    },

    'offer-acceptance': {
      subject: `Formal Acceptance – ${jt} Offer | ${name}`,
      body:
`${greeting}

It is with great pleasure and enthusiasm that I formally accept the offer to join ${co} as ${jt}.${descLine}

I have reviewed the offer letter in full and am excited to begin this next chapter of my career. Please let me know if there are any documents, onboarding steps, or formalities I should complete prior to my start date — I am eager to hit the ground running.

Thank you for this wonderful opportunity. I look forward to contributing to the team and making a meaningful impact from day one.

${closing}`
    },

    'offer-rejection': {
      subject: `Re: ${jt} Offer – Decision`,
      body:
`${greeting}

Thank you sincerely for extending the offer to join ${co} as ${jt}. After careful and thorough consideration, I have made the difficult decision to respectfully decline at this time.${descLine}

This was by no means an easy choice — I hold ${co} and your team in the highest regard. I hope that our paths may cross professionally in the future, as I have nothing but admiration for the work your organization is doing.

Thank you again for the time, consideration, and warmth you extended throughout this process. I wish you and the team every continued success.

${closing}`
    },

    'leave-request': {
      subject: `Leave Request – [Your Name] | [Date Range]`,
      body:
`${greeting}

I am writing to formally request a period of leave from [Start Date] to [End Date] (inclusive).${descLine}

I will ensure that all current projects and responsibilities are properly documented and handed over to minimize any disruption during my absence. I am happy to assist with the transition planning in advance.

Please let me know if you require any additional information or would like to discuss this request further. I appreciate your understanding and support.

${closing}`
    },

    'resignation': {
      subject: `Resignation Notice – ${name}`,
      body:
`${greeting}

It is with mixed emotions that I write this letter to formally notify you of my resignation from my role at ${co}, effective [Last Working Day — typically two weeks from today].${descLine}

My time at ${co} has been tremendously rewarding, and I am deeply grateful for the opportunities, mentorship, and experiences I have had the privilege of being a part of. This decision has not been made lightly.

I am fully committed to ensuring a smooth and professional transition. I will complete all outstanding responsibilities and am happy to assist with onboarding my successor to the best of my ability.

Thank you for everything. It has been an honor to be part of this team.

${closing}`
    },

    'business-inquiry': {
      subject: `Business Inquiry – Potential Partnership with ${co}`,
      body:
`${greeting}

My name is ${name}, and I am reaching out from [Your Organization] to explore a potential collaboration with ${co}.${descLine}

We believe there is a meaningful synergy between our organizations and would welcome the chance to discuss how we might work together to create mutual value. I would be glad to schedule a brief introductory call at a time that suits your schedule.

Thank you for your time and consideration. I look forward to hearing from you.

${closing}`
    },

    'custom': {
      subject: `[Your Custom Subject Line]`,
      body:
`${greeting}

${desc || 'Please describe what you would like to communicate. Our AI engine crafts polished, professional emails based on your input.'}

Thank you for your time. I look forward to your response.

${closing}`
    },
  };

  return map[type] || map['custom'];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmailGenerator({ userData }) {
  const [emailType,    setEmailType]    = useState('job-application');
  const [recipient,    setRecipient]    = useState('');
  const [jobTitle,     setJobTitle]     = useState('');
  const [company,      setCompany]      = useState('');
  const [description,  setDescription]  = useState('');
  const [tone,         setTone]         = useState('Professional');
  const [activeMode,   setActiveMode]   = useState('ai'); // 'ai' | 'editor'
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [typeOpen,     setTypeOpen]     = useState(false);

  const [generated,    setGenerated]    = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const dropdownRef = useRef(null);
  const outputRef   = useRef(null);

  const selectedType = EMAIL_TYPES.find(t => t.id === emailType);
  const senderName   = userData?.name || '[Your Name]';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runGenerate = () => {
    setIsGenerating(true);
    setGenerated(null);
    setTimeout(() => {
      const result = buildEmail({ type: emailType, recipient, jobTitle, company, description, tone, senderName });
      setGenerated(result);
      setIsGenerating(false);
      showToast("Generated AI Email!");
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, 750);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(`Subject: ${generated.subject}\n\n${generated.body}`);
    setCopied(true);
    showToast("Copied email to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleEditorMode = () => {
    const nextState = !isEditorMode;
    setIsEditorMode(nextState);
    if (nextState) {
      setActiveMode('editor');
      if (!generated) {
        const defaultEmail = buildEmail({ type: emailType, recipient, jobTitle, company, description, tone, senderName });
        setGenerated(defaultEmail);
      }
      showToast("✨ Editor Mode Activated — Edit subject & body text live!");
    } else {
      setActiveMode('ai');
      showToast("AI Prompt Mode Activated");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
          }}>
            <Mail size={22} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>
              AI Email Generator & Editor
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Generate professional emails with AI or edit subject line and body text directly in Editor Mode.
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons matching user screenshot */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className={`btn ${isEditorMode ? 'btn-primary ai-glow' : 'btn-secondary'}`}
            onClick={toggleEditorMode}
            style={{
              backgroundColor: isEditorMode ? '#2563eb' : undefined,
              color: isEditorMode ? '#ffffff' : undefined,
              boxShadow: isEditorMode ? '0 0 15px rgba(37, 99, 235, 0.4)' : undefined
            }}
          >
            <Sparkles size={16} /> Editor Mode
          </button>
          
          {generated && (
            <button className="btn btn-secondary" onClick={handleCopy}>
              <Copy size={15} /> Copy Email
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '20px', alignItems: 'start' }}>

        {/* LEFT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {activeMode === 'ai' && !isEditorMode ? (
            /* AI Generator Form */
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                <Sparkles size={18} /> AI Email Prompter
              </div>

              {/* Email Type Dropdown */}
              <div>
                <label style={labelStyle}>Email Type</label>
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setTypeOpen(o => !o)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      border: typeOpen ? '1px solid var(--border-focus)' : '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
                      cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                      boxShadow: typeOpen ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem' }}>{selectedType?.icon}</span>
                      {selectedType?.label}
                    </span>
                    <ChevronDown size={15} color="var(--text-muted)"
                      style={{ transform: typeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
                  </button>

                  {typeOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                      maxHeight: '280px', overflowY: 'auto', padding: '6px',
                      animation: 'fadeIn 0.15s ease'
                    }}>
                      {EMAIL_TYPES.map(t => (
                        <button key={t.id} type="button"
                          onClick={() => { setEmailType(t.id); setTypeOpen(false); }}
                          style={{
                            width: '100%', textAlign: 'left', padding: '9px 12px',
                            borderRadius: '7px', border: 'none', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: emailType === t.id ? 700 : 500,
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: emailType === t.id ? 'var(--accent-primary-light)' : 'transparent',
                            color: emailType === t.id ? 'var(--accent-primary)' : 'var(--text-main)',
                            transition: 'background 0.1s'
                          }}
                        >
                          <span style={{ fontSize: '1rem', width: '22px', textAlign: 'center' }}>{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label style={labelStyle}>Recipient Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color="var(--text-subtle)" style={iconStyle} />
                  <input type="text" className="form-input" placeholder="e.g. Sarah Johnson"
                    value={recipient} onChange={e => setRecipient(e.target.value)}
                    style={{ paddingLeft: '36px' }} />
                </div>
              </div>

              {/* Job Title + Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>Job Title <OptTag /></label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={14} color="var(--text-subtle)" style={iconStyle} />
                    <input type="text" className="form-input" placeholder="e.g. UX Designer"
                      value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                      style={{ paddingLeft: '36px' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Company <OptTag /></label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={14} color="var(--text-subtle)" style={iconStyle} />
                    <input type="text" className="form-input" placeholder="e.g. Apple Inc."
                      value={company} onChange={e => setCompany(e.target.value)}
                      style={{ paddingLeft: '36px' }} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  Key Context&nbsp;
                  <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-subtle)' }}>(achievements, skills, context)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <AlignLeft size={14} color="var(--text-subtle)" style={{ ...iconStyle, top: '14px', transform: 'none' }} />
                  <textarea className="form-textarea" rows={4}
                    placeholder="e.g. Led a redesign that improved DAU by 35%, reduced churn by 15%..."
                    value={description} onChange={e => setDescription(e.target.value)}
                    style={{ paddingLeft: '36px', resize: 'vertical' }} />
                </div>
              </div>

              {/* Tone */}
              <div>
                <label style={labelStyle}>Writing Tone</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {TONES.map(t => (
                    <button key={t.id} type="button" onClick={() => setTone(t.id)}
                      style={{
                        padding: '9px 6px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: tone === t.id ? '1.5px solid var(--accent-primary)' : '1.5px solid var(--border-color)',
                        backgroundColor: tone === t.id ? 'var(--accent-primary-light)' : 'var(--bg-input)',
                        color: tone === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                        transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '2px', textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>{t.label}</span>
                      <span style={{ fontSize: '0.66rem', opacity: 0.7 }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button type="button"
                className="btn btn-primary ai-glow"
                onClick={runGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '13px', fontSize: '0.92rem',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  border: 'none', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                  opacity: isGenerating ? 0.8 : 1
                }}
              >
                {isGenerating
                  ? <><RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Crafting your email…</>
                  : <><Sparkles size={16} /> Generate Email</>
                }
              </button>
            </div>
          ) : (
            /* Direct Manual Editor Mode Form */
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                <Edit3 size={18} /> Email Text Editor
              </div>

              <div>
                <label style={labelStyle}>Subject Line</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={generated ? generated.subject : ''}
                  onChange={(e) => {
                    const newSub = e.target.value;
                    setGenerated(prev => prev ? { ...prev, subject: newSub } : { subject: newSub, body: '' });
                  }}
                  placeholder="e.g. Application for Position"
                />
              </div>

              <div>
                <label style={labelStyle}>Email Body</label>
                <textarea 
                  className="form-textarea" 
                  rows={10}
                  value={generated ? generated.body : ''}
                  onChange={(e) => {
                    const newBody = e.target.value;
                    setGenerated(prev => prev ? { ...prev, body: newBody } : { subject: '', body: newBody });
                  }}
                  placeholder="Type or paste your customized email body text here..."
                />
              </div>

              <button 
                className="btn btn-primary" 
                onClick={() => showToast("Updated email content live!")}
                style={{ width: '100%' }}
              >
                <Check size={16} /> Save & Sync Email
              </button>
            </div>
          )}

          {/* Pro Tip */}
          <div style={{
            padding: '13px 16px', borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', gap: '10px', alignItems: 'flex-start'
          }}>
            <Zap size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
              <strong>Editor Tip:</strong> Click <strong>Editor Mode</strong> above to toggle live editing on both form inputs and the right email card preview!
            </p>
          </div>
        </div>

        {/* RIGHT OUTPUT PANEL */}
        <div ref={outputRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '520px' }}>

          {/* Empty State */}
          {!generated && !isGenerating && (
            <div className="glass-panel" style={{
              flex: 1, minHeight: '520px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '20px',
              padding: '40px 24px', textAlign: 'center'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(99,102,241,0.1))',
                border: '1px solid rgba(37,99,235,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Send size={30} color="var(--accent-primary)" />
              </div>
              <div style={{ maxWidth: '320px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
                  Your Email Will Appear Here
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  Select an email type, fill in the fields, and click <strong>Generate Email</strong> to get a polished, professional email in under a second.
                </p>
              </div>

              {/* Type chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '420px' }}>
                {EMAIL_TYPES.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => setEmailType(t.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      border: emailType === t.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: emailType === t.id ? 'var(--accent-primary-light)' : 'var(--bg-input)',
                      color: emailType === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skeleton Loader */}
          {isGenerating && (
            <div className="glass-panel" style={{ padding: '28px', minHeight: '520px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sparkles size={17} color="var(--accent-primary)" style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Crafting your email…</span>
              </div>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '4px' }}>
                <div className="skeleton" style={{ height: '10px', width: '30%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '65%' }} />
              </div>
              {[95, 88, 72, 91, 60, 80, 55, 85, 40].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: '11px', width: `${w}%`, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          )}

          {/* Generated Output Card */}
          {generated && !isGenerating && (
            <div 
              className="glass-panel fade-in" 
              style={{ 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: isEditorMode ? '0 0 0 3px #2563eb, 0 10px 30px rgba(0,0,0,0.2)' : undefined,
                transition: 'box-shadow 0.2s ease'
              }}
            >

              {/* Window Bar */}
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                    <span key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                  ))}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 500 }}>
                    {selectedType?.icon} {selectedType?.label} {isEditorMode ? '(Live Card Edit ON)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button type="button" onClick={runGenerate} className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.75rem', gap: '5px' }}>
                    <RefreshCw size={12} /> Regenerate
                  </button>
                  <button type="button" onClick={handleCopy} className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.75rem', gap: '5px' }}>
                    {copied ? <><Check size={12} color="#10b981" /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Subject Line */}
              <div style={{
                padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
                background: 'var(--accent-primary-light)'
              }}>
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Subject Line
                </span>
                <p 
                  contentEditable={isEditorMode}
                  suppressContentEditableWarning
                  onBlur={(e) => setGenerated(prev => prev ? { ...prev, subject: e.target.innerText } : prev)}
                  style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: '5px 0 0', lineHeight: 1.4, outline: 'none', cursor: isEditorMode ? 'text' : 'default' }}
                >
                  {generated.subject}
                </p>
              </div>

              {/* Email Body */}
              <div style={{ padding: '24px 28px', overflowY: 'auto', maxHeight: '500px' }}>
                <pre 
                  contentEditable={isEditorMode}
                  suppressContentEditableWarning
                  onBlur={(e) => setGenerated(prev => prev ? { ...prev, body: e.target.innerText } : prev)}
                  style={{
                    fontFamily: 'var(--font-primary)', fontSize: '0.875rem',
                    lineHeight: 1.85, color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                    outline: 'none', cursor: isEditorMode ? 'text' : 'default'
                  }}
                >
                  {generated.body}
                </pre>
              </div>

              {/* Action Bar */}
              <div style={{
                padding: '14px 20px', borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                display: 'flex', justifyContent: 'flex-end', gap: '10px'
              }}>
                <button type="button" onClick={runGenerate} className="btn btn-secondary"
                  style={{ padding: '9px 18px' }}>
                  <RefreshCw size={14} /> Regenerate
                </button>
                <button type="button" onClick={handleCopy} className="btn btn-primary"
                  style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', border: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Email</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  fontSize: '0.74rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  marginBottom: '7px'
};

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none'
};

function OptTag() {
  return (
    <span style={{ fontSize: '0.66rem', fontWeight: 400, textTransform: 'none', color: 'var(--text-subtle)', marginLeft: '2px' }}>
      optional
    </span>
  );
}
