import { ADDRESSES } from "./lib/constants";
import { sc } from "./services/stacks-socket";
import { getFungibleContractId } from "./utils/getFungibleContractID";
import { getTokenMetadata } from "./services/stxtools-api";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { createSocketIo } from "./services/socket-io";

const PORT = 3008;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const { io, emitTxToContractSubscribers } = createSocketIo(server);

sc.subscribeAddressTransactions(ADDRESSES.VELAR, async (address, tx) => {
  console.log("new tx", tx.tx.tx_status);
  if (tx.tx.tx_status === "success" && tx.tx.tx_type === "contract_call") {
    const ca = getFungibleContractId(tx.tx.post_conditions);
    const tokenMetadata = await getTokenMetadata(ca as string);
    // console.log(ca, tokenMetadata);
    emitTxToContractSubscribers(ca as string, {
      type: "tx",
      contract: ca,
      txId: tx.tx.tx_id,
      tokenMetadata,
    });
    // refresh here
  } else {
    // const res = await createChainhook(tx.tx.tx_id);
    // console.log(res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
