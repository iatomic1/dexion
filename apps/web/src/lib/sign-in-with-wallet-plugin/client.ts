import type { BetterAuthClientPlugin } from "better-auth";
import type { siws } from ".";

type SiwePlugin = typeof siws;

export const siweClient = () => {
	return {
		id: "siws",
		$InferServerPlugin: {} as ReturnType<SiwePlugin>,
	} satisfies BetterAuthClientPlugin;
};
