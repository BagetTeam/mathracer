
export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  progress: number;
}

export interface Equation {
  id: string;
  question: string;
  answer: number;
}

export type GameMode = 
  | { type: 'equations'; count: number }
  | { type: 'time'; seconds: number };

export type GameState = 
  | 'menu'
  | 'joining'
  | 'lobby'
  | 'playing'
  | 'results';
