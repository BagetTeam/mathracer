
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Player, GameMode, Equation } from '@/types/game';
import PlayerList from './PlayerList';
import EquationStack from './EquationStack';

interface GameScreenProps {
  currentPlayer: Player;
  players: Player[];
  gameMode: GameMode;
  onSubmitAnswer: (answer: number) => void;
  onGameEnd: () => void;
  equations: Equation[];
  currentEquationIndex: number;
  timeRemaining?: number;
}

const GameScreen: React.FC<GameScreenProps> = ({
  currentPlayer,
  players,
  gameMode,
  onSubmitAnswer,
  onGameEnd,
  equations,
  currentEquationIndex,
  timeRemaining,
}) => {
  const [answer, setAnswer] = useState('');
  const [animation, setAnimation] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts and after each equation
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentEquationIndex]);

  // Handle time-based game end
  useEffect(() => {
    if (gameMode.type === 'time' && timeRemaining === 0) {
      onGameEnd();
    }
  }, [timeRemaining, gameMode, onGameEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmitAnswer(Number(answer));
      setAnswer('');
      
      // Add animation for feedback
      setAnimation('animate-scale-in');
      setTimeout(() => setAnimation(''), 300);
    }
  };

  // Calculate progress based on game mode
  const calculateProgress = () => {
    if (gameMode.type === 'equations') {
      return (currentEquationIndex / gameMode.count) * 100;
    } else if (gameMode.type === 'time' && timeRemaining !== undefined) {
      return ((gameMode.seconds - timeRemaining) / gameMode.seconds) * 100;
    }
    return 0;
  };
  
  // Format progress text based on game mode
  const getProgressText = () => {
    if (gameMode.type === 'equations') {
      return `Equation ${currentEquationIndex + 1} of ${gameMode.count}`;
    } else {
      return timeRemaining !== undefined ? `${timeRemaining} seconds remaining` : '';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto animate-fade-in">
      {/* Main game area */}
      <div className="flex-grow lg:order-1 flex flex-col">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">{getProgressText()}</h2>
            <div className="text-sm text-muted-foreground">
              {gameMode.type === 'equations' 
                ? `First to ${gameMode.count}` 
                : `${gameMode.seconds}s Challenge`}
            </div>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        <div className="flex-grow flex flex-col items-center justify-center mb-8">
          <div className={`mb-6 w-full ${animation}`}>
            <EquationStack 
              equations={equations.slice(currentEquationIndex)} 
              currentIndex={0}
              stackSize={3}
            />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center">
            <Input
              ref={inputRef}
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="text-center text-xl h-14 mb-4"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              className="math-button-primary w-full"
              disabled={!answer.trim()}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>

      {/* Leaderboard sidebar */}
      <div className="lg:w-64 lg:order-2">
        <div className="sticky top-4">
          <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
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
