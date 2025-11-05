import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: "https://dexion.pro/",
			lastModified: new Date("2025-10-01"),
			changeFrequency: "weekly",
			priority: 1.0,
		},
		{
			url: "https://dexion.pro/login",
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: "https://dexion.pro/signup",
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: "https://dexion.pro/reset",
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: "https://dexion.pro/recover-account",
			lastModified: new Date("2025-10-01"),
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];
}
