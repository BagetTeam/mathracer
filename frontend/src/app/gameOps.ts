import { Equation, GameMode, Player } from "@/types/game";

export type GameOps = {
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameId: string;
  equations: Equation[];
};

export type GameOpsAction =
  | {
      type: "addPlayer";
      player: Player;
    }
  | {
      type: "setGameMode";
      gameMode: GameMode;
    }
  | {
      type: "createLobby";
      host: Player;
    }
  | {
      type: "exitLobby";
    }
  | {
      type: "nameChange";
      name: string;
    }
  | {
      type: "setPlayers";
      players: Player[];
    }
  | {
      type: "setCurrentPlayer";
      player: Player;
    }
  | {
      type: "setEquations";
      equations: Equation[];
    }
  | {
      type: "setScore";
      playerId: number;
      score: number;
    }
  | {
      type: "isComplete";
      playerId: number;
      hasComplete: boolean;
    }
  | {
      type: "setGameId";
      gameId: string;
    };

export function gameOpsreducer(state: GameOps, action: GameOpsAction): GameOps {
  switch (action.type) {
    case "setCurrentPlayer":
      return {
        ...state,
        currentPlayer: action.player,
        players: state.players.map((p) =>
          p.id === state.currentPlayer.id ? action.player : p,
        ),
      };
    case "addPlayer":
      return {
        ...state,
        players: [...state.players, action.player],
      };
    case "setPlayers":
      return {
        ...state,
        players: action.players,
        currentPlayer:
          action.players.find((p) => p.id === state.currentPlayer.id) ??
          state.currentPlayer,
      };
    case "setGameMode":
      return {
        ...state,
        gameMode: action.gameMode,
      };
    case "createLobby":
      return {
        ...state,
        currentPlayer: action.host,
      };
    case "exitLobby":
      return {
        ...state,
        gameMode: { type: "time", count: 10 },
        equations: [],
        players: [],
        gameId: crypto.randomUUID().toString(),
        currentPlayer: {
          ...state.currentPlayer,
          id: 1,
          isHost: false,
          hasComplete: false,
        },
      };

    case "nameChange":
      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          name: action.name,
        },
        players: state.players.map((p) =>
          p.id === state.currentPlayer.id
            ? {
                ...state.currentPlayer,
                name: action.name,
              }
            : p,
        ),
      };

    case "setEquations":
      return {
        ...state,
        equations: action.equations,
      };

    case "setScore":
      return {
        ...state,
        currentPlayer:
          action.playerId === state.currentPlayer.id
            ? {
                ...state.currentPlayer,
                score: action.score,
              }
            : state.currentPlayer,
        players: state.players.map((p) =>
          p.id === action.playerId
            ? {
                ...p,
                score: action.score,
              }
            : p,
        ),
      };

    case "isComplete":
      return {
        ...state,
        currentPlayer:
          action.playerId === state.currentPlayer.id
            ? {
                ...state.currentPlayer,
                hasComplete: action.hasComplete,
              }
            : state.currentPlayer,
        players: state.players.map((p) =>
          p.id === action.playerId
            ? {
                ...p,
                hasComplete: action.hasComplete,
              }
            : p,
        ),
      };

    case "setGameId":
      return {
        ...state,
        gameId: action.gameId,
      };
  }
}
