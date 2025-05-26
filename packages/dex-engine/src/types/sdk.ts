import {
  type ContractPrincipalCV,
  type PostCondition,
  PostConditionMode,
  type UIntCV,
} from "@stacks/transactions";
import type { AmountOutResponse } from "@velarprotocol/velar-sdk";

// Core Engine Types
export interface SwapParams {
  account: string;
  inToken: string; // Token Symbol or Token Contract Address
  outToken: string; // Token Symbol or Token Contract Address
  amount: number;
  slippage?: number;
}

export interface QuoteParams {
  inToken: string;
  outToken: string;
  amount: number;
  slippage?: number;
}

export interface DestinationToken {
  symbol: string;
  contractAddress: string;
  tokenDecimalNum: number;
  assetName: string;
}

// export interface QuoteResponse {
//   value: number;
//   amountOut: number; // raw amount out
//   path: Array<string>; // route contract addresses
//   path2: Array<string>; // route symbols
//   destinationToken: DestinationToken; // destination token details
//   amountOutDecimal: number; // amountOutWithDecimals
//   route?: Array<string>; // multihop optimal route
//   result?: any; // multihop routes results
// }

export interface SwapResponse {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: [
    UIntCV, // pool id
    ContractPrincipalCV, // pool token0 address
    ContractPrincipalCV, // pool token1 address
    ContractPrincipalCV, // in token address
    ContractPrincipalCV, // out token address
    ContractPrincipalCV, // staking contract
    UIntCV, // amount in
    UIntCV, // amount out
  ];
  postConditions: Array<PostCondition>;
  postConditionMode: PostConditionMode;
}

// Platform enum for extensibility
export enum DexPlatform {
  VELAR = "velar",
  // Add other platforms here as you integrate them
  // ALEX = 'alex',
  // ARKADIKO = 'arkadiko',
}

// Generic dex service interface
export interface IDexService {
  executeSwap(params: SwapParams): Promise<SwapResponse>;
  getQuote(params: QuoteParams): Promise<AmountOutResponse>;
}

// Platform-specific configuration (no token pairs here)
export interface PlatformConfig {
  platform: DexPlatform;
  // Add platform-specific config here if needed (API keys, endpoints, etc.)
  config?: Record<string, any>;
}
