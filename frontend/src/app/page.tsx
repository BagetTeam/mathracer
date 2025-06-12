"use client";

import { Suspense, useEffect, useState } from "react";
import { ConnectionContext } from "./connectionContext";
import Wrapper from "./wrapper";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useSearchParams } from "next/navigation";

function LoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      Loading...
    </div>
  );
}

function GameComponent() {
  const searchParams = useSearchParams();
  const isJoining = searchParams.get("join") ? true : false;
  const gameId = searchParams.get("join") ?? crypto.randomUUID().toString();

  const [conn, setConn] = useState<HubConnection | null>(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("https://mathracer.onrender.com/hub")
      .build();

    connection
      .start()
      .then(() => setConn(connection))
      .catch(() => setConn(null));
  }, []);

  return !conn ? (
    <div className="flex h-full w-full items-center justify-center">
      Making Connection...
    </div>
  ) : (
    <ConnectionContext.Provider value={conn}>
      <Wrapper gameId={gameId} isJoining={isJoining} />
    </ConnectionContext.Provider>
  );
}

// Page component with proper suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <GameComponent />
    </Suspense>
  );
}
