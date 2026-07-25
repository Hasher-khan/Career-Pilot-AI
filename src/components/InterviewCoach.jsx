import React, { useState } from 'react';
import { MessageSquare, Award, Play, RotateCcw, CheckCircle, Sparkles, Send, Mic } from 'lucide-react';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../utils/aiEngine';

export default function InterviewCoach({ userData }) {
  const [role, setRole] = useState(userData.title || 'Full Stack Engineer');
  const [industry, setIndustry] = useState('Technology / SaaS');
  const [level, setLevel] = useState('Mid-Senior');

  const [questions, setQuestions] = useState(() => generateInterviewQuestions(role, industry, level));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartNewSession = (e) => {
    e.preventDefault();
    const newQs = generateInterviewQuestions(role, industry, level);
    setQuestions(newQs);
    setCurrentQIndex(0);
    setUserAnswerText('');
    setEvaluation(null);
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!userAnswerText.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      const q = questions[currentQIndex];
      const res = evaluateInterviewAnswer(q.question, userAnswerText);
      setEvaluation(res);
      setIsSubmitting(false);
    }, 600);
  };

  const currentQ = questions[currentQIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} color="var(--accent-primary)" /> Interactive AI Interview Coach
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
          Practice targeted behavioral and technical questions with instant 5-metric performance evaluation.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Session Control & Question Room */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Setup Strip */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <form onSubmit={handleStartNewSession} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Job Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                />
              </div>

              <div>
                <label className="form-label">Industry</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)} 
                />
              </div>

              <div>
                <label className="form-label">Experience Level</label>
                <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="Junior / Entry">Junior / Entry</option>
                  <option value="Mid-Senior">Mid-Senior</option>
                  <option value="Executive / Staff">Executive / Staff</option>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ height: '42px' }}>
                <RotateCcw size={14} /> Reset Questions
              </button>
            </form>
          </div>

          {/* Active Question Box */}
          <div className="glass-panel glow-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-purple">
                Question {currentQIndex + 1} of {questions.length} • {currentQ.category}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setEvaluation(null);
                      setUserAnswerText('');
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '1px solid var(--border-color)',
                      backgroundColor: currentQIndex === idx ? 'var(--accent-primary)' : 'transparent',
                      color: currentQIndex === idx ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '20px' }}>
              "{currentQ.question}"
            </h4>

            {/* Answer Input Area */}
            <form onSubmit={handleSubmitAnswer}>
              <div className="form-group">
                <label className="form-label" style={{ justifyContent: 'space-between' }}>
                  <span>Your Answer Submission</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Use STAR method (Situation, Task, Action, Result)</span>
                </label>
                <textarea 
                  className="form-textarea" 
                  rows={5}
                  placeholder="Type your response here or explain your situation..."
                  value={userAnswerText}
                  onChange={(e) => setUserAnswerText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                  <Mic size={14} /> Voice Input (Simulated)
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting || !userAnswerText.trim()}
                >
                  {isSubmitting ? <Sparkles size={16} className="spin" /> : <Send size={16} />}
                  Evaluate Answer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: 5-Metric Evaluation Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent-secondary)" /> Performance Metrics
            </h4>

            {evaluation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OVERALL ANSWER SCORE</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-success)', lineHeight: 1 }}>
                    {evaluation.overallScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>

                {/* Metric Bars */}
                {Object.entries(evaluation.metrics).map(([metricName, metricVal]) => (
                  <div key={metricName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{metricName}</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{metricVal}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${metricVal}%`, height: '100%', background: 'var(--gradient-brand)' }}></div>
                    </div>
                  </div>
                ))}

                {/* Key Improvements */}
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-warning)', display: 'block', marginBottom: '6px' }}>
                    💡 AI Feedback & Tips:
                  </span>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {evaluation.improvements.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                <Sparkles size={32} color="var(--border-color)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '0.85rem' }}>
                  Submit an answer above to receive real-time scoring across Clarity, Confidence, Technical Accuracy, Communication, and Professionalism.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
