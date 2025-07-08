import {
	Turnkey,
	TurnkeyApiClient,
	type TurnkeySDKServerConfig,
} from "@turnkey/sdk-server";
import { type Session } from "@turnkey/sdk-types";
// import { turnkeyConfig } from "../config";
import { TurnkeyError } from "../errors";
import type { SignerConfig } from "../types";
import type { SigningResult } from "../types/turnkey";

export class TurnkeyProvider {
	private turnkey: TurnkeyApiClient;
	private userConfig: SignerConfig["walletConfig"];

	constructor(
		userConfig: SignerConfig["walletConfig"],
		turnkeyConfig: TurnkeySDKServerConfig,
	) {
		const turnkeyServerClient = new Turnkey(turnkeyConfig).apiClient();
		this.turnkey = turnkeyServerClient;
		this.userConfig = userConfig;
	}

	async getAccount() {
		return this.userConfig;
	}

	async signTX(
		payload: string,
		pubKey: string,
		organizationId: string,
	): Promise<SigningResult> {
		try {
			console.log("signing with pubKey", pubKey);
			const signature = await this.turnkey.signRawPayload({
				payload,
				organizationId,
				signWith: pubKey,
				encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
				hashFunction: "HASH_FUNCTION_NO_OP",
			});

			if (!signature) {
				throw new TurnkeyError("Failed to get signature from Turnkey");
			}

			return {
				v: signature.v,
				r: signature.r.padStart(64, "0"),
				s: signature.s.padStart(64, "0"),
			};
		} catch (error) {
			throw new TurnkeyError("Failed to sign payload", error as Error);
		}
	}
}
