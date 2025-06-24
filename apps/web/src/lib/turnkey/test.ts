"use server";
import {
  createMessageSignature,
  SingleSigSpendingCondition,
  StacksTransaction,
  PubKeyEncoding,
  AnchorMode,
  makeUnsignedSTXTokenTransfer,
  UnsignedTokenTransferOptions,
  broadcastTransaction,
} from "@stacks/transactions";
import { TurnkeyApiClient } from "@turnkey/sdk-server";
import { turnkeyServer } from "./api-client";
import { serializeTransaction } from "@stacks/transactions/dist/transaction";
import { createHash } from "crypto";

function attachTurnkeySignature(
  tx: StacksTransaction,
  turnkeySig: { r: string; s: string; v: string | number },
  publicKey: string,
): StacksTransaction {
  // Clean hex strings
  const r = turnkeySig.r.startsWith("0x")
    ? turnkeySig.r.slice(2)
    : turnkeySig.r;
  const s = turnkeySig.s.startsWith("0x")
    ? turnkeySig.s.slice(2)
    : turnkeySig.s;

  // Ensure r and s are 32 bytes (64 hex characters) each
  const rPadded = r.padStart(64, "0");
  const sPadded = s.padStart(64, "0");

  // Handle recovery ID - Turnkey returns string "01" but we need numeric value
  let recoveryId: number;
  if (typeof turnkeySig.v === "string") {
    recoveryId = parseInt(turnkeySig.v, 16);
  } else {
    recoveryId = turnkeySig.v;
  }

  // For Stacks, recovery ID should be 0 or 1
  // Turnkey might return 27/28 format, so normalize to 0/1
  if (recoveryId >= 27) {
    recoveryId = recoveryId - 27;
  }

  const vHex = recoveryId.toString(16).padStart(2, "0");

  // Create recoverable signature: r + s + recovery_id
  const recoverableSigHex = rPadded + sPadded + vHex;

  console.log("Signature components:", {
    r: rPadded,
    s: sPadded,
    v: vHex,
    recoveryId,
    originalV: turnkeySig.v,
    fullSig: recoverableSigHex,
    sigLength: recoverableSigHex.length,
  });

  const msgSig = createMessageSignature(recoverableSigHex);
  const condition = tx.auth.spendingCondition as SingleSigSpendingCondition;
  condition.signature = msgSig;
  condition.signatureEncoding = PubKeyEncoding.Compressed;

  return tx;
}

class TurnkeyStacksSigner {
  private turnkeyClient: TurnkeyApiClient;
  private pubKey: string;
  private address: string;
  private orgId: string;

  constructor({
    walletPubKey,
    walletAddr,
    subOrgId,
  }: {
    walletPubKey: string;
    walletAddr: string;
    subOrgId: string;
  }) {
    this.turnkeyClient = turnkeyServer;
    this.pubKey = walletPubKey;
    this.address = walletAddr;
    this.orgId = subOrgId;
  }

  getAddress(): string {
    return this.address;
  }

  async signAndAttach(tx: StacksTransaction): Promise<StacksTransaction> {
    // Get the sighash that needs to be signed
    const sigHash = tx.signBegin();

    console.log("Transaction sighash:", Buffer.from(sigHash).toString("hex"));

    try {
      const signResult = await turnkeyServer.signRawPayload({
        organizationId: this.orgId,
        signWith: this.pubKey,
        payload: sigHash,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
      });

      const { r, s, v } = signResult;

      console.log("Turnkey signature result:", { r, s, v });

      return attachTurnkeySignature(tx, { r, s, v }, this.pubKey);
    } catch (error) {
      console.error("Signing error:", error);
      throw error;
    }
  }
}

