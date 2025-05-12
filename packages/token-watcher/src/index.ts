import { ADDRESSES } from "./lib/constants";
import { sc } from "./services/stacks-socket";
import { getFungibleContractId } from "./utils/getFungibleContractID";
import {
  getHolders,
  getTokenMetadata,
  getTrades,
} from "./services/stxtools-api";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createSocketIo } from "./services/socket-io";

const PORT = process.env.PORT || 3008;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const { io, emitTxToContractSubscribers } = createSocketIo(server);

sc.subscribeAddressTransactions(ADDRESSES.VELAR, async (address, tx) => {
  if (tx.tx.tx_status === "success" && tx.tx.tx_type === "contract_call") {
    const ca = getFungibleContractId(tx.tx.post_conditions);
    console.log("new tx", tx.tx.tx_status, ca);
    if (ca) {
      const [tokenMetadata, trades, holders] = await Promise.all([
        getTokenMetadata(ca),
        getTrades(ca),
        getHolders(ca),
      ]);
      const contractAddress = ca;
      getTokenMetadata(contractAddress)
        .then((tokenMetadata) => {
          emitTxToContractSubscribers(ca as string, {
            type: "metadata",
            contract: contractAddress,
            tokenMetadata,
          });
        })
        .catch((err) => console.error("Error fetching tokenMetadata:", err));

      getTrades(contractAddress)
        .then((trades) => {
          emitTxToContractSubscribers(ca, {
            type: "trades",
            contract: contractAddress,
            trades: trades?.data,
          });
        })
        .catch((err) => console.error("Error fetching trades:", err));

      getHolders(contractAddress)
        .then((holders) => {
          emitTxToContractSubscribers(ca, {
            type: "holders",
            contract: contractAddress,
            holders: holders?.data,
          });
        })
        .catch((err) => console.error("Error fetching holders:", err));
    }
  } else {
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
