'use client';
import { useState, useRef, useEffect } from 'react';

export default function AIAssistant({ resume }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Greetings, traveler! I am your Combustion Career Coach. Upload your credentials (resume) or consult me on your path through the job market.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setError('');
    setLoading(true);

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10),
          resumeText: resume?.text || resume?.summary || '',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Connection broken. Failed to reach thermal core.');
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text || 'No response returned.' }]);
      }
    } catch (fetchError) {
      setError('Unable to reach the AI counselor.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    if (loading) return;
    handleSend(promptText);
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Bridge reset. Ready for new thermal transmissions.'
      }
    ]);
    setError('');
  };

  return (
    <section className="glass-card rounded-[2rem] border border-orange-500/20 bg-slate-950/60 p-8 shadow-orangeGlow backdrop-blur-2xl flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300">
            Thermal Advisor
          </span>
          <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">AI Career Coach</h3>
        </div>
        <button 
          onClick={resetChat} 
          className="rounded-full border border-orange-500/30 px-3 py-1 text-xs text-orange-300 transition hover:bg-orange-500/10"
        >
          Reset Logs
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-600/20 border border-orange-500/30 text-orange-100 rounded-tr-none'
                  : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5 border-b border-white/5 pb-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300">Coach AI</span>
                </div>
              )}
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[1.5rem] p-4 bg-slate-900/60 border border-white/5 text-slate-400 text-xs rounded-tl-none flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" />
              <span>Analyzing feed signals...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Output */}
      {error && (
        <p className="mb-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      {/* Suggested prompt chips */}
      {messages.length === 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button 
            onClick={() => handleQuickPrompt("Give me suggestions to improve my resume.")}
            className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-orange-500/15 hover:border-orange-500/30 hover:text-orange-200"
          >
            📋 Improve my resume
          </button>
          <button 
            onClick={() => handleQuickPrompt("What remote technical skills are most in demand right now?")}
            className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-orange-500/15 hover:border-orange-500/30 hover:text-orange-200"
          >
            ⚡ In-demand remote skills
          </button>
        </div>
      )}

      {/* Input bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="flex items-center gap-2 border-t border-white/5 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={resume ? "Query your career coordinator..." : "Query coordinator (upload resume for deep sync)..."}
          className="flex-1 rounded-full border border-white/10 bg-slate-900/60 px-5 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-400/80"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-orange-500 p-3 text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </form>
    </section>
  );
}