import { performance } from "perf_hooks";
import { Server } from "socket.io";
import { getTokenMetadata, getPools } from "./stxtools-api";
import { getStxCityTokenMetadata, getStxCityTokenTrades } from "./stxcity";
import { transformToTokenMetadata } from "../utils/transferToTokenMetadata";
import { convertTransaction } from "../utils/convertSwapTransaction";

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

      try {
        // First try to get metadata from stxcity
        console.log("Attempting to get metadata from stxcity...");
        const stxCityMetadata = await getStxCityTokenMetadata(contractAddress);
        console.log("Raw stxcity metadata:", stxCityMetadata);

        if (stxCityMetadata) {
          console.log("Transforming stxcity metadata...");
          const token = transformToTokenMetadata(stxCityMetadata);
          console.log("Transformed token:", token);

          // Check if progress is 100 (complete)
          if (stxCityMetadata.progress === 100) {
            console.log("Progress is 100, fetching from stxtools...");

            const tokenMetadata = await getTokenMetadata(contractAddress);

            if (tokenMetadata) {
              console.log("Got metadata from stxtools:", tokenMetadata);
              socket.emit("tx", {
                type: "metadata",
                contract: contractAddress,
                tokenMetadata,
              });
            } else {
              console.log("No metadata from stxtools, using stxcity data");
              socket.emit("tx", {
                type: "metadata",
                contract: contractAddress,
                tokenMetadata: token,
              });
            }
          } else {
            console.log(
              `Progress is ${stxCityMetadata.progress}, using stxcity data and fetching trades...`,
            );

            // Emit stxcity metadata
            socket.emit("tx", {
              type: "metadata",
              contract: contractAddress,
              tokenMetadata: token,
            });

            // Get trades from stxcity since progress < 100
            console.log(
              `Getting trades for dex_contract: ${token.dex_contract}, contract_id: ${token.contract_id}`,
            );
            const res = await getStxCityTokenTrades(
              token.dex_contract as string,
              token.contract_id,
            );

            const swapTxs = res.swapTXs;
            console.log(
              `Got ${swapTxs?.length || 0} swap transactions from stxcity and ${res.chartData.length} chartData`,
            );

            if (swapTxs && swapTxs.length > 0) {
              console.log();
              const trades = swapTxs.map((trade, index) =>
                convertTransaction(trade, {
                  token_y_contract: token.contract_id,
                  token_y_decimals: token.decimals,
                  token_y_image: token.image_url,
                  token_y_symbol: token.symbol,
                  tx_index: index,
                  chartData: res.chartData,
                }),
              );

              console.log(
                `Converted ${trades.length} trades, emitting to socket`,
                trades[0],
              );
              socket.emit("tx", {
                type: "trades",
                contract: contractAddress,
                trades: trades,
              });
            } else {
              console.log("No trades found or empty array returned");
            }
          }
        } else {
          console.log(
            "No metadata from stxcity, trying stxtools as fallback...",
          );

          // Fallback to stxtools if stxcity has no data
          const tokenMetadata = await getTokenMetadata(contractAddress);

          if (tokenMetadata) {
            console.log("Got metadata from stxtools:", tokenMetadata);
            socket.emit("tx", {
              type: "metadata",
              contract: contractAddress,
              tokenMetadata,
            });
          } else {
            console.log("No metadata found from either source");
          }
        }
      } catch (err) {
        console.error("Error in subscribe handler:", err);
        console.error("Stack trace:", err.stack);

        // Emit error to client
        socket.emit("tx", {
          type: "error",
          contract: contractAddress,
          error: err.message,
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
