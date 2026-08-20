import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles, Link2, Zap, Award, Brain,
  CheckCircle, XCircle, RotateCcw, AlignLeft,
  AlertCircle, Loader, Globe, Hash, ChevronRight,
  BarChart2
} from 'lucide-react';

import { GoogleGenAI } from '@google/genai';

// ─── Gemini API Call ───────────────────────────────────────────
async function callGeminiAI(prompt, youtubeUrl = null) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-1.5-pro';

    let contents;
    if (youtubeUrl) {
      contents = [
        {
          role: 'user',
          parts: [
            { fileData: { mimeType: 'video/*', fileUri: youtubeUrl } },
            { text: prompt }
          ]
        }
      ];
    } else {
      contents = prompt; // plain string works fine for text-only prompts
    }

    const response = await ai.models.generateContent({ model, contents });
    return response.text || null;
  } catch (e) {
    console.error('Gemini API error:', e);
    return null;
  }
}

// ─── Difficulty config ────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    emoji: '🟢',
    description: 'Basic recall & straightforward comprehension questions',
    instruction: `- Use simple, direct language that a beginner can easily understand.
- Focus on basic facts, definitions, and straightforward recall.
- Avoid tricky wording or complex multi-step reasoning.
- All wrong options should be clearly distinguishable from the correct one.
- Prefer True/False questions and simple MCQs.`
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    emoji: '🟡',
    description: 'Applied understanding & moderate analytical thinking',
    instruction: `- Use a balanced mix of recall, comprehension, and application questions.
- Include questions that require the learner to apply concepts, not just remember them.
- Wrong options should be plausible to create meaningful challenge.
- Mix MCQs with some True/False questions.
- Expect a mix of concrete and slightly abstract reasoning.`
  },
  hard: {
    label: 'Hard',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
    emoji: '🔴',
    description: 'Deep analysis, synthesis & critical evaluation',
    instruction: `- Use advanced language and complex multi-step reasoning questions.
- Focus on analysis, synthesis, evaluation, and edge-case scenarios.
- All distractors (wrong options) should be highly plausible and require careful thought to rule out.
- Include questions that demand critical thinking and comparison of concepts.
- Avoid straightforward recall; every question should challenge the learner.`
  }
};

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildQuizPrompt(content, topic, numQuestions = 10, difficulty = 'medium') {
  const diff = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  return `### SYSTEM PROMPT: AI INTERACTIVE QUIZ GENERATOR

You are an expert educational AI assistant. Your task is to process the provided video transcript or educational content and generate a ${numQuestions}-question interactive quiz based directly on the content.
${topic ? `\nThe topic/subject context is: ${topic}\n` : ''}
### DIFFICULTY LEVEL: ${diff.label.toUpperCase()} ${diff.emoji}
${diff.description}

**Difficulty-specific instructions:**
${diff.instruction}

---

### REQUIRED OUTPUT FORMAT

Return the output formatted strictly according to the following structure:

#### SECTION 2: INTERACTIVE QUIZZES

Generate a ${numQuestions}-question interactive quiz based directly on the provided content. Include a mix of Multiple-Choice Questions (MCQs) and True/False Questions appropriate for the ${diff.label} difficulty level.

For each question, follow this exact structure:

* **Question [X]/${numQuestions}**: [Insert question text]
  * A) [Option 1]
  * B) [Option 2]
  * C) [Option 3]
  * D) [Option 4]
  * **Correct Answer**: [Specify option letter, e.g., B]
  * **Explanation**: [Provide a brief 1-2 sentence explanation of why this is correct]

For True/False questions, use only A) True and B) False as options.

---

### INSTRUCTIONS & RULES:
- Keep the language accurate, engaging, and clear for learners.
- Ensure all quiz questions are directly answerable using information present in the transcript/content.
- Calibrate every question precisely to the **${diff.label}** difficulty level.
- Return ONLY the interactive quiz questions in the format specified above. Do not include summary notes.

---

### CONTENT TO PROCESS:

${content}`;
}

// No demo data used anymore

