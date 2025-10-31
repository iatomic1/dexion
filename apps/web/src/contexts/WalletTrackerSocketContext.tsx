"use client";
import { EXPLORER_BASE_URL } from "@dexion/shared";
import { type ParsedTransaction } from "@dexion/tokens/parser";
import { validateStacksAddress } from "@stacks/transactions";
import usePartySocket from "partysocket/react";
import React, { createContext, useCallback, useContext } from "react";
import { toast } from "sonner";
import openInNewPage from "~/lib/helpers/openInNewPage";

interface WalletNotificationData {
	type: "wallet_activity";
	action: "send_notification";
	wallet: {
		userId: string;
		nickname: string;
		address: string;
	};
	tx: ParsedTransaction;
}
function truncateAddressesFlexible(summary: string, truncateLength = 6) {
	// Split the summary into words and process each one
	const words = summary.split(" ");

	return words
		.map((word) => {
			// Check if the word looks like an address and validate it
			if (
				word.startsWith("S") &&
				word.length > 10 &&
				validateStacksAddress(word)
			) {
				if (word.length <= truncateLength * 2 + 3) {
					return word;
				}
				return `${word.slice(0, truncateLength)}...${word.slice(-truncateLength)}`;
			}
			return word;
		})
		.join(" ");
}

export interface NotificationContextValue {
	isConnected: boolean;
	userId: string;
	connectionStatus: "open" | "connecting" | "closed";
}

const NotificationContext = createContext<NotificationContextValue | null>(
	null,
);

export interface NotificationProviderProps {
	host: string;
	userId: string;
	children: React.ReactNode;
	onWalletNotification?: (notification: WalletNotificationData) => void;
	onConnected?: (userId: string) => void;
	onError?: (error: string) => void;
	autoConnect?: boolean;
}

export function NotificationProvider({
	host,
	userId,
	children,
	onWalletNotification,
	onConnected,
	onError,
	autoConnect = true,
}: NotificationProviderProps) {
	const handleWalletNotification = useCallback(
		(notification: WalletNotificationData) => {
			onWalletNotification?.(notification);
			console.log(notification);
			const tx = notification.tx;

			if (tx.protocol.toLocaleLowerCase() === "stacks") {
				toast.success(`${notification.wallet.nickname}`, {
					description: truncateAddressesFlexible(tx.summary),
					duration: 5000,
					action: {
						label: "DEXplorer",
						onClick: () => openInNewPage(`${EXPLORER_BASE_URL}txid/${tx.txId}`),
					},
				});
			}
		},
		[onWalletNotification],
	);

	const handleMessage = useCallback(
		(data: any) => {
			switch (data.type) {
				case "connected":
					console.log("Connected with ID:", data.connectionId);
					break;

				case "user_confirmed":
					console.log("User ID confirmed:", data.userId);
					break;

				case "wallet_activity":
					handleWalletNotification(data);
					break;

				case "error":
					console.error("Server error:", data.message);
					onError?.(data.message);
					toast.error("Notification Error", {
						description: data.message,
					});
					break;

				default:
					console.log("Unknown message type:", data);
			}
		},
		[handleWalletNotification, onError],
	);

	const socket = usePartySocket({
		host,
		room: userId,
		party: "notifications",
		onOpen: useCallback(() => {
			console.log(`Connected to notifications for user ${userId}`);

			socket?.send(
				JSON.stringify({
					type: "user_connect",
					userId,
				}),
			);

			onConnected?.(userId);
		}, [userId, onConnected]),

		onMessage: useCallback(
			(event: MessageEvent) => {
				try {
					const data = JSON.parse(event.data);
					handleMessage(data);
				} catch (error) {
					console.error("Error parsing message:", error);
					onError?.("Error parsing server message");
					toast.error("Message Error", {
						description: "Error parsing server message",
					});
				}
			},
			[handleMessage, onError],
		),

		onError: useCallback(
			(error: Event) => {
				console.error("WebSocket error:", error);
				onError?.("Connection error");
				toast.error("Connection Error", {
					description: "WebSocket connection error",
				});
			},
			[onError],
		),

		onClose: useCallback(() => {
			console.log("Disconnected from notification server");
		}, []),
	});

	const isConnected = socket?.readyState === WebSocket.OPEN;
	const connectionStatus: "open" | "connecting" | "closed" =
		socket?.readyState === WebSocket.OPEN
			? "open"
			: socket?.readyState === WebSocket.CONNECTING
				? "connecting"
				: "closed";

	const value: NotificationContextValue = {
		isConnected,
		userId,
		connectionStatus,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
}

export function useNotifications() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider",
		);
	}
	return context;
}
