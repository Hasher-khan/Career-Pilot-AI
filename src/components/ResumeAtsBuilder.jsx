import React, { useState, useRef } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileCheck,
  Award,
  Printer,
  ZoomIn,
  ZoomOut,
  Palette,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lightbulb,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Edit3,
  Check,
  Layout
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { analyzeResumeATS } from '../utils/atsAnalyzer';
import { actionVerbsLibrary } from '../sampleData';
import { RESUME_TEMPLATES, renderTemplate } from './ResumeTemplates';

export default function ResumeAtsBuilder({ userData, setUserData }) {
  const [jobDescription, setJobDescription] = useState(
    `Senior React / Frontend Engineer position requiring TypeScript, Jest testing, Core Web Vitals optimization, and AWS cloud experience.`
  );
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'scan'
  const [editorStep, setEditorStep] = useState(1); // 1: Personal, 2: Experience, 3: Skills/Edu
  const [zoomLevel, setZoomLevel] = useState(1);
  const [primaryColor, setPrimaryColor] = useState('#2563eb'); // Default CareerPilot Blue from Stitch
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const resumeRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Colors library for resume accent picker
  const colorOptions = [
    { name: 'CareerPilot Blue', value: '#2563eb' },
    { name: 'Royal Indigo', value: '#4f46e5' },
    { name: 'Emerald Green', value: '#059669' },
    { name: 'Midnight Slate', value: '#1e293b' },
    { name: 'Crimson Red', value: '#dc2626' }
  ];

  // Run ATS analysis live
  const atsResult = analyzeResumeATS(userData, jobDescription);

  const handleSummaryChange = (e) => {
    setUserData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleAddSkill = (skillName) => {
    const skillToAdd = skillName || newSkillInput;
    if (!skillToAdd || !skillToAdd.trim()) return;
    const cleanSkill = skillToAdd.trim();
    if (userData.skills.includes(cleanSkill)) return;
    setUserData(prev => ({ ...prev, skills: [...prev.skills, cleanSkill] }));
    setNewSkillInput('');
    showToast(`Added skill: ${cleanSkill}`);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setUserData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleExperienceChange = (id, field, value) => {
    setUserData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const handleAddExperience = () => {
    const newExp = {
      id: Date.now(),
      role: "",
      company: "",
      period: "",
      location: "",
      highlights: [""]
    };
    setUserData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    showToast("Added new work experience position");
  };

  const handleRemoveExperience = (id) => {
    setUserData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const handleAddHighlight = (expId) => {
    setUserData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          return {
            ...exp,
            highlights: [...(exp.highlights || []), ""]
          };
        }
        return exp;
      })
    }));
  };

  const handleRemoveHighlight = (expId, hIdx) => {
    setUserData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id === expId) {
          const newHighlights = exp.highlights.filter((_, idx) => idx !== hIdx);
          return { ...exp, highlights: newHighlights };
        }
        return exp;
      })
    }));
  };

  // High-fidelity PDF Download
  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = resumeRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
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
      const yOffset = (pdfHeight - renderHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, yOffset > 0 ? yOffset : 0, renderWidth, renderHeight);

      const fileName = `${(userData.name || 'Resume').replace(/\s+/g, '_')}_CareerPilot_ATS.pdf`;
      pdf.save(fileName);
      showToast("PDF downloaded successfully!");
    } catch (error) {
      console.error('PDF Generation failed, triggering print fallback:', error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportText = () => {
    let resumeText = `${userData.name || 'Your Name'}\n${userData.targetRole || userData.title || ''}\n${userData.email || ''} | ${userData.phone || ''} | ${userData.location || ''}\n\nSUMMARY\n${userData.summary || ''}\n\nSKILLS\n${(userData.skills || []).join(", ")}\n\nEXPERIENCE\n`;
    
    (userData.experience || []).forEach(exp => {
      resumeText += `\n${exp.role} - ${exp.company} (${exp.period})\n`;
      if (Array.isArray(exp.highlights)) {
        exp.highlights.forEach(h => {
          resumeText += `  • ${h}\n`;
        });
      }
    });

    resumeText += `\nEDUCATION\n`;
    (userData.education || []).forEach(edu => {
      resumeText += `${edu.degree} - ${edu.school} (${edu.year || ''})\n`;
    });

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(userData.name || 'Resume').replace(/\s+/g, '_')}_ATS_Resume.txt`;
    link.click();
    showToast("Exported ATS Plain Text file");
  };

  // Direct Inline Editing helper for live document paper
  const handleInlineBlur = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
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

      {/* Top Header Control Strip */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText color="var(--accent-primary)" size={20} /> AI Resume Builder & PDF Studio
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Craft ATS-optimized, high-converting resumes matching CareerPilot "The Professional" design template.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('editor');
              showToast("Editor Mode Active");
            }}
          >
            <Sparkles size={15} /> Editor Mode
          </button>
          <button 
            className={`btn ${activeTab === 'scan' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('scan');
              showToast("ATS Matcher Active");
            }}
          >
            <FileCheck size={15} /> ATS Matcher
          </button>

          <button className="btn btn-secondary" onClick={handleExportText} title="Export plain text for ATS job portals">
            <Download size={15} /> Export TXT
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={() => window.print()}
            title="Browser Print to PDF"
          >
            <Printer size={15} /> Print PDF
          </button>

          <button 
            className="btn btn-primary ai-glow" 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{ backgroundColor: '#2563eb', padding: '10px 20px' }}
          >
            <Download size={16} /> 
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Scanner - Right High-Fidelity Resume Document Preview */}
      <div className="resume-builder-grid">
        
        {/* Left Container: Form Editor or Scan Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {activeTab === 'editor' ? (
            <>
              {/* Stepper Progress */}
              <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div 
                  onClick={() => setEditorStep(1)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: editorStep === 1 ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: editorStep === 1 ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                  }}>1</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: editorStep === 1 ? 700 : 500, color: editorStep === 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Personal</span>
                </div>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)', margin: '0 12px' }}></div>
                <div 
                  onClick={() => setEditorStep(2)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: editorStep === 2 ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: editorStep === 2 ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                  }}>2</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: editorStep === 2 ? 700 : 500, color: editorStep === 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Experience</span>
                </div>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)', margin: '0 12px' }}></div>
                <div 
                  onClick={() => setEditorStep(3)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: editorStep === 3 ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: editorStep === 3 ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                  }}>3</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: editorStep === 3 ? 700 : 500, color: editorStep === 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>Skills</span>
                </div>
              </div>

              {/* Step 1: Personal Information */}
              {editorStep === 1 && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={18} /> Personal Information
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userData.name || ''} 
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        placeholder="e.g. Alex Henderson"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Job Title</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userData.targetRole || userData.title || ''} 
                        onChange={(e) => setUserData({ ...userData, targetRole: e.target.value, title: e.target.value })}
                        placeholder="e.g. Senior UX Designer"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Professional Email</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userData.email || ''} 
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        placeholder="alex.h@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userData.phone || ''} 
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        placeholder="+1 (555) 000-1122"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={userData.location || ''} 
                      onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                      placeholder="New York, NY"
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label">Professional Summary</label>
                      <button 
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          const polished = `${userData.summary || ''} Specialized in scalable design systems, empathetic user advocacy, and cross-functional team collaboration.`;
                          setUserData(prev => ({ ...prev, summary: polished }));
                          showToast("AI Summary Polish applied!");
                        }}
                      >
                        <Sparkles size={13} /> AI Polish
                      </button>
                    </div>
                    <textarea 
                      className="form-textarea" 
                      value={userData.summary || ''}
                      onChange={handleSummaryChange}
                      rows={4}
                      placeholder="Describe your key qualifications, achievements, and technical expertise..."
                    />
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '12px' }}
                    onClick={() => setEditorStep(2)}
                  >
                    Continue to Work Experience →
                  </button>
                </div>
              )}

              {/* Step 2: Work Experience */}
              {editorStep === 2 && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={18} /> Work Experience
                    </h4>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 12px' }} onClick={handleAddExperience}>
                      <Plus size={14} /> Add Position
                    </button>
                  </div>

                  {(userData.experience || []).map((exp) => (
                    <div key={exp.id} style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                          <div>
                            <label className="form-label">Job Title / Role</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={exp.role} 
                              onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} 
                              placeholder="e.g. Senior Software Developer"
                            />
                          </div>
                          <div>
                            <label className="form-label">Company</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={exp.company} 
                              onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} 
                              placeholder="e.g. TechNova Solutions"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveExperience(exp.id)} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', marginLeft: '12px' }}
                          title="Delete Position"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label className="form-label">Date Range</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={exp.period || ''} 
                            onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)} 
                            placeholder="Jan 2020 - Present"
                          />
                        </div>
                        <div>
                          <label className="form-label">Location</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={exp.location || ''} 
                            onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)} 
                            placeholder="New York, NY"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label">Bullet Achievements</label>
                        <button 
                          type="button" 
                          onClick={() => handleAddHighlight(exp.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          + Add Bullet
                        </button>
                      </div>

                      {(exp.highlights || []).map((h, hIdx) => (
                        <div key={hIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={h}
                            onChange={(e) => {
                              const newHighlights = [...exp.highlights];
                              newHighlights[hIdx] = e.target.value;
                              handleExperienceChange(exp.id, 'highlights', newHighlights);
                            }}
                            placeholder="e.g. Led a cross-functional engineering team to build enterprise SaaS solutions."
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveHighlight(exp.id, hIdx)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditorStep(1)}>
                      ← Back
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setEditorStep(3)}>
                      Continue to Skills →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Skills & Education */}
              {editorStep === 3 && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={18} /> Skills & ATS Keywords
                  </h4>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Add a new technical skill..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button className="btn btn-primary" onClick={() => handleAddSkill()}>
                      <Plus size={15} /> Add
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {(userData.skills || []).map((skill, i) => (
                      <span key={i} className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        {skill}
                        <button 
                          onClick={() => handleRemoveSkill(skill)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '6px' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Add missing ATS keywords */}
                  {atsResult.missingKeywords.length > 0 && (
                    <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-warning)', display: 'block', marginBottom: '6px' }}>
                        ⚡ Missing ATS Job Keywords (Click to add to skills):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {atsResult.missingKeywords.map((kw, idx) => (
                          <button
                            key={idx}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => handleAddSkill(kw)}
                          >
                            <Plus size={12} /> {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <GraduationCap size={18} /> Education & Credentials
                  </h4>

                  {(userData.education || []).map((edu, idx) => (
                    <div key={idx} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <label className="form-label">Degree / Qualification</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={edu.degree} 
                            onChange={(e) => {
                              const updatedEdu = [...userData.education];
                              updatedEdu[idx].degree = e.target.value;
                              setUserData({ ...userData, education: updatedEdu });
                            }} 
                          />
                        </div>
                        <div>
                          <label className="form-label">Institution / School</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={edu.school} 
                            onChange={(e) => {
                              const updatedEdu = [...userData.education];
                              updatedEdu[idx].school = e.target.value;
                              setUserData({ ...userData, education: updatedEdu });
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditorStep(2)}>
                      ← Back
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveTab('scan')}>
                      Run Full ATS Audit →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ATS Scan View */
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                Job Description Matcher & Keyword Optimization
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Paste the target job description below to test keyword compatibility and score enhancement.
              </p>
              
              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea 
                  className="form-textarea" 
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* ATS Score Overview */}
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: atsResult.statusColor }}>
                  {atsResult.score}
                </div>
                <div>
                  <span className="badge" style={{ backgroundColor: `${atsResult.statusColor}20`, color: atsResult.statusColor }}>
                    {atsResult.statusGrade}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {atsResult.strongKeywordsFound.length} required skills found in your resume.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                  Recommended Action Verbs Reference
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {Object.entries(actionVerbsLibrary).map(([category, verbs]) => (
                    <div key={category} style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{category}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {verbs.slice(0, 4).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Container: Live Formatted Resume Document Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Template Picker ─────────────────────────────────────── */}
          <div className="glass-panel" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Layout size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Choose Template</span>
            </div>
            <div style={{
              display: 'flex', gap: '10px',
              overflowX: 'auto', paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}>
              {RESUME_TEMPLATES.map(tmpl => {
                const isActive = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                      showToast(`Template: ${tmpl.name}`);
                    }}
                    style={{
                      flexShrink: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                      gap: '6px',
                      padding: '10px 12px',
                      border: isActive ? `2px solid var(--accent-primary)` : '2px solid var(--border-color)',
                      borderRadius: '10px',
                      background: isActive ? 'var(--accent-primary)10' : 'var(--bg-input)',
                      cursor: 'pointer',
                      minWidth: '100px',
                      transition: 'all 0.18s ease',
                      boxShadow: isActive ? '0 0 0 3px var(--accent-primary)30' : 'none',
                    }}
                  >
                    {/* Color swatch strip */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {tmpl.colors.map((c, ci) => (
                        <div key={ci} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: c }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>{tmpl.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--accent-primary)' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      {tmpl.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {tmpl.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Controls Bar ─────────────────────────────────────────── */}
          <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Zoom:</span>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.3))}>
                <ZoomIn size={14} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(zoomLevel * 100)}%</span>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))}>
                <ZoomOut size={14} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setZoomLevel(1)}>
                Reset
              </button>
            </div>

            {/* Accent Color Palette Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Accent:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {colorOptions.map(color => (
                  <div 
                    key={color.value}
                    onClick={() => {
                      setPrimaryColor(color.value);
                      showToast(`Color: ${color.name}`);
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: color.value,
                      cursor: 'pointer',
                      border: primaryColor === color.value ? '2px solid #ffffff' : '1px solid transparent',
                      boxShadow: primaryColor === color.value ? '0 0 0 2px var(--accent-primary)' : 'none'
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Container holding the A4 Document */}
          <div style={{
            overflowY: 'auto',
            overflowX: 'auto',
            maxHeight: 'calc(100vh - 180px)',
            padding: '24px 16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            minHeight: '650px',
            width: '100%'
          }}>
            {/* Scaled Wrapper to maintain layout height */}
            <div style={{
              width: '100%',
              maxWidth: '680px',
              display: 'flex',
              justify: 'center',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease'
            }}>
              {/* Direct Printable Document with Live Inline Editing */}
              <div 
                ref={resumeRef}
                id="resume-preview-document"
                className="resume-paper printable-resume"
                style={{
                  boxShadow: '0 20px 40px rgba(11, 28, 48, 0.18)',
                  padding: selectedTemplate === 'sidebar-dark' ? '0' : '40px',
                  backgroundColor: '#ffffff',
                  color: '#0b1c30',
                  borderRadius: '4px',
                  width: '100%',
                  minHeight: '880px',
                  height: 'auto',
                  position: 'relative',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* CAREERPILOT VERIFIED Watermark Header */}
                {selectedTemplate !== 'sidebar-dark' && (
                  <div style={{ position: 'absolute', top: '20px', right: '24px', zIndex: 10 }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#94a3b8', textTransform: 'uppercase' }}>
                      CAREERPILOT VERIFIED
                    </span>
                  </div>
                )}


                {/* Live Template Renderer */}
                <div style={{
                  padding: selectedTemplate === 'sidebar-dark' ? '0' : '0',
                  flex: 1,
                }}>
                  {renderTemplate(
                    selectedTemplate,
                    userData,
                    primaryColor,
                    { handleInlineBlur, handleExperienceChange }
                  )}
                </div>

                {/* Real-time Status Indicator & Template Watermark */}
                {selectedTemplate !== 'sidebar-dark' && (
                  <div style={{ marginTop: '24px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase' }}>
                        Live Sync Enabled
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', fontStyle: 'italic', color: '#94a3b8' }}>
                      Template: {RESUME_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Professional'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
