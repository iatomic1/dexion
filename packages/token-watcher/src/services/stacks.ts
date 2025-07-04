import { StacksApiSocketClient } from "@stacks/blockchain-api-client";

// for testnet, replace with https://api.testnet.hiro.so
const socketUrl = "https://api.mainnet.hiro.so";

export const sc = new StacksApiSocketClient({ url: socketUrl });
