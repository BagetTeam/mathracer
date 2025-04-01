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
      type: "createGame";
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
      };
    case "setGameMode":
      return {
        ...state,
        gameMode: action.gameMode,
      };
    case "createGame":
      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          isHost: true,
        },
      };
    case "exitLobby":
      return {
        ...state,
        players: state.players.map((p) => {
          return {
            ...p,
            isHost: false,
          };
        }),
        currentPlayer: {
          ...state.currentPlayer,
          isHost: false,
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
  }
}
