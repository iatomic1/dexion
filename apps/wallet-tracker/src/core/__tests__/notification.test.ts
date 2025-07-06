import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Notification } from "../../core/notification";

const mockNotifierSend = mock(() => Promise.resolve());
const mockGenerateTelegramMessage = mock(() => Promise.resolve("test message"));

// Mock the modules
mock.module("@repo/notifier", () => ({
	NotifierClient: mock(() => ({
		send: mockNotifierSend,
	})),
}));

mock.module("../../core/telegram-messages", () => ({
	generateTelegramMessage: mockGenerateTelegramMessage,
}));

describe("Notification", () => {
	let notification: Notification;

	beforeEach(() => {
		mockNotifierSend.mockClear();
		mockGenerateTelegramMessage.mockClear();
		notification = new Notification();
	});

	it("should send a telegram notification", async () => {
		mockGenerateTelegramMessage.mockResolvedValue("test message");

		await notification.send(
			{ id: "telegram:123", nickname: "test" },
			{
				action: "Swap",
				details: { sent: { contractId: "a" }, received: { contractId: "b" } },
				txId: "0x123",
			},
		);

		expect(mockNotifierSend).toHaveBeenCalledWith("telegram", {
			message: "test message",
			recipient: { id: "123" },
			buttons: [
				[
					{ text: "Trade on Dexion", url: "https://dexion.io/swap/a/b" },
					{ text: "View on STXWatch", url: "https://stxwatch.com/txid/0x123" },
				],
			],
			parseMode: "HTML",
		});
	});
});
