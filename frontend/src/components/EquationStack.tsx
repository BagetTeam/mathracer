
import React from 'react';
import { cn } from '@/lib/utils';
import { Equation } from '@/types/game';

interface EquationStackProps {
  equations: Equation[];
  currentIndex: number;
  stackSize?: number;
}

const EquationStack: React.FC<EquationStackProps> = ({
  equations,
  currentIndex,
  stackSize = 3
}) => {
  // Only show a few equations at a time in the stack
  const visibleEquations = equations.slice(
    Math.max(0, currentIndex),
    Math.min(currentIndex + stackSize, equations.length)
  );

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
      {visibleEquations.map((equation, index) => {
        // First equation is the current one, others are upcoming
        const isCurrent = index === 0;
        
        return (
          <div 
            key={equation.id}
            className={cn(
              "equation-card w-full transition-all duration-300",
              "animate-fade-down",
              isCurrent 
                ? "opacity-100 scale-100 z-10" 
                : `opacity-${80 - index * 20} scale-${95 - index * 5} -mt-8 z-${10 - index}`
            )}
            style={{ 
              transform: isCurrent ? 'translateY(0)' : `translateY(-${index * 0.5}rem)`,
              opacity: isCurrent ? 1 : Math.max(0.4, 1 - (index * 0.2))
            }}
          >
            <span className={cn(
              "text-3xl md:text-4xl", 
              isCurrent ? "font-bold" : "font-medium text-muted-foreground"
            )}>
              {equation.question}
            </span>
          </div>
        );
      })}
      
      {visibleEquations.length === 0 && (
        <div className="equation-card w-full bg-muted/50 border-dashed animate-pulse">
          <span className="text-muted-foreground">No more equations</span>
        </div>
      )}
    </div>
  );
};

export default EquationStack;
