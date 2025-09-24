import { beforeEach, describe, expect, it, vi } from "vitest";
import { TelegramSender } from "../../src/channels/telegram";
import type { Notification } from "../../src/interfaces";

vi.mock("telegraf", () => {
	return {
		Telegraf: vi.fn().mockImplementation(() => ({
			catch: vi.fn(),
			telegram: {
				sendMessage: vi.fn(),
			},
		})),
		Markup: {
			inlineKeyboard: vi.fn().mockReturnValue({ reply_markup: "mocked" }),
		},
	};
});

const { Telegraf, Markup } = await import("telegraf");

describe("TelegramSender", () => {
	let sender: TelegramSender;
	let mockSendMessage: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockSendMessage = vi.fn().mockResolvedValue({ ok: true });
		(Telegraf as any).mockImplementation(() => ({
			catch: vi.fn(),
			telegram: { sendMessage: mockSendMessage },
		}));
	});

	it("should be not ready if bot token is missing", () => {
		sender = new TelegramSender(undefined);
		expect(sender.isReady()).toBe(false);
	});

	it("should be ready if bot token is provided", () => {
		sender = new TelegramSender("fake_token");
		expect(sender.isReady()).toBe(true);
	});

	it("should reject if bot token is missing when sending", async () => {
		sender = new TelegramSender(undefined);
		const notification: Notification = {
			message: "Hello",
			recipient: { id: "123" },
		} as any;
		await expect(sender.send(notification)).rejects.toThrow(
			"Telegram Bot Token is not configured.",
		);
	});

	it("should reject if recipient id is missing", async () => {
		sender = new TelegramSender("fake_token");
		const notification: Notification = {
			message: "Hello",
			recipient: {} as any,
		};
		await expect(sender.send(notification)).rejects.toThrow(
			"Recipient ID is missing.",
		);
	});

	it("should send message with default params", async () => {
		sender = new TelegramSender("fake_token");
		const notification: Notification = {
			message: "Hello World",
			recipient: { id: "123" },
		} as any;

		await sender.send(notification);

		expect(mockSendMessage).toHaveBeenCalledWith(
			"123",
			"Hello World",
			expect.objectContaining({
				parse_mode: undefined,
				disable_web_page_preview: true,
			}),
		);
	});

	it("should send message with buttons if provided", async () => {
		sender = new TelegramSender("fake_token");
		const notification: Notification = {
			message: "Hello with buttons",
			recipient: { id: "123" },
			buttons: [["btn1"]],
		} as any;

		await sender.send(notification);

		expect(Markup.inlineKeyboard).toHaveBeenCalledWith([["btn1"]]);
		expect(mockSendMessage).toHaveBeenCalledWith(
			"123",
			"Hello with buttons",
			expect.objectContaining({
				reply_markup: "mocked",
			}),
		);
	});

	it("should throw if sendMessage fails", async () => {
		mockSendMessage.mockRejectedValue(new Error("Telegram error"));
		sender = new TelegramSender("fake_token");
		const notification: Notification = {
			message: "Test error",
			recipient: { id: "123" },
		} as any;

		await expect(sender.send(notification)).rejects.toThrow("Telegram error");
	});
});
