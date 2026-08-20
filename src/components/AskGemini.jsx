import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Copy, Check, Trash2, ImagePlus, Mic, Square, X } from 'lucide-react';
import { SYSTEM_PROMPT } from '../utils/aiEngine';

const GEMINI_MODEL = 'gemini-1.5-flash';
const welcomeMessage = {
  sender: 'ai',
  text: `Welcome to **Chat Boot**! I am your advanced AI assistant powered by Google Gemini 3.6 Flash. \n\nYou can ask questions, attach an image for analysis, or use the microphone to dictate a prompt.`
};

function loadChatHistory() {
  try {
    const saved = localStorage.getItem('ask_gemini_chat_history');
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [welcomeMessage];
  } catch {
    return [welcomeMessage];
  }
}

function buildAssistantInstructions(userData) {
  const profileContext = [
    userData?.name && `Name: ${userData.name}`,
    userData?.targetRole && `Target role: ${userData.targetRole}`,
    userData?.targetIndustry && `Target industry: ${userData.targetIndustry}`,
    userData?.experienceLevel && `Experience level: ${userData.experienceLevel}`,
    Array.isArray(userData?.skills) && userData.skills.length && `Skills: ${userData.skills.join(', ')}`
  ].filter(Boolean).join('\n');

  return `${SYSTEM_PROMPT}

# ANSWER QUALITY
- Be accurate over confident: state uncertainty when a fact cannot be verified.
- Give a complete, practical answer tailored to the user's goal. Include examples or concrete next steps when useful.
- For career-related questions, use the profile context below only when relevant. Never invent missing credentials, experience, or achievements.

# USER PROFILE CONTEXT
${profileContext || 'No profile details are available yet.'}`;
}

