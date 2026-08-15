import React, { useState, useCallback } from 'react';
import {
  Sparkles, Copy, Check, AlignLeft, AlertCircle, Loader, Globe, Hash, Link2, Zap
} from 'lucide-react';

// ─── Gemini API Call ─────────────────────────────────────────────────────────
async function callGeminiAI(prompt, sourceUrl = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    // Simulate a delay for demo mode
    await new Promise(r => setTimeout(r, 2000));
    return null;
  }
  const isYouTubeUrl = sourceUrl && /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i.test(new URL(sourceUrl).hostname);
  const parts = isYouTubeUrl
    ? [{ file_data: { file_uri: sourceUrl } }, { text: prompt }]
    : [{ text: sourceUrl ? `${prompt}\n\nSOURCE URL TO ANALYZE:\n${sourceUrl}` : prompt }];

  const body = {
    systemInstruction: {
      parts: [{ text: 'Generate a clean, professional, and well-structured transcript from the content provided. Fix spelling and grammar issues, format it into clear paragraphs with descriptive headings/subheadings, and optional logical timestamps if helpful. Do not add questions, quizzes, or extra commentary.' }]
    },
    contents: [{ parts }],
    generationConfig: { temperature: 0.45, maxOutputTokens: 8192 }
  };

  // Gemini processes public YouTube links as video input. For regular web pages,
  // URL Context fetches the actual page rather than asking the model to guess from
  // a bare link.
  if (sourceUrl && !isYouTubeUrl) body.tools = [{ url_context: {} }];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Gemini API error:', json);
    throw new Error(json?.error?.message || `The AI service returned an error (${res.status}).`);
  }
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('The AI service did not return transcript content. Please try again.');
  return text;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildTranscriptPrompt(content, topic) {
  return `You are a professional AI transcription and formatting assistant.
Your task is to take the provided text (which is a raw transcript, notes, or educational content) and generate a polished, beautifully structured, and highly readable transcript.

${topic ? `SUBJECT / TOPIC: ${topic}\n` : ''}

INSTRUCTIONS:
1. Provide a professional title at the top of the transcript.
2. Organise the transcript into logical sections or chapters with clear headings.
3. Clean up the language (remove verbal filler words like "um", "ah", "like", "you know"), correct syntax/grammar errors, and ensure the sentences are fully readable and flow smoothly.
4. Keep the content accurate to the source material; do not invent details.
5. Format the transcript using paragraphs and section headers so it is easy to read and review.
6. Do NOT generate quizzes, notes summaries, outlines, or Q&A structures. Focus strictly on a clean, professional transcript.

SOURCE CONTENT:
${content}`;
}

