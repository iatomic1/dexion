import { TokenWatcherServer } from "./server";

const PORT = Number(process.env.PORT) || 3008;
const server = new TokenWatcherServer(PORT);

server.start();
