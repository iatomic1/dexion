// services/socket-io.ts

import { Server } from "socket.io";

const contractSubscriptions = new Map<string, Set<string>>(); // contract -> socket IDs

export const createSocketIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.CLIENT_URL || ""]
          : ["*"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("subscribe", (contractAddress: string) => {
      if (!contractSubscriptions.has(contractAddress))
        contractSubscriptions.set(contractAddress, new Set());
      contractSubscriptions.get(contractAddress)?.add(socket.id);
    });

    socket.on("unsubscribe", (contractAddress: string) => {
      contractSubscriptions.get(contractAddress)?.delete(socket.id);
    });

    socket.on("disconnect", () => {
      for (const subs of contractSubscriptions.values()) {
        subs.delete(socket.id);
      }
    });
  });

  return {
    io,
    emitTxToContractSubscribers: (contractAddress: string, payload: any) => {
      const sockets = contractSubscriptions.get(contractAddress) || new Set();
      for (const id of sockets) {
        const s = io.sockets.sockets.get(id);
        if (s) s.emit("tx", payload);
      }
    },
  };
};
