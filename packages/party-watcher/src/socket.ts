// stacks-socket.ts
import { StacksApiSocketClient } from "@stacks/blockchain-api-client";

// for testnet, replace with https://api.testnet.hiro.so
const socketUrl = "https://api.mainnet.hiro.so";

let socketClient: StacksApiSocketClient | null = null;

// Lazy initialization function
export function getSocketClient(): StacksApiSocketClient {
  if (!socketClient) {
    socketClient = new StacksApiSocketClient({ url: socketUrl });
  }
  return socketClient;
}

// Optional: cleanup function
export function closeSocketClient() {
  if (socketClient) {
    // Close the connection if the client has a close method
    // socketClient.close?.();
    socketClient = null;
  }
}
