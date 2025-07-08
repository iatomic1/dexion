import { hexToBytes } from "@stacks/common";
import {
	broadcastTransaction,
	createMessageSignature,
	createStacksPublicKey,
	leftPadHex,
	makeUnsignedContractCall,
	makeUnsignedContractDeploy,
	makeUnsignedSTXTokenTransfer,
	PubKeyEncoding,
	publicKeyIsCompressed,
	type SingleSigSpendingCondition,
	type StacksTransactionWire,
	sigHashPreSign,
	TransactionSigner,
	type TxBroadcastResult,
	txidFromData,
	type UnsignedContractCallOptions,
	type UnsignedContractDeployOptions,
	type UnsignedTokenTransferOptions,
} from "@stacks/transactions";
import { SigningError, ValidationError } from "../errors";
import { TurnkeyProvider } from "../providers/TurnkeyProvider";
import {
	type BroadcastResult,
	NetworkType,
	type SignedTransaction,
	type TransactionTypeMap,
} from "../types";
import { BaseSigner } from "./BaseSigner";

export class StacksSigner extends BaseSigner {
	private turnkeyProvider: TurnkeyProvider;
	private network: NetworkType;

	constructor(config: { network: NetworkType; provider: TurnkeyProvider }) {
		super(config);
		this.network = config.network;
		this.turnkeyProvider = config.provider;
	}

	async signTransaction<T extends keyof TransactionTypeMap>(
		type: T,
		params: TransactionTypeMap[T],
	): Promise<SignedTransaction> {
		try {
			this.validateParams(type, params);

			const account = await this.turnkeyProvider.getAccount();
			console.log(account);
			if (!account) {
				throw new SigningError("No Ethereum account found");
			}

			const { stacksTransaction, stacksTxSigner } =
				await this.constructStacksTx(account.wallet.publicKey, type, params);

			const preSignSigHash = this.generatePreSignSigHash(
				stacksTransaction,
				stacksTxSigner,
			);
			const payload = `0x${preSignSigHash}`;

			const signature = await this.turnkeyProvider.signTX(
				payload,
				account.wallet.publicKey,
				account.subOrgID,
			);
			const nextSig = `${signature!.v}${signature!.r}${signature!.s}`;

			const nextSigHash = this.generatePostSignSigHash(
				account.wallet.publicKey,
				preSignSigHash,
				nextSig,
			);

			stacksTxSigner.sigHash = nextSigHash;
			const spendingCondition = stacksTransaction.auth
				.spendingCondition as SingleSigSpendingCondition;
			spendingCondition.signature = createMessageSignature(nextSig);

			return {
				transaction: stacksTransaction,
				txId: nextSigHash,
				// txId: txidFromData(stacksTransaction.serialize())),
			};
		} catch (error) {
			throw new SigningError("Failed to sign transaction", error as Error);
		}
	}

	async broadcastTransaction(
		signedTx: SignedTransaction,
	): Promise<TxBroadcastResult> {
		const result = await broadcastTransaction({
			transaction: signedTx.transaction,
			network: this.network,
		});

		return result;
	}

	private async constructStacksTx<T extends keyof TransactionTypeMap>(
		pubKey: string,
		type: T,
		params: TransactionTypeMap[T],
	): Promise<{
		stacksTransaction: StacksTransactionWire;
		stacksTxSigner: TransactionSigner;
	}> {
		let transaction: StacksTransactionWire;

		switch (type) {
			case "contractCall":
				transaction = await makeUnsignedContractCall({
					...(params as UnsignedContractCallOptions),
					publicKey: pubKey,
					network: this.network,
				});
				break;

			case "tokenTransfer":
				transaction = await makeUnsignedSTXTokenTransfer({
					...(params as UnsignedTokenTransferOptions),
					publicKey: pubKey,
					network: this.network,
				});
				break;

			case "smartContract":
				transaction = await makeUnsignedContractDeploy({
					...(params as UnsignedContractDeployOptions),
					publicKey: pubKey,
					network: this.network,
				});
				break;

			default:
				throw new ValidationError(`Unsupported transaction type: ${type}`);
		}

		return {
			stacksTransaction: transaction,
			stacksTxSigner: new TransactionSigner(transaction),
		};
	}

	private generatePreSignSigHash(
		transaction: StacksTransactionWire,
		signer: TransactionSigner,
	): string {
		return sigHashPreSign(
			signer.sigHash,
			transaction.auth.authType,
			transaction.auth.spendingCondition.fee,
			transaction.auth.spendingCondition.nonce,
		);
	}

	private generatePostSignSigHash(
		pubKey: string,
		preSignSigHash: string,
		nextSig: string,
	): string {
		const RECOVERABLE_ECDSA_SIG_LENGTH_BYTES = 65;
		const hashLength = 32 + 1 + RECOVERABLE_ECDSA_SIG_LENGTH_BYTES;

		const pubKeyStacksWire = createStacksPublicKey(pubKey);
		const pubKeyEncoding = publicKeyIsCompressed(pubKeyStacksWire.data)
			? PubKeyEncoding.Compressed
			: PubKeyEncoding.Uncompressed;

		const sigHash =
			preSignSigHash + leftPadHex(pubKeyEncoding.toString(16)) + nextSig;
		const sigHashBytes = hexToBytes(sigHash);

		if (sigHashBytes.byteLength > hashLength) {
			throw new ValidationError("Invalid signature hash length");
		}

		return txidFromData(sigHashBytes);
	}
}
