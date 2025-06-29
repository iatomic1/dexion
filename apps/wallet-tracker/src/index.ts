import { initializeRedis } from "./initRedis";
import { setupMempoolSubscription } from "./mempoolTracker";

async function main() {
  try {
    await initializeRedis();
    setupMempoolSubscription();
    console.log("Wallet tracker is running.");
  } catch (err) {
    console.error("Failed to start wallet tracker", err);
    process.exit(1);
  }
}

main();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (process.env.NODE_ENV === "production") {
    console.error("Critical error, shutting down...");
    process.exit(1);
  }
});
