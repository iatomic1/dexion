import type * as Party from "partykit/server";
import {
  getStxCityTokenMetadata,
  getStxCityTokenTrades,
} from "./services/stxcity";
import {
  getTokenMetadata,
  getTrades,
  getPools,
  getHolders,
  getDevTokens,
} from "./services/stxtools-api";
import { convertTransaction } from "./utils/convertSwapTransaction";
import { transformToTokenMetadata } from "./utils/transferToTokenMetadata";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    // When a client connects, we send them the initial data
    this.fetchAndSendData(this.room.id, conn);
  }

  async onMessage(message: string, sender: Party.Connection) {
    const { type, payload } = JSON.parse(message);

    if (type === "subscribe") {
      this.fetchAndSendData(payload.contractAddress, sender);
    }
  }

  async fetchAndSendData(contractAddress: string, conn: Party.Connection) {
    try {
      const stxCityMetadata = await getStxCityTokenMetadata(
        contractAddress,
        true,
      );

      if (stxCityMetadata) {
        const token = transformToTokenMetadata(stxCityMetadata);

        if (stxCityMetadata.progress === 100) {
          const tokenMetadata = await getTokenMetadata(contractAddress);

          if (tokenMetadata) {
            conn.send(
              JSON.stringify({
                type: "metadata",
                contract: contractAddress,
                tokenMetadata,
              }),
            );

            getTrades(contractAddress).then((trades) => {
              conn.send(
                JSON.stringify({
                  type: "trades",
                  contract: contractAddress,
                  trades: trades?.data,
                }),
              );
            });

            getPools(contractAddress).then((pools) => {
              conn.send(
                JSON.stringify({
                  type: "pools",
                  contract: contractAddress,
                  pools: pools,
                }),
              );
            });

            getHolders(contractAddress).then((holders) => {
              conn.send(
                JSON.stringify({
                  type: "holders",
                  contract: contractAddress,
                  holders: holders?.data,
                }),
              );
            });

            getDevTokens(contractAddress.split(".")[0]).then((tokens) => {
              conn.send(
                JSON.stringify({
                  type: "devTokens",
                  contract: contractAddress,
                  devTokens: tokens,
                }),
              );
            });
          } else {
            conn.send(
              JSON.stringify({
                type: "metadata",
                contract: contractAddress,
                tokenMetadata: token,
              }),
            );
          }
        } else {
          conn.send(
            JSON.stringify({
              type: "metadata",
              contract: contractAddress,
              tokenMetadata: token,
            }),
          );

          const res = await getStxCityTokenTrades(
            token.dex_contract as string,
            token.contract_id,
          );
          const swapTxs = res.swapTXs;

          if (swapTxs && swapTxs.length > 0) {
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
            conn.send(
              JSON.stringify({
                type: "trades",
                contract: contractAddress,
                trades: trades,
              }),
            );
          }
        }
      } else {
        const tokenMetadata = await getTokenMetadata(contractAddress);

        if (tokenMetadata) {
          conn.send(
            JSON.stringify({
              type: "metadata",
              contract: contractAddress,
              tokenMetadata,
            }),
          );

          getTrades(contractAddress).then((trades) => {
            conn.send(
              JSON.stringify({
                type: "trades",
                contract: contractAddress,
                trades: trades?.data,
              }),
            );
          });

          getPools(contractAddress).then((pools) => {
            conn.send(
              JSON.stringify({
                type: "pools",
                contract: contractAddress,
                pools: pools,
              }),
            );
          });

          getHolders(contractAddress).then((holders) => {
            conn.send(
              JSON.stringify({
                type: "holders",
                contract: contractAddress,
                holders: holders?.data,
              }),
            );
          });
        } else {
          conn.send(
            JSON.stringify({
              type: "error",
              contract: contractAddress,
              error: "No metadata found",
            }),
          );
        }
      }
    } catch (err: any) {
      conn.send(
        JSON.stringify({
          type: "error",
          contract: contractAddress,
          error: err.message,
        }),
      );
    }
  }
}

Server satisfies Party.Worker;
