import React from 'react';
import { Message, Tone } from '../types';
import ActionCard from './ActionCard';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Base styling variables
  let bubbleClass = "bg-white border-gray-100 text-gray-700";
  let borderClass = "";
  let icon = "🤖";
  
  if (isUser) {
    bubbleClass = "bg-[#45C9FF] text-white shadow-[0_4px_15px_rgba(69,201,255,0.4)] border-transparent";
    icon = "👤";
  } else if (message.metadata) {
    switch (message.metadata.tone) {
      case Tone.SERIOUS:
        bubbleClass = "bg-slate-50 border-slate-200 text-slate-800";
        borderClass = "border-l-4 border-l-slate-400";
        break;
      case Tone.FRIENDLY:
        bubbleClass = "bg-teal-50 border-teal-100 text-teal-900";
        borderClass = "border-l-4 border-l-teal-300";
        break;
      case Tone.TEACHING:
        bubbleClass = "bg-indigo-50 border-indigo-100 text-indigo-900";
        borderClass = "border-l-4 border-l-indigo-300";
        break;
      case Tone.STORYTELLING:
        bubbleClass = "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-900";
        borderClass = "border-l-4 border-l-fuchsia-300";
        break;
    }
  }

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-float`} style={{ animationDuration: '6s' }}>
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 opacity-70 px-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {isUser ? 'You' : `Aiush • ${message.metadata?.tone || 'AI'}`}
          </span>
          <span className="text-[10px]">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
        </div>

        {/* Bubble */}
        <div 
          className={`
            p-5 rounded-3xl relative shadow-sm border
            ${bubbleClass}
            ${!isUser ? `${borderClass} rounded-tl-sm` : 'rounded-tr-sm'}
          `}
        >
          {message.image && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/30 shadow-sm">
              <img 
                src={message.image} 
                alt="Uploaded context" 
                className="w-full h-auto" 
                style={{ maxHeight: '250px' }}
              />
            </div>
          )}
          
          <p className="whitespace-pre-wrap leading-7 text-[15px]">
            {message.content}
          </p>

          {/* Action Card for AI responses */}
          {!isUser && message.metadata?.action && (
            <div className="mt-4 pt-2 border-t border-black/5">
              <ActionCard action={message.metadata.action} />
            </div>
          )}
        </div>
        
        {/* Medical Disclaimer */}
        {!isUser && message.metadata?.medical_safety && (
          <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full inline-flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
             <span className="text-[10px] text-amber-700 font-medium">{message.metadata.medical_safety}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;