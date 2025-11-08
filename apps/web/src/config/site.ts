import { SOCIALS } from "@dexion/shared";

const siteConfig = {
	title: "Dexion",
	socials: SOCIALS,
	features: {
		walletTracking: false,
		priceAlerts: true,
		trading: false,
		signing: false,
		unlinkTelegram: false,
		ott: false,
	},
	authSuccessRedirectUrl: "/settings",
};
export default siteConfig;