// ─── Demo fallback data ────────────────────────────────────────────────────────
const DEMO_TRANSCRIPT = `### AI & Future of Software Engineering: Professional Transcript

#### Section 1: Introduction to Modern Software Paradigms
Welcome back, everyone. Today we are going to explore the intersection of artificial intelligence and software development, and how these forces are shaping the future of software engineering. Over the past decade, programming paradigms have evolved significantly. We moved from purely manual code construction to leveraging automated systems, and now, to collaborating with advanced AI systems.

Understanding these changes is crucial for any engineer aiming to design robust and scalable applications. Artificial intelligence is not replacing developers; rather, it is raising the level of abstraction, enabling us to focus on system design, architecture, and high-level logic rather than boilerplate code.

#### Section 2: Core Algorithmic Thinking and AI Integration
When we think about algorithms, we are looking at step-by-step procedures for solving complex problems. Algorithms and data structures remain the foundation of computer science. Even when AI models generate code blocks, the underlying architecture must support efficient data access and memory management.

For example, choosing a hash table for constant-time lookup or a graph structure for complex relationships is a design decision that requires human analytical thinking. The integration of AI into this workflow means that we can prototype algorithms much faster, test edge cases automatically, and refine complexity metrics on the fly.

#### Section 3: Design Principles and Maintainable Systems
Maintaining large-scale systems requires strict adherence to design principles. Concepts like DRY—Don't Repeat Yourself—and the SOLID design principles are more relevant than ever. When AI models assist in generating code, the potential for code duplication actually increases if not monitored carefully.

A professional engineer must guide the AI assistant, ensuring that the generated components adhere to clean separation of concerns, modular design, and testability. By maintaining high design standards, we ensure that software remains maintainable, scalable, and easy to refactor as business needs evolve.`;

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];
  let inList = false;

  const flushList = (key) => {
    if (listBuffer.length) {
      elements.push(
        <div key={`ul-${key}`} style={{ margin: '8px 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {listBuffer.map((item, i) => (
            <p key={i} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}
              dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </div>
      );
      listBuffer = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const bold = (t) => t.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-main);font-weight:600">$1</strong>');

    if (line.match(/^#\s+/)) {
      flushList(i);
      elements.push(
        <h1 className="study-note-h1" key={i} style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '24px', marginBottom: '12px' }}>{line.replace(/^#\s+/, '')}</h1>
      );
      return;
    }

    if (line.match(/^##\s+/)) {
      flushList(i);
      elements.push(
        <h2 className="study-note-h2" key={i} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '20px', marginBottom: '10px' }}>{line.replace(/^##\s+/, '')}</h2>
      );
      return;
    }

    if (line.match(/^###\s+/)) {
      flushList(i);
      elements.push(
        <h3 className="study-note-h3" key={i} style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '16px', marginBottom: '8px' }}>{line.replace(/^###\s+/, '')}</h3>
      );
      return;
    }

    if (line.match(/^####\s+/)) {
      flushList(i);
      elements.push(
        <h4 className="study-note-h4" key={i} style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '14px', marginBottom: '6px' }}>{line.replace(/^####\s+/, '')}</h4>
      );
      return;
    }

    if (line.match(/^>\s*/)) {
      flushList(i);
      elements.push(
        <aside className="study-note-callout" key={i} style={{ padding: '12px 16px', borderLeft: '4px solid var(--accent-primary)', background: 'var(--bg-main)', margin: '16px 0', borderRadius: '0 8px 8px 0' }} dangerouslySetInnerHTML={{ __html: bold(line.replace(/^>\s*/, '')) }} />
      );
      return;
    }

    // Bullet points
    if (line.match(/^[-*]\s+/)) {
      listBuffer.push(bold(line.replace(/^[-*]\s+/, '')));
      inList = true;
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      flushList(i);
      elements.push(
        <p key={i} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, margin: '4px 0 8px' }}
          dangerouslySetInnerHTML={{ __html: bold(line) }} />
      );
    }
  });

  flushList('final');
  return <div className="study-notes-markdown">{elements}</div>;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function Skeleton({ height = 16, width = '100%', radius = 8, mb = 8 }) {
  return (
    <div style={{
      height, width, borderRadius: radius, marginBottom: mb,
      background: 'linear-gradient(90deg, var(--bg-card) 25%, rgba(255,255,255,0.04) 50%, var(--bg-card) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite linear'
    }} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudyCompanion({ userData, setUserData }) {
  const [inputMode, setInputMode]     = useState('transcript'); // 'transcript' | 'url'
  const [transcript, setTranscript]   = useState('');
  const [urlInput, setUrlInput]       = useState('');
  const [topic, setTopic]             = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]             = useState('');
  const [generatedTranscript, setGeneratedTranscript] = useState(null);
  const [copied, setCopied]           = useState(false);

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerate = async () => {
    const content = inputMode === 'transcript' ? transcript.trim() : urlInput.trim();
    if (!content) {
      setError(inputMode === 'transcript' ? 'Please paste a transcript or text content.' : 'Please enter a URL.');
      return;
    }
    if (inputMode === 'url') {
      try {
        const url = new URL(content);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        setError('Enter a complete public URL starting with http:// or https://.');
        return;
      }
    }
    setError('');
    setIsGenerating(true);
    setGeneratedTranscript(null);

    try {
      const prompt = buildTranscriptPrompt(content, topic);
      const response = await callGeminiAI(prompt, inputMode === 'url' ? content : '');

      if (response) {
        setGeneratedTranscript(response.trim());
      } else {
        // Fallback demo transcript
        setGeneratedTranscript(DEMO_TRANSCRIPT);
        if (!hasApiKey) {
          setError('demo');
        }
      }

      if (setUserData) {
        setUserData(prev => {
          const currentCount = prev.transcriptsGeneratedCount || 0;
          const currentHistory = Array.isArray(prev?.transcriptsHistory) ? prev.transcriptsHistory : [];
          const newHistory = {
            topic: topic.trim() || 'General Content',
            type: inputMode === 'transcript' ? 'Text Input' : 'URL',
            charCount: content.length,
            generatedAt: new Date().toISOString(),
          };
          return {
            ...prev,
            transcriptsGeneratedCount: currentCount + 1,
            transcriptsHistory: [newHistory, ...currentHistory].slice(0, 10)
          };
        });
      }
    } catch (e) {
      console.error('Transcript generation failed:', e);
      setError(e instanceof Error ? e.message : 'Unable to generate transcript. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!generatedTranscript) return;
    navigator.clipboard.writeText(generatedTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedTranscript]);

  const charCount = transcript.length;

  return (
    <div className="study-companion-container">
      {/* ── Shimmer animation keyframe ─── */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)'
          }}>
            <AlignLeft size={22} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              AI Transcript Generator
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0, fontWeight: 500 }}>
              Convert raw audio transcriptions, URL feeds, or unformatted text into beautifully styled, professional transcripts
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          {[
            { icon: '🎙️', label: 'Polished Transcription' },
            { icon: '✨', label: 'Grammar & Clarity Correction' },
            { icon: '📂', label: 'Logical Sectioning' },
            { icon: '📋', label: 'Instant Copy Text' },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 12px', borderRadius: '20px',
              background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)',
              fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500
            }}>
              <span>{p.icon}</span> {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className={`study-companion-grid ${generatedTranscript ? 'has-kit' : ''}`}>

        {/* ── Left: Input Panel ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '24px', animation: 'fadeInUp 0.5s ease'
        }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#818cf8" />
            Content Source
          </h2>

          {/* Input Mode Toggle */}
          <div style={{
            display: 'flex', gap: '0', marginBottom: '18px',
            background: 'var(--bg-main)', borderRadius: '10px', padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { id: 'transcript', label: 'Paste Text / Transcript', icon: AlignLeft },
              { id: 'url', label: 'Video / Article URL', icon: Globe },
            ].map(m => {
              const Icon = m.icon;
              const active = inputMode === m.id;
              return (
                <button key={m.id} onClick={() => setInputMode(m.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '8px', border: 'none',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? '#818cf8' : 'var(--text-muted)',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none'
                }}>
                  <Icon size={13} /> {m.label}
                </button>
              );
            })}
          </div>

          {/* Transcript Input */}
          {inputMode === 'transcript' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Raw Transcript or Text Draft
              </label>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste your unformatted draft transcript, lecture audio notes, or text content here…"
                rows={10}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.84rem', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textAlign: 'right', marginTop: '4px' }}>
                {charCount.toLocaleString()} characters
              </div>
            </div>
          )}

          {/* URL Input */}
          {inputMode === 'url' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Video or Page Link
              </label>
              <div style={{ position: 'relative' }}>
                <Link2 size={14} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{
                    width: '100%', padding: '11px 14px 11px 36px', borderRadius: '12px',
                    background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                    color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', margin: '6px 0 0' }}>
                Note: URL content extraction depends on page accessibility.
              </p>
            </div>
          )}

          {/* Topic Tag */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Context / Topic <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={13} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Technology Keynote, Biology Lecture, Custom..."
                style={{
                  width: '100%', padding: '9px 14px 9px 32px', borderRadius: '10px',
                  background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && error !== 'demo' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
              borderRadius: '10px', background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)', marginBottom: '14px'
            }}>
              <AlertCircle size={14} color="#f87171" />
              <span style={{ fontSize: '0.82rem', color: '#f87171' }}>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
              padding: '14px', borderRadius: '13px', border: 'none',
              background: isGenerating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#fff', fontSize: '0.92rem', fontWeight: 700,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: isGenerating ? 'none' : '0 4px 18px rgba(124,58,237,0.4)',
              transition: 'all 0.2s ease', letterSpacing: '0.01em'
            }}
            onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isGenerating ? 'none' : '0 4px 18px rgba(124,58,237,0.4)'; }}
          >
            {isGenerating ? (
              <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing Transcript…</>
            ) : (
              <><Zap size={16} /> Clean & Format Transcript</>
            )}
          </button>

          {/* Tips */}
          {!generatedTranscript && !isGenerating && (
            <div style={{ marginTop: '20px', padding: '14px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <p style={{ fontSize: '0.73rem', fontWeight: 700, color: '#818cf8', margin: '0 0 8px' }}>💡 Guidelines</p>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Paste unedited raw voice-to-text transcripts', 'Input video links to generate clean transcript summaries', 'Context helps AI structure logical topic boundaries'].map((t, i) => (
                  <li key={i} style={{ fontSize: '0.73rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right: Output Panel ────────────────────────────────────── */}
        {(isGenerating || generatedTranscript) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{
              background: 'var(--bg-card)', borderRadius: '18px',
              border: '1px solid var(--border-color)', overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
                background: 'rgba(124,58,237,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlignLeft size={15} color="#818cf8" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Structured Transcript</span>
                </div>
                <div>
                  <button onClick={handleCopy} disabled={isGenerating} style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
                    borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)', color: 'var(--text-main)',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-main)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
                  >
                    {copied ? <><Check size={13} color="#10b981" /> Copied!</> : <><Copy size={13} /> Copy Transcript</>}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div id="study-notes-content" className="study-notes-content" style={{ padding: '20px 24px' }}>
                {isGenerating ? (
                  <div>
                    <Skeleton height={20} width="60%" mb={12} radius={6} />
                    <Skeleton height={14} mb={6} radius={5} />
                    <Skeleton height={14} width="90%" mb={6} radius={5} />
                    <Skeleton height={14} width="80%" mb={20} radius={5} />
                    <Skeleton height={18} width="40%" mb={10} radius={6} />
                    {[1, 2, 3].map(i => <Skeleton key={i} height={14} mb={6} radius={5} />)}
                  </div>
                ) : (
                  <MarkdownRenderer text={generatedTranscript} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
