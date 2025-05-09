import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3008", {
      transports: ["websocket"],
    });
  }
  return socket;
};
