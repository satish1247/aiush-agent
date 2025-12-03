import React from 'react';

interface VoicePanelProps {
  isListening: boolean;
  onToggleListening: () => void;
}

const VoicePanel: React.FC<VoicePanelProps> = ({ isListening, onToggleListening }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 z-0"></div>
      
      <div className="z-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">Voice Assist</h2>
        <p className="text-gray-500 mb-8 text-sm">Tap to speak securely</p>

        <button
          onClick={onToggleListening}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            transition-all duration-300 ease-in-out group
            ${isListening 
              ? 'bg-gradient-to-r from-red-400 to-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse-ring' 
              : 'bg-white shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:scale-105'
            }
          `}
        >
          {/* Inner Circle */}
          <div className={`
            w-28 h-28 rounded-full flex items-center justify-center transition-all
            ${isListening ? 'bg-white' : 'bg-gradient-to-br from-[#45C9FF] to-[#C9A7FF]'}
          `}>
            {isListening ? (
              <div className="flex gap-1 h-8 items-center">
                <div className="w-1.5 h-8 bg-rose-500 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                <div className="w-1.5 h-6 bg-rose-500 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                <div className="w-1.5 h-8 bg-rose-500 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                <div className="w-1.5 h-6 bg-rose-500 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
        </button>

        <p className={`mt-8 font-medium transition-colors duration-300 ${isListening ? 'text-rose-500' : 'text-gray-400'}`}>
          {isListening ? 'Listening...' : 'Ready to help'}
        </p>
      </div>
    </div>
  );
};

export default VoicePanel;