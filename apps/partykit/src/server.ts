import type * as Party from "partykit/server";
import { getDevTokens, getHolders, getPools, getStxCityTokenMetadata, getStxCityTokenTrades, getTokenMetadata, getTrades } from "@repo/tokens/services";
import { convertTransaction, transformToTokenMetadata } from "@repo/tokens/utils";
import { getSocketClient } from "./socket";
import axios from "axios";

interface TokenData {
  token_y_contract: string;
  token_y_decimals: number;
  token_y_image: string;
  token_y_symbol: string;
  tx_index: number;
  chartData: any;
}

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {
    if (this.room.id.startsWith("token:")) {
      this.setupSubscription();
    }
  }

  async setupSubscription() {
    try {
      const sc = getSocketClient();
      const contractAddress = this.room.id.split(":")[1];
      sc.subscribeAddressTransactions(contractAddress, async (address, tx) => {
        console.log(`Transaction update for room ${this.room.id}. Refetching and broadcasting.`);
        this.fetchAndSendData(contractAddress);
      });
    } catch (err) {
      console.error(`Failed to setup subscription for ${this.room.id}`, err);
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`Connected: id: ${conn.id} room: ${this.room.id} url: ${new URL(ctx.request.url).pathname}`);
    if (this.room.id.startsWith("token:")) {
      const contractAddress = this.room.id.split(":")[1];
      this.fetchAndSendData(contractAddress, conn);
    }
  }

  async onMessage(message: string) {
    if (this.room.id.startsWith("wallet:")) {
      this.room.broadcast(message, []);
    }
  }

  async onRequest(req: Party.Request) {
    if (this.room.id.startsWith("wallet:")) {
      if (req.method === "POST") {
        const body = await req.text();
        this.room.broadcast(body);
        return new Response("Message broadcasted", { status: 200 });
      }
      return new Response("Unsupported method", { status: 405 });
    }
    return new Response("Not found", { status: 404 });
  }

  async fetchAndSendData(contractAddress: string, conn?: Party.Connection) {
    try {
      const sourceResponse = await axios.get(`http://localhost:3008/source/${contractAddress}`);
      const source = sourceResponse.data.source;

      if (source === 'stxcity') {
        const metadata = await getStxCityTokenMetadata(contractAddress, true);
        if (metadata) {
            await this.handleStxCityToken(contractAddress, metadata, conn);
        } else {
            this.sendError(contractAddress, "No metadata found", conn);
        }
      } else if (source === 'stxtools') {
        const metadata = await getTokenMetadata(contractAddress);
        if (metadata) {
            await this.handleRegularToken(contractAddress, conn, metadata);
        } else {
            this.sendError(contractAddress, "No metadata found", conn);
        }
      } else {
        // Fallback logic if source is not found
        let metadata = await getStxCityTokenMetadata(contractAddress, true);
        if (!metadata) {
            metadata = await getTokenMetadata(contractAddress);
        }

        if (metadata) {
            if ("progress" in metadata) {
                await this.handleStxCityToken(contractAddress, metadata, conn);
            } else {
                await this.handleRegularToken(contractAddress, conn, metadata);
            }
        } else {
            this.sendError(contractAddress, "No metadata found", conn);
        }
      }
    } catch (err: any) {
      this.sendError(contractAddress, err.message, conn);
    }
  }

  private async handleStxCityToken(contractAddress: string, stxCityMetadata: any, conn?: Party.Connection) {
    const token = transformToTokenMetadata(stxCityMetadata);
    if (stxCityMetadata.progress === 100) {
      await this.handleCompletedStxCityToken(contractAddress, token, conn);
    } else {
      await this.handleIncompleteStxCityToken(contractAddress, token, conn);
    }
  }

  private async handleCompletedStxCityToken(contractAddress: string, token: any, conn?: Party.Connection) {
    const tokenMetadata = await getTokenMetadata(contractAddress);
    const metadataToSend = tokenMetadata || token;
    this.sendMetadata(contractAddress, metadataToSend, conn);
    if (tokenMetadata) {
      this.sendAllTokenData(contractAddress, conn);
    }
  }

  private async handleIncompleteStxCityToken(contractAddress: string, token: any, conn?: Party.Connection) {
    this.sendMetadata(contractAddress, token, conn);
    try {
      const res = await getStxCityTokenTrades(token.dex_contract as string, token.contract_id);
      if (res.swapTXs?.length > 0) {
        const trades = this.transformStxCityTrades(res, token);
        this.sendTrades(contractAddress, trades, conn);
      }
    } catch (error) {
      console.warn(`Failed to fetch STX City trades for ${contractAddress}:`, error);
    }
  }

  private async handleRegularToken(contractAddress: string, conn: Party.Connection | undefined, tokenMetadata: any) {
    if (tokenMetadata) {
      this.sendMetadata(contractAddress, tokenMetadata, conn);
      this.sendAllTokenData(contractAddress, conn);
    } else {
      this.sendError(contractAddress, "No metadata found", conn);
    }
  }

  private transformStxCityTrades(res: any, token: any) {
    return res.swapTXs.map((trade: any, index: number) =>
      convertTransaction(trade, {
        token_y_contract: token.contract_id,
        token_y_decimals: token.decimals,
        token_y_image: token.image_url,
        token_y_symbol: token.symbol,
        tx_index: index,
        chartData: res.chartData,
      } as TokenData),
    );
  }

  private sendAllTokenData(contractAddress: string, conn?: Party.Connection) {
    const address = contractAddress;
    const devAddress = contractAddress.split(".")[0];
    this.fetchAndSendTrades(address, conn);
    this.fetchAndSendPools(address, conn);
    this.fetchAndSendHolders(address, conn);
    this.fetchAndSendDevTokens(devAddress, conn);
  }

  private fetchAndSendTrades(contractAddress: string, conn?: Party.Connection) {
    getTrades(contractAddress)
      .then((trades) => {
        if (trades?.data) {
          this.sendTrades(contractAddress, trades.data, conn);
        }
      })
      .catch((error) => {
        console.warn(`Failed to fetch trades for ${contractAddress}:`, error);
      });
  }

  private fetchAndSendPools(contractAddress: string, conn?: Party.Connection) {
    getPools(contractAddress)
      .then((pools) => {
        if (pools) {
          this.sendPools(contractAddress, pools, conn);
        }
      })
      .catch((error) => {
        console.warn(`Failed to fetch pools for ${contractAddress}:`, error);
      });
  }

  private fetchAndSendHolders(contractAddress: string, conn?: Party.Connection) {
    getHolders(contractAddress)
      .then((holders) => {
        if (holders?.data) {
          this.sendHolders(contractAddress, holders.data, conn);
        }
      })
      .catch((error) => {
        console.warn(`Failed to fetch holders for ${contractAddress}:`, error);
      });
  }

  private fetchAndSendDevTokens(devAddress: string, conn?: Party.Connection) {
    getDevTokens(devAddress)
      .then((devTokens) => {
        if (devTokens) {
          this.sendDevTokens(devAddress, devTokens, conn);
        }
      })
      .catch((error) => {
        console.warn(`Failed to fetch dev tokens for ${devAddress}:`, error);
      });
  }

  private sendMessage(message: object, conn?: Party.Connection) {
    try {
      const msg = JSON.stringify(message);
      if (conn) {
        conn.send(msg);
      } else {
        this.room.broadcast(msg);
      }
    } catch (error) {
      console.error("Failed to send message:", error, message);
    }
  }

  private sendMetadata(contract: string, tokenMetadata: any, conn?: Party.Connection) {
    this.sendMessage({ type: "metadata", contract, tokenMetadata }, conn);
  }

  private sendTrades(contract: string, trades: any, conn?: Party.Connection) {
    this.sendMessage({ type: "trades", contract, trades }, conn);
  }

  private sendPools(contract: string, pools: any, conn?: Party.Connection) {
    this.sendMessage({ type: "pools", contract, pools }, conn);
  }

  private sendHolders(contract: string, holders: any, conn?: Party.Connection) {
    this.sendMessage({ type: "holders", contract, holders }, conn);
  }

  private sendDevTokens(contract: string, devTokens: any, conn?: Party.Connection) {
    this.sendMessage({ type: "devTokens", contract, devTokens }, conn);
  }

  private sendError(contract: string, error: string, conn?: Party.Connection) {
    this.sendMessage({ type: "error", contract, error }, conn);
  }
}

Server satisfies Party.Worker;
