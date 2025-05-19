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
    isPublic: false,
    publicLobbies: [],
  });

  const connection = use(ConnectionContext)!;
  const router = useRouter();

  // useEffect(() => {
  //   console.log("CONNECTING AND SYNCING");
  //   connection.on("StartCountdown", (req: string) => {
  //     console.log("SETTING EQUATIONS???");
  //     dispatch({ type: "setEquations", equations: JSON.parse(req) });
  //     setScreen("playing");
  //   });

  //   connection.on("SyncPlayers", (players: string) => {
  //     console.log("SYNCCC");
  //     dispatch({
  //       type: "setPlayers",
  //       players: JSON.parse(players),
  //     });
  //   });

  //   return () => {
  //     console.log("BYEBYE");
  //     connection.off("StartCountdown");
  //     connection.off("SyncPlayers");
  //   };
  // }, []);
  function setupSignalREventHandlers() {
    connection.on("StartCountdown", (req: string) => {
      console.log("SETTING EQUATIONS???");
      dispatch({ type: "setEquations", equations: JSON.parse(req) });
      setScreen("playing");
    });

    connection.on("SyncPlayers", (players: string) => {
      console.log("SYNCCC");
      dispatch({
        type: "setPlayers",
        players: JSON.parse(players),
      });
    });

    connection.on("CountDown", (count) => {
      console.log("Countdown:", count);
    });

    connection.on("GameStart", () => {
      console.log("Game started!");
    });

    connection.on("TimeElapsed", (time) => {
      console.log("Time elapsed:", time);
    });

    connection.on("ChangePublic", (isPublic) => {
      dispatch({
        type: "changePublic",
        isPublic: isPublic,
      });
    });

    connection.on("SyncPublicLobbies", (publicLobbies) => {
      dispatch({
        type: "setPublicLobbies",
        publicLobbies: JSON.parse(publicLobbies),
      });
    });
  }

  useEffect(() => {
    setupSignalREventHandlers();

    return () => {
      // Remove all handlers when component unmounts
      connection.off("StartCountdown");
      connection.off("SyncPlayers");
      connection.off("CountDown");
      connection.off("GameStart");
      connection.off("TimeElapsed");
      connection.off("ChangePublic");
      connection.off("SyncPublicLobbies");
    };
  }, []);

  async function play() {
    console.log("Lets play gameOps.gameId:", gameOps.gameId);

    // if (gameOps.players.length === 0) {
    //   await connection.send(
    //     "JoinLobby",
    //     gameOps.gameId,
    //     gameOps.currentPlayer.name,
    //     gameOps.gameMode.type,
    //     gameOps.gameMode.count,
    //   );
    // }

    await connection
      .send("ClearStats", gameOps.gameId)
      .then(async () => {
        console.log("STARTING GAME LES GOOOO");
        await withConnection(async (c) => {
          await c
            .send("StartGame", gameOps.gameId, JSON.stringify(gameOps.gameMode))
            .catch();
        }).catch();
      })
      .catch();

    setScreen("playing");
  }

  async function exitLobby() {
    console.log("gameOps.gameId:", gameOps.gameId);
    const currentGameId = gameOps.gameId;

    try {
      await connection.send(
        "RemovePlayer",
        currentGameId,
        gameOps.currentPlayer.id,
      );

      dispatch({ type: "exitLobby" });
      router.push("/");
      setScreen("menu");
    } catch (error) {
      console.error("Failed to exit lobby:", error);
      dispatch({ type: "exitLobby" });
      router.push("/");
      setScreen("menu");
    } finally {
      console.log("NEW gameOps.gameId:", gameOps.gameId);
    }
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
                publicLobbies={gameOps.publicLobbies}
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
                isPublic={gameOps.isPublic}
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
