import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface JoinGameScreenProps {
  onJoinGame: (gameId: string) => void;
  onBackToMenu: () => void;
}

const JoinGameScreen: React.FC<JoinGameScreenProps> = ({
  onJoinGame,
  onBackToMenu,
}) => {
  const [gameId, setGameId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      setIsJoining(true);
      onJoinGame(gameId.trim());
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-md space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackToMenu}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>Back to Menu</span>
      </Button>

      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Join Game</h1>
        <p className="text-muted-foreground">
          Enter the game code and your name to join
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="gameId" className="text-sm font-medium">
            Game Code
          </label>
          <Input
            id="gameId"
            placeholder="Enter game code"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <Button
          type="submit"
          className="math-button-primary h-12 w-full"
          disabled={!gameId.trim() || isJoining}
        >
          {isJoining ? "Joining..." : "Join Game"}
        </Button>
      </form>
    </div>
  );
};

export default JoinGameScreen;
