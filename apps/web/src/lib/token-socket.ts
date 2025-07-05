import { TOKEN_WATCHER_API_BASE_URL } from "@repo/shared-constants/constants.ts";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
	if (!socket) {
		socket = io(TOKEN_WATCHER_API_BASE_URL, {
			transports: ["websocket"],
		});
	}
	return socket;
};
