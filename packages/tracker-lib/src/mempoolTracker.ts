import { StacksApiSocketClient } from "@stacks/blockchain-api-client";
import type { Server } from "socket.io";

// for testnet, replace with https://api.testnet.hiro.so
const socketUrl = "https://api.mainnet.hiro.so";
const testnetUrl = "https://api.testnet.hiro.so";

export const setupMempoolSubscription = (io: Server, userId: string) => {
  const sc = new StacksApiSocketClient({ url: testnetUrl });

  sc.subscribeMempool((mempoolTx) => {
    io.to(userId).emit("wallet-alert", {
      title: "Wallet moved",
      message: `Address ${mempoolTx.sender_address} sent an STX transaction`,
      txId: mempoolTx.tx_id,
      txType: mempoolTx.tx_type,
    });

    // if (mempoolTx.tx_type === "contract_call") {
    //   console.log(mempoolTx);
    // }
  });
};
