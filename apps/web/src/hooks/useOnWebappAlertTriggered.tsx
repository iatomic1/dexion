"use client";
import { useEffect, useRef } from "react";
import { useSocket } from "~/contexts/SocketProvider";
import { TriggeredAlertPayload } from "~/types/socket";

export const useOnWebappAlertTriggered = (
	onAlert: (data: TriggeredAlertPayload) => void,
) => {
	const { socket, isConnected } = useSocket();
	const savedHandler = useRef(onAlert);

	useEffect(() => {
		if (!socket || !isConnected) return;
		const eventListener = (data: TriggeredAlertPayload) => {
			if (savedHandler.current) savedHandler.current(data);
		};

		socket.on("alert_triggered", eventListener);

		return () => {
			socket.off("alert_triggered", eventListener);
		};
	}, [socket, isConnected]);
};
