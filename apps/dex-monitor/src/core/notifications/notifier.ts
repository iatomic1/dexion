import type { NotificationJobData } from "@/core/queues";

export interface INotifier {
	send(payload: NotificationJobData): Promise<void>;
}
