import { type HonoAdapter } from "@bull-board/hono";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { emailQueue, swapQueue, telegramQueue, webhookQueue } from "@/queues";

export function setupBullBoard(adapter: HonoAdapter) {
	return createBullBoard({
		queues: [
			new BullMQAdapter(webhookQueue),
			new BullMQAdapter(emailQueue),
			new BullMQAdapter(swapQueue),
			new BullMQAdapter(telegramQueue),
		],
		serverAdapter: adapter,
	});
}
