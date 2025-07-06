import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock Senders
const mockTelegramSenderInstance = {
	send: mock(() => Promise.resolve()),
	isReady: mock(() => true),
	destroy: mock(() => Promise.resolve()),
};

const mockPartyKitSenderInstance = {
	send: mock(() => Promise.resolve()),
	isReady: mock(() => true),
	destroy: mock(() => Promise.resolve()),
};

mock.module("./channels/telegram", () => ({
	TelegramSender: mock(() => mockTelegramSenderInstance),
}));

mock.module("./channels/partykit", () => ({
	PartyKitSender: mock(() => mockPartyKitSenderInstance),
}));

// Import after mocking
import { NotifierClient } from "./index";
import type { Notification, NotificationChannel } from "./interfaces";

// Helper function to create a notification
const createNotification = (
	message: string,
	recipientId: string,
): Notification => ({
	message,
	recipient: { id: recipientId },
});

describe("NotifierClient", () => {
	beforeEach(() => {
		// Reset all mocks
		mock.restore();
		mockTelegramSenderInstance.send = mock(() => Promise.resolve());
		mockTelegramSenderInstance.isReady = mock(() => true);
		mockTelegramSenderInstance.destroy = mock(() => Promise.resolve());

		mockPartyKitSenderInstance.send = mock(() => Promise.resolve());
		mockPartyKitSenderInstance.isReady = mock(() => true);
		mockPartyKitSenderInstance.destroy = mock(() => Promise.resolve());
	});

	it("should initialize correctly with all senders", () => {
		const client = new NotifierClient();
		expect(client).toBeInstanceOf(NotifierClient);

		// Verify senders were instantiated
		const TelegramSenderMock = mock.module(
			"./channels/telegram",
		).TelegramSender;
		const PartyKitSenderMock = mock.module(
			"./channels/partykit",
		).PartyKitSender;

		expect(TelegramSenderMock).toHaveBeenCalledTimes(1);
		expect(PartyKitSenderMock).toHaveBeenCalledTimes(1);
	});

	describe("send method", () => {
		it("should call telegramSender.send for telegram channel if ready", async () => {
			mockTelegramSenderInstance.isReady.mockReturnValue(true);
			mockTelegramSenderInstance.send.mockResolvedValue(undefined);

			const client = new NotifierClient();
			const notification = createNotification("Hello Telegram", "chat123");
			await client.send("telegram", notification);

			expect(mockTelegramSenderInstance.isReady).toHaveBeenCalledTimes(1);
			expect(mockTelegramSenderInstance.send).toHaveBeenCalledWith(
				notification,
			);
		});

		it("should reject if telegramSender is not ready", async () => {
			mockTelegramSenderInstance.isReady.mockReturnValue(false);

			const client = new NotifierClient();
			const notification = createNotification("Hello Telegram", "chat123");

			await expect(client.send("telegram", notification)).rejects.toThrow(
				"Sender for channel telegram is not ready.",
			);
			expect(mockTelegramSenderInstance.send).not.toHaveBeenCalled();
		});

		it("should call partykitSender.send for partykit channel if ready", async () => {
			mockPartyKitSenderInstance.isReady.mockReturnValue(true);
			mockPartyKitSenderInstance.send.mockResolvedValue(undefined);

			const client = new NotifierClient();
			const notification = createNotification("Hello PartyKit", "room123");
			await client.send("partykit", notification);

			expect(mockPartyKitSenderInstance.isReady).toHaveBeenCalledTimes(1);
			expect(mockPartyKitSenderInstance.send).toHaveBeenCalledWith(
				notification,
			);
		});

		it("should reject if partykitSender is not ready", async () => {
			mockPartyKitSenderInstance.isReady.mockReturnValue(false);

			const client = new NotifierClient();
			const notification = createNotification("Hello PartyKit", "room123");

			await expect(client.send("partykit", notification)).rejects.toThrow(
				"Sender for channel partykit is not ready.",
			);
			expect(mockPartyKitSenderInstance.send).not.toHaveBeenCalled();
		});

		it("should reject for an unsupported channel", async () => {
			const client = new NotifierClient();
			const notification = createNotification("Hello Invalid", "user123");

			await expect(
				client.send("unsupported" as NotificationChannel, notification),
			).rejects.toThrow("Unsupported channel: unsupported");
		});

		it("should handle sender errors gracefully", async () => {
			mockTelegramSenderInstance.isReady.mockReturnValue(true);
			mockTelegramSenderInstance.send.mockRejectedValue(
				new Error("Send failed"),
			);

			const client = new NotifierClient();
			const notification = createNotification("Hello Telegram", "chat123");

			await expect(client.send("telegram", notification)).rejects.toThrow(
				"Send failed",
			);
			expect(mockTelegramSenderInstance.send).toHaveBeenCalledWith(
				notification,
			);
		});
	});

	describe("destroyAll method", () => {
		it("should call destroy on all senders", async () => {
			const client = new NotifierClient();
			await client.destroyAll();

			expect(mockTelegramSenderInstance.destroy).toHaveBeenCalledTimes(1);
			expect(mockPartyKitSenderInstance.destroy).toHaveBeenCalledTimes(1);
		});

		it("should handle destroy errors gracefully", async () => {
			mockTelegramSenderInstance.destroy.mockRejectedValue(
				new Error("Destroy failed"),
			);
			mockPartyKitSenderInstance.destroy.mockResolvedValue(undefined);

			const client = new NotifierClient();

			// Should not throw even if one destroy fails
			await expect(client.destroyAll()).resolves.not.toThrow();

			expect(mockTelegramSenderInstance.destroy).toHaveBeenCalledTimes(1);
			expect(mockPartyKitSenderInstance.destroy).toHaveBeenCalledTimes(1);
		});
	});
});
