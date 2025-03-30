
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Timer, PlusCircle, User } from 'lucide-react';
import GameModeCard from './GameModeCard';
import { GameMode } from '@/types/game';

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
  onStartSinglePlayer
}) => {
  return (
    <div className="flex flex-col items-center space-y-8 max-w-3xl mx-auto animate-fade-in">
      <div className="w-full text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Math Race Quest
        </h1>
        <p className="text-muted-foreground text-lg">
          Race against others to solve math equations and claim victory!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Button 
          variant="outline" 
          size="lg" 
          className="math-button-accent flex items-center justify-center gap-2 h-16" 
          onClick={onStartSinglePlayer}
        >
          <User size={20} />
          <span>Single Player</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="math-button-primary flex items-center justify-center gap-2 h-16" 
          onClick={onCreateGame}
        >
          <PlusCircle size={20} />
          <span>Create Game</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="math-button-secondary flex items-center justify-center gap-2 h-16" 
          onClick={onJoinGame}
        >
          <Users size={20} />
          <span>Join Game</span>
        </Button>
      </div>

      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Select Game Mode</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GameModeCard 
            title="Race to 10"
            description="First to solve 10 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: 'equations', count: 10 })}
            bgColor="bg-math-purple"
          />
          
          <GameModeCard 
            title="Race to 30"
            description="First to solve 30 equations wins"
            icon={<Trophy size={24} />}
            onClick={() => onSelectMode({ type: 'equations', count: 30 })}
            bgColor="bg-math-purple"
          />
          
          <GameModeCard 
            title="10 Second Sprint"
            description="Solve the most in 10 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: 'time', seconds: 10 })}
            bgColor="bg-math-blue"
          />
          
          <GameModeCard 
            title="30 Second Challenge"
            description="Solve the most in 30 seconds"
            icon={<Timer size={24} />}
            onClick={() => onSelectMode({ type: 'time', seconds: 30 })}
            bgColor="bg-math-blue"
          />
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
