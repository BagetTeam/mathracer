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
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    connection.on("StartCountdown", (req: string) => {
      dispatch({ type: "setEquations", equations: JSON.parse(req) });
      setScreen("playing");
    });

    connection.on("SyncPlayers", (players: string) => {
      dispatch({
        type: "setPlayers",
        players: JSON.parse(players),
      });
    });

    return () => {
      connection.off("StartCountdown");
      connection.off("SyncPlayers");
    };
  }, []);

  async function play() {
    console.log("gameOps.gameId:", gameOps.gameId);

    await connection
      .send("ClearStats", gameOps.gameId)
      .then(() => {
        withConnection(async (c) => {
          await c
            .send("StartGame", gameId, JSON.stringify(gameOps.gameMode))
            .catch();
        }).catch();
      })
      .catch();

    setScreen("playing");
  }

  async function exitLobby() {
    console.log("gameOps.gameId:", gameOps.gameId);

    await connection
      .send("RemovePlayer", gameOps.gameId, gameOps.currentPlayer.id)
      .then(() => dispatch({ type: "exitLobby" }))
      .catch();
    router.push("/");

    dispatch({ type: "exitLobby" });
    router.push("/");

    setScreen("menu");
  }

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
                onStartSinglePlayer={async () => {
                  await connection
                    .send(
                      "JoinLobby",
                      gameOps.gameId,
                      gameOps.currentPlayer.name,
                      gameOps.gameMode.type,
                      gameOps.gameMode.count,
                    )
                    .then(async () => await play())
                    .catch();
                }}
              />
            );
          case "joining":
            return (
              <JoinGameScreen
                onJoinGame={(gameId) => {
                  dispatch({ type: "setGameId", gameId });
                  setScreen("lobby");
                }}
                onBackToMenu={() => setScreen("menu")}
              />
            );
          case "lobby":
            return (
              <LobbyScreen
                dispatch={dispatch}
                onBackToMenu={exitLobby}
                onStartGame={play}
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
                onBackToMenu={exitLobby}
                onPlayAgain={() => {
                  if (gameOps.players.length == 1) {
                    play();
                  } else {
                    setScreen("lobby");
                  }
                }}
                dispatch={dispatch}
              />
            );
        }
      })()}
    </main>
  );
}