export default function AskGemini({ userData }) {
  const [messages, setMessages] = useState(loadChatHistory);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    localStorage.setItem('ask_gemini_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickPrompts = [
    "Write a quick TypeScript utility for debouncing functions",
    "Explain quantum computing in three simple sentences",
    "Help me brainstorm professional blog post ideas about AI",
    "Find a logic bug in this React useEffect snippet"
  ];

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation history?")) {
      const initialMsg = [welcomeMessage];
      setMessages(initialMsg);
      localStorage.setItem('ask_gemini_chat_history', JSON.stringify(initialMsg));
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please choose an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Please choose an image smaller than 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({ dataUrl: reader.result, mimeType: file.type, name: file.name });
      setErrorMsg('');
    };
    reader.onerror = () => setErrorMsg('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Voice input is not supported by this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      setInputText(transcript);
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') setErrorMsg('Voice input could not start. Please allow microphone access and try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setErrorMsg('');
    setIsListening(true);
    recognition.start();
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const callGeminiAPI = async (userPrompt, chatHistory, imageAttachment) => {
    if (!apiKey) {
      // Simulation mode
      await new Promise(r => setTimeout(r, 1200));
      
      const promptLower = userPrompt.toLowerCase();
      if (/^(hello|hi|hey|assalamualaikum|salam)[!.\s]*$/i.test(userPrompt.trim())) {
        return `Hello! I’m **Chat Boot**. I can help with career planning, coding, writing, interview preparation, and general questions. What would you like to work on?`;
      }
      if (promptLower.includes("debounce") || promptLower.includes("typescript")) {
        return `Here is a clean, production-ready TypeScript debounce utility.

**TypeScript Debounce Function**
\`\`\`typescript
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
\`\`\`

**Core Features:**
- **Zero Dependencies**: Pure TypeScript implementation.
- **Type-Safe**: Correctly infers and preserves parameters of the debounced function.
- **Memory Efficient**: Properly clears active timeouts.`;
      }
      
      if (promptLower.includes("quantum")) {
        return `Quantum computing uses qubits instead of bits to process complex data. These qubits can exist in multiple states simultaneously through superposition and entanglement. This allows quantum computers to solve specific mathematical problems exponentially faster than classical computers.`;
      }

      return `I can help you think through that. For the most detailed, up-to-date answer, Chat Boot needs its Gemini connection enabled. In the meantime, try asking a specific question with the context, goal, and format you want.`;
    }

    // The Gemini API requires a conversation to begin with a user turn. The
    // local welcome message is UI-only, so exclude it and retain complete
    // user/model exchanges from the saved conversation.
    const history = chatHistory
      .filter(msg => msg?.sender === 'user' || msg?.sender === 'ai')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    while (history[0]?.role === 'model') history.shift();
    if (history.at(-1)?.role === 'user') history.pop();

    const userParts = [{ text: userPrompt }];
    if (imageAttachment) {
      userParts.push({
        inlineData: {
          mimeType: imageAttachment.mimeType,
          data: imageAttachment.dataUrl.split(',')[1]
        }
      });
    }

    const contents = [...history, { role: 'user', parts: userParts }];

    const body = {
      systemInstruction: {
        parts: [{ text: buildAssistantInstructions(userData) }]
      },
      contents,
      generationConfig: { maxOutputTokens: 4096 }
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error?.message || `API error (${res.status}).`);
    }

    const reply = json?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();
    if (!reply) {
      const reason = json?.candidates?.[0]?.finishReason;
      throw new Error(reason ? `Gemini stopped before completing an answer (${reason}).` : 'No response returned from the Gemini service.');
    }
    return reply;
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if ((!query.trim() && !attachment) || isLoading) return;

    setErrorMsg('');
    setIsLoading(true);
    
    const prompt = query.trim() || 'Please analyze this image.';
    const imageForRequest = attachment;
    const userMessage = { sender: 'user', text: prompt, image: imageForRequest?.dataUrl };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setAttachment(null);

    try {
      const responseText = await callGeminiAPI(prompt, messages.filter(m => m.sender !== 'error'), imageForRequest);
      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to reach Gemini API");
      setMessages(prev => [...prev, { sender: 'ai', text: `❌ **Error**: ${err.message || 'Unable to connect to Gemini API. Please verify your internet connection and API key configuration.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (text) => {
    // Basic Markdown parser for beautiful inline rendering in Chat Boot
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const header = lines[0].replace('```', '').trim() || 'code';
        const code = lines.slice(1, -1).join('\n');
        
        return (
          <div key={index} style={{
            margin: '12px 0',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            backgroundColor: '#0c1017'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.72rem',
              color: 'var(--text-subtle)',
              fontFamily: 'monospace'
            }}>
              <span>{header}</span>
              <button 
                type="button"
                onClick={() => handleCopyText(code, index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedId === index ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copiedId === index ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre style={{
              margin: 0,
              padding: '14px',
              overflowX: 'auto',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              color: '#c9d1d9'
            }}>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Handle simple formatting: Bold, lists, headings
      const lines = part.split('\n');
      return lines.map((line, lineIdx) => {
        let content = line;
        
        // Match bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = [];
        let lastIdx = 0;
        let match;
        
        while ((match = boldRegex.exec(content)) !== null) {
          if (match.index > lastIdx) {
            boldParts.push(content.substring(lastIdx, match.index));
          }
          boldParts.push(<strong key={match.index} style={{ color: 'var(--text-main)', fontWeight: 700 }}>{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }
        if (lastIdx < content.length) {
          boldParts.push(content.substring(lastIdx));
        }

        const elements = boldParts.length > 0 ? boldParts : content;

        // Render bullet lists
        if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
          const cleanLine = line.replace(/^[•\-*]\s*/, '');
          return (
            <ul key={lineIdx} style={{ margin: '4px 0 4px 16px', padding: 0 }}>
              <li style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{cleanLine}</li>
            </ul>
          );
        }

        // Render headings
        if (line.startsWith('###')) {
          return <h5 key={lineIdx} style={{ fontSize: '0.94rem', fontWeight: 700, margin: '14px 0 6px', color: 'var(--text-main)' }}>{line.replace('###', '').trim()}</h5>;
        }
        if (line.startsWith('##')) {
          return <h4 key={lineIdx} style={{ fontSize: '1.05rem', fontWeight: 800, margin: '18px 0 8px', color: 'var(--text-main)' }}>{line.replace('##', '').trim()}</h4>;
        }
        if (line.startsWith('#')) {
          return <h3 key={lineIdx} style={{ fontSize: '1.2rem', fontWeight: 900, margin: '22px 0 10px', color: 'var(--text-main)' }}>{line.replace('#', '').trim()}</h3>;
        }

        return (
          <p key={lineIdx} style={{ margin: line.trim() === '' ? '12px 0' : '4px 0', minHeight: line.trim() === '' ? '8px' : 'auto', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
            {elements}
          </p>
        );
      });
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 140px)',
      minHeight: '450px',
      backgroundColor: 'var(--bg-main)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }} className="glass-panel chat-boot-shell">
      {/* Chat Boot Header */}
      <div className="chat-boot-header" style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--chat-boot-header)'
      }}>
        <div className="chat-boot-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--chat-boot-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Chat Boot</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              Gemini 3.7 Flash · Image + Voice ready
            </span>
          </div>
        </div>

        <div className="chat-boot-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!apiKey && (
            <div className="chat-boot-mode" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              fontSize: '0.72rem',
              color: '#f59e0b',
              fontWeight: 500
            }}>
              <AlertCircle size={14} />
              Simulation Mode
            </div>
          )}
          <button 
            type="button"
            onClick={handleClearChat}
            className="chat-boot-clear"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
          >
            <Trash2 size={13} />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-boot-messages" style={{
        flex: 1,
        padding: '24px 20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--chat-boot-surface)'
      }}>
        {messages.map((m, idx) => (
          <div
            className={`chat-boot-message ${m.sender === 'user' ? 'is-user' : 'is-assistant'}`}
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div className="chat-boot-avatar" style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: m.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #6366f1, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {m.sender === 'user' ? (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>ME</span>
              ) : (
                <Bot size={15} color="#fff" />
              )}
            </div>
            
            <div className="chat-boot-bubble" style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: m.sender === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              border: m.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid var(--border-color)',
              color: 'var(--text-main)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {renderMessageContent(m.text)}
              {m.image && (
                <img
                  src={m.image}
                  alt="User attachment"
                  style={{ display: 'block', width: 'min(100%, 320px)', maxHeight: '260px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }}
                />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-boot-loading" style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={15} color="#fff" />
            </div>
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-subtle)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="spinner" style={{
                width: '14px', height: '14px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTop: '2px solid #818cf8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              Chat Boot is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="chat-boot-suggestions" style={{
          padding: '12px 20px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--chat-boot-surface)'
        }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              style={{
                fontSize: '0.74rem',
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = 'var(--text-main)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Sparkles size={11} color="#818cf8" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Chat Footer Input */}
      <form
        className="chat-boot-composer"
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        background: 'var(--bg-card)'
      }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        {attachment && (
          <div className="chat-boot-attachment" style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', padding: '7px 10px', borderRadius: '9px', background: 'var(--chat-boot-attachment)', border: '1px solid var(--chat-boot-border)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <ImagePlus size={14} color="var(--accent-primary)" />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} aria-label="Remove image" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Attach image"
          title="Attach image"
          className="chat-boot-tool-button"
        >
          <ImagePlus size={18} />
        </button>
        <input 
          className="chat-boot-input"
          type="text" 
          placeholder="Ask Chat Boot anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
        />
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={isLoading}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={isListening ? 'Stop listening' : 'Voice input'}
          className={`chat-boot-tool-button${isListening ? ' listening' : ''}`}
        >
          {isListening ? <Square size={15} /> : <Mic size={18} />}
        </button>
        <button 
          type="submit" 
          className="chat-boot-send"
          disabled={isLoading || (!inputText.trim() && !attachment)}
          style={{
            padding: '0 20px',
            borderRadius: '10px',
            border: 'none',
            background: (isLoading || (!inputText.trim() && !attachment)) ? 'var(--border-color)' : 'var(--chat-boot-gradient)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: (isLoading || !inputText.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: (isLoading || (!inputText.trim() && !attachment)) ? 'none' : '0 4px 12px rgba(14,165,233,0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <Send size={15} />
          Send Message
        </button>
      </form>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
