import React, { useState, useRef, useEffect } from 'react';
import { PanditPortrait } from './PanditPortrait';
import { ChatMessage, UserMobileAccount } from '../types';
import {
  Send,
  Sparkles,
  Youtube,
  RefreshCw,
  Phone,
  History,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ShashankSharmaChatProps {
  initialPrompt?: string;
  onNavigateToTab: (tab: string) => void;
  onOpenBookingWithService?: (serviceName: string) => void;
  currentUser?: UserMobileAccount | null;
  onUpdateChatMessages?: (messages: ChatMessage[]) => void;
  onOpenLoginModal?: () => void;
  isEmbeddedInDrawer?: boolean;
}

const QUICK_CHIPS = [
  'आज के त्योहार व व्रत की पूजा विधि बताएं',
  'गृह प्रवेश मुहूर्त एवं रुद्रपुर में पूजा',
  'शनि साढ़े साती के लाभ व सावधानियां',
  'सत्यनारायण कथा विधि एवं प्रसाद नियम',
  'कुंडली मिलान एवं मांगलिक विचार',
  'महामृत्युंजय महाजप की विधि व सावधानियां',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  text: `राधे राधे! मैं पण्डित शशांक शर्मा ("पण्डित जी ऑनलाइन")। 

रुद्रपुर (उत्तराखंड) में आपके घर पर शास्त्रोक्त पूजा, गृह प्रवेश, सत्यनारायण कथा, महा रुद्राभिषेक, अथवा ऑनलाइन लाइव संकल्प एवं विस्तृत कुंडली परामर्श के विषय में आप मुझसे निसंकोच बात कर सकते हैं।

वैदिक ज्योतिष एवं कर्मकांड का मेरा सिद्धांत सदैव **संतुलित दृष्टिकोण** का है—हम प्रत्येक ग्रह, दशा एवं अनुष्ठान के शुभ लाभ (Pros) और आवश्यक सावधानियां (Precautions/Cons) दोनों को ध्यान में रखकर ही उचित निर्णय लेते हैं।

बताइए, आज आपके मन में क्या जिज्ञासा या संकल्प है?`,
  timestamp: 'सदैव उपलब्ध',
};

export const ShashankSharmaChat: React.FC<ShashankSharmaChatProps> = ({
  initialPrompt,
  onNavigateToTab,
  currentUser,
  onUpdateChatMessages,
  onOpenLoginModal,
  isEmbeddedInDrawer = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (currentUser && currentUser.chatMessages && currentUser.chatMessages.length > 0) {
      return [WELCOME_MESSAGE, ...currentUser.chatMessages.filter((m) => m.id !== 'msg-welcome')];
    }
    try {
      const savedGuest = localStorage.getItem('panditji_chat_history_guest');
      if (savedGuest) {
        const parsed: ChatMessage[] = JSON.parse(savedGuest);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [WELCOME_MESSAGE, ...parsed.filter((m) => m.id !== 'msg-welcome')];
        }
      }
    } catch {
      // ignore
    }
    return [WELCOME_MESSAGE];
  });

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastInitialPromptRef = useRef<string>('');

  // Sync when currentUser changes (e.g., user logs in or switches mobile number)
  useEffect(() => {
    if (currentUser) {
      const saved = currentUser.chatMessages || [];
      setMessages([WELCOME_MESSAGE, ...saved.filter((m) => m.id !== 'msg-welcome')]);
    } else {
      try {
        const savedGuest = localStorage.getItem('panditji_chat_history_guest');
        if (savedGuest) {
          const parsed: ChatMessage[] = JSON.parse(savedGuest);
          setMessages([WELCOME_MESSAGE, ...parsed.filter((m) => m.id !== 'msg-welcome')]);
          return;
        }
      } catch {
        // ignore
      }
      setMessages([WELCOME_MESSAGE]);
    }
  }, [currentUser?.phone, currentUser?.chatMessages?.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== lastInitialPromptRef.current) {
      lastInitialPromptRef.current = initialPrompt;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const persistMessages = (nextMessages: ChatMessage[]) => {
    const historyOnly = nextMessages.filter((m) => m.id !== 'msg-welcome');
    try {
      localStorage.setItem('panditji_chat_history_guest', JSON.stringify(historyOnly));
    } catch {
      // ignore
    }
    if (onUpdateChatMessages) {
      onUpdateChatMessages(historyOnly);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const nowStr = new Date().toLocaleString('hi-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: nowStr,
    };

    const updatedWithUser = [...messages, userMessage];
    setMessages(updatedWithUser);
    persistMessages(updatedWithUser);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = updatedWithUser.slice(-8).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error('API response failed');
      }

      const data = await response.json();
      const replyText = data.reply || 'राधे राधे! आपके प्रश्न का विश्लेषण किया जा रहा है।';

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleString('hi-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const finalMessages = [...updatedWithUser, assistantMessage];
      setMessages(finalMessages);
      persistMessages(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: `राधे राधे! आपका प्रश्न मुझे प्राप्त हुआ। 

शास्त्रों में कहा गया है कि किसी भी ग्रह स्थिति या पूजा संकल्प में संतुलन ही सबसे बड़ा धर्म है। यदि आप गृह प्रवेश, सत्यनारायण कथा या कुंडली विचार के लिए रुद्रपुर में तिथि तय करना चाहते हैं, तो आप सीधे हमारे "Puja & Booking" टैब से शुभ मुहूर्त चुन सकते हैं या मुझे अपनी जन्म तिथि, समय व स्थान बता सकते हैं। 

साथ ही हमारे आधिकारिक यूट्यूब चैनल (@panditjionlineofficial) पर इस विषय में मेरा विस्तृत वीडियो भी उपलब्ध है।`,
        timestamp: nowStr,
      };
      const finalMessages = [...updatedWithUser, fallbackMessage];
      setMessages(finalMessages);
      persistMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    persistMessages([WELCOME_MESSAGE]);
    setShowHistoryDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const savedConversationCount = messages.filter((m) => m.id !== 'msg-welcome').length;

  return (
    <div
      className={`flex flex-col bg-[#0c1220] overflow-hidden ${
        isEmbeddedInDrawer
          ? 'h-full'
          : 'h-[76vh] min-h-[540px] border border-amber-600/40 rounded-2xl shadow-2xl'
      }`}
    >
      {/* Chat Header / Action Toolbar */}
      <div className="bg-gradient-to-r from-amber-950/90 via-[#19110a] to-[#0d1424] px-3 sm:px-5 py-2.5 border-b border-amber-700/40 flex flex-wrap items-center justify-between gap-2">
        {!isEmbeddedInDrawer ? (
          <div className="flex items-center gap-3 min-w-0">
            <PanditPortrait size="md" showBadge={true} allowUpload={true} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-lg font-bold font-vedic text-amber-100 truncate">
                  पण्डित शशांक शर्मा (AI वैदिक परामर्श)
                </h3>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  सक्रिय (Online)
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium truncate">
                {currentUser
                  ? `मोबाइल हिस्ट्री सिंक: +91 ${currentUser.phone} (${savedConversationCount} संदेश सुरक्षित)`
                  : 'चैट हिस्ट्री मोबाइल नंबर से सुरक्षित रखने हेतु लॉगिन करें'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {currentUser
                ? `सुरक्षित चैट संदेश: ${savedConversationCount}`
                : 'हिस्ट्री सेव करने हेतु मोबाइल लॉगिन करें'}
            </span>
          </div>
        )}

        {/* Quick actions in chat header */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
            title="चैटबॉट हिस्ट्री देखें"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>चैट हिस्ट्री ({savedConversationCount})</span>
          </button>

          {!currentUser && onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>लॉगिन</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateToTab('youtube')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="यूट्यूब ज्ञान वीडियो"
          >
            <Youtube className="w-3.5 h-3.5 fill-current" />
            <span>यूट्यूब</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="चैट रीसेट करें"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Past Chat History Drawer inside Chat */}
      {showHistoryDrawer && (
        <div className="bg-slate-950/95 border-b border-amber-700/50 p-3 sm:p-4 max-h-56 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>
                आपकी चैटबॉट प्रश्नोत्तरी हिस्ट्री{' '}
                {currentUser ? `(+91 ${currentUser.phone})` : '(गेस्ट सेशन)'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('history')}
                className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
              >
                मेरी सम्पूर्ण हिस्ट्री टैब खोलें →
              </button>
              {savedConversationCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> साफ़ करें
                </button>
              )}
            </div>
          </div>

          {savedConversationCount === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              अभी कोई पुराना संवाद नहीं है। नीचे कोई भी प्रश्न पूछें, वह आपके मोबाइल नंबर के इतिहास में सुरक्षित हो जाएगा।
            </p>
          ) : (
            <div className="space-y-1.5">
              {messages
                .filter((m) => m.id !== 'msg-welcome' && m.role === 'user')
                .map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setInput(q.text);
                      setShowHistoryDrawer(false);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-amber-950/40 border border-amber-900/40 flex items-center justify-between gap-2 text-xs text-amber-100 cursor-pointer"
                  >
                    <span className="truncate">❓ {q.text}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{q.timestamp}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-radial-gradient">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="w-9 h-9 rounded-full bg-amber-600 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-md">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'आप'}
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <PanditPortrait size="xs" showBadge={true} />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-slate-900/95 text-amber-50 border border-amber-700/40 rounded-tl-none shadow-lg'
                }`}
              >
                {!isUser && (
                  <div className="text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <span>पं. शशांक शर्मा</span>
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>

                <div
                  className={`mt-2 text-[10px] flex items-center justify-end gap-1 ${
                    isUser ? 'text-amber-950/70' : 'text-slate-400'
                  }`}
                >
                  {currentUser && <CheckCircle2 className="w-3 h-3 inline" />}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <PanditPortrait size="xs" showBadge={true} />
            <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl rounded-tl-none p-3.5 shadow-lg flex items-center gap-2 text-xs text-amber-300">
              <span className="flex space-x-1">
                <span
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
              <span className="italic">पण्डित शशांक शर्मा जी शास्त्र सम्मत विचार कर रहे हैं...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-amber-900/30 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-amber-400/80 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> त्वरित प्रश्न:
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-900/40 text-amber-200/90 border border-amber-900/40 transition-colors flex-shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-3.5 bg-slate-950 border-t border-amber-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="पण्डित शशांक शर्मा जी से पूछें (उदा. आज का त्योहार, गृह प्रवेश, कुंडली)..."
            className="flex-1 bg-slate-900 border border-amber-900/60 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-600/30"
            title="संदेश भेजें"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
