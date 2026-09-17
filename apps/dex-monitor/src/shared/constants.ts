import { config } from "@/config";

// PRLLY NOT GONNA UPDATE OFTEN
export const PROD_ALERT_CHANNELS = [
	{
		id: "90ffc42f-6806-449b-b6d2-35674a2344e1",
		name: "email",
		description: "Email notification",
		createdAt: "2025-10-18T02:58:44.644545+01:00",
	},
	{
		id: "0001b7da-9821-45f5-a67c-a8cbc9009f5b",
		name: "telegram",
		description: "Telegram direct message",
		createdAt: "2025-10-18T02:58:44.644545+01:00",
	},
	{
		id: "26abcc6a-9991-4b54-acd2-ea1607ba2a5c",
		name: "webapp",
		description: "In-app toast notifications",
		createdAt: "2025-10-18T02:58:44.644545+01:00",
	},
	{
		id: "3985669c-e938-4343-a227-9c43833db825",
		name: "webhook",
		description: "Custom webhook endpoint",
		createdAt: "2025-10-18T02:58:44.644545+01:00",
	},
];

export const DEV_ALERT_CHANNELS = [
	{
		id: "0533ef9f-55b7-4ff8-9da3-875b8250eef9",
		name: "telegram",
		description: "Telegram direct message",
		created_at: "2026-09-15 16:48:56.004683+00",
	},
	{
		id: "9a79a343-87cd-49f1-9f88-200e141036bb",
		name: "webhook",
		description: "Custom webhook endpoint",
		created_at: "2026-09-15 16:48:56.004683+00",
	},
	{
		id: "9a8ce38c-45fb-49b5-bb21-0dfa1117987d",
		name: "email",
		description: "Email notification",
		created_at: "2026-09-15 16:48:56.004683+00",
	},
	{
		id: "bdeffefc-f8f4-46f1-8c2c-4b1c5fce1377",
		name: "webapp",
		description: "In-app toast notifications",
		created_at: "2026-09-15 16:48:56.004683+00",
	},
];
export const ALERT_CHANNELS =
	config.ENVIRONMENT === "development"
		? DEV_ALERT_CHANNELS
		: PROD_ALERT_CHANNELS;
