"use client";

import React, { useState, useEffect, useRef, use, ActionDispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlayerList from "./PlayerList";
import EquationStack from "./EquationStack";
import { GameOps, GameOpsAction } from "@/app/gameOps";
import { Progress } from "./ui/progress";
import { ConnectionContext } from "@/app/connectionContext";

interface Props {
  gameOps: GameOps;
  dispatch: ActionDispatch<[action: GameOpsAction]>;
  onGameEnd: () => void;
}

function GameScreen({ gameOps, dispatch, onGameEnd }: Props) {
  const { gameMode, currentPlayer, players, equations } = gameOps;

  const [countDown, setCountDown] = useState(3);
  const [animation, setAnimation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null!);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const connection = use(ConnectionContext)!;

  const currentEquationIndex = 1;

  useEffect(() => {
    connection.on("CountDown", (count: number) => {
      setCountDown(count);
    });

    connection.on("SyncPlayers", (players: string) => {
      dispatch({
        type: "setPlayers",
        players: JSON.parse(players),
      });
    });

    connection.on("TimeElapsed", (time) => setTimeElapsed(time));

    return () => {
      connection.off("CountDown");
      connection.off("SyncPlayers");
      connection.off("TimeElapsed");
    };
  }, []);

  // Handle time-based game end
  useEffect(() => {
    if (gameMode.type === "time" && timeElapsed === gameMode.count) {
      onGameEnd();
    }
  }, [timeElapsed]);

  useEffect(() => {
    if (countDown == 0) {
      inputRef.current.focus();
    }
  }, [countDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = inputRef.current?.value ?? "";

    if (answer == equations[currentPlayer.score].answer.toString()) {
      dispatch({
        type: "setCurrentPlayer",
        player: {
          ...currentPlayer,
          score: currentPlayer.score + 1,
        },
      });
    }

    // Add animation for feedback
    setAnimation("animate-scale-in");
    setTimeout(() => setAnimation(""), 300);
  };

  // Calculate progress based on game mode
  const calculateProgress = () => {
    if (gameMode.type === "equations") {
      return (currentEquationIndex / gameMode.count) * 100;
    } else if (gameMode.type === "time" && timeElapsed !== undefined) {
      return (timeElapsed / gameMode.count) * 100;
    }
    return 0;
  };

  // Format progress text based on game mode
  const getProgressText = () => {
    if (gameMode.type === "equations") {
      return `Equation ${currentEquationIndex + 1} of ${gameMode.count}`;
    } else {
      return timeElapsed !== undefined
        ? `${gameMode.count - timeElapsed} seconds remaining`
        : "";
    }
  };

  return (
    <>
      {countDown > 0 && (
        <div className="absolute z-50 flex h-full w-full items-center justify-center">
          {countDown}
        </div>
      )}
      <div className="animate-fade-in mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-4 lg:flex-row">
        {/* Main game area */}
        <div className="flex flex-grow flex-col lg:order-1">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">{getProgressText()}</h2>
              <div className="text-muted-foreground text-sm">
                {gameMode.type === "equations"
                  ? `First to ${gameMode.count}`
                  : `${gameMode.count}s Challenge`}
              </div>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          <div className="mb-8 flex flex-grow flex-col items-center justify-center">
            <div className={`mb-6 w-full ${animation}`}>
              <EquationStack
                equations={equations.slice(3)}
                currentIndex={currentEquationIndex}
                stackSize={3}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-xs flex-col items-center"
            >
              <Input
                ref={inputRef}
                type="number"
                placeholder="Enter your answer"
                className="mb-4 h-14 text-center text-xl"
                autoComplete="off"
              />
              <Button type="submit" className="math-button-primary w-full">
                Submit
              </Button>
            </form>
          </div>
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:order-2 lg:w-64">
          <div className="sticky">
            <h3 className="mb-3 text-lg font-semibold">Leaderboard</h3>
            <PlayerList
              players={players}
              showScores={true}
              currentPlayerId={currentPlayer.id}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default GameScreen;
