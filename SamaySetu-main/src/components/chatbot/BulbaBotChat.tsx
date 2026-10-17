import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Leaf,
  Globe,
  Trash2,
  ChevronDown,
  Bot,
  User,
  CornerDownLeft,
  Copy,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  SupportedLanguage,
  ChatMessage,
  LANGUAGE_OPTIONS,
  QUICK_PROMPTS_BY_LANG,
  BulbaBotEngine,
} from '../../services/chatbot/knowledgeEngine';

export const BulbaBotChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message per language
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'bot',
      text: BulbaBotEngine.processQuery('hello', 'en'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'en',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Handle language switch
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const greeting = BulbaBotEngine.processQuery('hello', newLang);
    setMessages(prev => [
      ...prev,
      {
        id: `lang-change-${Date.now()}`,
        sender: 'bot',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: newLang,
      },
    ]);
  };

  // Copy message text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit user query with realistic conversational delay
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Snappy intelligent response
    setTimeout(() => {
      const botReply = BulbaBotEngine.processQuery(query, language);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: BulbaBotEngine.processQuery('hello', language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      },
    ]);
  };

  const activeLangOption = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];
  const quickPrompts = QUICK_PROMPTS_BY_LANG[language] || QUICK_PROMPTS_BY_LANG.en;

  const inputPlaceholderMap: Record<SupportedLanguage, string> = {
    en: 'Ask about faculty, timetable, free rooms, notices...',
    hi: 'फैकल्टी, टाइमटेबल, खाली कमरों या नोटिस के बारे में पूछें...',
    hinglish: 'Timetable, teachers, cabins, free rooms ke baare mein poocho...',
    mr: 'वेळापत्रक, शिक्षक, रिकाम्या खोल्या किंवा सूचनांविषयी विचारा...',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[85vh] max-h-[85vh]'
              : 'w-[360px] sm:w-[440px] h-[580px] max-h-[82vh]'
          } bg-white/95 backdrop-blur-xl border border-[#BCE5D1] rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200 transition-all`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white flex items-center justify-between border-b border-[#A7F3D0]/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-base shadow-sm border border-white/30">
                🌿
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-white">BulbaBot AI</h3>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0]">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[#DCFCE7] font-semibold">Multilingual Academic Copilot</p>
              </div>
            </div>

            {/* Language Selector Dropdown & Actions */}
            <div className="flex items-center gap-1.5">
              {/* Language Dropdown */}
              <div className="relative">
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="text-xs font-bold bg-[#133E35] text-[#86EFAC] border border-[#86EFAC]/40 rounded-xl px-2.5 py-1.5 appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-[#86EFAC] cursor-pointer shadow-xs"
                  title="Choose conversation language"
                >
                  {LANGUAGE_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code} className="bg-[#133E35] text-white">
                      {opt.flag} {opt.nativeName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#86EFAC] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Maximize / Minimize Window */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#DCFCE7] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 text-[#DCFCE7] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Close window */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#DCFCE7] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Language & Status Pill */}
          <div className="px-4 py-1.5 bg-[#F8FCF9] border-b border-[#BCE5D1] flex items-center justify-between text-[11px] text-[#2D6A4F] shrink-0">
            <span className="flex items-center gap-1 font-semibold">
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Language: <strong className="text-[#133E35]">{activeLangOption.nativeName}</strong></span>
            </span>
            <span className="text-[10px] bg-[#E6FDF0] text-[#065F46] border border-[#A7F3D0] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Zero-Clash Solver Connected</span>
            </span>
          </div>

          {/* Chat Messages Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F0F9F5]/40">
            {messages.map(msg => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'} group`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center text-sm shrink-0 shadow-xs mt-0.5 border border-[#86EFAC]/50">
                      🌿
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs relative ${
                        isBot
                          ? 'bg-white text-[#133E35] border border-[#BCE5D1] rounded-tl-xs font-normal'
                          : 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold rounded-tr-xs shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {msg.text.split('\n').map((line, idx) => {
                          return (
                            <p key={idx} className={line.startsWith('•') ? 'pl-2 text-[11.5px] my-0.5' : ''}>
                              {line.includes('**') ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: line.replace(
                                      /\*\*(.*?)\*\*/g,
                                      `<strong class="${isBot ? 'font-extrabold text-[#059669]' : 'font-black text-white'}">$1</strong>`
                                    ),
                                  }}
                                />
                              ) : (
                                line
                              )}
                            </p>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5">
                        <span
                          className={`text-[9px] font-mono ${
                            isBot ? 'text-[#2D6A4F]/60' : 'text-white/70'
                          }`}
                        >
                          {msg.timestamp}
                        </span>

                        {isBot && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="text-[10px] text-[#2D6A4F] hover:text-[#059669] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                            title="Copy reply to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#10B981]" />
                                <span className="text-[#10B981] font-bold text-[9px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[9px]">Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-2xl bg-[#133E35] text-white flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5 border border-[#10B981]/50">
                      <User className="w-4 h-4 text-[#86EFAC]" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Realistic Live Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center text-sm shrink-0 shadow-xs mt-0.5 border border-[#86EFAC]/50">
                  🌿
                </div>
                <div className="bg-white border border-[#BCE5D1] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#047857] animate-bounce" />
                  <span className="text-[11px] font-semibold text-[#2D6A4F] ml-2">
                    Consulting institutional database...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="p-2 border-t border-[#BCE5D1] bg-[#F8FCF9] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleSendMessage(prompt.query)}
                className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-xl bg-white text-[#133E35] border border-[#BCE5D1] hover:bg-[#E6FDF0] hover:text-[#065F46] hover:border-[#86EFAC] transition-all flex items-center gap-1 shadow-2xs"
              >
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#BCE5D1] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholderMap[language]}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#BCE5D1] bg-[#F8FCF9] text-[#133E35] placeholder-[#2D6A4F]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white disabled:opacity-40 transition-all shadow-xs shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-[#A7F3D0] group"
      >
        <span className="text-base group-hover:rotate-12 transition-transform">🌿</span>
        <span className="tracking-wide">Ask BulbaBot</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#047857] font-black uppercase shadow-2xs">
          Multilingual
        </span>
      </button>
    </div>
  );
};
