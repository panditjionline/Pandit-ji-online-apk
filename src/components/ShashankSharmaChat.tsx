import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PanditPortrait } from './PanditPortrait';
import { UserAvatar } from './UserAvatar';
import { ChatMessage, UserMobileAccount } from '../types';
import { vedicAudio } from '../utils/audioSynthesizer';
import { useLanguage, AppLanguage } from '../i18n/LanguageContext';
import { getActiveProfile } from '../utils/autoPersonalization';
import { generateSampurnKundali } from '../utils/sampurnKundali';
import { getCalculationViewingMode, CalculationViewingMode } from '../utils/familyVaultStorage';
import { getVedicDetailsFromName } from '../utils/kundaliMilan';
import {
  Send,
  Sparkles,
  Youtube,
  RefreshCw,
  Phone,
  History,
  CheckCircle2,
  Trash2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Compass,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
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

const LOCALIZED_QUICK_CHIPS: Record<AppLanguage, string[]> = {
  hi: [
    'मेरी लग्न, राशि, महादशा व गोचर के अनुसार करियर व धन योग बताएं',
    'विवाह योग, सप्तम भाव एवं मांगलिक दोष का शास्त्रोक्त समाधान',
    'स्वास्थ्य, आत्मबल एवं रोग-मुक्ति हेतु वैदिक उपाय व रुद्राक्ष',
    'शनि साढ़े साती, राहु-केतु गोचर एवं अचूक वैदिक परिहार',
    'मेरे लग्नेश के अनुसार शुभ रत्न, रुद्राक्ष एवं सिद्ध बीज मंत्र',
    'आज का दृक् पंचांग (रुद्रपुर IST) एवं अभिजित शुभ मुहूर्त',
  ],
  en: [
    'Analyze my Career & Finance via Lagna, Mahadasha & Gochar',
    'Marriage timing, 7th House & Manglik Dosha Vedic remedies',
    'Health, vitality & immunity remedies via Lagna & Nakshatra',
    'Shani Sade Sati & Rahu-Ketu transit effects + Shastrokta Upay',
    'Recommend authentic Gemstone, Rudraksha & Beej Mantra for me',
    "Today's Rudrapur IST Panchang & Abhijit Shubh Muhurat",
  ],
  hinglish: [
    'Meri Lagna, Rashi, Mahadasha aur Gochar se Career & Dhan yog batayein',
    'Vivah yog, 7th house aur Manglik Dosha ka shastrokta upay',
    'Health aur mansik shanti ke liye Vedic upay aur Rudraksha',
    'Shani Sade Sati, Rahu-Ketu gochar aur achook Vedic parihar',
    'Mere Lagnesh ke anusar shubh Ratna, Rudraksha aur Beej Mantra',
    'Aaj ka Rudrapur IST Panchang aur Abhijit Shubh Muhurat',
  ],
  mr: [
    'माझ्या लग्न, राशी, महादशा व गोचरनुसार करिअर आणि धन योग सांगा',
    'विवाह योग, सप्तम भाव आणि मांगलिक दोषाचे शास्त्रोक्त उपाय',
    'आरोग्य व मानसिक शांतीसाठी वैदिक उपाय आणि रुद्राक्ष',
    'शनि साडेसाती व राहू-केतू गोचर उपाय सांगा',
    'लग्नेशानुसार शुभ रत्न, रुद्राक्ष आणि बीज मंत्र सांगा',
    'आजचे पंचांग व शुभ मुहूर्त सांगा',
  ],
  gu: [
    'મારા લગ્ન, રાશિ, મહાદશા અને ગોચર મુજબ કરિયર અને ધન યોગ જણાવો',
    'લગ્ન યોગ, સપ્તમ ભાવ અને માંગલિક દોષના શાસ્ત્રોક્ત ઉપાય',
    'સ્વાસ્થ્ય અને માનસિક શાંતિ માટે વૈદિક ઉપાય અને રુદ્રાક્ષ',
    'શનિ સાડાસાતી અને રાહુ-કેતુ ગોચરના ઉપાય જણાવો',
    'લગ્નેશ મુજબ શુભ રત્ન, રુદ્રાક્ષ અને બીજ મંત્ર જણાવો',
    'આજનું પંચાંગ અને શુભ મુહૂર્ત જણાવો',
  ],
};

function getWelcomeMessage(lang: AppLanguage): ChatMessage {
  if (lang === 'en') {
    return {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Radhe Radhe! I am **Acharya Pandit Shashank Sharma** ("Pandit Ji Online", Rudrapur).

Using **Classical Parashari, Jaimini (Chara Karakas), and Nakshatra Nadi Principles**, I evaluate your **Lagna, Chandra Rashi, Active Vimshottari Mahadasha/Antardasha, and Live Planetary Gochar** to guide you on **Career, Marriage, Finance, Health, Doshas, and Authentic Vedic Upay (Gemstones, Rudraksha & Mantra Jaap)**.

How may I analyze your horoscope or guide your spiritual journey today?`,
      timestamp: 'Always Available',
    };
  }
  if (lang === 'hinglish') {
    return {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Radhe Radhe! Main **Acharya Pandit Shashank Sharma** ("Pandit Ji Online", Rudrapur).

Main **Parashari, Jaimini aur Nadi Jyotish Siddhanton** ke aadhar par aapke **Lagna, Chandra Rashi, Active Mahadasha/Antardasha aur Live Gochar** ka vishleshan karke **Career, Vivah, Dhan, Health, Grah-Dosha aur Shastrokta Upay (Ratna, Rudraksha & Mantra Jaap)** par sateek margdarshan deta hoon.

Bataiye, aaj aap apni Kundali ya jeevan ke kis vishay par parmarsh chahte hain?`,
      timestamp: 'Sadaiv Uplabdh',
    };
  }
  return {
    id: 'msg-welcome',
    role: 'assistant',
    text: `राधे राधे! मैं **आचार्य पण्डित शशांक शर्मा** ("पण्डित जी ऑनलाइन" • रुद्रपुर, उत्तराखण्ड)। 

मैं **बृहत् पराशर होरा शास्त्र, जैमिनी सूत्र एवं नक्षत्र नाड़ी ज्योतिष** के सिद्धांतों के आधार पर आपके **लग्न, चन्द्र राशि, जन्म नक्षत्र, सक्रिय विंशोत्तरी महादशा/अंतर्दशा एवं वर्तमान ग्रह गोचर** का सूक्ष्म विश्लेषण कर **करियर, विवाह, धन, स्वास्थ्य, दोष-निवारण तथा प्रामाणिक वैदिक उपाय (रत्न, रुद्राक्ष व मंत्र जप)** पर सटीक मार्गदर्शन प्रदान करता हूँ।

बताइए, आज आपके मन में क्या ज्योतिषीय जिज्ञासा या संकल्प है?`,
    timestamp: 'सदैव उपलब्ध',
  };
}

/**
 * Filters out any old broken generic Hinglish repeat messages from stored history
 */
function sanitizeStoredChatHistory(list: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(list)) return [];
  return list.filter((m) => {
    if (!m || !m.text || m.id === 'msg-welcome') return false;
    if (
      m.text.includes('Rudrapur (Uttarakhand) aur sampoorn vishva ke shradhaluon ke kalyanarth') ||
      m.text.includes('पर शास्त्रसम्मत एवं संतुलित वैदिक विचार इस प्रकार है') ||
      m.text.includes('मन को सदैव सकारात्मक और धर्मपरायण रखें')
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Formats bold (**text**) and inline code (`text`) cleanly inside chat bubbles
 */
function renderFormattedVedicText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-extrabold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <span
          key={idx}
          className="inline-block px-2 py-0.5 my-0.5 rounded-md bg-amber-950/90 border border-amber-500/50 text-yellow-300 font-vedic font-bold"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Jyotish AI Chat ErrorBoundary Caught Fatal Component Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-stone-900 border border-amber-500/30 rounded-2xl m-4 text-amber-100">
          <p className="font-bold text-amber-300 text-lg mb-2">🙏 क्षमा करें, चैट सेवा लोड करने में व्यवधान आया</p>
          <p className="text-sm text-stone-300 mb-4">
            आचार्य जी की सेवा पुनः प्रारंभ करने के लिए कृपया नीचे दिए गए बटन पर क्लिक करें।
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold rounded-lg shadow-md hover:from-amber-500 hover:to-amber-400 transition-all text-sm cursor-pointer"
          >
            पुनः प्रयास करें (Retry)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ShashankSharmaChatInner: React.FC<ShashankSharmaChatProps> = ({
  initialPrompt,
  onNavigateToTab,
  currentUser,
  onUpdateChatMessages,
  onOpenLoginModal,
  isEmbeddedInDrawer = false,
}) => {
  const { language, tr } = useLanguage();
  const welcomeMessage = useMemo(() => getWelcomeMessage(language), [language]);
  const quickChips = useMemo(
    () => LOCALIZED_QUICK_CHIPS[language] || LOCALIZED_QUICK_CHIPS.hi,
    [language]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialWelcome = getWelcomeMessage(language);
    if (currentUser && currentUser.chatMessages && currentUser.chatMessages.length > 0) {
      const cleaned = sanitizeStoredChatHistory(currentUser.chatMessages);
      return [initialWelcome, ...cleaned];
    }
    try {
      const savedGuest = localStorage.getItem('panditji_chat_history_guest');
      if (savedGuest) {
        const parsed: ChatMessage[] = JSON.parse(savedGuest);
        const cleaned = sanitizeStoredChatHistory(parsed);
        if (cleaned.length > 0) {
          return [initialWelcome, ...cleaned];
        }
      }
    } catch {
      // ignore
    }
    return [initialWelcome];
  });

  // Update welcome bubble dynamically when user switches language
  useEffect(() => {
    setMessages((prev) => {
      const rest = prev.filter((m) => m.id !== 'msg-welcome');
      return [welcomeMessage, ...rest];
    });
  }, [welcomeMessage]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [isAstroContextExpanded, setIsAstroContextExpanded] = useState<boolean>(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMountedRef = useRef<boolean>(false);
  const lastInitialPromptRef = useRef<string>('');

  // Sync when currentUser changes (e.g., user logs in or switches mobile number)
  useEffect(() => {
    if (currentUser) {
      const cleaned = sanitizeStoredChatHistory(currentUser.chatMessages || []);
      setMessages([welcomeMessage, ...cleaned]);
    } else {
      try {
        const savedGuest = localStorage.getItem('panditji_chat_history_guest');
        if (savedGuest) {
          const parsed: ChatMessage[] = JSON.parse(savedGuest);
          const cleaned = sanitizeStoredChatHistory(parsed);
          setMessages([welcomeMessage, ...cleaned]);
          return;
        }
      } catch {
        // ignore
      }
      setMessages([welcomeMessage]);
    }
  }, [currentUser?.phone, welcomeMessage]);

  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    return unsubSpeech;
  }, []);

  // Voice Speech Recognition (Speech-to-Text via Web Speech API)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-speak responses toggle (tailored for elderly users)
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem('panditji_auto_speak_chat') === 'true';
    } catch {
      return false;
    }
  });

  const toggleAutoSpeak = () => {
    setAutoSpeak((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('panditji_auto_speak_chat', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        tr(
          'आपके ब्राउज़र में वॉइस स्पीच उपलब्ध नहीं है। कृपया लिखकर प्रश्न पूछें।',
          'Voice recognition is not supported in this browser. Please type your query.',
          'Aapke browser mein voice recognition support nahi hai. Kripya type karein.'
        )
      );
      setTimeout(() => setSpeechError(null), 4500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        vedicAudio.playCrispTempleBell(0.5);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            tr(
              'कृपया माइक्रोफोन की अनुमति दें (Allow Mic in browser)।',
              'Please allow microphone permission in your browser.',
              'Kripya microphone ki permission allow karein.'
            )
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(
            tr(
              'आवाज स्पष्ट नहीं सुनाई दी, कृपया माइक दबाकर दोबारा बोलें।',
              'Could not hear clearly, please click Mic and speak again.',
              'Aawaz spasht nahi aayi, kripya dobara bolein.'
            )
          );
        }
        setTimeout(() => setSpeechError(null), 4500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech start error:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Strictly scroll ONLY the internal chat box container — never the outer page window
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (messages.length <= 1) {
        container.scrollTop = 0;
      } else {
        container.scrollTop = container.scrollHeight;
      }
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== lastInitialPromptRef.current) {
      lastInitialPromptRef.current = initialPrompt;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const persistMessages = (nextMessages: ChatMessage[]) => {
    const historyOnly = sanitizeStoredChatHistory(nextMessages);
    try {
      localStorage.setItem('panditji_chat_history_guest', JSON.stringify(historyOnly));
    } catch {
      // ignore
    }
    if (onUpdateChatMessages) {
      onUpdateChatMessages(historyOnly);
    }
  };

  const [calcViewingMode, setCalcViewingMode] = useState<CalculationViewingMode>(getCalculationViewingMode);

  useEffect(() => {
    const handleModeChange = (e: CustomEvent<CalculationViewingMode> | Event) => {
      const mode = (e as CustomEvent).detail || getCalculationViewingMode();
      setCalcViewingMode(mode);
    };
    window.addEventListener('display_preference_changed', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('display_preference_changed', handleModeChange as EventListener);
    };
  }, []);

  // Compute live Lagna, Chandra Rashi, Nakshatra & Active Vimshottari Mahadasha for personalized AI Chat
  const activeAstroContext = useMemo(() => {
    const activeProf = getActiveProfile();
    const rawName = currentUser?.name || activeProf?.name || 'यजमान';
    const cleanName = rawName.replace(/^(?:हे\s+|श्री\s+|यजमान\s+)+/i, '').replace(/\s+(?:जी|ji)$/i, '').trim() || 'यजमान';
    const dob = currentUser?.dob || activeProf?.dob || '1996-11-06';
    const birthTime = currentUser?.birthTime || activeProf?.birthTime || '12:00';
    const birthPlace = currentUser?.birthPlace || activeProf?.birthPlace || 'रुद्रपुर, उत्तराखण्ड';
    const report = generateSampurnKundali(cleanName, dob, birthTime, birthPlace);
    const activeDasha = report.mahadashas.find((d) => d.isCurrent) || report.mahadashas[0];
    const isNameMode = calcViewingMode === 'name_rashi';
    const nameVedic = isNameMode ? getVedicDetailsFromName(cleanName) : null;

    const lagna = nameVedic
      ? `${nameVedic.rashi} (नाम राशि आधारित)`
      : activeProf?.lagna || report.panchang.lagnaName;
    const rashi = nameVedic
      ? nameVedic.rashi
      : currentUser?.rashi || activeProf?.rashi || report.panchang.moonRashiName;
    const nakshatra = nameVedic
      ? nameVedic.nakshatra
      : activeProf?.nakshatra || report.panchang.nakshatraName;
    const dashaLabel = activeDasha
      ? `${activeDasha.planet} महादशा (${activeDasha.currentAntardasha || 'शुक्र'} अंतर्दशा)`
      : 'बृहस्पति महादशा';

    return {
      name: cleanName,
      dob,
      birthTime,
      birthPlace,
      lagna,
      lagnaLord: nameVedic ? nameVedic.rashiLord : report.panchang.lagnaLord,
      rashi,
      nakshatra,
      dashaLabel,
      ratna: report.lucky.ratnaName,
      rudraksha: report.lucky.rudraksha,
      beejMantra: report.lucky.beejMantra,
      calcViewingMode,
      payload: {
        name: cleanName,
        dob,
        birthTime,
        birthPlace,
        rashi,
        lagna,
        nakshatra,
        gotra: currentUser?.gotra || activeProf?.gotra,
        calcViewingMode,
      },
    };
  }, [
    currentUser?.name,
    currentUser?.dob,
    currentUser?.birthTime,
    currentUser?.birthPlace,
    currentUser?.rashi,
    calcViewingMode,
  ]);

  const sendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const nowStr = new Date().toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN', {
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

    const priorConversation = messages.filter((m) => m && m.id !== 'msg-welcome');
    const isFirstTurn = priorConversation.filter((m) => m.role === 'user').length === 0;
    const updatedWithUser = [...messages, userMessage];
    setMessages(updatedWithUser);
    persistMessages(updatedWithUser);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('Chat request timeout')), 25000);

    try {
      const historyPayload = priorConversation
        .slice(-6)
        .map((m) => {
          let text = m.text.replace(/[*#`_~•]+/g, '').replace(/\s+/g, ' ').trim();
          if (m.role === 'assistant' && text.length > 450) {
            text = text.slice(0, 445).replace(/\s+\S*$/, '') + '...';
          }
          return {
            role: m.role,
            parts: [{ text }],
          };
        });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          language,
          userProfile: activeAstroContext.payload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errData = await response.json();
          errorDetail = errData?.error || JSON.stringify(errData);
        } catch {
          errorDetail = await response.text().catch(() => '');
        }
        throw new Error(`API HTTP ${response.status}: ${errorDetail || response.statusText}`);
      }

      const data = await response.json();
      if (!data || (typeof data.reply !== 'string' && !data.error)) {
        throw new Error('Malformed API response payload received');
      }

      const replyText =
        data.reply ||
        (isFirstTurn
          ? tr(
              'राधे राधे! कल्याण हो! आपके प्रश्न का विश्लेषण किया जा रहा है।',
              'Radhe Radhe! Kalyan ho! Analyzing your query according to Vedic Shastras.',
              'Radhe Radhe! Kalyan ho! Aapke prashna ka vishleshan kiya ja raha hai.'
            )
          : tr(
              'आपके प्रश्न का शास्त्रोक्त विश्लेषण किया जा रहा है।',
              'Analyzing your query according to Vedic Shastras.',
              'Aapke prashna ka shastrokta vishleshan kiya ja raha hai.'
            ));

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
        searchGrounded: Boolean(data.searchGrounded),
        timestamp: new Date().toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const finalMessages = [...updatedWithUser, assistantMessage];
      setMessages(finalMessages);
      persistMessages(finalMessages);

      // Auto-speak reply if enabled (accessible for elderly devotees)
      if (autoSpeak) {
        const cleanSpeakText = replyText
          .replace(/[*#`_~•]/g, '')
          .replace(/https?:\/\/\S+/g, '')
          .trim();
        vedicAudio.speakVedicText(cleanSpeakText, `chat-msg-${assistantMessage.id}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('[Jyotish AI Chat] Network notice:', err?.message || String(err));

      const effectiveName = activeAstroContext.name || 'यजमान';
      const greetingPrefix = isFirstTurn
        ? `**राधे राधे, ${effectiveName} जी! 🙏 कल्याण हो!** `
        : '';

      const fallbackReplyText = `${greetingPrefix}${effectiveName} जी, आपके प्रश्न ("${userText.slice(0, 60)}") के संदर्भ में: आपकी राशि ${activeAstroContext.rashi || 'पत्रिका'} तथा वर्तमान गोचर के अनुसार अपने इष्ट देव का स्मरण करें। यदि किसी तात्कालिक तकनीकी या नेटवर्क कारण से विलंब हुआ है, तो कृपया पुनः प्रयास करें अथवा अपने प्रश्न का विशिष्ट विवरण साझा करें।`;

      const fallbackMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: fallbackReplyText,
        timestamp: nowStr,
      };
      const finalMessages = [...updatedWithUser, fallbackMessage];
      setMessages(finalMessages);
      persistMessages(finalMessages);

      if (autoSpeak) {
        const cleanSpeakText = fallbackMessage.text
          .replace(/[*#`_~•]/g, '')
          .replace(/https?:\/\/\S+/g, '')
          .trim();
        vedicAudio.speakVedicText(cleanSpeakText, `chat-msg-${fallbackMessage.id}`);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleClearChat = () => {
    setMessages([welcomeMessage]);
    persistMessages([welcomeMessage]);
    setShowHistoryDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        sendMessage();
      }
    }
  };

  const savedConversationCount = messages.filter((m) => m.id !== 'msg-welcome').length;

  return (
    <div
      className={`flex flex-col bg-[#0c1220] overflow-hidden ${
        isEmbeddedInDrawer
          ? 'h-full min-h-0'
          : 'h-[calc(100dvh-140px)] sm:h-[80vh] min-h-[460px] max-h-[820px] border border-amber-600/40 rounded-2xl shadow-2xl'
      }`}
    >
      {/* Chat Header / Action Toolbar */}
      <div
        className={`bg-gradient-to-r from-amber-950/90 via-[#19110a] to-[#0d1424] px-3 sm:px-5 border-b border-amber-700/40 flex ${
          isEmbeddedInDrawer
            ? 'flex-row items-center justify-between py-2 gap-2'
            : 'flex-col sm:flex-row items-start sm:items-center justify-between py-2.5 gap-2.5'
        } flex-shrink-0 z-20`}
      >
        {!isEmbeddedInDrawer ? (
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
            <PanditPortrait size="md" showBadge={true} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h2 className="text-sm sm:text-base font-bold font-vedic text-amber-100 truncate">
                  {tr(
                    'आचार्य पण्डित शशांक शर्मा (पराशरी • जैमिनी • नाड़ी ज्योतिष)',
                    'Acharya Pandit Shashank Sharma (Parashari • Jaimini • Nadi AI)',
                    'Acharya Pandit Shashank Sharma (Parashari • Jaimini • Nadi AI)',
                    'आचार्य पंडित शशांक शर्मा (पराशरी व नाडी ज्योतिष)',
                    'આચાર્ય પંડિત શશાંક શર્મા (પરાશરી અને નાડી જ્યોતિષ)'
                  )}
                </h2>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex-shrink-0">
                  {tr('प्रत्यक्ष उपलब्ध', 'Active Online', 'Sakriya (Online)', 'सक्रिय', 'સક્રિય')}
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium truncate">
                {currentUser
                  ? tr(
                      `मोबाइल हिस्ट्री सिंक: +91 ${currentUser.phone} (${savedConversationCount} संदेश सुरक्षित)`,
                      `Mobile History Synced: +91 ${currentUser.phone} (${savedConversationCount} messages saved)`,
                      `Mobile History Sync: +91 ${currentUser.phone} (${savedConversationCount} sandesh surakshit)`
                    )
                  : tr(
                      'चैट हिस्ट्री मोबाइल नंबर से सुरक्षित रखने हेतु लॉगिन करें',
                      'Login with your mobile number to keep chat history permanently synced',
                      'Chat history mobile number se save rakhne ke liye login karein'
                    )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium min-w-0 flex-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              {currentUser
                ? tr(
                    `सुरक्षित संदेश: ${savedConversationCount}`,
                    `Saved: ${savedConversationCount}`,
                    `Surakshit: ${savedConversationCount}`
                  )
                : tr(
                    'हिस्ट्री सेव हेतु लॉगिन करें',
                    'Login to save history',
                    'Login to save history'
                  )}
            </span>
          </div>
        )}

        {/* Quick actions in chat header */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0 flex-shrink-0">
          {/* Auto Speak TTS toggle for Elderly devotees */}
          <button
            type="button"
            onClick={toggleAutoSpeak}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              autoSpeak
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-xs'
                : 'bg-slate-900 text-amber-300/70 border-amber-800/40 hover:text-amber-200'
            }`}
            title={
              autoSpeak
                ? 'उत्तर स्वतः वाचन चालू है (Auto Speak Active)'
                : 'उत्तर स्वतः वाचन चालू करें (Auto Speak for Elders)'
            }
          >
            {autoSpeak ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-amber-400/60" />
            )}
            <span className="hidden xs:inline text-[11px]">
              {autoSpeak ? 'ऑटो वॉइस चालू' : 'ऑटो वॉइस'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
            title={tr('चैटबॉट हिस्ट्री देखें', 'View Chat History', 'Chat History Dekhein')}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {tr('चैट हिस्ट्री', 'Chat History', 'Chat History')} ({savedConversationCount})
            </span>
          </button>

          {!currentUser && onOpenLoginModal && (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{tr('लॉगिन', 'Login', 'Login')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigateToTab('youtube')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title={tr('यूट्यूब ज्ञान वीडियो', 'YouTube Vedic Videos', 'YouTube Gyan Videos')}
          >
            <Youtube className="w-3.5 h-3.5 fill-current" />
            <span>{tr('यूट्यूब', 'YouTube', 'YouTube')}</span>
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title={tr('चैट रीसेट करें', 'Reset Chat', 'Chat Reset Karein')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Jyotish Horoscope Context Strip (Collapsible Accordion Header for Maximum Chat Viewport Space) */}
      <div className="bg-slate-950/95 border-b border-amber-800/40 transition-all flex-shrink-0 z-10">
        {/* Compact Accordion Header Bar */}
        <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 text-[11px] min-h-[32px]">
          <button
            type="button"
            onClick={() => setIsAstroContextExpanded(!isAstroContextExpanded)}
            className="flex items-center gap-1.5 text-left text-amber-200 hover:text-yellow-300 font-medium cursor-pointer min-w-0 flex-1 group"
            title={
              isAstroContextExpanded
                ? tr('सक्रिय ज्योतिष मूल्यांकन विवरण छुपाएं', 'Hide Active Horoscope Context Details')
                : tr('सक्रिय ज्योतिष मूल्यांकन विवरण दिखाएं', 'Show Active Horoscope Context Details')
            }
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-bold text-yellow-300 whitespace-nowrap">
              {tr('ज्योतिष मूल्यांकन:', 'Astro Context:')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-100 font-semibold text-[10px] truncate max-w-[180px] xs:max-w-[220px] sm:max-w-xs">
              {activeAstroContext.name} • {activeAstroContext.lagna} • {activeAstroContext.rashi}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 ml-1 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <span>
                {isAstroContextExpanded
                  ? tr('छुपाएं', 'Hide', 'Chhipayein')
                  : tr('विवरण देखें', 'Details', 'Details')}
              </span>
              {isAstroContextExpanded ? (
                <ChevronUp className="w-3 h-3 text-amber-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-amber-400" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab('janam-kundali')}
            className="text-[10px] font-bold text-amber-400 hover:text-yellow-300 underline cursor-pointer flex-shrink-0"
          >
            {tr('कुंडली चार्ट →', 'Kundali →')}
          </button>
        </div>

        {/* Expanded Detailed Horoscope Badges */}
        {isAstroContextExpanded && (
          <div className="px-3 sm:px-4 pb-2.5 pt-1 border-t border-amber-800/30 bg-[#080d17]/90 flex flex-wrap items-center gap-1.5 text-[10px] animate-fadeIn">
            <span className="px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-600/50 text-amber-100 font-semibold">
              👤 {tr('यजमान:', 'User:')} <strong className="text-yellow-300">{activeAstroContext.name}</strong> ({activeAstroContext.dob})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/50 text-amber-100 font-semibold">
              🔱 {tr('लग्न:', 'Lagna:')} <strong className="text-yellow-300">{activeAstroContext.lagna}</strong> ({activeAstroContext.lagnaLord})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950/90 border border-indigo-400/50 text-indigo-200 font-semibold">
              🌙 {tr('राशि:', 'Rashi:')} <strong className="text-yellow-300">{activeAstroContext.rashi}</strong> ({activeAstroContext.nakshatra})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold">
              ⏳ {tr('महादशा:', 'Mahadasha:')} {activeAstroContext.dashaLabel}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-950/90 border border-purple-500/40 text-purple-200 font-semibold">
              💎 {tr('शुभ रत्न:', 'Ratna:')} {activeAstroContext.ratna}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-teal-950/90 border border-teal-500/40 text-teal-200 font-semibold">
              📿 {tr('रुद्राक्ष:', 'Rudraksha:')} {activeAstroContext.rudraksha}
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Past Chat History Drawer inside Chat */}
      {showHistoryDrawer && (
        <div className="bg-slate-950/95 border-b border-amber-700/50 p-3 sm:p-4 max-h-56 overflow-y-auto space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {tr('आपकी चैटबॉट प्रश्नोत्तरी हिस्ट्री', 'Your Saved Q&A Chat History', 'Aapki Saved Chat History')}{' '}
                {currentUser ? `(+91 ${currentUser.phone})` : tr('(गेस्ट सेशन)', '(Guest Session)', '(Guest Session)')}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('history')}
                className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
              >
                {tr('मेरी सम्पूर्ण हिस्ट्री टैब खोलें →', 'Open Full History Tab →', 'Meri Sampoorna History Kholें →')}
              </button>
              {savedConversationCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> {tr('साफ़ करें', 'Clear', 'Saaf Karein')}
                </button>
              )}
            </div>
          </div>

          {savedConversationCount === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              {tr(
                'अभी कोई पुराना संवाद नहीं है। नीचे कोई भी प्रश्न पूछें, वह आपके मोबाइल नंबर के इतिहास में सुरक्षित हो जाएगा।',
                'No past conversation yet. Ask any question below and it will be saved in your history.',
                'Abhi koi purana samvad nahi hai. Niche koi bhi prashna puchein, vah aapki history mein save ho jayega.'
              )}
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
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4 bg-radial-gradient"
      >
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
                <UserAvatar currentUser={currentUser} size="sm" fallbackName={currentUser?.name || 'आप'} />
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
                  <div className="text-[11px] font-bold text-amber-400 mb-1.5 flex items-center justify-between gap-2">
                    <span>{tr('पं. शशांक शर्मा', 'Pt. Shashank Sharma', 'Pt. Shashank Sharma')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const speechId = `chat-msg-${msg.id}`;
                        if (activeSpeechId !== speechId) {
                          vedicAudio.playTempleBell(0.45);
                        }
                        vedicAudio.toggleSpeakText(msg.text, speechId);
                      }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all ${
                        activeSpeechId === `chat-msg-${msg.id}`
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40'
                      }`}
                    >
                      {activeSpeechId === `chat-msg-${msg.id}` ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{tr('उत्तर रोकें', 'Stop Audio', 'Audio Rokein')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-yellow-400" />
                          <span>{tr('उत्तर सुनें', 'Listen Reply', 'Uttar Sunein')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-line">
                  {isUser ? msg.text : renderFormattedVedicText(msg.text)}
                </div>

                {/* Live Web Search Grounding Citations (if retrieved by Acharya AI) */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-800/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300/90">
                      <Globe className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span>
                        {tr(
                          'लाइव पंचांग एवं ज्योतिष संदर्भ स्रोत (Web Grounded):',
                          'Live Astrological & Panchang Web Sources:'
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/70 hover:bg-amber-900/70 border border-amber-600/40 text-[10px] text-amber-200 hover:text-yellow-300 transition-colors max-w-[230px]"
                          title={src.title}
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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
              <span className="italic">
                {tr(
                  'पण्डित शशांक शर्मा जी शास्त्र सम्मत विचार कर रहे हैं...',
                  'Acharya Pandit Shashank Sharma is consulting Vedic Shastras...',
                  'Pandit Shashank Sharma Ji shastra sammat vichar kar rahe hain...'
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-amber-900/30 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-amber-400/80 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />{' '}
            {tr('त्वरित प्रश्न:', 'Quick Questions:', 'Twarit Prashna:')}
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => sendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-900/40 text-amber-200/90 border border-amber-900/40 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar with Voice Microphone */}
      <div className="p-3 sm:p-3.5 bg-slate-950 border-t border-amber-900/50 space-y-2">
        {speechError && (
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-yellow-300 text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Voice Microphone (Speech Recognition) Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={toggleListening}
            className={`p-2.5 sm:p-3 rounded-xl border font-bold transition-all cursor-pointer flex-shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-300 animate-pulse shadow-lg shadow-rose-600/40'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 hover:border-amber-400'
            }`}
            title={
              isListening
                ? tr('माइक रोकें (सुन रहे हैं...)', 'Stop Mic (Listening...)', 'Mic Rokein')
                : tr('बोलकर प्रश्न पूछें (Voice Mic)', 'Speak Your Question (Voice Mic)', 'Bolkar Puchein')
            }
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 animate-bounce" />
                <span className="text-[11px] font-extrabold hidden xs:inline">सुन रहे हैं...</span>
              </>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? tr(
                    'आचार्य जी विचार कर रहे हैं, कृपया प्रतीक्षा करें...',
                    'Acharya Ji is analyzing according to Vedic Shastras...',
                    'Acharya Ji vichar kar rahe hain, kripya pratiksha karein...'
                  )
                : isListening
                ? tr('बोलिए, पण्डित जी सुन रहे हैं...', 'Listening... please speak your question', 'Boliye, sun rahe hain...')
                : tr(
                    'पण्डित शशांक शर्मा जी से पूछें या माइक दबाकर बोलें...',
                    'Ask Acharya Pandit Shashank Sharma or click Mic to speak...',
                    'Pandit Ji se puchein ya Mic dabakar bolein...'
                  )
            }
            className={`flex-1 bg-slate-900 border rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none transition-colors ${
              isLoading
                ? 'border-amber-800/40 bg-slate-900/60 text-amber-200/60 cursor-wait'
                : isListening
                ? 'border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/50'
                : 'border-amber-900/60 focus:border-amber-500'
            }`}
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-600/30 flex-shrink-0 flex items-center justify-center min-w-[42px]"
            title={
              isLoading
                ? tr('विचार चल रहा है...', 'Analyzing query...', 'Vichar chal raha hai...')
                : tr('संदेश भेजें', 'Send Message', 'Sandesh Bhejein')
            }
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ShashankSharmaChat: React.FC<ShashankSharmaChatProps> = (props) => {
  return (
    <ChatErrorBoundary>
      <ShashankSharmaChatInner {...props} />
    </ChatErrorBoundary>
  );
};

