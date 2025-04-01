"use client";

import React, { useState, useEffect, useRef, ActionDispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Player, GameMode, Equation } from "@/types/game";
import PlayerList from "./PlayerList";
import EquationStack from "./EquationStack";
import { GameOpsAction } from "@/app/page";

interface GameScreenProps {
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  gameId: string;
  equations: Equation[];
  onGameEnd: () => void;
  dispatch: ActionDispatch<[action: GameOpsAction]>;
}

const GameScreen: React.FC<GameScreenProps> = ({
  currentPlayer,
  players,
  gameMode,
  gameId,
  equations,
  onGameEnd,
  dispatch,
}) => {
  const [answer, setAnswer] = useState("");
  const [boxStyle, setBoxStyle] = useState("math-button-primary");
  const [formStyle, setFormStyle] = useState("bg-background/70");

  const [animation, setAnimation] = useState("");
  const [currentEquationIndex, setCurrentEquationIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const timeRemaining = gameMode.count / 10;

  function onSubmitAnswer(number: number) {
    if (number == equations[currentEquationIndex].answer) {
      setCurrentEquationIndex(currentEquationIndex + 1);
      dispatch({
        type: "setCurrentPlayer",
        player: {
          ...currentPlayer,
          score: currentPlayer.score + 1,
        },
      });
      setAnswer("");
      console.log(currentPlayer.score);
      console.log("=++_+-+__++_-+=-_+-+_+_+-+-=+_-_++_-+_+_+_=-=-=-+_");
    } else {
      setBoxStyle("math-button-destructive");
      setFormStyle("bg-destructive/70");
    }
  }

  // Focus input when component mounts and after each equation
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentEquationIndex]);

  // Handle time-based game end
  useEffect(() => {
    if (gameMode.type === "time" && timeRemaining === 0) {
      onGameEnd();
    }
  }, [timeRemaining, gameMode, onGameEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmitAnswer(Number(answer));
      setAnswer("");
      setBoxStyle("math-button-primary");
      setFormStyle("bg-background/70");

      // Add animation for feedback
      setAnimation("animate-scale-in");
      setTimeout(() => setAnimation(""), 300);
    }
  };

  const isAnswer = (e: string) => {
    setAnswer(e);
    console.log(boxStyle);
    if (e.length >= equations[currentEquationIndex].answer.toString().length) {
      if (e.trim()) {
        onSubmitAnswer(Number(e));

        // Add animation for feedback
        setAnimation("animate-scale-in");
        setTimeout(() => setAnimation(""), 300);
      }
    } else {
      setBoxStyle("math-button-primary");
      setFormStyle("bg-background/70");
    }
  };

  // Calculate progress based on game mode
  const calculateProgress = () => {
    if (gameMode.type === "equations") {
      return (currentEquationIndex / gameMode.count) * 100;
    } else if (gameMode.type === "time" && timeRemaining !== undefined) {
      return (
        ((gameMode.count / 10 - timeRemaining) / gameMode.count / 10) * 100
      );
    }
    return 0;
  };

  // Format progress text based on game mode
  const getProgressText = () => {
    if (gameMode.type === "equations") {
      return `Equation ${currentEquationIndex + 1} of ${gameMode.count}`;
    } else {
      return timeRemaining !== undefined
        ? `${timeRemaining} seconds remaining`
        : "";
    }
  };

  return (
    <div className="animate-fade-in mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      {/* Main game area */}
      <div className="flex flex-grow flex-col lg:order-1">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-medium">{getProgressText()}</h2>
            <div className="text-muted-foreground text-sm">
              {gameMode.type === "equations"
                ? `First to ${gameMode.count}`
                : `${gameMode.count / 10}s Challenge`}
            </div>
          </div>
          {/* <Progress value={calculateProgress()} className="h-2" /> */}
        </div>

        <div className="mb-8 flex flex-grow flex-col items-center justify-center">
          <div className={`mb-6 w-full ${animation}`}>
            <EquationStack
              equations={equations}
              currentIndex={currentEquationIndex}
              stackSize={3}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className={`flex w-full max-w-xs flex-col items-center`}
          >
            <Input
              ref={inputRef}
              type="number"
              value={answer}
              onChange={(e) => isAnswer(e.target.value)}
              placeholder="Enter your answer"
              className={`mb-4 h-14 text-center text-xl ${formStyle}`}
              autoComplete="off"
            />
            <Button
              type="submit"
              className={`w-full ${boxStyle}`}
              disabled={!answer.trim()}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>

      {/* Leaderboard sidebar */}
      <div className="lg:order-2 lg:w-64">
        <div className="sticky top-4">
          <h3 className="mb-3 text-lg font-semibold">Leaderboard</h3>
          <PlayerList
            players={players}
            showScores={true}
            currentPlayerId={currentPlayer.id}
          />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
