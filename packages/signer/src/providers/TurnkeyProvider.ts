import { Turnkey, TurnkeyApiClient } from "@turnkey/sdk-server";
import { type Session } from "@turnkey/sdk-types";
import { turnkeyConfig } from "../config";
import { TurnkeyError } from "../errors";
import type { SignerConfig } from "../types";
import type {
	SigningResult,
	TurnkeyAccount,
	TurnkeyWallet,
} from "../types/turnkey";

export class TurnkeyProvider {
	private turnkey: TurnkeyApiClient;
	private config: SignerConfig["walletConfig"];

	constructor(config: SignerConfig["walletConfig"]) {
		const turnkeyServerClient = new Turnkey(turnkeyConfig).apiClient();
		this.turnkey = turnkeyServerClient;
		this.config = config;
	}

	async getAccount() {
		return this.config;
	}

	async signRawPayload(
		payload: string,
		address: string,
	): Promise<SigningResult> {
		try {
			const signature = await this.turnkey.signRawPayload({
				payload,
				signWith: address,
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
