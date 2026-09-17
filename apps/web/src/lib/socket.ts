import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(serverUrl: string) {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const s = io(serverUrl, {
			transports: ["websocket", "polling"],
		});
		s.on("connect", () => {
			console.log("COnnected", s.id);
		});
		s.on("disconnect", () => {
			console.log("DisCOnnected");
		});
		setSocket(s);
		return () => {
			s.disconnect();
		};
	}, [serverUrl]);

	return socket;
}
