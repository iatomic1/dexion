import { getTokenMetadata } from "@repo/tokens/services";
import { type RedisClientType } from "redis";
import { getContractIdsFromPostConditions } from "../lib/utils";

export class TransactionHandler {
  constructor(private redisClient: RedisClientType) {}

  public async handleTransaction(tx: any): Promise<void> {
    if (tx.tx.tx_status !== "success" || !tx.tx.post_conditions) return;

    const contractIds = getContractIdsFromPostConditions(tx.tx.post_conditions);

    for (const contractId of contractIds) {
      try {
        const tokenMetadata = await getTokenMetadata(contractId);
        if (tokenMetadata && tokenMetadata.metrics.marketcap_usd) {
          const priceUpdate = {
            contractId: contractId,
            price: tokenMetadata.metrics.marketcap_usd,
          };
          await this.redisClient.publish(
            "price-updates",
            JSON.stringify(priceUpdate),
          );
        }
      } catch (error) {
        console.error(`Failed to process contract ${contractId}:`, error);
      }
    }
  }
}
