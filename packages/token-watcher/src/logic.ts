import { ADDRESSES } from "@repo/shared-constants/constants.ts";
import { getTokenMetadata } from "@repo/tokens/services";
import redisClient from "./redis";
import { sc } from "./services/stacks-socket";
import { getContractIdsFromPostConditions } from "./utils";

const DEX_ADDRESSES = Object.values(ADDRESSES);

async function handleTransaction(tx: any) {
  if (tx.tx.tx_status !== "success" || !tx.tx.post_conditions) return;

  const contractIds = getContractIdsFromPostConditions(tx.tx.post_conditions);
  console.log(contractIds);

  for (const contractId of contractIds) {
    try {
      const tokenMetadata = await getTokenMetadata(contractId);
      if (tokenMetadata && tokenMetadata.metrics.price_usd) {
        const mc = tokenMetadata.metrics.marketcap_usd;
        const priceUpdate = {
          contractId: contractId,
          price: tokenMetadata.metrics.marketcap_usd,
        };
        await redisClient.publish("price-updates", JSON.stringify(priceUpdate));
      }
    } catch (error) {
      console.error(`Failed to process contract ${contractId}:`, error);
    }
  }
}

for (const address of DEX_ADDRESSES) {
  sc.subscribeAddressTransactions(address, (_, tx) => handleTransaction(tx));
}
