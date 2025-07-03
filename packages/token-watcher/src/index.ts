import { TokenWatcherServer } from "./server";
const PORT = 3008;

const server = new TokenWatcherServer(PORT);

server.start();
