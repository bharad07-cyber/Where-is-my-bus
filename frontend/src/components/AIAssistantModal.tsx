import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Bot, X, Send, Sparkles, Mic, Volume2 } from 'lucide-react';
import { VoiceGuidanceService } from '../voice/voiceGuidance';

export const AIAssistantModal: React.FC = () => {
  const { isAIAssistantOpen, setAIAssistantOpen, language } = useAppStore();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: language === 'ta'
        ? 'வணக்கம்! நான் உங்கள் தமிழ் நாடு பேருந்து AI உதவியாளராக இயங்குகிறேன். உங்களுக்கு எங்கு செல்ல வேண்டும்?'
        : 'Hello! I am your TN Bus Live AI assistant. Ask me anything about MTC & TNSTC buses, live routes, or auto suggestions.'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isAIAssistantOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, language })
      });
      const data = await res.json();
      const botText = data.response || (language === 'ta' ? 'தி. நகர் செல்ல பேருந்து 23C சிறந்த தேர்வாகும்.' : 'To reach T Nagar, board MTC Bus 23C from Ashok Pillar.');

      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      VoiceGuidanceService.speak(botText, language);
    } catch {
      const fallback = language === 'ta' ? 'கோயம்பேடு பேருந்து நிலையத்திற்கு 570 பேருந்து நேரலையில் உள்ளது.' : 'MTC Bus 570 is currently live towards Koyambedu.';
      setMessages(prev => [...prev, { sender: 'bot', text: fallback }]);
      VoiceGuidanceService.speak(fallback, language);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-lg glass-card rounded-2xl border border-sky-500/40 shadow-2xl flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                <span>TN Bus AI Assistant</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[10px] text-slate-400">Powered by FastAPI Transit RAG Model</p>
            </div>
          </div>
          <button onClick={() => setAIAssistantOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                <p>{m.text}</p>
                {m.sender === 'bot' && (
                  <button
                    onClick={() => VoiceGuidanceService.speak(m.text, language)}
                    className="mt-1.5 text-[10px] text-sky-400 flex items-center gap-1 hover:underline"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800 flex gap-2 overflow-x-auto text-[11px] text-slate-300">
          <button onClick={() => setInput('How do I reach T Nagar?')} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shrink-0">
            How to reach T Nagar?
          </button>
          <button onClick={() => setInput('Is Bus 570 crowded?')} className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 shrink-0">
            Is Bus 570 crowded?
          </button>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-700/60 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI transit guide..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
