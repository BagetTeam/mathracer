"use client";

import React, { useEffect, ActionDispatch, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Play, ArrowLeft } from "lucide-react";
import { toast } from "@/lib/toast";
import PlayerList from "./PlayerList";
import { Player, GameMode } from "@/types/game";
import * as signalR from "@microsoft/signalr";
import { GameOpsAction } from "@/app/page";

interface LobbyScreenProps {
  gameId: string;
  players: Player[];
  curentPlayer: Player;
  selectedMode: GameMode;
  onStartGame: () => void;
  onBackToMenu: () => void;
  dispatch: ActionDispatch<[action: GameOpsAction]>;
}

function LobbyScreen({
  gameId,
  players,
  curentPlayer: currentPlayer,
  selectedMode,
  onStartGame,
  onBackToMenu,
  dispatch,
}: LobbyScreenProps) {
  const [showNameDialogue, setShowNameDialogue] = useState(true);

  const gameUrl = `http://localhost:3000?join=${gameId}`;

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5103/hub")
      .build();

    connection.on("NewPlayer", (id: number) => {
      console.log({ id });
      dispatch({
        type: "addPlayer",
        player: {
          id,
          isHost: currentPlayer.isHost,
          progress: 0,
          score: 0,
          name: "Guest",
        },
      });
    });

    connection
      .start()
      .then(() => connection.send("JoinLobby", gameId))
      .catch();

    return () => {
      connection.stop();
    };
  }, []);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(gameUrl);
    toast.success("Invite link copied to clipboard");
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Math Race Quest game!",
          text: "Join me for a math racing challenge!",
          url: gameUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  // Display game mode info
  const getModeDescription = () => {
    if (selectedMode.type === "equations") {
      return `First to solve ${selectedMode.count} equations wins`;
    } else {
      return `Solve the most equations in ${selectedMode.seconds} seconds`;
    }
  };

  return (
    <div className="animate-fade-in flex max-w-2xl flex-col items-center justify-center space-y-6">
      {showNameDialogue && (
        <div className="bg-background absolute top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center backdrop-blur-md backdrop-filter">
          <p>Join as...</p>
          <form
            className="w-60"
            action={(formdata) => {
              dispatch({
                type: "nameChange",
                name: formdata.get("name")?.toString() ?? "Guest",
              });
              setShowNameDialogue(false);
            }}
          >
            <label htmlFor="name" />
            <input
              className="w-full p-2 outline-none placeholder:italic"
              placeholder="name..."
              id="name"
              name="name"
              type="text"
            />
            <div className="bg-secondary h-0.5 w-full rounded-full" />
            <Button className="mt-2 w-full" type="submit">
              Ok
            </Button>
          </form>
        </div>
      )}

      <div className="w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToMenu}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Button>

        <h1 className="mb-2 text-center text-3xl font-bold">Game Lobby</h1>
        <p className="text-muted-foreground mb-6 text-center">
          {getModeDescription()}
        </p>
      </div>

      <div className="bg-secondary/30 border-secondary w-full rounded-lg border p-4">
        <div className="mb-2 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-sm font-medium">
            Share this link to invite players:
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteLink}
              className="flex items-center gap-1"
            >
              <Copy size={14} />
              <span>Copy</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareInviteLink}
              className="flex items-center gap-1"
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>
        <div className="bg-background truncate rounded border p-2 text-xs">
          {gameUrl}
        </div>
      </div>

      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players ({players.length})</h2>
          {currentPlayer.isHost && players.length > 1 && (
            <Button
              onClick={onStartGame}
              className="math-button-primary flex items-center gap-2"
            >
              <Play size={16} />
              <span>Start Game</span>
            </Button>
          )}
        </div>

        <PlayerList players={players} currentPlayerId={currentPlayer.id} />

        {players.length < 2 && (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Waiting for more players to join...
          </p>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen;
