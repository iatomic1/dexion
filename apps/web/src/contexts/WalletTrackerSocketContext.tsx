"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { WALLET_TRACKER_SOCKET_URL } from "~/lib/constants";

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const WalletTrackerSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(WALLET_TRACKER_SOCKET_URL, {
      transports: ["websocket"],
      query: { userId: "3cb4239c-a495-4c73-a7c9-6e3f85b0c9e9" },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("wallet-alert", (data) => {
      // console.log("📣 Notification received:", data);
      // toast.success("Received");
      // trigger UI, toast, etc.
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocketContext must be used within SocketProvider");
  return context;
};
