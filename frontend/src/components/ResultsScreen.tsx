
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Player, GameMode } from '@/types/game';
import PlayerList from './PlayerList';

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
  const highestScore = Math.max(...players.map(player => player.score));
  const winners = players.filter(player => player.score === highestScore);
  
  // For display, sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Game Over!</h1>
        <p className="text-muted-foreground">
          {gameMode.type === 'equations' 
            ? `First to solve ${gameMode.count} equations` 
            : `Most equations solved in ${gameMode.seconds} seconds`}
        </p>
      </div>

      <div className="text-center py-6">
        <div className="inline-block rounded-full bg-accent p-6 mb-4">
          <Trophy size={48} className="text-accent-foreground" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          {winners.length === 1 
            ? `${winners[0].name} wins!` 
            : 'It\'s a tie!'}
        </h2>
        
        {winners.length > 1 && (
          <div className="text-lg mb-2">
            {winners.map(winner => winner.name).join(' & ')}
          </div>
        )}
        
        <div className="text-lg">
          With <span className="font-bold">{highestScore}</span> equations solved
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Final Results</h3>
        <PlayerList players={sortedPlayers} showScores={true} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onPlayAgain}
          className="flex-1 math-button-primary flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          <span>Play Again</span>
        </Button>
        
        <Button
          onClick={onBackToMenu}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Home size={18} />
          <span>Back to Menu</span>
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
