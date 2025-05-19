"use client";

import React, {
  useState,
  useEffect,
  useRef,
  use,
  ActionDispatch,
  useMemo,
} from "react";
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
  const { gameMode, currentPlayer, players, equations, gameId } = gameOps;

  const [countDown, setCountDown] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const connection = use(ConnectionContext)!;

  const [boxStyle, setBoxStyle] = useState("math-button-primary");
  const [formStyle, setFormStyle] = useState("bg-background/70");

  const [animation, setAnimation] = useState("");
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null!);

  const now = useMemo(() => Math.round(Date.now() / 1000), []);

  useEffect(() => {
    connection.on("CountDown", (count: number) => {
      setCountDown(count);
    });

    connection.on("TimeElapsed", (time) => setTimeElapsed(time));

    return () => {
      connection.off("CountDown");
      connection.off("TimeElapsed");
    };
  }, []);

  // Handle time-based game end
  useEffect(() => {
    if (
      (gameMode.type === "time" && timeElapsed === gameMode.count) ||
      (gameMode.type === "equations" && currentEquationIndex === gameMode.count)
    ) {
      async function setPlayerComplete() {
        dispatch({
          type: "isComplete",
          playerId: currentPlayer.id,
          hasComplete: true,
        });

        await connection
          .send("UpdatePlayerState", gameId, currentPlayer.id, true)
          .catch();
      }
      setPlayerComplete().then(() => onGameEnd());
    }
  }, [timeElapsed, currentEquationIndex]);

  useEffect(() => {
    if (countDown == 0) {
      inputRef.current.focus();
    }
  }, [countDown]);

  async function submitAnswer() {
    setCurrentEquationIndex(currentEquationIndex + 1);

    let score = currentPlayer.score + 1;
    if (
      gameMode.type === "equations" &&
      currentEquationIndex === gameMode.count - 1
    ) {
      score = Math.round(Date.now() / 1000) - now;
    }

    dispatch({
      type: "setScore",
      playerId: currentPlayer.id,
      score,
    });

    inputRef.current.value = "";

    await connection
      .send("UpdateScore", gameId, currentPlayer.id, score)
      .catch();
  }

  async function submitIfCorrect(answer: string) {
    if (answer === equations[currentEquationIndex].answer.toString()) {
      setAnimation("animate-scale-in");
      setTimeout(() => setAnimation(""), 300);
      await submitAnswer();
    } else {
      if (
        answer.length >=
        equations[currentEquationIndex].answer.toString().length
      ) {
        setBoxStyle("math-button-destructive");
        setFormStyle("bg-destructive/70");
      } else {
        setBoxStyle("math-button-primary");
        setFormStyle("bg-background/70");
      }
    }
  }

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
      <div className="animate-fade-in mx-auto flex h-full w-full max-w-5xl flex-col gap-6 lg:flex-row">
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

          <div className="mb-8 flex w-full flex-grow flex-col items-center justify-center">
            {countDown > 0 && (
              <div className="absolute z-50 flex h-full w-full items-center justify-center font-extrabold">
                <div className="border-primary bg-secondary/10 flex h-[7rem] w-[7rem] items-center justify-center rounded-full border-[4px] border-solid text-6xl backdrop-blur-xs backdrop-filter">
                  <span className="text-primary">{countDown}</span>
                </div>
              </div>
            )}

            <div
              className={`mb-6 flex w-full items-center justify-center ${animation}`}
            >
              <EquationStack
                equations={equations}
                currentIndex={currentEquationIndex}
                stackSize={3}
              />
            </div>

            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                inputRef.current.value = "";
                submitIfCorrect(inputRef.current.value);
              }}
              className={`relative flex w-full max-w-xs flex-col items-center`}
            >
              <Input
                ref={inputRef}
                type="number"
                onChange={(e) => submitIfCorrect(e.target.value)}
                placeholder="Enter your answer"
                className={`mb-4 h-14 text-center text-xl ${formStyle}`}
                autoComplete="off"
                disabled={countDown > 0}
              />
              <Button type="submit" className={`w-full ${boxStyle}`}>
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
              showScores
              currentPlayerId={currentPlayer.id}
              gameMode={gameMode}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default GameScreen;
