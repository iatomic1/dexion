import { PartyKitSender } from "./channels/partykit";
import { TelegramSender } from "./channels/telegram";
import type {
  IChannelSender,
  INotifier,
  Notification,
  NotificationChannel,
  NotificationRecipient,
} from "./interfaces";

export class NotifierClient implements INotifier {
  private telegramSender: IChannelSender;
  private partykitSender: IChannelSender;

  constructor(telegramBotToken?: string, partykitUrl?: string) {
    this.telegramSender = new TelegramSender(telegramBotToken);
    this.partykitSender = new PartyKitSender(partykitUrl);

    console.log("NotifierClient initialized with all channel senders");
  }

  async send(
    channel: NotificationChannel,
    notification: Notification,
  ): Promise<void> {
    console.log(
      `Attempting to send notification via ${channel} to ${notification.recipient.id}`,
    );

    let sender: IChannelSender;

    switch (channel) {
      case "partykit":
        sender = this.partykitSender;
        break;
      case "telegram":
        sender = this.telegramSender;
        break;
      default:
        const exhaustiveCheck: never = channel;
        return Promise.reject(
          new Error(`Unsupported channel: ${exhaustiveCheck}`),
        );
    }

    if (!sender.isReady()) {
      console.warn(
        `Sender for channel ${channel} is not ready. Skipping notification.`,
      );
      return Promise.reject(
        new Error(`Sender for channel ${channel} is not ready.`),
      );
    }

    try {
      await sender.send(notification);
      console.log(`Notification successfully routed via ${channel}.`);
    } catch (error) {
      console.error(`Error sending notification via ${channel}:`, error);
      throw error;
    }
  }

  async destroyAll(): Promise<void> {
    console.log("Destroying all notifier clients...");
    if (
      this.partykitSender &&
      typeof (this.partykitSender as any).destroy === "function"
    ) {
      (this.partykitSender as any).destroy();
    }
    // Add similar destroy calls for TelegramSender if it implements a destroy method
    console.log("All notifier clients shutdown sequence initiated.");
  }
}

// Example usage (for testing, will be removed or moved)
// Ensure necessary environment variables are set (TELEGRAM_BOT_TOKEN, DISCORD_BOT_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
async function testNotifier() {
  const client = new NotifierClient();

  const telegramRecipient: NotificationRecipient = {
    id: "YOUR_TELEGRAM_CHAT_ID",
  };
  const telegramNotification: Notification = {
    message: "Hello from NotifierClient via Telegram!",
    recipient: telegramRecipient,
  };

  const partykitRecipient: NotificationRecipient = {
    id: "YOUR_PARTYKIT_ROOM_ID",
  };
  const partykitNotification: Notification = {
    message: "Hello from NotifierClient via PartyKit!",
    recipient: partykitRecipient,
  };

  if (client["telegramSender"].isReady()) {
    try {
      console.log("Sending test Telegram message...");
      await client.send("telegram", telegramNotification);
    } catch (error) {
      console.error("Test Telegram notification failed:", error);
    }
  } else {
    console.warn(
      "Telegram sender not ready, skipping. Ensure TELEGRAM_BOT_TOKEN is set.",
    );
  }

  if (client["partykitSender"].isReady()) {
    try {
      console.log("Sending test PartyKit message...");
      await client.send("partykit", partykitNotification);
    } catch (error) {
      console.error("Test PartyKit notification failed:", error);
    }
  } else {
    console.warn(
      "PartyKit sender not ready, skipping. Ensure partykitUrl is set.",
    );
  }

  await client.destroyAll();
}

if (require.main === module) {
  testNotifier();
}

export * from "./interfaces";
