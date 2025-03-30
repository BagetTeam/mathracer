
import React from 'react';
import { cn } from '@/lib/utils';

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor?: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  description,
  icon,
  onClick,
  bgColor = 'bg-math-green',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start rounded-xl p-4 transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50",
        "text-left w-full border border-gray-100", 
        bgColor, 
        "bg-opacity-30 hover:bg-opacity-40"
      )}
    >
      <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-white/80">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
};

export default GameModeCard;
