import { io, Socket } from "socket.io-client";
import { TOKEN_WATCHER_API_BASE_URL } from "./constants";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(TOKEN_WATCHER_API_BASE_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
