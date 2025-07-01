import { StacksApiSocketClient } from "@stacks/blockchain-api-client";

const socketUrl = "https://api.mainnet.hiro.so";

let socketClient: StacksApiSocketClient | null = null;

export function getSocketClient(): StacksApiSocketClient {
  if (!socketClient) {
    socketClient = new StacksApiSocketClient({ url: socketUrl });
  }
  return socketClient;
}

export function closeSocketClient() {
  if (socketClient) {
    socketClient = null;
  }
}
