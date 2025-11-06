import { FRONTEND_URL } from "@dexion/shared";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: `${FRONTEND_URL}/`,
			lastModified: new Date("2025-10-01"),
			changeFrequency: "weekly",
			priority: 1.0,
		},
		{
			url: `${FRONTEND_URL}/login`,
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${FRONTEND_URL}/signup`,
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${FRONTEND_URL}/reset`,
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${FRONTEND_URL}/recover-account`,
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];
}
