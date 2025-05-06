import { Server, Socket } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    console.log("New client connected:", socket.id, userId);

    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} connected`);
    }

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });
};
