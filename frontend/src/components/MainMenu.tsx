"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Timer, PlusCircle, User } from "lucide-react";
import GameModeCard from "./GameModeCard";
import { GameMode } from "@/types/game";

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  onCreateGame: () => void;
  onJoinGame: () => void;
  onStartSinglePlayer: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  onCreateGame,
  onJoinGame,
  onStartSinglePlayer,
}) => {
  return (
    <div className="animate-fade-in mx-auto flex max-w-3xl flex-col items-center space-y-8">
      <div className="w-full space-y-3 text-center">
        <h1 className="from-primary via-secondary to-accent bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Math Race Quest
        </h1>
        <p className="text-muted-foreground text-lg">
          Race against others to solve math equations and claim victory!
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          size="lg"
          className="math-button-accent flex h-16 items-center justify-center gap-2"
          onClick={onStartSinglePlayer}
        >
          <User size={20} />
          <span>Single Player</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="math-button-primary flex h-16 items-center justify-center gap-2"
          onClick={onCreateGame}
        >
          <PlusCircle size={20} />
          <span>Create Game</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="math-button-secondary flex h-16 items-center justify-center gap-2"
          onClick={onJoinGame}
        >
          <Users size={20} />
          <span>Join Game</span>
        </Button>
      </div>

      <div className="w-full">
        <h2 className="mb-4 text-xl font-semibold">Select Game Mode</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GameModeCard
            title="Race to 10"
            description="First to solve 10 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: "equations", count: 10 })}
            bgColor="bg-math-purple"
          />

          <GameModeCard
            title="Race to 30"
            description="First to solve 30 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: "equations", count: 30 })}
            bgColor="bg-math-purple"
          />

          <GameModeCard
            title="10 Second Sprint"
            description="Solve the most in 10 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: "time", seconds: 10 })}
            bgColor="bg-math-blue"
          />

          <GameModeCard
            title="30 Second Challenge"
            description="Solve the most in 30 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: "time", seconds: 30 })}
            bgColor="bg-math-blue"
          />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
