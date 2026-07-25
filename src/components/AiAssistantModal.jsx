import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, Shield, User } from 'lucide-react';
import { SYSTEM_PROMPT } from '../utils/aiEngine';

export default function AiAssistantModal({ isOpen, onClose, userData }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${userData.name}! I am CareerPilot AI, your intelligent Resume & Career Coach. How can I help you today? You can ask me to critique your resume summary, suggest action verbs, prepare for an upcoming interview, or structure a cover letter!`
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    "Critique my resume summary",
    "Suggest stronger technical action verbs",
    "How to prepare for behavioral questions?",
    "Salary negotiation tips for senior roles"
  ];

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInputText('');

    // AI response simulation enforcing system prompt persona
    setTimeout(() => {
      let aiReply = "Thank you for asking! As your CareerPilot AI coach, I recommend structuring your response using clear, quantifiable achievements. Never invent qualifications or experience; focus on highlighting real metrics such as performance improvements, user growth, or project latency reductions.";

      const qLower = query.toLowerCase();
      if (qLower.includes("summary")) {
        aiReply = `Here is how I recommend polishing your summary:\n\n"${userData.summary}"\n\n**Enhancement Suggestion:**\n"Results-driven ${userData.title} with 4+ years of experience engineering high-throughput React & TypeScript applications. Demonstrated track record of optimizing page load times by 42% and establishing scalable component libraries."`;
      } else if (qLower.includes("verb") || qLower.includes("words")) {
        aiReply = `Here are 5 high-converting action verbs tailored for software engineers:\n• **Spearheaded**: Lead initiatives\n• **Architected**: System design & frameworks\n• **Orchestrated**: Complex workflows/CI/CD\n• **Refactored**: Codebase improvements\n• **Quantified**: Metric-backed success`;
      } else if (qLower.includes("interview") || qLower.includes("behavioral")) {
        aiReply = `For behavioral questions, always follow the **STAR framework**:\n1. **Situation**: Brief context (15-20 secs)\n2. **Task**: What was your explicit goal?\n3. **Action**: The exact technical/leadership steps YOU took\n4. **Result**: The measurable impact (e.g. 35% bug reduction, 99.9% uptime).`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'clamp(8px, 3vw, 20px)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '650px',
        height: 'min(600px, 90dvh)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>CareerPilot AI Assistant</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={10} /> Compliant with System Prompt Rules
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat History */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {messages.map((m, i) => (
            <div 
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'ai' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#fff" />
                </div>
              )}
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '0 16px 10px 16px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '4px 8px', whitespace: 'nowrap', flexShrink: 0 }}
              onClick={() => handleSendMessage(p)}
            >
              <Sparkles size={10} /> {p}
            </button>
          ))}
        </div>

        {/* Footer Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px'
          }}
        >
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ask CareerPilot for resume, interview, or career tips..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
