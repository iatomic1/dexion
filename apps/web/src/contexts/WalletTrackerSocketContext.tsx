"use client";
import React, { createContext, useContext, ReactNode } from "react";
import usePartySocket from "partysocket/react";
import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";

const PARTYKIT_HOST = "http://127.0.0.1:4002";

export interface WalletTrackerSocketContextType {
  isConnected: boolean;
  lastMessage: MessageEvent<any> | null;
}

const WalletTrackerContext = createContext<
  WalletTrackerSocketContextType | undefined
>(undefined);

export const WalletTrackerSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending } = authClient.useSession();
  const userId = !isPending && session?.user?.id ? session.user.id : null;

  // Only create socket connection when userId is available
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: userId || "anno", // Pass undefined instead of empty string
    onOpen: () => console.log("Connected to PartyKit"),
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📣 Notification received:", data);
        toast.success(data.message || "New wallet activity!");
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },
    onClose: () => console.log("Disconnected from PartyKit"),
    onError: (error) => console.error("PartyKit error:", error),
    // Disable connection until we have a valid userId
    options: {
      startClosed: !userId,
    },
  });

  const contextValue: WalletTrackerSocketContextType = {
    isConnected: userId ? socket.readyState === WebSocket.OPEN : false,
    lastMessage: socket.lastMessage,
  };

  return (
    <WalletTrackerContext.Provider value={contextValue}>
      {children}
    </WalletTrackerContext.Provider>
  );
};

export const useWalletTrackerSocket = () => {
  const context = useContext(WalletTrackerContext);
  if (!context) {
    throw new Error(
      "useWalletTrackerSocket must be used within a WalletTrackerSocketProvider",
    );
  }
  return context;
};