// ─── Parse AI response into quiz ─────────────────────────────────────────────
function parseAIResponse(text) {
  if (!text) return [];

  // Parse quiz questions
  const quiz = [];
  const questionBlocks = text.split(/\*\*Question \d+\/\d+\*\*:/g).slice(1);
  
  if (questionBlocks.length === 0) {
    // Try simpler fallback split if exact match fails
    const fallbackBlocks = text.split(/Question \d+:/g).slice(1);
    if (fallbackBlocks.length > 0) {
      fallbackBlocks.forEach((block, idx) => {
        parseBlock(block, idx);
      });
    }
  } else {
    questionBlocks.forEach((block, idx) => {
      parseBlock(block, idx);
    });
  }

  function parseBlock(block, idx) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const q = lines[0]?.replace(/^\*+/, '').trim() || `Question ${idx + 1}`;
    const opts = [];
    let correct = '';
    let explanation = '';

    lines.forEach(line => {
      const optMatch = line.match(/^\*?\s*([A-D])\)\s+(.+)/);
      if (optMatch) opts.push(`${optMatch[1]}) ${optMatch[2]}`);

      const corrMatch = line.match(/\*\*Correct Answer\*\*:?\s*([A-D])/i);
      if (corrMatch) correct = corrMatch[1].toUpperCase();

      const expMatch = line.match(/\*\*Explanation\*\*:?\s*(.+)/i);
      if (expMatch) explanation = expMatch[1];
    });

    if (q && opts.length >= 2) {
      quiz.push({ q, opts, correct, explanation });
    }
  }

  return quiz;
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

