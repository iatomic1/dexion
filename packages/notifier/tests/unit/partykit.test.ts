import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartyKitSender } from "../../src/channels/partykit";
import type { Notification } from "../../src/interfaces";

describe("PartyKitSender", () => {
	let sender: PartyKitSender;
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn().mockResolvedValue({ ok: true });
		(global as any).fetch = mockFetch;
	});

	it("should use default URL if none is provided", () => {
		sender = new PartyKitSender();
		expect(sender.isReady()).toBe(true);
		expect((sender as any).partyUrl).toBe("http://127.0.0.1:1999/party");
	});

	it("should be ready if partyUrl is provided", () => {
		sender = new PartyKitSender("http://custom-url");
		expect(sender.isReady()).toBe(true);
	});

	it("should reject if partyUrl is missing when sending", async () => {
		(sender as any).partyUrl = "";
		const notification: Notification = {
			message: "Hello",
			recipient: { id: "room1" },
		} as any;
		await expect(sender.send(notification)).rejects.toThrow(
			"PartyKitSender is not ready (partyUrl not configured).",
		);
	});

	it("should reject if recipient id is missing", async () => {
		sender = new PartyKitSender("http://custom-url");
		const notification: Notification = {
			message: "Hello",
			recipient: {} as any,
		};
		await expect(sender.send(notification)).rejects.toThrow(
			"Recipient ID (room ID) is missing for PartyKit notification",
		);
	});

	it("should call fetch with correct params", async () => {
		sender = new PartyKitSender("http://custom-url");
		const notification: Notification = {
			message: "Hello Party",
			recipient: { id: "room42" },
		} as any;

		await sender.send(notification);

		expect(mockFetch).toHaveBeenCalledWith(
			"http://custom-url/parties/notifications/room42",
			{
				method: "POST",
				body: JSON.stringify("Hello Party"),
				headers: { "Content-Type": "application/json" },
			},
		);
	});

	it("should propagate fetch errors", async () => {
		mockFetch.mockRejectedValue(new Error("Network down"));
		sender = new PartyKitSender("http://custom-url");
		const notification: Notification = {
			message: "fail test",
			recipient: { id: "roomX" },
		} as any;

		await expect(sender.send(notification)).rejects.toThrow("Network down");
	});

	it("should log destroy without error", () => {
		sender = new PartyKitSender();
		expect(() => sender.destroy()).not.toThrow();
	});
});
