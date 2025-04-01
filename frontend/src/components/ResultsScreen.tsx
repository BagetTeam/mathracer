import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { Player, GameMode } from "@/types/game";
import PlayerList from "./PlayerList";

interface ResultsScreenProps {
  players: Player[];
  gameMode: GameMode;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  players,
  gameMode,
  onPlayAgain,
  onBackToMenu,
}) => {
  // Get the winner(s) - could be multiple in case of tie
  const highestScore = Math.max(...players.map((player) => player.score));
  const winners = players.filter((player) => player.score === highestScore);

  // For display, sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="animate-fade-in mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Game Over!</h1>
        <p className="text-muted-foreground">
          {gameMode.type === "equations"
            ? `First to solve ${gameMode.count} equations`
            : `Most equations solved in ${gameMode.count / 10} seconds`}
        </p>
      </div>

      <div className="py-6 text-center">
        <div className="bg-accent mb-4 inline-block rounded-full p-6">
          <Trophy size={48} className="text-accent-foreground" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">
          {winners.length === 1 ? `${winners[0].name} wins!` : "It's a tie!"}
        </h2>

        {winners.length > 1 && (
          <div className="mb-2 text-lg">
            {winners.map((winner) => winner.name).join(" & ")}
          </div>
        )}

        <div className="text-lg">
          With <span className="font-bold">{highestScore}</span> equations
          solved
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Final Results</h3>
        <PlayerList
          players={sortedPlayers}
          showScores={true}
          currentPlayerId={0}
        />
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button
          onClick={onPlayAgain}
          className="math-button-primary flex flex-1 items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          <span>Play Again</span>
        </Button>

        <Button
          onClick={onBackToMenu}
          variant="outline"
          className="flex flex-1 items-center justify-center gap-2"
        >
          <Home size={18} />
          <span>Back to Menu</span>
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