export async function transferSTX({
  walletPubKey,
  walletAddr,
  subOrgId,
  recipient,
}: {
  walletPubKey: string;
  walletAddr: string;
  subOrgId: string;
  recipient: string;
}) {
  const signer = new TurnkeyStacksSigner({
    walletPubKey,
    walletAddr,
    subOrgId,
  });

  const txOptions: UnsignedTokenTransferOptions = {
    recipient,
    amount: 10n,
    network: "mainnet",
    memo: "Turnkey transfer",
    fee: 1000n,
    anchorMode: AnchorMode.Any,
    publicKey: walletPubKey,
  };

  try {
    const tx = await makeUnsignedSTXTokenTransfer(txOptions);
    console.log("Created unsigned transaction");

    const signedTx = await signer.signAndAttach(tx);
    console.log("Transaction signed successfully");

    const serialized = serializeTransaction(signedTx);
    console.log("Signed TX (hex):", serialized.toString("hex"));

    // Verify the transaction before broadcasting
    const condition = signedTx.auth
      .spendingCondition as SingleSigSpendingCondition;
    console.log("Final spending condition:", {
      hashMode: condition.hashMode,
      signer: condition.signer,
      nonce: condition.nonce.toString(),
      fee: condition.fee.toString(),
      signatureEncoding: condition.signatureEncoding,
      signatureLength: condition.signature.data.length,
    });

    const result = await broadcastTransaction(signedTx, "mainnet");
    console.log("Broadcast result:", result);

    return signedTx;
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
}

// Manual signing following Stacks specification exactly
export async function transferSTXManual({
  walletPubKey,
  walletAddr,
  subOrgId,
  recipient,
}: {
  walletPubKey: string;
  walletAddr: string;
  subOrgId: string;
  recipient: string;
}) {
  const txOptions: UnsignedTokenTransferOptions = {
    recipient,
    amount: 10n,
    network: "mainnet",
    memo: "Turnkey transfer",
    fee: 1000n,
    anchorMode: AnchorMode.Any,
    publicKey: walletPubKey,
  };

  const tx = await makeUnsignedSTXTokenTransfer(txOptions);
  const condition = tx.auth.spendingCondition as SingleSigSpendingCondition;

  // Step 1: Clear the spending condition (set signature to empty)
  condition.signature = createMessageSignature("0".repeat(130));
  condition.signatureEncoding = PubKeyEncoding.Compressed;

  // Step 2: Serialize transaction and get initial hash
  const serializedTx = serializeTransaction(tx);
  const initialSigHash = createHash("sha256").update(serializedTx).digest();

  console.log("Initial sighash:", initialSigHash.toString("hex"));

  // Step 3: Calculate presign-sighash
  const authType = Buffer.from([0x04]); // Standard auth type
  const feeBytes = Buffer.alloc(8);
  feeBytes.writeBigUInt64BE(BigInt(condition.fee.toString()));
  const nonceBytes = Buffer.alloc(8);
  nonceBytes.writeBigUInt64BE(BigInt(condition.nonce.toString()));

  const presignData = Buffer.concat([
    initialSigHash,
    authType,
    feeBytes,
    nonceBytes,
  ]);
  const presignSigHash = createHash("sha256").update(presignData).digest();

  console.log("Presign sighash:", presignSigHash.toString("hex"));

  // Step 4: Sign the presign sighash with Turnkey
  const signResult = await turnkeyServer.signRawPayload({
    organizationId: subOrgId,
    signWith: walletPubKey,
    payload: presignSigHash.toString("hex"),
    encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
    hashFunction: "HASH_FUNCTION_NO_OP",
  });

  console.log("Manual signature result:", signResult);

  // Step 5: Construct the recoverable signature
  const { r, s, v } = signResult;
  const rClean = r.startsWith("0x") ? r.slice(2) : r;
  const sClean = s.startsWith("0x") ? s.slice(2) : s;

  let recoveryId: number;
  if (typeof v === "string") {
    recoveryId = parseInt(v, 16);
  } else {
    recoveryId = v;
  }

  // Normalize recovery ID
  if (recoveryId >= 27) {
    recoveryId = recoveryId - 27;
  }

  const recoverableSig =
    rClean.padStart(64, "0") +
    sClean.padStart(64, "0") +
    recoveryId.toString(16).padStart(2, "0");

  console.log("Final recoverable signature:", recoverableSig);

  // Step 6: Attach the signature
  condition.signature = createMessageSignature(recoverableSig);
  // Step 7: Serialize and broadcast the transaction
  const serialized = serializeTransaction(tx);
  console.log("Manually signed TX (hex):", serialized.toString("hex"));

  // Verify the transaction before broadcasting
  console.log("Final spending condition:", {
    hashMode: condition.hashMode,
    signer: condition.signer,
    nonce: condition.nonce.toString(),
    fee: condition.fee.toString(),
    signatureEncoding: createMessageSignature(recoverableSig),
    signatureLength: condition.signature.data.length,
  });

  const result = await broadcastTransaction(tx, "mainnet");
  console.log("Manual broadcast result:", result);

  return tx;
}
