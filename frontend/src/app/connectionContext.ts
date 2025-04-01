import { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";

export const ConnectionContext = createContext<HubConnection | null>(null);
