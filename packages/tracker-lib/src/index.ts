import { initializeRedis } from "./initRedis";
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { setupMempoolSubscription } from "./mempoolTracker";
import { setupSocketHandlers } from "./socket";

const PORT = 3005;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.CLIENT_URL || ""]
        : ["*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});
setupSocketHandlers(io);
setupMempoolSubscription(io, "3cb4239c-a495-4c73-a7c9-6e3f85b0c9e9");
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initializeRedis().catch((err) => {
  console.error("Failed to initialize Redis", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);

  if (process.env.NODE_ENV === "production") {
    console.error("Critical error, shutting down...");
    process.exit(1);
  }
});
