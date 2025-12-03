import React from 'react';

interface VoiceIndicatorProps {
  isListening: boolean;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="flex items-center space-x-1 h-6">
      <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1 h-5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <span className="text-xs text-red-500 font-medium ml-2">Listening...</span>
    </div>
  );
};

export default VoiceIndicator;