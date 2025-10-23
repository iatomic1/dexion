import { DexionClient } from "../DexionApiSDK";

export function createServerSDK(authToken: string, userId: string) {
	return new DexionClient({
		authToken,
		userId,
		framework: {
			type: "nextjs",
		},
	});
}