// ─── Interactive Quiz Component ──────────────────────────────────────────────
function InteractiveQuiz({ questions }) {
  const [currentQ, setCurrentQ]       = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [revealed, setRevealed]       = useState(false);
  const [score, setScore]             = useState(0);
  const [answers, setAnswers]         = useState([]);
  const [finished, setFinished]       = useState(false);
  const nextButtonRef = useRef(null);

  const question = questions[currentQ];
  const isCorrect = selectedOpt && selectedOpt.startsWith(question?.correct);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelectedOpt(opt);
    setRevealed(true);
    const correct = opt.startsWith(question.correct);
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { q: currentQ, correct }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOpt(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0); setSelectedOpt(null); setRevealed(false);
    setScore(0); setAnswers([]); setFinished(false);
  };

  const progress = ((currentQ + (revealed ? 1 : 0)) / questions.length) * 100;

  // The mobile navigation is fixed to the bottom of the screen. Once feedback
  // is shown, bring the next action into the visible part of the scroll area.
  useEffect(() => {
    if (!revealed || !nextButtonRef.current || !window.matchMedia('(max-width: 1024px)').matches) return;

    const frame = window.requestAnimationFrame(() => {
      nextButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentQ, revealed]);

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? { label: 'Excellent!', color: '#10b981', emoji: '🏆' }
                : pct >= 70 ? { label: 'Good Job!',  color: '#3b82f6', emoji: '🎉' }
                : pct >= 50 ? { label: 'Keep Going!', color: '#f59e0b', emoji: '📚' }
                :             { label: 'Review Again', color: '#ef4444', emoji: '🔄' };

    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{grade.emoji}</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>
          {grade.label}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          You scored <strong style={{ color: grade.color }}>{score}/{questions.length}</strong> ({pct}%)
        </p>

        {/* Score bar */}
        <div style={{ maxWidth: '320px', margin: '0 auto 28px', background: 'var(--bg-card)', borderRadius: '12px', height: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: grade.color, borderRadius: '12px', transition: 'width 1s ease' }} />
        </div>

        {/* Per-question review */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {answers.map((a, i) => (
            <div key={i} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700,
              background: a.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: a.correct ? '#10b981' : '#ef4444',
              border: `1px solid ${a.correct ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
            }}>Q{i + 1}</div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            border: 'none', color: '#fff', fontSize: '0.9rem',
            fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
          }}
        >
          <RotateCcw size={15} /> Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="interactive-quiz">
      {/* Progress header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Question {currentQ + 1} of {questions.length}
        </span>
        <span style={{
          fontSize: '0.78rem', fontWeight: 700,
          color: '#818cf8', background: 'rgba(99,102,241,0.1)',
          padding: '3px 10px', borderRadius: '20px'
        }}>
          Score: {score}/{currentQ + (revealed ? 1 : 0)}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #6366f1, #2563eb)',
          borderRadius: '4px', transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Question */}
      <div style={{
        padding: '20px 22px', borderRadius: '14px',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
          {question.q}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {question.opts.map((opt, i) => {
          const letter = opt.charAt(0);
          const isSelected = selectedOpt === opt;
          const isCorrectOpt = letter === question.correct;
          let bg = 'var(--bg-card)', borderColor = 'var(--border-color)', textColor = 'var(--text-muted)';

          if (revealed) {
            if (isCorrectOpt) {
              bg = 'rgba(16,185,129,0.08)'; borderColor = 'rgba(16,185,129,0.35)'; textColor = '#10b981';
            } else if (isSelected && !isCorrectOpt) {
              bg = 'rgba(239,68,68,0.08)'; borderColor = 'rgba(239,68,68,0.35)'; textColor = '#ef4444';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={revealed}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                background: bg, border: `1px solid ${borderColor}`,
                color: textColor, fontSize: '0.875rem', fontWeight: isSelected || (revealed && isCorrectOpt) ? 600 : 400,
                cursor: revealed ? 'default' : 'pointer', textAlign: 'left',
                transition: 'all 0.2s ease', width: '100%'
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700,
                background: revealed && isCorrectOpt ? 'rgba(16,185,129,0.2)'
                  : revealed && isSelected ? 'rgba(239,68,68,0.2)'
                  : 'rgba(99,102,241,0.1)',
                color: revealed && isCorrectOpt ? '#10b981'
                  : revealed && isSelected ? '#ef4444'
                  : '#818cf8'
              }}>{letter}</div>
              <span style={{ flex: 1 }}>{opt.substring(3)}</span>
              {revealed && isCorrectOpt && <CheckCircle size={16} color="#10b981" />}
              {revealed && isSelected && !isCorrectOpt && <XCircle size={16} color="#ef4444" />}
            </button>
          );
        })}
      </div>

      {/* Skip Button */}
      {!revealed && (
        <button
          onClick={() => {
            const nextAnswers = [...answers];
            nextAnswers[currentQ] = { correct: false, skipped: true };
            setAnswers(nextAnswers);
            setRevealed(true);
          }}
          style={{
            marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px',
            background: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-subtle)', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s ease', width: '100%'
          }}
        >
          Skip Question
        </button>
      )}

      {/* Explanation */}
      {revealed && question.explanation && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)',
          border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
          marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start'
        }}>
          <Brain size={16} color={isCorrect ? '#10b981' : '#60a5fa'} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: isCorrect ? '#10b981' : '#60a5fa', margin: '0 0 3px' }}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p style={{ fontSize: '0.835rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Next button */}
      {revealed && (
        <button
          ref={nextButtonRef}
          className="quiz-next-action"
          onClick={handleNext}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '13px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'; }}
        >
          {currentQ < questions.length - 1 ? (
            <><ChevronRight size={16} /> Next Question</>
          ) : (
            <><Award size={16} /> See My Results</>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuizCompanion({ userData, setUserData }) {
  const [inputMode, setInputMode]     = useState('transcript'); // 'transcript' | 'url'
  const [transcript, setTranscript]   = useState('');
  const [urlInput, setUrlInput]       = useState('');
  const [topic, setTopic]             = useState('');
  const [quizLength, setQuizLength]   = useState(10);
  const [difficulty, setDifficulty]   = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [activeDifficulty, setActiveDifficulty] = useState('medium'); // difficulty used for current quiz
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]             = useState('');
  const [quizList, setQuizList]       = useState(null); // array of questions

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerate = async () => {
    const content = inputMode === 'transcript' ? transcript.trim() : urlInput.trim();
    if (!content) {
      setError(inputMode === 'transcript' ? 'Please paste a transcript or educational content.' : 'Please enter a URL.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setQuizList(null);

    setActiveDifficulty(difficulty);
    try {
      const youtubeUrl = inputMode === 'url' ? content : null;
      const textContent = inputMode === 'url' ? `Generate ${quizLength} quiz questions about the video.` : content;
      const prompt = buildQuizPrompt(textContent, topic, quizLength, difficulty);
      const response = await callGeminiAI(prompt, youtubeUrl);

      let parsed;
      if (response) {
        parsed = parseAIResponse(response);
        if (parsed && parsed.length > 0) {
          setQuizList(parsed);
        } else {
          setQuizList(null);
          setError('Could not generate a quiz from this content. Please provide a valid text transcript or check the URL.');
        }
      } else {
        setQuizList(null);
        setError('Failed to reach AI service or invalid API key.');
      }

      if (parsed && parsed.length > 0 && setUserData) {
        setUserData(prev => {
          const currentCount = prev.studyKitsGeneratedCount || 0;
          const currentKits = prev.studyKitsHistory || [];
          const newKit = {
            topic: topic.trim() || 'General Practice Quiz',
            type: inputMode === 'transcript' ? 'Transcript' : 'URL',
            charCount: content.length,
            generatedAt: new Date().toISOString(),
            questionCount: parsed.length
          };
          return {
            ...prev,
            studyKitsGeneratedCount: currentCount + 1,
            studyKitsHistory: [newKit, ...currentKits].slice(0, 10)
          };
        });
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const charCount = transcript.length;

  return (
    <div className="study-companion-container">
      {/* ── Shimmer animation keyframe ─── */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(236,72,153,0.35)'
          }}>
            <Brain size={22} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              AI Quizzes
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', margin: 0, fontWeight: 500 }}>
              Generate interactive assessments from any transcript, text content, or video link
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className={`study-companion-grid ${quizList ? 'has-kit' : ''}`}>

        {/* ── Left: Input Panel ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '24px', animation: 'fadeInUp 0.5s ease'
        }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#ec4899" />
            Content Input
          </h2>

          {/* Input Mode Toggle */}
          <div style={{
            display: 'flex', gap: '0', marginBottom: '18px',
            background: 'var(--bg-main)', borderRadius: '10px', padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { id: 'transcript', label: 'Transcript / Text', icon: AlignLeft },
              { id: 'url', label: 'URL / Link', icon: Globe },
            ].map(m => {
              const Icon = m.icon;
              const active = inputMode === m.id;
              return (
                <button key={m.id} onClick={() => setInputMode(m.id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '8px', border: 'none',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? '#ec4899' : 'var(--text-muted)',
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
                Content Transcript / Raw Text
              </label>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Paste video transcript, articles, notes, or any educational text here…"
                rows={8}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.84rem', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
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
                Content URL
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
                    fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Topic Tag */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Subject / Topic <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={13} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Science, Tech, Philosophy…"
                style={{
                  width: '100%', padding: '9px 14px 9px 32px', borderRadius: '10px',
                  background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Difficulty Level Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <BarChart2 size={13} color="var(--text-muted)" />
              Difficulty Level
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
                const isActive = difficulty === key;
                return (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? cfg.border : 'var(--border-color)'}`,
                      background: isActive ? cfg.bg : 'var(--bg-main)',
                      color: isActive ? cfg.color : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 2px 10px ${cfg.bg}` : 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{cfg.emoji}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500 }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', margin: '6px 0 0', lineHeight: 1.4 }}>
              {DIFFICULTY_CONFIG[difficulty].description}
            </p>
          </div>

          {/* Quiz Length Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Number of Questions ({quizLength})
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="35"
                value={quizLength}
                onChange={e => setQuizLength(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#ec4899',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--border-color)',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ec4899',
                background: 'rgba(236,72,153,0.1)',
                padding: '4px 10px',
                borderRadius: '8px',
                minWidth: '24px',
                textAlign: 'center'
              }}>
                {quizLength}
              </span>
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
              background: isGenerating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #ec4899, #7c3aed)',
              color: '#fff', fontSize: '0.92rem', fontWeight: 700,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: isGenerating ? 'none' : '0 4px 18px rgba(236,72,153,0.4)',
              transition: 'all 0.2s ease', letterSpacing: '0.01em'
            }}
          >
            {isGenerating ? (
              <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating Practice Quiz…</>
            ) : (
              <><Zap size={16} /> Generate Practice Quiz</>
            )}
          </button>
        </div>

        {/* ── Right: Quiz Output ── */}
        {(isGenerating || quizList) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{
              background: 'var(--bg-card)', borderRadius: '18px',
              border: '1px solid var(--border-color)', overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
                background: 'rgba(236,72,153,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={15} color="#ec4899" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Interactive Quiz</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeDifficulty && (() => {
                    const cfg = DIFFICULTY_CONFIG[activeDifficulty];
                    return (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        color: cfg.color, background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        padding: '2px 9px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    );
                  })()}
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: '#ec4899',
                    background: 'rgba(236,72,153,0.1)', padding: '3px 10px', borderRadius: '10px'
                  }}>
                    {quizList?.length || 0} Questions
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {isGenerating ? (
                  <div>
                    <Skeleton height={12} width="50%" mb={16} radius={5} />
                    <Skeleton height={6} mb={24} radius={4} />
                    <Skeleton height={70} mb={16} radius={12} />
                    {[1,2,3,4].map(i => <Skeleton key={i} height={48} mb={10} radius={12} />)}
                  </div>
                ) : quizList?.length > 0 ? (
                  <InteractiveQuiz questions={quizList} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Brain size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.875rem' }}>Quiz could not be parsed. Try regenerating.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
