import { Turnkey, TurnkeyApiClient } from "@turnkey/sdk-server";
import {
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  serializeTransaction,
  TransactionSigner,
} from "@stacks/transactions";
import { turnkeyServer } from "./api-client";

// Custom Turnkey signer for Stacks
class TurnkeyStacksSigner {
  private turnkeyClient: TurnkeyApiClient;
  private organizationId: string;
  private stacksAddress: string;
  private publicKey: string;

  constructor(
    organizationId: string,
    stacksAddress: string,
    publicKey: string,
  ) {
    this.turnkeyClient = turnkeyServer;

    this.organizationId = organizationId;
    this.stacksAddress = stacksAddress;
    this.publicKey = publicKey;
  }

  // Sign a transaction hash using Turnkey
  async signTransactionHash(txHash: Uint8Array): Promise<any> {
    const hashHex = Buffer.from(txHash).toString("hex");

    const signResult = await this.turnkeyClient.signRawPayload({
      organizationId: this.organizationId,
      signWith: this.stacksAddress,
      payload: hashHex,
      encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
      hashFunction: "HASH_FUNCTION_NO_OP", // Hash is already computed
    });

    return signResult;
  }

  // Get the Stacks address
  getAddress(): string {
    return this.stacksAddress;
  }

  // Get the public key
  getPublicKey(): string {
    return this.publicKey;
  }
}

// Helper function to convert Turnkey address to Stacks address
function turnkeyAddressToStacksAddress(
  publicKeyHex: string,
  version: AddressVersion = AddressVersion.MainnetSingleSig,
): string {
  const publicKeyBuffer = Buffer.from(publicKeyHex, "hex");

  return addressFromPublicKeys(version, AddressHashMode.SerializeP2PKH, 1, [
    publicKeyBuffer,
  ]);
}

// Main function to create and sign a Stacks STX transfer
async function signStacksSTXTransfer() {
  // Initialize Turnkey signer
  const turnkeySigner = new TurnkeyStacksSigner(
    process.env.API_PRIVATE_KEY!,
    process.env.API_PUBLIC_KEY!,
    process.env.ORGANIZATION_ID!,
  );

  // Transaction parameters
  const recipientAddress = "ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE"; // Example recipient
  const amount = 1000000; // Amount in microSTX (1 STX = 1,000,000 microSTX)
  const fee = 1000; // Fee in microSTX
  const nonce = 0; // Get this from the account nonce

  try {
    // Create the unsigned transaction
    const unsignedTx = await makeSTXTokenTransfer({
      recipient: recipientAddress,
      amount: amount,
      senderKey:
        "0000000000000000000000000000000000000000000000000000000000000001", // Dummy key, we'll replace the signature
      network: network,
      memo: "Sent via Turnkey",
      nonce: nonce,
      fee: fee,
      anchorMode: AnchorMode.Any,
    });

    const serializedTx = serializeTransaction(unsignedTx);

    const signer = new TransactionSigner(unsignedTx);
    const sigHash = signer.sigHash;

    // Sign the transaction hash with Turnkey
    const signature = await turnkeySigner.signTransactionHash(sigHash);

    // Parse the signature (assuming it's in DER format)
    const signatureBuffer = Buffer.from(signature, "hex");

    // Create a new transaction with the correct signature
    // Note: You'll need to properly format the signature according to Stacks requirements
    const signedTx = {
      ...unsignedTx,
      auth: {
        ...unsignedTx.auth,
        spendingCondition: {
          ...unsignedTx.auth.spendingCondition,
          signature: {
            type: "MessageSignature",
            data: signatureBuffer.toString("hex"),
          },
        },
      },
    };

    // Broadcast the transaction
    const broadcastResponse = await broadcastTransaction(signedTx, "mainnet");
    console.log("Transaction broadcast:", broadcastResponse);

    return broadcastResponse;
  } catch (error) {
    console.error("Error signing Stacks transaction:", error);
    throw error;
  }
}

// Example: Sign a Stacks contract call
async function signStacksContractCall() {
  const turnkeySigner = new TurnkeyStacksSigner(
    process.env.API_PRIVATE_KEY!,
    process.env.API_PUBLIC_KEY!,
    process.env.ORGANIZATION_ID!,
    process.env.TURNKEY_ADDRESS!,
    process.env.PUBLIC_KEY_HEX!,
  );

  const network = new StacksTestnet();

  // This is a more complex example - you would need to implement
  // the contract call construction and signing similar to the STX transfer
  console.log("Contract call signing would follow similar pattern...");
}

// Usage
async function main() {
  try {
    await signStacksSTXTransfer();
  } catch (error) {
    console.error("Failed to sign transaction:", error);
  }
}

// Export for use in other modules
export {
  TurnkeyStacksSigner,
  turnkeyAddressToStacksAddress,
  signStacksSTXTransfer,
};
