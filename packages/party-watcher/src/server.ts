import {
  getDevTokens,
  getHolders,
  getPools,
  getStxCityTokenMetadata,
  getStxCityTokenTrades,
  getTokenMetadata,
  getTrades,
} from "@repo/tokens/services";
import {
  convertTransaction,
  transformToTokenMetadata,
} from "@repo/tokens/utils";
import type * as Party from "partykit/server";
import { getSocketClient } from "./socket";

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
    this.setupSubscription();
  }

  async setupSubscription() {
    try {
      // Now we can safely get the socket client inside a handler
      const sc = getSocketClient();

      sc.subscribeAddressTransactions(this.room.id, async (address, tx) => {
        // on successful tx, refetch and broadcast to all connections in the room
        // if (tx.tx_status === "success") {
        console.log(
          `Transaction update for room ${this.room.id}. Refetching and broadcasting.`,
        );
        this.fetchAndSendData(this.room.id);
        // }
      });
    } catch (err) {
      console.error(`Failed to setup subscription for ${this.room.id}`, err);
    }
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    // Start fetching and streaming data immediately upon connection
    this.fetchAndSendData(this.room.id, conn);
  }

  /**
   * Main orchestrator that determines token type and routes to appropriate handler
   */
  async fetchAndSendData(contractAddress: string, conn?: Party.Connection) {
    try {
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
    } catch (err: any) {
      this.sendError(contractAddress, err.message, conn);
    }
  }

  /**
   * Handles STX City tokens - routes based on completion status
   */
  private async handleStxCityToken(
    contractAddress: string,
    stxCityMetadata: any,
    conn?: Party.Connection,
  ) {
    const token = transformToTokenMetadata(stxCityMetadata);

    // Check if bonding curve is complete (100% progress)
    if (stxCityMetadata.progress === 100) {
      await this.handleCompletedStxCityToken(contractAddress, token, conn);
    } else {
      await this.handleIncompleteStxCityToken(contractAddress, token, conn);
    }
  }

  /**
   * Handles completed STX City tokens (graduated to full DEX)
   * These tokens have full metadata and trading data
   */
  private async handleCompletedStxCityToken(
    contractAddress: string,
    token: any,
    conn?: Party.Connection,
  ) {
    // Try to get enhanced metadata first
    const tokenMetadata = await getTokenMetadata(contractAddress);
    const metadataToSend = tokenMetadata || token;

    this.sendMetadata(contractAddress, metadataToSend, conn);

    // Only fetch full trading data if we have proper metadata
    if (tokenMetadata) {
      this.sendAllTokenData(contractAddress, conn);
    }
  }

  /**
   * Handles incomplete STX City tokens (still in bonding curve)
   * These tokens have limited data and use STX City specific endpoints
   */
  private async handleIncompleteStxCityToken(
    contractAddress: string,
    token: any,
    conn?: Party.Connection,
  ) {
    // Send basic metadata immediately
    this.sendMetadata(contractAddress, token, conn);
    console.log(token);

    try {
      // Get STX City specific trading data
      const res = await getStxCityTokenTrades(
        token.dex_contract as string,
        token.contract_id,
      );

      // Transform and send trades if available
      if (res.swapTXs?.length > 0) {
        const trades = this.transformStxCityTrades(res, token);
        this.sendTrades(contractAddress, trades, conn);
      }
    } catch (error) {
      // Silently handle trade data failure - metadata was already sent
      console.warn(
        `Failed to fetch STX City trades for ${contractAddress}:`,
        error,
      );
    }
  }

  /**
   * Handles regular tokens (non-STX City)
   */
  private async handleRegularToken(
    contractAddress: string,
    conn: Party.Connection | undefined,
    tokenMetadata: any,
  ) {
    if (tokenMetadata) {
      this.sendMetadata(contractAddress, tokenMetadata, conn);
      this.sendAllTokenData(contractAddress, conn);
    } else {
      this.sendError(contractAddress, "No metadata found", conn);
    }
  }

  /**
   * Transforms STX City trade data into standard format
   */
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

  /**
   * Initiates parallel fetching of all token data
   * Each data type is sent immediately when ready (streaming approach)
   */
  private sendAllTokenData(contractAddress: string, conn?: Party.Connection) {
    const address = contractAddress;
    const devAddress = contractAddress.split(".")[0];

    // Fire all requests in parallel - each sends data as soon as ready
    this.fetchAndSendTrades(address, conn);
    this.fetchAndSendPools(address, conn);
    this.fetchAndSendHolders(address, conn);
    this.fetchAndSendDevTokens(devAddress, conn);
  }

  /**
   * Fetches and sends trade data
   */
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

  /**
   * Fetches and sends pool data
   */
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

  /**
   * Fetches and sends holder data
   */
  private fetchAndSendHolders(
    contractAddress: string,
    conn?: Party.Connection,
  ) {
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

  /**
   * Fetches and sends developer's other tokens
   */
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

  // ===== MESSAGE SENDING HELPERS =====

  private sendMetadata(
    contract: string,
    tokenMetadata: any,
    conn?: Party.Connection,
  ) {
    this.sendMessage(
      {
        type: "metadata",
        contract,
        tokenMetadata,
      },
      conn,
    );
  }

  private sendTrades(contract: string, trades: any, conn?: Party.Connection) {
    this.sendMessage(
      {
        type: "trades",
        contract,
        trades,
      },
      conn,
    );
  }

  private sendPools(contract: string, pools: any, conn?: Party.Connection) {
    this.sendMessage(
      {
        type: "pools",
        contract,
        pools,
      },
      conn,
    );
  }

  private sendHolders(contract: string, holders: any, conn?: Party.Connection) {
    this.sendMessage(
      {
        type: "holders",
        contract,
        holders,
      },
      conn,
    );
  }

  private sendDevTokens(
    contract: string,
    devTokens: any,
    conn?: Party.Connection,
  ) {
    this.sendMessage(
      {
        type: "devTokens",
        contract,
        devTokens,
      },
      conn,
    );
  }

  private sendError(contract: string, error: string, conn?: Party.Connection) {
    this.sendMessage(
      {
        type: "error",
        contract,
        error,
      },
      conn,
    );
  }

  /**
   * Central message sending with error handling
   */
  private sendMessage(message: object, conn?: Party.Connection) {
    try {
      const msg = JSON.stringify(message);
      if (conn) {
        // Send to a specific connection
        conn.send(msg);
      } else {
        // Broadcast to all connections in the room
        this.room.broadcast(msg);
      }
    } catch (error) {
      console.error("Failed to send message:", error, message);
    }
  }
}

Server satisfies Party.Worker;
