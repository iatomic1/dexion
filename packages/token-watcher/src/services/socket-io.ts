import { performance } from "perf_hooks";

import { Server } from "socket.io";
import {
  getTokenMetadata,
  getTrades,
  getHolders,
  getPools,
} from "./stxtools-api";

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

    socket.on("subscribe", async (contractAddress: string) => {
      console.log("sub was emitted");
      if (!contractSubscriptions.has(contractAddress))
        contractSubscriptions.set(contractAddress, new Set());
      contractSubscriptions.get(contractAddress)?.add(socket.id);

      console.log(`Fetching initial data for ${contractAddress}`);

      const start = performance.now(); // start timer
      try {
        getTokenMetadata(contractAddress)
          .then((tokenMetadata) => {
            socket.emit("tx", {
              type: "metadata",
              contract: contractAddress,
              tokenMetadata,
            });
          })
          .catch((err) => console.error("Error fetching tokenMetadata:", err));

        getTrades(contractAddress)
          .then((trades) => {
            socket.emit("tx", {
              type: "trades",
              contract: contractAddress,
              trades: trades?.data,
            });
          })
          .catch((err) => console.error("Error fetching trades:", err));

        getHolders(contractAddress)
          .then((holders) => {
            socket.emit("tx", {
              type: "holders",
              contract: contractAddress,
              holders: holders?.data,
            });
          })
          .catch((err) => console.error("Error fetching holders:", err));

        getPools(contractAddress)
          .then((pools) => {
            socket.emit("tx", {
              type: "pools",
              contract: contractAddress,
              pools: pools,
            });
          })
          .catch((err) => console.error("Error fetching pools:", err));

        const end = performance.now(); // end timer
        console.log(
          `Fetched initial data for ${contractAddress} in ${(end - start).toFixed(2)}ms`,
        );
      } catch (err) {
        console.error("Error fetching initial data:", err);
        socket.emit("tx", {
          type: "error",
          message: "Failed to fetch initial data",
        });
      }
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
