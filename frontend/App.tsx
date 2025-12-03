import React, { useState, useRef, useEffect, useCallback } from 'react';

import { apiService } from './services/apiService';
import { Message, AiushResponse, Lang, Tone, SearchResult } from './types';

import { useTTS } from './hooks/useTTS';
import { useAudioRecorder } from './hooks/useAudioRecorder';

import { subscribeToAuthChanges, logOut } from './services/authService';
import { subscribeToHistory } from './services/firestoreService';

import ChatMessage from './components/ChatMessage';
import VoicePanel from './components/VoicePanel';
import InfoPanel from './components/InfoPanel';
import AuthModal from './components/AuthModal';

// ✅ FIXED — ONLY ONE VALID IMPORT
import { auth } from "./firebaseConfig";


const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [latestSearchResults, setLatestSearchResults] = useState<SearchResult[] | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { speak, isPlaying } = useTTS();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  // 1. Auth Listener with Loading State
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      setIsLoadingAuth(false);
      
      // DEBUG: Verify Token on Login
      if (u) {
        u.getIdToken().then(token => {
           console.log("✅ Authenticated. Token ready.");
        }).catch(err => console.error("❌ Token Error:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. History Listener
  useEffect(() => {
    if (!user?.uid) {
      setMessages([]);
      return;
    }
    const unsubscribe = subscribeToHistory(user.uid, (historyMessages) => {
      if (historyMessages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'ai',
          content: "Hi! I'm Aiush, your health assistant. I can chat in multiple languages and analyze prescriptions safely.",
          timestamp: Date.now(),
          metadata: {
            reply: "Hi there!",
            lang: Lang.EN,
            tone: Tone.FRIENDLY,
            action: null,
            medical_safety: "General info only."
          }
        }]);
      } else {
        setMessages(historyMessages);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clear errors
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => setConnectionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  // --- HANDLERS ---
  const handleToggleListening = async () => {
    if (isRecording) {
      setIsThinking(true);
      setConnectionError(null);
      try {
        const audioBlob = await stopRecording();
        const transcript = await apiService.transcribeAudio(audioBlob);
        if (transcript) handleSendMessage(transcript);
      } catch (err: any) {
        console.error("Voice Error:", err);
        setConnectionError("Voice processing failed. Please try again.");
        setIsThinking(false);
      }
    } else {
      await startRecording();
    }
  };

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    const isOCR = !!selectedImage && !overrideText;
    const isText = !!textToSend.trim();

    if ((!isText && !isOCR) || isThinking || !user) return;

    // Optimistic UI Update (User Message)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: isOCR ? "[Analyzing Image...]" : textToSend,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    // Note: We do NOT append to messages here manually because Firestore
    // subscription will handle it once the backend saves the history.
    // However, for immediate feedback, we can optimistically set it if desired,
    // but the backend logic is robust enough to rely on Firestore sync.
    
    setInputText('');
    setIsThinking(true);
    setConnectionError(null);
    setLatestSearchResults(undefined); 

    try {
      let response: AiushResponse;

      if (isOCR && selectedImage) {
        response = await apiService.analyzeImage(selectedImage);
      } else {
        response = await apiService.sendMessage(textToSend, messages);
      }
      
      setLatestSearchResults(response.searchResults);
      speak(response.reply, response.lang, response.tone);

    } catch (error: any) {
      console.error(error);
      setConnectionError(error.message || "Connection failed.");
    } finally {
      setIsThinking(false);
      setSelectedImage(null);
    }
  }, [inputText, selectedImage, isThinking, messages, speak, user, isRecording, stopRecording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingAuth) {
    return <div className="h-screen w-screen flex items-center justify-center bg-genz-gradient text-white">Loading Aiush...</div>;
  }

  if (!user) {
    return <AuthModal onAuthSuccess={() => {}} />;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-genz-gradient p-4 md:p-8">
      
      {/* Test Script Trigger (Hidden) */}
      <div className="hidden">
        <button onClick={() => {
           auth.currentUser?.getIdToken().then(t => console.log("Current Token:", t));
        }}>Log Token</button>
      </div>

      {connectionError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-sm font-semibold">{connectionError}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl h-full md:h-[90vh] glass-panel rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden relative shadow-2xl">
        
        {/* TOP BAR */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between z-50 pointer-events-none">
           <button 
             className="pointer-events-auto px-4 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors shadow-sm text-xs font-bold text-gray-600 gap-2"
             onClick={logOut}
           >
             LOGOUT
           </button>
           <div className="flex gap-3 pointer-events-auto">
             <div className="h-10 px-4 rounded-full bg-gradient-to-tr from-[#45C9FF] to-[#C9A7FF] flex items-center justify-center text-white font-bold text-sm shadow-md">
               {user.email?.split('@')[0]}
             </div>
           </div>
        </div>

        {/* LEFT PANEL */}
        <div className="w-full md:w-1/4 h-[30vh] md:h-full border-b md:border-b-0 md:border-r border-white/40 bg-white/10 relative">
          <VoicePanel isListening={isRecording} onToggleListening={handleToggleListening} />
        </div>

        {/* MIDDLE PANEL */}
        <div className="w-full md:w-2/4 h-full flex flex-col relative z-10">
          <div className="flex-1 overflow-y-auto p-6 pt-20 scrollbar-hide">
             {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isThinking && (
              <div className="flex items-center space-x-1 pl-4 mb-8">
                <div className="w-2 h-2 bg-[#45C9FF] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#C9A7FF] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-2 bg-[#45C9FF] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6">
            <div className="glass rounded-[2rem] p-2 flex items-center shadow-lg transition-shadow focus-within:shadow-[0_0_20px_rgba(69,201,255,0.3)]">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aiush..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 px-4 py-2 placeholder-gray-400 font-medium"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !selectedImage}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${(inputText.trim() || selectedImage) 
                    ? 'bg-[#1e293b] text-white hover:bg-black transform hover:scale-105' 
                    : 'bg-gray-100 text-gray-400'
                  }
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden md:flex w-1/4 h-full border-l border-white/40 bg-white/20 flex-col pt-20">
          <InfoPanel 
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
            onClearImage={() => setSelectedImage(null)}
            isThinking={isThinking}
            searchResults={latestSearchResults}
          />
        </div>

      </div>
    </div>
  );
};

export default App;
