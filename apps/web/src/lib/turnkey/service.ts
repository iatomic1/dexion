"use server";
import {
  makeUnsignedSTXTokenTransfer,
  broadcastTransaction,
  UnsignedTokenTransferOptions,
  createMessageSignature,
  validateStacksAddress,
} from "@stacks/transactions";
import { User } from "better-auth";
import { turnkeyServer } from "./api-client";

export const createSubOrganization = async (userInfo: User) => {
  const response = await turnkeyServer.createSubOrganization({
    subOrganizationName: `User ${userInfo.id}`,
    rootUsers: [
      {
        userName: userInfo.email.split("@")[0] as string,
        userEmail: userInfo.email,
        authenticators: [],
        apiKeys: [
          {
            apiKeyName: `DexBot-${userInfo.id}`,
            publicKey: process.env.TURNKEY_API_PUBLIC_KEY as string,
            curveType: "API_KEY_CURVE_SECP256K1",
          },
        ],
        oauthProviders: [],
      },
    ],
    rootQuorumThreshold: 1,
    wallet: {
      walletName: "Default Stacks Wallet",
      accounts: [
        {
          curve: "CURVE_SECP256K1",
          pathFormat: "PATH_FORMAT_BIP32",
          path: "m/44'/5757'/0'/0/0",
          addressFormat: "ADDRESS_FORMAT_COMPRESSED",
        },
      ],
    },
  });

  return response;
};

export async function sendStacksWithTurnkey(
  walletPubKey: string,
  walletAddr: string,
  recipient: string,
  subOrgId: string,
) {
  try {
    // Validate inputs
    if (!walletPubKey || !walletAddr || !recipient || !subOrgId) {
      throw new Error("Missing required parameters");
    }

    if (!validateStacksAddress(recipient)) {
      throw new Error(`Invalid recipient address: ${recipient}`);
    }

    // --- (2) Build unsigned STX transfer ---
    console.log("Building unsigned STX transfer...");
    const txOptions: UnsignedTokenTransferOptions = {
      recipient: recipient,
      amount: 10n,
      publicKey: walletPubKey,
      fee: 200n,
      network: "mainnet",
      memo: "Test payment",
    };

    let unsignedTx;
    try {
      unsignedTx = await makeUnsignedSTXTokenTransfer(txOptions);
    } catch (error) {
      throw new Error(
        `Failed to create unsigned transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // --- (3) Get the transaction hash to sign ---
    console.log("Computing transaction hash...");
    let sighash;
    let sighashHex;
    try {
      sighash = unsignedTx.signBegin();
      sighashHex = sighash.toString("hex");
    } catch (error) {
      throw new Error(
        `Failed to compute transaction hash: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // --- (4) Sign with Turnkey ---
    console.log("Signing with Turnkey...");
    let signRes;
    try {
      signRes = await turnkeyServer.signRawPayload({
        timestampMs: Date.now().toString(),
        organizationId: subOrgId,
        signWith: walletPubKey,
        payload: sighashHex,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP", // Hash is already computed
      });
    } catch (error) {
      throw new Error(
        `Turnkey signing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Validate Turnkey response
    if (!signRes?.activity?.result?.signRawPayloadResult) {
      throw new Error("Invalid Turnkey response: missing signature result");
    }

    const { r, s, v } = signRes.activity.result.signRawPayloadResult;

    if (!r || !s || v === undefined) {
      throw new Error("Invalid signature components from Turnkey");
    }

    console.log("Creating and attaching signature...");
    try {
      const rBuff = Buffer.from(r, "hex");
      const sBuff = Buffer.from(s, "hex");
      const recoveryId = v ? 1 : 0;

      if (rBuff.length !== 32 || sBuff.length !== 32) {
        throw new Error("Invalid signature component length");
      }

      const sigBuff = Buffer.concat([rBuff, sBuff, Buffer.from([recoveryId])]);
      const signature = createMessageSignature(sigBuff.toString("hex"));

      const spendingCondition = unsignedTx.auth.spendingCondition;
      if ("signature" in spendingCondition) {
        (spendingCondition as any).signature = signature;
      } else if ("fields" in spendingCondition) {
        // Handle multi-sig case if needed
        throw new Error(
          "Multi-sig transactions not supported in this implementation",
        );
      } else {
        throw new Error("Unknown spending condition type");
      }
    } catch (error) {
      throw new Error(
        `Failed to create or attach signature: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const signedTx = unsignedTx;

    console.log("Broadcasting transaction...");
    let broadcastRes;
    try {
      broadcastRes = await broadcastTransaction({ transaction: signedTx });
    } catch (error) {
      throw new Error(
        `Failed to broadcast transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    if (!broadcastRes?.txid) {
      throw new Error("Invalid broadcast response: missing transaction ID");
    }

    console.log("Transaction broadcast successfully, TXID:", broadcastRes.txid);
    return {
      success: true,
      txid: broadcastRes.txid,
      message: "Transaction sent successfully",
    };
  } catch (error) {
    console.error("Error in sendStacksWithTurnkey:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      txid: null,
    };
  }
}

// export async function signStacksTransaction(
//   unsignedTxHex: string,
//   signerAddress: string,
//   orgId: string
// ) {
//   try {
//     const signResult = await turnkeyServer.signRawPayload({
//       organizationId: orgId,
//       signWith: signerAddress,
//       payload: unsignedTxHex,
//       encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
//       hashFunction: "HASH_FUNCTION_SHA256", // Stacks typically uses SHA256
//     });
//
//     return signResult;
//   } catch (error) {
//     console.error("Error signing Stacks transaction:", error);
//     throw error;
//   }
// }
