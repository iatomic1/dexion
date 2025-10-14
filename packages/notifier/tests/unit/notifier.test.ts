import { beforeEach, describe, expect, it, vi } from "vitest";
import  {type Notification, NotifierClient } from "../../src";
import  { PartyKitSender } from "../../src/channels/partykit";
import  { TelegramSender } from "../../src/channels/telegram";


vi.mock("../../src/channels/telegram", () => ({
  TelegramSender: vi.fn().mockImplementation(() => ({
    isReady: vi.fn().mockReturnValue(true),
    send: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../src/channels/partykit", () => ({
  PartyKitSender: vi.fn().mockImplementation(() => ({
    isReady: vi.fn().mockReturnValue(true),
    send: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  })),
}));


describe("NotifierClient", () => {
	let notifier: NotifierClient;
	const sampleNotification: Notification = {
		message: "Hello",
		recipient: { id: "1234" },
	};

	beforeEach(() => {
		vi.clearAllMocks();
		notifier = new NotifierClient("fake-token", "http://localhost:1999/party");
	});

	it("initializes with telegram and partykit senders", () => {
		expect(TelegramSender).toHaveBeenCalledWith("fake-token");
		expect(PartyKitSender).toHaveBeenCalledWith("http://localhost:1999/party");
	});

	it("sends via telegram when channel is telegram", async () => {
		await notifier.send("telegram", sampleNotification);
		const instance = (TelegramSender as any).mock.results[0].value;
		expect(instance.send).toHaveBeenCalledWith(sampleNotification);
	});

	it("sends via partykit when channel is partykit", async () => {
		await notifier.send("partykit", sampleNotification);
		const instance = (PartyKitSender as any).mock.results[0].value;
		expect(instance.send).toHaveBeenCalledWith(sampleNotification);
	});

	it("throws error for unsupported channel", async () => {
		// @ts-expect-error testing invalid channel
		await expect(notifier.send("slack", sampleNotification)).rejects.toThrow(
			"Unsupported channel",
		);
	});

	it("rejects if sender is not ready", async () => {
		const instance = (TelegramSender as any).mock.results[0].value;
		instance.isReady.mockReturnValue(false);
		await expect(notifier.send("telegram", sampleNotification)).rejects.toThrow(
			"Sender for channel telegram is not ready",
		);
	});

	it("calls destroyAll", async () => {
		const instance = (PartyKitSender as any).mock.results[0].value;
		await notifier.destroyAll();
		expect(instance.destroy).toHaveBeenCalled();
	});
});
