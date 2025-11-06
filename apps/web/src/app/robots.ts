import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/login", "/signup", "/reset", "/recover-account"],
				disallow: [
					"/settings",
					"/alerts",
					"/trackers",
					"/pulse",
					"/portfolio",
					"/meme/",
				],
			},
		],
		sitemap: "https://dexion.pro/sitemap.xml",
	};
}
