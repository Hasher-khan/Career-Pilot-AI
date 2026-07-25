import React, { useState, useRef } from 'react';
import { 
  Send, 
  Copy, 
  Download, 
  Sparkles, 
  Check, 
  Info, 
  FileText, 
  Building, 
  Briefcase, 
  Edit3,
  RefreshCw,
  User,
  MapPin,
  Mail,
  Phone,
  Sliders
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CoverLetterGenerator({ userData, setUserData }) {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('Formal'); // 'Formal' | 'Creative' | 'Persuasive'
  const [keyAchievements, setKeyAchievements] = useState('');

  const [activeMode, setActiveMode] = useState('ai'); // 'ai' | 'editor'
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const letterRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Dynamic Cover Letter Text State starts blank (null)
  const [letterContent, setLetterContent] = useState(null);

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let p1 = `I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}. Having closely followed ${companyName}'s recent innovations, I am confident that my background in software architecture and design aligns perfectly with your team's mission.`;
      let p2 = `In my previous role, ${keyAchievements || 'I spearheaded key product redesigns that boosted engagement by 40%.'} I specialize in translating business objectives into high-impact user experiences.`;

      if (tone === 'Creative') {
        p1 = `Driven by a passion for disruptive product experiences, I am thrilled to apply for the ${jobTitle} role at ${companyName}. ${companyName}'s vision for user-first innovation resonates deeply with my creative philosophy.`;
        p2 = `Throughout my career, ${keyAchievements || 'I have designed award-winning web platforms serving over 500k users.'} I thrive in fast-paced environments where bold ideas meet technical execution.`;
      } else if (tone === 'Persuasive') {
        p1 = `If ${companyName} is seeking a high-performing ${jobTitle} who delivers immediate business impact, I welcome the opportunity to connect. My track record demonstrates consistent acceleration of product metrics and team output.`;
        p2 = `For instance, ${keyAchievements || 'I optimized core SaaS conversion funnels, generating a 35% growth in recurring ARR.'} I bring strategic focus and quantitative rigor to every initiative.`;
      }

      const p3 = `I am particularly impressed by ${companyName}'s leadership in the market. My technical competencies across ${userData?.skills ? userData.skills.slice(0, 4).join(', ') : 'modern stacks'} empower me to drive immediate value for your engineering and design teams.`;
      const p4 = `Thank you for your time and consideration. I look forward to discussing how my experience can support ${companyName}'s strategic goals.`;

      setLetterContent({
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        recipientName: 'Hiring Manager',
        companyAddress: `${companyName} HQ\nSan Francisco, CA`,
        subject: `RE: ${jobTitle} Position`,
        salutation: 'Dear Hiring Manager,',
        bodyText: `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`
      });
      setIsGenerating(false);
      showToast("Generated AI Cover Letter!");
    }, 800);
  };

  const handleCopyClipboard = () => {
    if (!letterContent) return;
    const fullText = `${userData?.name || 'Alex Rivera'}\n${userData?.location || 'San Francisco, CA'} | ${userData?.email || 'alex.rivera@email.com'} | ${userData?.phone || '555-0123'}\n\n${letterContent.date}\n\n${letterContent.recipientName}\n${companyName}\n${letterContent.companyAddress}\n\n${letterContent.subject}\n\n${letterContent.salutation}\n\n${letterContent.bodyText}\n\nSincerely,\n${userData?.name || 'Alex Rivera'}`;
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    showToast("Copied text to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!letterRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = letterRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const scale = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const renderWidth = canvas.width * scale;
      const renderHeight = canvas.height * scale;
      const xOffset = (pdfWidth - renderWidth) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, 0, renderWidth, renderHeight);
      pdf.save(`Cover_Letter_${(companyName || 'Application').replace(/\s+/g, '_')}.pdf`);
      showToast("Downloaded PDF successfully!");
    } catch (err) {
      console.error('PDF Export failed:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const toggleEditorMode = () => {
    const nextState = !isEditorMode;
    setIsEditorMode(nextState);
    if (nextState) {
      setActiveMode('editor');
      showToast("✨ Editor Mode Activated — You can now edit form & document text live!");
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

      {/* Header Control Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--accent-primary)" /> Cover Letter Generator & Editor
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Generate tailored cover letters with AI or customize text directly in Editor Mode.
          </p>
        </div>

        {/* Mode Switcher Buttons matching user screenshot */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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

          <button className="btn btn-secondary" onClick={handleCopyClipboard} title="Copy to Clipboard">
            <Copy size={15} /> Copy Text
          </button>

          <button 
            className="btn btn-primary ai-glow" 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{ backgroundColor: '#2563eb' }}
          >
            <Download size={15} /> {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Control Panel - Right Document Preview */}
      <div className="cover-letter-grid">
        
        {/* Left Panel: AI Mode vs Editor Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {activeMode === 'ai' && !isEditorMode ? (
            /* AI Generator Form */
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                <Sparkles size={18} /> AI Cover Letter Prompter
              </div>

              {/* Job Title */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Senior Product Designer" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              {/* Company Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Acme Corp" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Tone Selector Pills */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tone Selector</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Formal', 'Creative', 'Persuasive'].map((t) => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        border: tone === t ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: tone === t ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-input)',
                        color: tone === t ? 'var(--accent-primary)' : 'var(--text-main)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Key Achievements (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  rows={4}
                  placeholder="Mention specific impacts, metrics, or skills..." 
                  value={keyAchievements}
                  onChange={(e) => setKeyAchievements(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <button 
                className="btn btn-primary ai-glow" 
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', backgroundColor: '#2563eb' }}
                onClick={handleGenerateAI}
                disabled={isGenerating}
              >
                <Sparkles size={18} />
                {isGenerating ? 'Generating with AI...' : 'Generate Cover Letter'}
              </button>
            </div>
          ) : (
            /* Direct Manual Editor Mode Form */
            !letterContent ? (
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Please click "Create New Cover Letter" or use AI generation to start editing.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Edit3 size={18} /> Cover Letter Content Editor
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject Line</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={letterContent.subject} 
                    onChange={(e) => setLetterContent({ ...letterContent, subject: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Recipient Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={letterContent.recipientName} 
                      onChange={(e) => setLetterContent({ ...letterContent, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Company Address / Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={letterContent.companyAddress} 
                    onChange={(e) => setLetterContent({ ...letterContent, companyAddress: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Salutation</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={letterContent.salutation} 
                    onChange={(e) => setLetterContent({ ...letterContent, salutation: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Letter Body Text</label>
                  <textarea 
                    className="form-textarea" 
                    rows={8}
                    value={letterContent.bodyText} 
                    onChange={(e) => setLetterContent({ ...letterContent, bodyText: e.target.value })}
                  />
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => showToast("Changes synced live to document!")}
                  style={{ width: '100%' }}
                >
                  <Check size={16} /> Save & Sync Document
                </button>
              </div>
            )
          )}

          {/* Pro Tip */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <Info size={16} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-success)', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
              <strong>Editor Tip:</strong> Click the <strong>Editor Mode</strong> button above to toggle live editing on both the form fields and the document preview canvas!
            </p>
          </div>
        </div>

        {/* Right Panel: Live Document Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!letterContent ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '780px',
              backgroundColor: 'var(--bg-sidebar)',
              border: '1.5px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-muted)'
            }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>No Cover Letter Found</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '320px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                You have not created a cover letter yet. Enter details on the left and click "Generate Cover Letter", or click the button below to start with a blank template.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => setLetterContent({
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  recipientName: '[Hiring Manager]',
                  companyAddress: '[Company Address]',
                  subject: 'RE: [Job Title] Position',
                  salutation: 'Dear Hiring Manager,',
                  bodyText: '[Write your cover letter body here...]'
                })}
                style={{ backgroundColor: '#2563eb' }}
              >
                Create New Cover Letter
              </button>
            </div>
          ) : (
            <>
              <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* macOS Control Bar */}
                <div style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--bg-input)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
                      preview_cover_letter.pdf {isEditorMode ? '(Live Paper Edit ON)' : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={handleCopyClipboard} title="Copy text">
                      {copied ? <Check size={14} color="var(--accent-success)" /> : <Copy size={14} />}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={handleDownloadPdf} title="Download PDF">
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {/* Formatted Cover Letter Canvas */}
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-input)', display: 'flex', justifyContent: 'center' }}>
                  <div 
                    ref={letterRef}
                    className="resume-paper printable-resume"
                    style={{
                      width: '100%',
                      maxWidth: '680px',
                      minHeight: '780px',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      padding: '44px 48px',
                      borderRadius: '4px',
                      boxShadow: isEditorMode ? '0 0 0 3px #2563eb, 0 20px 40px rgba(11, 28, 48, 0.18)' : '0 20px 40px rgba(11, 28, 48, 0.12)',
                      fontFamily: "'Inter', sans-serif",
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      transition: 'box-shadow 0.2s ease'
                    }}
                  >
                    {/* Applicant Header */}
                    <div style={{ marginBottom: '4px' }}>
                      <h2 
                        contentEditable={isEditorMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setUserData && setUserData({ ...userData, name: e.target.innerText })}
                        style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b1c30', margin: 0, outline: 'none', cursor: isEditorMode ? 'text' : 'default' }}
                      >
                        {userData?.name || 'Your Name'}
                      </h2>
                      <p style={{ fontSize: '0.88rem', color: '#475569', margin: '4px 0 0 0' }}>
                        {userData?.location || 'Location'} | {userData?.email || 'Email'} | {userData?.phone || 'Phone Number'}
                      </p>
                    </div>

                    {/* Date & Recipient Block */}
                    <div>
                      <p 
                        contentEditable={isEditorMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setLetterContent({ ...letterContent, date: e.target.innerText })}
                        style={{ fontSize: '0.88rem', color: '#334155', margin: 0, outline: 'none' }}
                      >
                        {letterContent.date}
                      </p>
                      <div style={{ marginTop: '12px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.4 }}>
                        <p 
                          contentEditable={isEditorMode}
                          suppressContentEditableWarning
                          onBlur={(e) => setLetterContent({ ...letterContent, recipientName: e.target.innerText })}
                          style={{ margin: 0, fontWeight: 600, outline: 'none' }}
                        >
                          {letterContent.recipientName}
                        </p>
                        <p 
                          contentEditable={isEditorMode}
                          suppressContentEditableWarning
                          onBlur={(e) => setCompanyName(e.target.innerText)}
                          style={{ margin: 0, outline: 'none' }}
                        >
                          {companyName}
                        </p>
                        <p 
                          contentEditable={isEditorMode}
                          suppressContentEditableWarning
                          onBlur={(e) => setLetterContent({ ...letterContent, companyAddress: e.target.innerText })}
                          style={{ margin: 0, whiteSpace: 'pre-line', outline: 'none' }}
                        >
                          {letterContent.companyAddress}
                        </p>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                      <p 
                        contentEditable={isEditorMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setLetterContent({ ...letterContent, subject: e.target.innerText })}
                        style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b1c30', margin: 0, outline: 'none' }}
                      >
                        {letterContent.subject}
                      </p>
                    </div>

                    {/* Salutation & Body Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                      <p 
                        contentEditable={isEditorMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setLetterContent({ ...letterContent, salutation: e.target.innerText })}
                        style={{ margin: 0, fontWeight: 600, outline: 'none' }}
                      >
                        {letterContent.salutation}
                      </p>
                      
                      <div 
                        contentEditable={isEditorMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setLetterContent({ ...letterContent, bodyText: e.target.innerText })}
                        style={{ whiteSpace: 'pre-wrap', margin: 0, outline: 'none', cursor: isEditorMode ? 'text' : 'default' }}
                      >
                        {letterContent.bodyText}
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <p style={{ margin: 0 }}>Sincerely,</p>
                        <p style={{ margin: '8px 0 0 0', fontWeight: 800, color: '#0b1c30' }}>
                          {userData?.name || 'Your Name'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={handleCopyClipboard} style={{ padding: '10px 20px' }}>
                  {copied ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
                
                <button 
                  className="btn btn-primary ai-glow" 
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{ backgroundColor: '#2563eb', padding: '10px 24px' }}
                >
                  <Download size={16} />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
