export enum Tone {
  TEACHING = 'teaching',
  FRIENDLY = 'friendly',
  SERIOUS = 'serious',
  STORYTELLING = 'storytelling'
}

export enum Lang {
  EN = 'en',
  HI = 'hi',
  TE = 'te'
}

export interface ActionData {
  name: 'set_reminder' | 'add_todo' | 'explain_medicine' | string;
  time?: string;
  message?: string;
  item?: string;
}

export interface SearchResult {
  title: string;
  uri: string;
}

export interface AiushResponse {
  reply: string;
  lang: Lang;
  tone: Tone;
  action: ActionData | null;
  medical_safety: string;
  searchResults?: SearchResult[];
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string; // base64
  timestamp: number;
  metadata?: AiushResponse; // Only for AI messages
}

export interface ChatState {
  messages: Message[];
  isThinking: boolean;
  isListening: boolean;
  error: string | null;
}