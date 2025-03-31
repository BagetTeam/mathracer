"use client";

import GameScreen from "@/components/GameScreen";
import JoinGameScreen from "@/components/JoinGameScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import ResultsScreen from "@/components/ResultsScreen";
import { GameMode, GameState, Player } from "@/types/game";
import { use, useReducer, useState } from "react";
import { ConnectionContext } from "./connectionContext";

type Props = {
  gameId: string;
  isJoining: boolean;
};

export default function Wrapper({ gameId, isJoining }: Props) {
  const currentPlayer: Player = {
    id: 1,
    name: "Player",
    score: 0,
    isHost: false,
    progress: 0,
  };

  const [screen, setScreen] = useState<GameState>(isJoining ? "lobby" : "menu");
  const [gameOps, dispatch] = useReducer(gameOpsreducer, {
    gameId: gameId,
    currentPlayer,
    players: [],
    gameMode: { type: "time", seconds: 10 },
  });

  const connection = use(ConnectionContext)!;

  return (
    <main className="flex h-full w-full items-center justify-center">
      {(() => {
        switch (screen) {
          case "menu":
            return (
              <MainMenu
                onSelectMode={(gameMode) =>
                  dispatch({ type: "setGameMode", gameMode })
                }
                onJoinGame={() => setScreen("joining")}
                onCreateGame={() => {
                  dispatch({ type: "createGame" });
                  setScreen("lobby");
                }}
                onStartSinglePlayer={() => {
                  setScreen("playing");
                }}
              />
            );
          case "joining":
            return (
              <JoinGameScreen
                onJoinGame={() => {}}
                onBackToMenu={() => setScreen("menu")}
              />
            );
          case "lobby":
            return (
              <LobbyScreen
                dispatch={dispatch}
                onBackToMenu={() => {
                  dispatch({ type: "exitLobby" });
                  setScreen("menu");

                  connection
                    .send(
                      "RemovePlayer",
                      gameOps.gameId,
                      gameOps.currentPlayer.id,
                    )
                    .catch();
                }}
                onStartGame={() => setScreen("playing")}
                players={gameOps.players}
                gameId={gameId}
                currentPlayer={gameOps.currentPlayer}
                selectedMode={gameOps.gameMode}
              />
            );
          case "playing":
            return (
              <GameScreen
                {...gameOps}
                onGameEnd={() => setScreen("results")}
                equations={[]}
              />
            );
          case "results":
            return (
              <ResultsScreen
                players={gameOps.players}
                gameMode={gameOps.gameMode}
                onBackToMenu={() => setScreen("menu")}
                onPlayAgain={() => setScreen("playing")}
              />
            );
        }
      })()}
    </main>
  );
}

export type GameOps = {
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameId: string;
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
    };

function gameOpsreducer(state: GameOps, action: GameOpsAction): GameOps {
  switch (action.type) {
    case "setCurrentPlayer":
      return {
        ...state,
        currentPlayer: action.player,
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
  }
}
