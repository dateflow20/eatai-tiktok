
export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Not Specified';

export type Relationship = 'Friend' | 'Crush' | 'Partner' | 'Boss' | 'Colleague' | 'Parent' | 'Sibling' | 'Acquaintance' | 'Stranger';

export type Vibe = 
  | 'Flirty' 
  | 'Professional' 
  | 'Sarcastic' 
  | 'Empathetic' 
  | 'Direct' 
  | 'Playful' 
  | 'Mysterious' 
  | 'Supportive' 
  | 'Witty' 
  | 'Formal'
  | 'Lowkey'
  | 'Hype'
  | 'Nonchalant'
  | 'Unbothered'
  | 'Chaotic'
  | 'Risky'
  | 'Savage'
  | 'Wholesome'
  | 'Dramatic'
  | 'Chill'
  | 'Romantic'
  | 'Deep'
  | 'Seductive'
  | 'Passive-Aggressive'
  | 'Curious'
  | 'Humble'
  | 'Bossy';

export interface UserSettings {
  userName: string;
  agentName: string;
  userGender: Gender;
  targetGender: Gender;
  relationship: Relationship;
  currentVibe: Vibe | string;
  situation: string; 
  goal: string; 
  confidence: number;
  humor: number;
  humanity: number;
  isProfileSetup: boolean; 
}

export interface ChatMessage {
  sender: 'me' | 'them';
  text: string;
  timestamp: number;
}

export interface MessageContext {
  thread: ChatMessage[];
  audioBase64?: string;
  imageBase64?: string;
  videoBase64?: string;
  type: 'chat' | 'status';
  initialStatusContext?: string;
}

export interface Suggestion {
  id: string;
  text: string;
  vibe: string;
  strategy: string;
  phase: 'Rapport' | 'Escalation' | 'Pivot' | 'Closer' | 'Checkpoint';
  isMeta?: boolean;
  rating?: number;
}

export interface SocialReview {
  syncScore: number;
  mood: string;
  highlights: string[];
  strategicAdvice: string;
  relationshipStatus: string;
}

export interface Conversation {
  id: string;
  timestamp: number;
  settings: UserSettings;
  context: MessageContext;
  suggestions: Suggestion[];
  summary?: string;
  review?: SocialReview;
}
