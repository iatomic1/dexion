import PartySocket from "partysocket";

let socket: PartySocket | null = null;

export const getPartyKitSocket = (roomId: string) => {
  if (socket) {
    socket.close();
  }

  socket = new PartySocket({
    host: "localhost:3003",
    room: roomId,
  });

  return socket;
};
