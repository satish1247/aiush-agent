import { useCallback, useState } from 'react';
import { apiService } from '../services/apiService';
import { Lang, Tone } from '../types';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, lang: Lang, tone: Tone) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      setIsPlaying(true);
      
      // Call Backend to get Murf Audio URL
      const audioUrl = await apiService.generateSpeech(text);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);

    } catch (error) {
      console.error("TTS Error:", error);
      // Fallback to browser TTS if backend fails
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  return { speak, stop, isPlaying };
};
