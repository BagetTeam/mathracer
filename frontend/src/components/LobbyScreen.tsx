
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Play, ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast';
import PlayerList from './PlayerList';
import { Player, GameMode } from '@/types/game';

interface LobbyScreenProps {
  gameId: string;
  players: Player[];
  isHost: boolean;
  selectedMode: GameMode;
  onStartGame: () => void;
  onBackToMenu: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  gameId,
  players,
  isHost,
  selectedMode,
  onStartGame,
  onBackToMenu,
}) => {
  const [gameUrl, setGameUrl] = useState('');

  useEffect(() => {
    // Generate the join URL
    const url = `${window.location.origin}?join=${gameId}`;
    setGameUrl(url);
  }, [gameId]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(gameUrl);
    toast.success('Invite link copied to clipboard');
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Math Race Quest game!',
          text: 'Join me for a math racing challenge!',
          url: gameUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  // Display game mode info
  const getModeDescription = () => {
    if (selectedMode.type === 'equations') {
      return `First to solve ${selectedMode.count} equations wins`;
    } else {
      return `Solve the most equations in ${selectedMode.seconds} seconds`;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="w-full">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackToMenu} 
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        <h1 className="text-3xl font-bold text-center mb-2">Game Lobby</h1>
        <p className="text-center text-muted-foreground mb-6">
          {getModeDescription()}
        </p>
      </div>

      <div className="w-full p-4 bg-secondary/30 rounded-lg border border-secondary">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-2">
          <div className="text-sm font-medium">Share this link to invite players:</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyInviteLink} className="flex items-center gap-1">
              <Copy size={14} />
              <span>Copy</span>
            </Button>
            <Button variant="outline" size="sm" onClick={shareInviteLink} className="flex items-center gap-1">
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>
        <div className="text-xs bg-background p-2 rounded border truncate">
          {gameUrl}
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Players ({players.length})</h2>
          {isHost && players.length > 1 && (
            <Button 
              onClick={onStartGame} 
              className="math-button-primary flex items-center gap-2"
            >
              <Play size={16} />
              <span>Start Game</span>
            </Button>
          )}
        </div>
        
        <PlayerList players={players} />
        
        {players.length < 2 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Waiting for more players to join...
          </p>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
