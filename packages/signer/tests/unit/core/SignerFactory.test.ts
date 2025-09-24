import { validateStacksAddress } from "@stacks/transactions";
import type { TurnkeySDKServerConfig } from "@turnkey/sdk-server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	NetworkType,
	type SignerConfig,
	SignerError,
	SignerFactory,
	StacksSigner,
	ValidationError,
} from "../../../src";

vi.mock("@stacks/transactions", () => ({
	validateStacksAddress: vi.fn(),
}));

describe("SignerFactory", () => {
	const validTurnkeyConfig: TurnkeySDKServerConfig = {
		apiPrivateKey: "private",
		apiPublicKey: "public",
		defaultOrganizationId: "org",
		apiBaseUrl: "",
	};

	const baseConfig: SignerConfig = {
		blockchain: "stacks",
		provider: "turnkey",
		network: NetworkType.TESTNET,
		walletConfig: {
			subOrgID: "550e8400-e29b-41d4-a716-446655440000",
			wallet: {
				address: "SP38PHX6CDTPRDMWEYEZ2PMQNHH6K8BYYX9KVW76X",
				publicKey: "string",
			},
		},
	};

	beforeEach(() => {
		// Reset mock for each test, defaulting to true
		(validateStacksAddress as any).mockReturnValue(true);
	});

	it("creates a StacksSigner when blockchain=stacks and provider=turnkey", () => {
		const signer = SignerFactory.create(baseConfig, validTurnkeyConfig);
		expect(signer).toBeInstanceOf(StacksSigner);
	});

	it("throws SignerError when blockchain is unsupported", () => {
		const badConfig = { ...baseConfig, blockchain: "ethereum" } as any;
		expect(() => SignerFactory.create(badConfig, validTurnkeyConfig)).toThrow(
			new SignerError(
				"Unsupported blockchain: ethereum",
				"UNSUPPORTED_BLOCKCHAIN",
			),
		);
	});

	it("throws SignerError when provider is unsupported", () => {
		const badConfig = { ...baseConfig, provider: "other" } as any;
		expect(() => SignerFactory.create(badConfig, validTurnkeyConfig)).toThrow(
			new SignerError("Unsupported provider: other", "UNSUPPORTED_PROVIDER"),
		);
	});

	it("throws ValidationError when turnkeyConfig is null", () => {
		expect(() =>
			SignerFactory.create(
				baseConfig,
				null as unknown as TurnkeySDKServerConfig,
			),
		).toThrow(new ValidationError("Missing turnkey config"));
	});

	it("throws ValidationError if subOrgID is not a valid UUID", () => {
		const badConfig = {
			...baseConfig,
			walletConfig: {
				...baseConfig.walletConfig,
				subOrgID: "not-a-uuid",
			},
		} as any;

		expect(() => SignerFactory.create(badConfig, validTurnkeyConfig)).toThrow(
			new ValidationError("Invalid subOrgID, must be a UUID"),
		);
	});

	it("throws ValidationError if address is invalid for stacks", () => {
		(validateStacksAddress as any).mockReturnValue(false);

		const badConfig = {
			...baseConfig,
			walletConfig: {
				...baseConfig.walletConfig,
				wallet: {
					...baseConfig.walletConfig.wallet,
					address: "invalid-address",
				},
			},
		} as any;

		expect(() => SignerFactory.create(badConfig, validTurnkeyConfig)).toThrow(
			new ValidationError("Invalid Stacks wallet address"),
		);
	});

	it("creates signer if subOrgID is valid UUID and address validates", () => {
		(validateStacksAddress as any).mockReturnValue(true);

		const goodConfig = {
			...baseConfig,
			walletConfig: {
				...baseConfig.walletConfig,
				subOrgID: "550e8400-e29b-41d4-a716-446655440000",
				wallet: {
					...baseConfig.walletConfig.wallet,
					address: "SP38PHX6CDTPRDMWEYEZ2PMQNHH6K8BYYX9KVW76X",
				},
			},
		} as any;

		const signer = SignerFactory.create(goodConfig, validTurnkeyConfig);
		expect(signer).toBeInstanceOf(StacksSigner);
	});
});
