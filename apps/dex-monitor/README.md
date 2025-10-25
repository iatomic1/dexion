# DEX Monitor

The DEX Monitor is a crucial backend service responsible for listening to on-chain swap events and triggering alerts based on user-defined criteria.

It's an event-driven application built with Hono, BullMQ, and TypeScript, designed to be robust and scalable.

## Features

- **Chainhook Integration**: Listens for swap events from Velar and Bitflow DEXs via Hiro's Chainhooks.
- **Job Queueing**: Uses BullMQ to queue jobs for processing swap events and sending notifications, ensuring reliability and retryability.
- **Multi-channel Notifications**: Dispatches alerts through various channels like email (via Resend) and Telegram.
- **Structured Logging**: Integrated with a shared Pino logger for consistent, production-ready logging.
- **Configuration Management**: Uses Zod to validate environment variables on startup, ensuring the application is correctly configured.
- **Bull Board UI**: Includes a Bull Board UI for monitoring the status of the job queues.

## How It Works

1.  **Webhook Ingestion**: The application exposes webhook endpoints (`/webhooks/swaps/velar` and `/webhooks/swaps/bitflow`) that listen for POST requests from Hiro Chainhooks.
2.  **Job Enqueueing**: When a valid swap event is received, the webhook handler enqueues a job into the `swap-events-queue` with the relevant transaction data.
3.  **Swap Event Processing**: The `swapEventsWorker` picks up jobs from the queue. It fetches the relevant alerts from Redis, gets the token metadata, and evaluates if any alerts should be triggered.
4.  **Notification Dispatch**: If an alert is triggered, the worker enqueues a new job into the appropriate notification queue (e.g., `email-queue`, `telegram-queue`).
5.  **Notification Delivery**: Dedicated workers for each notification channel (e.g., `emailWorker`) pick up jobs and send the actual notifications using the respective services (e.g., Resend).
6.  **Dead-Letter Queues**: If a job fails all its retry attempts, it is automatically moved to a corresponding Dead-Letter Queue (DLQ) for manual inspection and reprocessing.

## Getting Started

### Prerequisites

- Bun
- Doppler CLI for environment variable management
- Access to a Redis instance

### Installation

1.  Navigate to the root of the monorepo.
2.  Install dependencies:

    ```bash
    bun install
    ```

### Environment Variables

This service requires the following environment variables to be set. You can manage them using a `.env` file and Doppler.

- `PORT`: The port the server will run on (defaults to `4000`).
- `BULLMQ_REDIS_URL`: The Redis connection URL for BullMQ.
- `REDIS_URL`: The Redis connection URL for general application data.
- `CHAINHOOK_CONSUMER_SECRET`: A secret token to authenticate incoming webhooks.
- `HIRO_PLATFORM_API_KEY`: Your API key for the Hiro Platform.
- `RESEND_API_KEY`: Your API key for Resend (for email notifications).

### Running the Application

To start the development server with hot-reloading:

```bash
cd apps/dex-monitor
bun run dev
```

The server will start on the port specified in your environment variables (defaulting to 4000), and the Bull Board UI will be available at `/ui`.

## Scripts

- `bun run dev`: Starts the development server.
- `bun run lint`: Lints the codebase using Biome.
- `bun run test`: Runs the test suite using Vitest.
