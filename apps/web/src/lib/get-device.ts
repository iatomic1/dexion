import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export const getDevice = async () => {
	const h = await headers();
	const userAgent = h.get("user-agent") || "";
	if (userAgent) {
		const uaParser = new UAParser(userAgent);
		const isMobile = uaParser.getDevice().type === "mobile";
		return isMobile;
	}
	return;
};
