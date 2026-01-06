
import { Vibe, Gender, Relationship, UserSettings } from './types';

export interface VibeOption {
  name: Vibe | string;
  icon: string;
}

export interface GoalTemplate {
  name: string;
  description: string;
}

export interface AgentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const AGENT_OPTIONS: AgentOption[] = [
  { id: 'ghost', name: 'The Ghost', description: 'Smooth, mysterious, and always leaves them wanting more.', icon: '👻' },
  { id: 'scholar', name: 'The Scholar', description: 'Intellectual, witty, and master of deep conversations.', icon: '📚' },
  { id: 'hype', name: 'The Hype Man', description: 'Maximum energy, charismatic, and bold moves only.', icon: '🔥' },
  { id: 'shadow', name: 'The Shadow', description: 'Silent but deadly precision in reading social cues.', icon: '🌑' },
];

export const VIBE_OPTIONS: VibeOption[] = [
  { name: 'Romantic', icon: '❤️' },
  { name: 'Flirty', icon: '🫦' },
  { name: 'Chill', icon: '☕' },
  { name: 'Savage', icon: '😈' },
  { name: 'Professional', icon: '💼' },
  { name: 'Sarcastic', icon: '🙄' },
  { name: 'Empathetic', icon: '🫂' },
  { name: 'Direct', icon: '🎯' },
  { name: 'Playful', icon: '🎡' },
  { name: 'Mysterious', icon: '🎭' },
  { name: 'Supportive', icon: '🤝' },
  { name: 'Witty', icon: '💡' },
  { name: 'Formal', icon: '🤵' },
  { name: 'Lowkey', icon: '🤫' },
  { name: 'Hype', icon: '⚡' },
  { name: 'Nonchalant', icon: '🧊' },
  { name: 'Unbothered', icon: '🧘' },
  { name: 'Chaotic', icon: '🌪️' },
  { name: 'Risky', icon: '🎲' },
  { name: 'Wholesome', icon: '🌸' },
  { name: 'Dramatic', icon: '🎭' },
  { name: 'Deep', icon: '🌊' },
  { name: 'Seductive', icon: '🔥' },
  { name: 'Passive-Aggressive', icon: '🙃' },
  { name: 'Curious', icon: '🧐' },
  { name: 'Humble', icon: '🙏' },
  { name: 'Bossy', icon: '👑' },
];

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { name: 'Break the ice', description: 'Start a fresh conversation with good energy' },
  { name: 'Get a date', description: 'Move the conversation towards meeting in person' },
  { name: 'Resolve conflict', description: 'Address a misunderstanding calmly' },
  { name: 'Make them laugh', description: 'Keep things light and entertaining' },
  { name: 'Stay friendly', description: 'Keep a healthy distance while being polite' },
  { name: 'Deep dive', description: 'Get to know them on a more personal level' },
];

export const GENDERS: Gender[] = ['Male', 'Female', 'Non-binary', 'Not Specified'];

export const RELATIONSHIPS: Relationship[] = [
  'Friend', 'Crush', 'Partner', 'Boss', 'Colleague', 'Parent', 'Sibling', 'Acquaintance', 'Stranger'
];

export const INITIAL_SETTINGS: UserSettings = {
  userName: '',
  agentName: 'The Ghost',
  userGender: 'Not Specified',
  targetGender: 'Not Specified',
  relationship: 'Acquaintance',
  currentVibe: 'Chill',
  situation: '',
  goal: 'Keep the conversation flowing naturally',
  confidence: 70,
  humor: 50,
  humanity: 90,
  isProfileSetup: false,
};
