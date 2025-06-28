import type { MempoolTransaction } from "@stacks/blockchain-api-client";

export const extractTxDetails = (tx: MempoolTransaction) => {
  return {
    txId: tx.tx_id,
    senderAddress: tx.sender_address,
    status: tx.tx_status,
    type: tx.tx_type,
  };
};
