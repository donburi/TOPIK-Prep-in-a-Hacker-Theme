export type GameState = 'INIT' | 'PLAYING' | 'LOADING' | 'GAMEOVER' | 'VICTORY';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface UserStats {
  hp: number;
  maxHp: number;
  credits: number;
  currentLevel: number;
  targetLevel: number;
  difficulty: Difficulty;
  missionProgress: number; // Current correct answers in this mission
  missionGoal: number;     // Correct answers needed to finish mission
  missionsCleared: number; // Total missions cleared in this sector
  unlockedSkills: string[]; // IDs of unlocked skills
  proficiency: Record<string, number>; // Focus/Domain -> Count of correct answers
  currentMission?: MissionObjective;
  streak?: number;
  lastActiveDate?: string; // YYYY-MM-DD
}

export interface MissionObjective {
  id: string;
  description: string;
  type: 'GENERAL' | 'FOCUS' | 'DOMAIN';
  target?: string;
  progress: number;
  goal: number;
  reward: number;
}

export type SkillCategory = 'COMBAT' | 'UTILITY' | 'ECONOMY';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: SkillCategory;
  dependsOn?: string;
  effect: {
    type: 'MAX_HP' | 'CREDIT_BOOST' | 'HINT_PENALTY_REDUCTION' | 'HEAL_ON_MISSION';
    value: number;
  };
}

export interface Card {
  id: number;
  text: string;
  classification?: string;
  type?: string;
  translation: string;
}

export interface Encounter {
  id: string;
  prompt: string;
  translation: string;
  type: string;
  domain?: string;
  level: number;
  cards: Card[];
  correct_answer_id: number;
  metadata?: {
    focus?: string;
    [key: string]: any;
  };
}

export interface TerminalLog {
  id: string;
  text: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM';
  timestamp: string;
  metadata?: {
    isAttempt?: boolean;
    selected?: string;
    expected?: string;
    earned?: number;
  };
}
