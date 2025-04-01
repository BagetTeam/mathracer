"use client";

import GameScreen from "@/components/GameScreen";
import JoinGameScreen from "@/components/JoinGameScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import ResultsScreen from "@/components/ResultsScreen";
import { GameMode, GameState, Player, Equation } from "@/types/game";
import { useMemo, useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as signalR from "@microsoft/signalr";

export default function Page() {
  // useEffect(() => {
  //   const connection = new signalR.HubConnectionBuilder()
  //     .withUrl("http://localhost:5103/hub")
  //     .build();
  //   connection.start();

  //   connection.on("messageReceived", (username: string, message: string) => {
  //     console.log(username, message);
  //   });
  // }, []);
  const urlSearchParams = useSearchParams();
  const isJoining = urlSearchParams.get("join") !== null;
  const gameId = useMemo(
    () => urlSearchParams.get("join") ?? crypto.randomUUID().toString(),
    [],
  );

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
    gameMode: { type: "time", count: 100 },
    equations: [],
  });

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

                  const connection = new signalR.HubConnectionBuilder()
                    .withUrl("http://localhost:5103/hub")
                    .build();

                  connection
                    .start()
                    .then(() =>
                      connection.send(
                        "RemovePlayer",
                        gameId,
                        gameOps.currentPlayer.id,
                      ),
                    )
                    .then(() => connection.stop())
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
                dispatch={dispatch}
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

function gameOpsreducer(state: GameOps, action: GameOpsAction): GameOps {
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
      console.log("Setting equations:", action.equations);
      return {
        ...state,
        equations: action.equations,
      };
  }
}
