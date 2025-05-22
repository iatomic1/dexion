
      try


      // const startAll = performance.now();
      //
      // const measureApi = async (label, fn) => {
      //   const start = performance.now();
      //   const result = await fn();
      //   const end = performance.now();
      //   console.log(`[${label}] took ${(end - start).toFixed(2)}ms`);
      //   return result;
      // };

      // try {
      // measureApi("getTokenMetadata", () =>
      //   getTokenMetadata(contractAddress).then((tokenMetadata) => {
      //     if (tokenMetadata)
      //       socket.emit("tx", {
      //         type: "metadata",
      //         contract: contractAddress,
      //         tokenMetadata,
      //       });
      //     else {
      //       getStxCityTokenMetadata(contractAddress).then((tokenMetadata) => {
      //         const token = transformToTokenMetadata(tokenMetadata);
      //         console.log(tokenMetadata, "from stxcity");
      //         socket.emit("tx", {
      //           type: "metadata",
      //           contract: contractAddress,
      //           tokenMetadata: token,
      //         });
      //
      //         getStxCityTokenTrades(
      //           token.dex_contract,
      //           token.contract_id,
      //         ).then((swapTxs) => {
      //           const trades = swapTxs.map((trade, index) =>
      //             convertTransaction(trade, {
      //               token_y_contract: token.contract_id,
      //               token_y_decimals: token.decimals,
      //               token_y_image: token.image_url,
      //               token_y_symbol: token.symbol,
      //               tx_index: index,
      //             }),
      //           );
      //           console.log(trades, "stxcity trades");
      //
      //           socket.emit("tx", {
      //             type: "trades",
      //             contract: contractAddress,
      //             trades: trades,
      //           });
      //         });
      //       });
      //     }
      //   }),
      // ).catch((err) => console.error("Error fetching tokenMetadata:", err));

      // measureApi("getTrades", () =>
      //   getTrades(contractAddress).then((trades) => {
      //     socket.emit("tx", {
      //       type: "trades",
      //       contract: contractAddress,
      //       trades: trades?.data,
      //     });
      //   }),
      // ).catch((err) => console.error("Error fetching trades:", err));
      //
      // measureApi("getHolders", () =>
      //   getHolders(contractAddress).then((holders) => {
      //     socket.emit("tx", {
      //       type: "holders",
      //       contract: contractAddress,
      //       holders: holders?.data,
      //     });
      //   }),
      // ).catch((err) => console.error("Error fetching holders:", err));

      //   measureApi("getPools", () =>
      //     getPools(contractAddress).then((pools) => {
      //       socket.emit("tx", {
      //         type: "pools",
      //         contract: contractAddress,
      //         pools: pools,
      //       });
      //     }),
      //   ).catch((err) => console.error("Error fetching pools:", err));
      //
      //   const endAll = performance.now();
      //   console.log(
      //     `Fetched all data for ${contractAddress} in ${(endAll - startAll).toFixed(2)}ms`,
      //   );
      // } catch (err) {
      //   console.error("Error fetching initial data:", err);
      //   socket.emit("tx", {
      //     type: "error",
      //     message: "Failed to fetch initial data",
      //   });
      // }
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
