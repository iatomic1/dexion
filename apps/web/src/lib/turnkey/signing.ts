"use server";
import { bytesToHex } from "@stacks/common";
import {
  AnchorMode,
  broadcastTransaction,
  createMessageSignature,
  getAddressFromPublicKey,
  isSingleSig,
  makeUnsignedSTXTokenTransfer,
  TransactionSigner,
} from "@stacks/transactions";
import { Buffer } from "buffer";
import { turnkeyServer } from "./api-client";

export const sendStxWithTurnKey = async (
  walletPubKey: string,
  walletAddr: string,
  recipient: string,
  subOrgId: string,
) => {
  console.log("=== DEBUGGING ADDRESS/KEY MISMATCH ===");
  console.log("Input wallet public key:", walletPubKey);
  console.log("Input wallet address:", walletAddr);

  try {
    const stacksAddr = getAddressFromPublicKey(walletPubKey);
    console.log("Stacks address derived from public key:", stacksAddr);
    console.log(stacksAddr === walletAddr);

    if (stacksAddr !== walletAddr) {
      console.log("❌ MISMATCH DETECTED!");
      console.log("Expected (walletAddr):", walletAddr);
      console.log("Derived (from pubkey):", stacksAddr);

      // OPTION 2: Use the derived address instead of the input address
      console.log("🔧 ATTEMPTING FIX: Using derived address for signing");
      walletAddr = stacksAddr; // Use the correct address
    }
  } catch (error) {
    console.log("Error getting public key from Turnkey:", error);
  }

  const unsignedTx = await makeUnsignedSTXTokenTransfer({
    recipient: recipient,
    amount: 1n,
    anchorMode: AnchorMode.Any,
    publicKey: walletPubKey,
    network: "mainnet",
  });

  const signer = new TransactionSigner(unsignedTx);
  const sigHash = signer.sigHash;

  let signRes;
  try {
    signRes = await turnkeyServer.signRawPayload({
      timestampMs: Date.now().toString(),
      organizationId: subOrgId,
      signWith: walletPubKey,
      payload: sigHash,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_NO_OP",
    });
  } catch (error) {
    throw new Error(
      `Turnkey signing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  const result = signRes?.activity?.result?.signRawPayloadResult;
  if (!result || !result.r || !result.s) {
    throw new Error("Invalid Turnkey signature response");
  }

  console.log("Turnkey signature result:", result);

  const rBuf = Buffer.from(result.r, "hex");
  const sBuf = Buffer.from(result.s, "hex");

  // The v value from Turnkey is already the recovery ID (0-3)
  // Don't subtract 27 unless it's actually in Ethereum format (27+)
  const vValue = parseInt(result.v, 16);
  let recoveryId = vValue;

  // Only adjust if it's in Ethereum format (27, 28, 29, 30)
  if (vValue >= 27) {
    recoveryId = vValue - 27;
  }

  console.log("Original v value:", vValue);
  console.log("Recovery ID:", recoveryId);

  // Validate recovery ID is in valid range (0-3)
  if (recoveryId < 0 || recoveryId > 3) {
    throw new Error(`Invalid recovery ID: ${recoveryId}. Must be 0-3.`);
  }

  // Create the recoverable signature format: [recovery_id][r][s]
  const recoveryIdBuf = Buffer.from([recoveryId]);
  const fullSig = Buffer.concat([recoveryIdBuf, rBuf, sBuf]);

  console.log("Full signature length:", fullSig.length); // Should be 65 bytes
  console.log("Full signature hex:", bytesToHex(fullSig));

  const msgSig = createMessageSignature(bytesToHex(fullSig));
  console.log("Message signature:", msgSig);

  if (!unsignedTx.auth.spendingCondition) {
    throw new Error(
      "Cannot set signature on transaction without spending condition",
    );
  }

  if (isSingleSig(unsignedTx.auth.spendingCondition)) {
    // @ts-expect-error would fix later
    unsignedTx.auth.spendingCondition.signature = msgSig;
  } else {
    throw new Error("Only single-sig transactions are supported");
  }

  const txId = await broadcastTransaction(unsignedTx, "mainnet");
  console.log("Broadcasted TX ID:", txId);
  return txId;
};
