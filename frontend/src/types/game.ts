export interface Player {
  id: number;
  name: string;
  score: number;
  isHost: boolean;
  progress: number;
}

export interface Equation {
  id: string;
  equation: string;
  answer: number;
}

export interface GameMode {
  type: string;
  count: number;
}
// export type GameMode =
//   | { type: "equations"; count: number }
//   | { type: "time"; seconds: number };

export type GameState = "menu" | "joining" | "lobby" | "playing" | "results";

export interface Game {
  id: string;
  gameMode: GameMode;
  questions: Equation;
}
