import { GameMode } from "@/types/game";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Timer, Users } from "lucide-react";

type PublicLobbyCardProp = {
  gameId: string;
  hostName: string;
  numPlayers: number;
  gameMode: GameMode;
};

export default function PublicLobbyCard({
  gameId,
  hostName,
  numPlayers,
  gameMode,
}: PublicLobbyCardProp) {
  const gameUrl = `http://localhost:3000?join=${gameId}`;
  return (
    <Button
      className={cn(
        "flex items-start rounded-xl p-4 transition-all duration-200",
        "focus:ring-primary/50 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:outline-none",
        "w-full border border-gray-100 text-left",
        "bg-math-blue",
        "bg-opacity-30 hover:bg-opacity-40",
      )}
      onClick={() => {}}
    >
      <a href={gameUrl}>
        <div className="flex flex-col items-start">
          <div className="flex flex-row items-center justify-between">
            <div className="font-bold text-gray-900">{`${hostName}'s Lobby`}</div>
            <div className="bg-math-purple rounded-2xl p-1.5 text-gray-700">
              {gameId}
            </div>
          </div>
          <div className="flex flex-row items-center text-xs text-gray-500">
            {gameMode.type === "equations" ? (
              <div className="space-x-3">
                <Trophy size={12} />
                <span>{`Race to ${String(gameMode.count)} equations`}</span>
              </div>
            ) : (
              <div>
                <Timer size={12} />
                <span>{`${String(gameMode.count)} second challenge`}</span>
              </div>
            )}
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="space-x-3 text-xs text-gray-500">
              <Users size={12} />
              <span>{`${numPlayers} players`}</span>
            </div>
            <a
              href={gameUrl}
              className="rounded-lg bg-gray-400 p-3 text-sm font-medium text-gray-900 hover:bg-emerald-300"
            >
              Join
            </a>
          </div>
        </div>
      </a>
    </Button>
  );
}
