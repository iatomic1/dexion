import type { TurnkeySDKServerConfig } from "@turnkey/sdk-server";
import { SignerError, ValidationError } from "../errors/SignerError";
import { TurnkeyProvider } from "../providers/TurnkeyProvider";
import { type SignerConfig } from "../types";
import { StacksSigner } from "./StacksSigner";

export class SignerFactory {
	static create(config: SignerConfig, turnkeyConfig: TurnkeySDKServerConfig) {
		switch (config.blockchain) {
			case "stacks":
				return this.createStacksSigner(config, turnkeyConfig);
			default:
				throw new SignerError(
					`Unsupported blockchain: ${config.blockchain}`,
					"UNSUPPORTED_BLOCKCHAIN",
				);
		}
	}

	private static createStacksSigner(
		config: SignerConfig,
		turnkeyConfig: TurnkeySDKServerConfig,
	): StacksSigner {
		if (config.provider !== "turnkey") {
			throw new SignerError(
				`Unsupported provider: ${config.provider}`,
				"UNSUPPORTED_PROVIDER",
			);
		}
		if (
			!turnkeyConfig ||
			!turnkeyConfig.apiPrivateKey ||
			!turnkeyConfig.defaultOrganizationId ||
			!turnkeyConfig.apiPublicKey
		) {
			throw new ValidationError("Missing turnkey config");
		}

		const turnkeyProvider = new TurnkeyProvider(
			config.walletConfig,
			turnkeyConfig,
		);

		return new StacksSigner({
			network: config.network,
			provider: turnkeyProvider,
		});
	}
}
