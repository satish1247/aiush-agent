import React, { useRef } from 'react';
import { SearchResult } from '../types';

interface InfoPanelProps {
  selectedImage: string | null;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  isThinking: boolean;
  searchResults?: SearchResult[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  selectedImage, 
  onImageSelect, 
  onClearImage, 
  isThinking,
  searchResults
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      
      {/* Agent Status Card */}
      <div className="glass p-4 rounded-2xl flex items-center justify-between shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</h3>
          <p className={`text-sm font-semibold ${isThinking ? 'text-[#45C9FF]' : 'text-emerald-500'}`}>
            {isThinking ? 'Processing...' : 'Online'}
          </p>
        </div>
        <div className="relative w-3 h-3">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isThinking ? 'bg-sky-400' : 'bg-emerald-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isThinking ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
        </div>
      </div>

      {/* Image Input Zone */}
      <div className="flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image Analysis</h3>
        {selectedImage ? (
          <div className="relative rounded-2xl overflow-hidden shadow-md group border border-white/40">
            <img src={selectedImage} alt="Analysis Target" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onClearImage} className="text-white bg-red-500/80 p-2 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#C9A7FF] bg-[#fdfcff] rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C9A7FF] mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-400">Drop prescription or click</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        )}
      </div>

      {/* Google Search Results */}
      <div className="flex-1 overflow-y-auto pr-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sources & Info</h3>
        {!searchResults || searchResults.length === 0 ? (
          <div className="text-center py-8 opacity-50">
             <div className="inline-block p-3 rounded-full bg-gray-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <p className="text-xs text-gray-400">No active search sources</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((result, idx) => (
              <a 
                key={idx} 
                href={result.uri} 
                target="_blank" 
                rel="noreferrer"
                className="block p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-[#45C9FF]"
              >
                <div className="flex items-start gap-3">
                   <div className="min-w-[20px] pt-1">
                     <img src={`https://www.google.com/s2/favicons?domain=${result.uri}&sz=32`} alt="icon" className="w-4 h-4 rounded-sm" />
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-sm font-medium text-gray-800 truncate">{result.title}</p>
                     <p className="text-[10px] text-gray-400 truncate mt-0.5">{result.uri}</p>
                   </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;