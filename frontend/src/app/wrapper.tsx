"use client";

import GameScreen from "@/components/GameScreen";
import JoinGameScreen from "@/components/JoinGameScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import ResultsScreen from "@/components/ResultsScreen";
import { GameState, Player } from "@/types/game";
import { use, useEffect, useReducer, useState } from "react";
import { ConnectionContext } from "./connectionContext";
import { gameOpsreducer } from "./gameOps";
import { withConnection } from "@/utils/connection";

type Props = {
  gameId: string;
  isJoining: boolean;
};

export default function Wrapper({ gameId, isJoining }: Props) {
  const initialPlayer: Player = {
    id: 1,
    name: "Player",
    score: 0,
    isHost: false,
    progress: 0,
    hasComplete: false,
  };

  const [screen, setScreen] = useState<GameState>(isJoining ? "lobby" : "menu");
  const [gameOps, dispatch] = useReducer(gameOpsreducer, {
    gameId,
    currentPlayer: initialPlayer,
    players: [],
    gameMode: { type: "time", count: 10 },
    equations: [],
  });

  const connection = use(ConnectionContext)!;

  useEffect(() => {
    connection.on("StartCountdown", (req: string) => {
      dispatch({ type: "setEquations", equations: JSON.parse(req) });
      setScreen("playing");
    });

    return () => {
      connection.off("StartCountdown");
    };
  }, []);

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
                onStartGame={() => {
                  connection
                    .send("ClearStats", gameOps.gameId)
                    .then(() => {
                      withConnection(async (c) => {
                        await c
                          .send(
                            "StartGame",
                            gameId,
                            JSON.stringify(gameOps.gameMode),
                          )
                          .catch();
                      }).catch();
                    })
                    .catch();
                }}
                players={gameOps.players}
                gameId={gameOps.gameId}
                currentPlayer={gameOps.currentPlayer}
                selectedMode={gameOps.gameMode}
              />
            );
          case "playing":
            return (
              <GameScreen
                onGameEnd={() => {
                  setScreen("results");
                }}
                gameOps={gameOps}
                dispatch={dispatch}
              />
            );
          case "results":
            return (
              <ResultsScreen
                currentPlayer={gameOps.currentPlayer}
                players={gameOps.players}
                gameMode={gameOps.gameMode}
                onBackToMenu={() => setScreen("menu")}
                onPlayAgain={() => setScreen("lobby")}
                dispatch={dispatch}
              />
            );
        }
      })()}
    </main>
  );
}
