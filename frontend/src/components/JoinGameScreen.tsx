
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface JoinGameScreenProps {
  onJoinGame: (gameId: string, playerName: string) => void;
  onBackToMenu: () => void;
}

const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ 
  onJoinGame, 
  onBackToMenu 
}) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim() && playerName.trim()) {
      setIsJoining(true);
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBackToMenu} 
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={16} />
        <span>Back to Menu</span>
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Join Game</h1>
        <p className="text-muted-foreground">Enter the game code and your name to join</p>
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
        
        <div className="space-y-2">
          <label htmlFor="playerName" className="text-sm font-medium">
            Your Name
          </label>
          <Input
            id="playerName"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            className="h-12"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 math-button-primary"
          disabled={!gameId.trim() || !playerName.trim() || isJoining}
        >
          {isJoining ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </div>
  );
};

export default JoinGameScreen;
