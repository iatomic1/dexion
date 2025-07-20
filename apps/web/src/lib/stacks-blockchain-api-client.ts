import { createClient } from "@stacks/blockchain-api-client";

export const client = createClient({
	baseUrl: "https://api.mainnet.hiro.so",
});
