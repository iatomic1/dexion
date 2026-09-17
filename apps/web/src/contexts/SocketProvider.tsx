"use client";

import { REALTIME_WEBSOCKET_URL } from "@dexion/shared";
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
	socket: null,
	isConnected: false,
});

interface SocketProviderProps {
	children: React.ReactNode;
	token?: string | null;
}

const WS_URL = REALTIME_WEBSOCKET_URL;

export const SocketProvider: React.FC<SocketProviderProps> = ({
	children,
	token,
}) => {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);
	useEffect(() => {
		if (!token || typeof window === "undefined") {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
				setIsConnected(false);
			}
			return;
		}

		const socketInstance = io(WS_URL, {
			auth: { token },
			transports: ["websocket"],
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			autoConnect: true,
		});

		socketRef.current = socketInstance;
		const onConnect = () => {
			setIsConnected(true);
		};
		const onDisconnect = () => {
			setIsConnected(false);
		};

		const onConnectError = (err: Error) => {
			console.error("[Socket] Connection error:", err.message);
			setIsConnected(false);
		};

		socketInstance.on("connect", onConnect);
		socketInstance.on("disconnect", onDisconnect);
		socketInstance.on("connect_error", onConnectError);

		return () => {
			socketInstance.off("connect", onConnect);
			socketInstance.off("disconnect", onDisconnect);
			socketInstance.off("connect_error", onConnectError);
			socketInstance.disconnect();
			socketRef.current = null;
			setIsConnected(false);
		};
	}, [token]);

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};
