import { validateContractAddress } from "@repo/tokens/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../../src";
import { Validator } from "../../../src/utils/validation";

vi.mock("@repo/tokens/utils", () => ({
	validateContractAddress: vi.fn(),
}));

describe("Validator", () => {
	describe("validateContractAddress", () => {
		it("should not throw if address is valid", () => {
			(validateContractAddress as any).mockReturnValue(true);

			expect(() =>
				Validator.validateContractAddress("ST123.contract"),
			).not.toThrow();
		});

		it("should throw ValidationError if address is invalid", () => {
			(validateContractAddress as any).mockReturnValue(false);

			expect(() =>
				Validator.validateContractAddress("bad-address"),
			).toThrowError(ValidationError);
		});
	});

	describe("validateContractCall", () => {
		beforeEach(() => {
			(validateContractAddress as any).mockReturnValue(true);
		});

		it("should not throw for valid params", () => {
			const params = {
				contractAddress: "ST123.contract",
				contractName: "my-contract",
				functionName: "do-something",
				functionArgs: [],
			} as any;

			expect(() => Validator.validateContractCall(params)).not.toThrow();
		});

		it("should throw if contract address invalid", () => {
			(validateContractAddress as any).mockReturnValue(false);

			const params = {
				contractAddress: "bad",
				contractName: "my-contract",
				functionName: "do-something",
				functionArgs: [],
			} as any;

			expect(() => Validator.validateContractCall(params)).toThrowError(
				ValidationError,
			);
		});

		it("should throw if contract name missing", () => {
			const params = {
				contractAddress: "ST123.contract",
				contractName: "   ",
				functionName: "do-something",
				functionArgs: [],
			} as any;

			expect(() => Validator.validateContractCall(params)).toThrowError(
				/Contract name is required/,
			);
		});

		it("should throw if function name missing", () => {
			const params = {
				contractAddress: "ST123.contract",
				contractName: "my-contract",
				functionName: "",
				functionArgs: [],
			} as any;

			expect(() => Validator.validateContractCall(params)).toThrowError(
				/Function name is required/,
			);
		});

		it("should throw if functionArgs is not array", () => {
			const params = {
				contractAddress: "ST123.contract",
				contractName: "my-contract",
				functionName: "fn",
				functionArgs: "not-an-array" as any,
			} as any;

			expect(() => Validator.validateContractCall(params)).toThrowError(
				/Function arguments must be an array/,
			);
		});
	});

	describe("validateHexString", () => {
		it("should not throw for valid hex string", () => {
			expect(() =>
				Validator.validateHexString("deadbeef", "testHex"),
			).not.toThrow();
		});

		it("should throw if not a string", () => {
			expect(() =>
				Validator.validateHexString(123 as any, "testHex"),
			).toThrowError(/testHex must be a string/);
		});

		it("should throw if invalid hex string", () => {
			expect(() =>
				Validator.validateHexString("not-hex", "testHex"),
			).toThrowError(/testHex must be a valid hex string/);
		});
	});
});
