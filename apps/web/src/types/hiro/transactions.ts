import type { TokenMetadata } from "@repo/tokens/types";

/**
 * Describes all transaction types on Stacks 2.0 blockchain
 */
export type Transaction =
	| TokenTransferTransaction
	| SmartContractTransaction
	| ContractCallTransaction
	| PoisonMicroblockTransaction
	| CoinbaseTransaction
	| TenureChangeTransaction;
/**
 * Describes representation of a Type-0 Stacks 2.0 transaction. https://github.com/blockstack/stacks-blockchain/blob/master/sip/sip-005-blocks-and-transactions.md#type-0-transferring-an-asset
 */
export type TokenTransferTransaction = AbstractTransaction &
	TokenTransferTransactionMetadata;
/**
 * Anchored transaction metadata. All mined/anchored Stacks transactions have these properties.
 */
export type AbstractTransaction = BaseTransaction & {
	/**
	 * Hash of the blocked this transactions was associated with
	 */
	block_hash: string;
	/**
	 * Height of the block this transactions was associated with
	 */
	block_height: number;
	/**
	 * Unix timestamp (in seconds) indicating when this block was mined.
	 */
	block_time: number;
	/**
	 * An ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) indicating when this block was mined.
	 */
	block_time_iso: string;
	/**
	 * Height of the anchor burn block.
	 */
	burn_block_height: number;
	/**
	 * Unix timestamp (in seconds) indicating when this block was mined
	 */
	burn_block_time: number;
	/**
	 * An ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) timestamp indicating when this block was mined.
	 */
	burn_block_time_iso: string;
	/**
	 * Unix timestamp (in seconds) indicating when this parent block was mined
	 */
	parent_burn_block_time: number;
	/**
	 * An ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) timestamp indicating when this parent block was mined.
	 */
	parent_burn_block_time_iso: string;
	/**
	 * Set to `true` if block corresponds to the canonical chain tip
	 */
	canonical: boolean;
	/**
	 * Index of the transaction, indicating the order. Starts at `0` and increases with each transaction
	 */
	tx_index: number;
	tx_status: TransactionStatus;
	/**
	 * Result of the transaction. For contract calls, this will show the value returned by the call. For other transaction types, this will return a boolean indicating the success of the transaction.
	 */
	tx_result: {
		/**
		 * Hex string representing the value fo the transaction result
		 */
		hex: string;
		/**
		 * Readable string of the transaction result
		 */
		repr: string;
	};
	/**
	 * Number of transaction events
	 */
	event_count: number;
	/**
	 * Hash of the previous block.
	 */
	parent_block_hash: string;
	/**
	 * True if the transaction is included in a microblock that has not been confirmed by an anchor block.
	 */
	is_unanchored: boolean;
	/**
	 * The microblock hash that this transaction was streamed in. If the transaction was batched in an anchor block (not included within a microblock) then this value will be an empty string.
	 */
	microblock_hash: string;
	/**
	 * The microblock sequence number that this transaction was streamed in. If the transaction was batched in an anchor block (not included within a microblock) then this value will be 2147483647 (0x7fffffff, the max int32 value), this value preserves logical transaction ordering on (block_height, microblock_sequence, tx_index).
	 */
	microblock_sequence: number;
	/**
	 * Set to `true` if microblock is anchored in the canonical chain tip, `false` if the transaction was orphaned in a micro-fork.
	 */
	microblock_canonical: boolean;
	/**
	 * Execution cost read count.
	 */
	execution_cost_read_count: number;
	/**
	 * Execution cost read length.
	 */
	execution_cost_read_length: number;
	/**
	 * Execution cost runtime.
	 */
	execution_cost_runtime: number;
	/**
	 * Execution cost write count.
	 */
	execution_cost_write_count: number;
	/**
	 * Execution cost write length.
	 */
	execution_cost_write_length: number;
	/**
	 * List of transaction events
	 */
	events: TransactionEvent[];
};
export type PostConditionMode = "allow" | "deny";
/**
 * Post-conditionscan limit the damage done to a user's assets
 */
export type PostCondition =
	| PostConditionStx
	| PostConditionFungible
	| PostConditionNonFungible;
export type PostConditionStx = {
	principal: PostConditionPrincipal;
} & {
	condition_code: PostConditionFungibleConditionCode;
	amount: string;
	type: "stx";
};
export type PostConditionPrincipal =
	| {
			/**
			 * String literal of type `PostConditionPrincipalType`
			 */
			type_id: "principal_origin";
	  }
	| {
			/**
			 * String literal of type `PostConditionPrincipalType`
			 */
			type_id: "principal_standard";
			address: string;
	  }
	| {
			/**
			 * String literal of type `PostConditionPrincipalType`
			 */
			type_id: "principal_contract";
			address: string;
			contract_name: string;
	  };
/**
 * A fungible condition code encodes a statement being made for either STX or a fungible token, with respect to the originating account.
 */
export type PostConditionFungibleConditionCode =
	| "sent_equal_to"
	| "sent_greater_than"
	| "sent_greater_than_or_equal_to"
	| "sent_less_than"
	| "sent_less_than_or_equal_to";
export type PostConditionFungible = {
	principal: PostConditionPrincipal;
} & {
	condition_code: PostConditionFungibleConditionCode;
	type: "fungible";
	amount: string;
	asset: {
		asset_name: string;
		contract_address: string;
		contract_name: string;
	};
};
export type PostConditionNonFungible = {
	principal: PostConditionPrincipal;
} & {
	condition_code: PostConditionNonFungibleConditionCode;
	type: "non_fungible";
	asset_value: {
		hex: string;
		repr: string;
	};
	asset: {
		asset_name: string;
		contract_address: string;
		contract_name: string;
	};
};
/**
 * A non-fungible condition code encodes a statement being made about a non-fungible token, with respect to whether or not the particular non-fungible token is owned by the account.
 */
export type PostConditionNonFungibleConditionCode = "sent" | "not_sent";
/**
 * `on_chain_only`: the transaction MUST be included in an anchored block, `off_chain_only`: the transaction MUST be included in a microblock, `any`: the leader can choose where to include the transaction.
 */
export type TransactionAnchorModeType =
	| "on_chain_only"
	| "off_chain_only"
	| "any";
/**
 * Status of the transaction
 */
export type TransactionStatus =
	| "success"
	| "abort_by_response"
	| "abort_by_post_condition";
export type TransactionEvent =
	| TransactionEventSmartContractLog
	| TransactionEventStxLock
	| TransactionEventStxAsset
	| TransactionEventFungibleAsset
	| TransactionEventNonFungibleAsset;
/**
 * Only present in `smart_contract` and `contract_call` tx types.
 */
export type TransactionEventSmartContractLog = AbstractTransactionEvent & {
	event_type: "smart_contract_log";
	tx_id: string;
	contract_log: {
		contract_id: string;
		topic: string;
		value: {
			hex: string;
			repr: string;
		};
	};
};
/**
 * Only present in `smart_contract` and `contract_call` tx types.
 */
export type TransactionEventStxLock = AbstractTransactionEvent & {
	event_type: "stx_lock";
	tx_id: string;
	stx_lock_event: {
		locked_amount: string;
		unlock_height: number;
		locked_address: string;
	};
};
/**
 * Only present in `smart_contract` and `contract_call` tx types.
 */
export type TransactionEventStxAsset = AbstractTransactionEvent & {
	event_type: "stx_asset";
	tx_id: string;
	asset: TransactionEventAsset;
};
export type TransactionEventAssetType = "transfer" | "mint" | "burn";
export type TransactionEventFungibleAsset = AbstractTransactionEvent & {
	event_type: "fungible_token_asset";
	tx_id: string;
	asset: {
		asset_event_type: string;
		asset_id: string;
		sender: string;
		recipient: string;
		amount: string;
	};
};
export type TransactionEventNonFungibleAsset = AbstractTransactionEvent & {
	event_type: "non_fungible_token_asset";
	tx_id: string;
	asset: {
		asset_event_type: string;
		asset_id: string;
		sender: string;
		recipient: string;
		value: {
			hex: string;
			repr: string;
		};
	};
};
/**
 * Describes representation of a Type-1 Stacks 2.0 transaction. https://github.com/blockstack/stacks-blockchain/blob/master/sip/sip-005-blocks-and-transactions.md#type-1-instantiating-a-smart-contract
 */
export type SmartContractTransaction = AbstractTransaction &
	SmartContractTransactionMetadata;
/**
 * Describes representation of a Type 2 Stacks 2.0 transaction: Contract Call
 */
export type ContractCallTransaction = AbstractTransaction &
	ContractCallTransactionMetadata;
/**
 * Describes representation of a Type 3 Stacks 2.0 transaction: Poison Microblock
 */
export type PoisonMicroblockTransaction = AbstractTransaction &
	PoisonMicroblockTransactionMetadata;
/**
 * Describes representation of a Type 3 Stacks 2.0 transaction: Poison Microblock
 */
export type CoinbaseTransaction = AbstractTransaction &
	CoinbaseTransactionMetadata;
/**
 * Describes representation of a Type 7 Stacks transaction: Tenure Change
 */
export type TenureChangeTransaction = AbstractTransaction &
	TenureChangeTransactionMetadata;

/**
 * GET Address Transactions
 */
export interface AddressTransactionsV2ListResponse {
	limit: number;
	offset: number;
	total: number;
	results: AddressTransaction[];
}
/**
 * Address transaction with STX, FT and NFT transfer summaries
 */
export interface AddressTransaction {
	tx: Transaction;
	/**
	 * Total sent from the given address, including the tx fee, in micro-STX as an integer string.
	 */
	stx_sent: string;
	/**
	 * Total received by the given address in micro-STX as an integer string.
	 */
	stx_received: string;
	events?: {
		stx: {
			transfer: number;
			mint: number;
			burn: number;
		};
		ft: {
			transfer: number;
			mint: number;
			burn: number;
		};
		nft: {
			transfer: number;
			mint: number;
			burn: number;
		};
	};
}
/**
 * Transaction properties that are available from a raw serialized transactions. These are available for transactions in the mempool as well as mined transactions.
 */
export interface BaseTransaction {
	/**
	 * Transaction ID
	 */
	tx_id: string;
	/**
	 * Used for ordering the transactions originating from and paying from an account. The nonce ensures that a transaction is processed at most once. The nonce counts the number of times an account's owner(s) have authorized a transaction. The first transaction from an account will have a nonce value equal to 0, the second will have a nonce value equal to 1, and so on.
	 */
	nonce: number;
	/**
	 * Transaction fee as Integer string (64-bit unsigned integer).
	 */
	fee_rate: string;
	/**
	 * Address of the transaction initiator
	 */
	sender_address: string;
	sponsor_nonce?: number;
	/**
	 * Denotes whether the originating account is the same as the paying account
	 */
	sponsored: boolean;
	sponsor_address?: string;
	post_condition_mode: PostConditionMode;
	post_conditions: PostCondition[];
	anchor_mode: TransactionAnchorModeType;
}
export interface AbstractTransactionEvent {
	event_index: number;
}
export interface TransactionEventAsset {
	asset_event_type?: TransactionEventAssetType;
	asset_id?: string;
	sender?: string;
	recipient?: string;
	amount?: string;
	value?: string;
	memo?: string;
}
/**
 * Metadata associated with token-transfer type transactions
 */
export interface TokenTransferTransactionMetadata {
	tx_type: "token_transfer";
	token_transfer: {
		recipient_address: string;
		/**
		 * Transfer amount as Integer string (64-bit unsigned integer)
		 */
		amount: string;
		/**
		 * Hex encoded arbitrary message, up to 34 bytes length (should try decoding to an ASCII string)
		 */
		memo: string;
	};
}
/**
 * Metadata associated with a contract-deploy type transaction. https://github.com/blockstack/stacks-blockchain/blob/master/sip/sip-005-blocks-and-transactions.md#type-1-instantiating-a-smart-contract
 */
export interface SmartContractTransactionMetadata {
	tx_type: "smart_contract";
	smart_contract: {
		/**
		 * The Clarity version of the contract, only specified for versioned contract transactions, otherwise null
		 */
		clarity_version?: number;
		/**
		 * Contract identifier formatted as `<principaladdress>.<contract_name>`
		 */
		contract_id: string;
		/**
		 * Clarity code of the smart contract being deployed
		 */
		source_code: string;
	};
}
/**
 * Metadata associated with a contract-call type transaction
 */
export interface ContractCallTransactionMetadata {
	tx_type: "contract_call";
	contract_call: {
		/**
		 * Contract identifier formatted as `<principaladdress>.<contract_name>`
		 */
		contract_id: string;
		/**
		 * Name of the Clarity function to be invoked
		 */
		function_name: string;
		/**
		 * Function definition, including function name and type as well as parameter names and types
		 */
		function_signature: string;
		/**
		 * List of arguments used to invoke the function
		 */
		function_args?: {
			hex: string;
			repr: string;
			name: string;
			type: string;
		}[];
	};
}
/**
 * Metadata associated with a poison-microblock type transaction
 */
export interface PoisonMicroblockTransactionMetadata {
	tx_type: "poison_microblock";
	poison_microblock: {
		/**
		 * Hex encoded microblock header
		 */
		microblock_header_1: string;
		/**
		 * Hex encoded microblock header
		 */
		microblock_header_2: string;
	};
}
/**
 * Describes representation of a Type 3 Stacks 2.0 transaction: Poison Microblock
 */
export interface CoinbaseTransactionMetadata {
	tx_type: "coinbase";
	coinbase_payload: {
		/**
		 * Hex encoded 32-byte scratch space for block leader's use
		 */
		data: string;
		/**
		 * A principal that will receive the miner rewards for this coinbase transaction. Can be either a standard principal or contract principal. Only specified for `coinbase-to-alt-recipient` transaction types, otherwise null.
		 */
		alt_recipient?: string;
		/**
		 * Hex encoded 80-byte VRF proof
		 */
		vrf_proof?: string;
	};
}

type SimilarTokens = {
	token: TokenMetadata;
	lastTx: string;
};

/**
 * Describes representation of a Type 7 Stacks transaction: Tenure Change
 */
export interface TenureChangeTransactionMetadata {
	tx_type: "tenure_change";
	tenure_change_payload?: {
		/**
		 * Consensus hash of this tenure. Corresponds to the sortition in which the miner of this block was chosen.
		 */
		tenure_consensus_hash: string;
		/**
		 * Consensus hash of the previous tenure. Corresponds to the sortition of the previous winning block-commit.
		 */
		prev_tenure_consensus_hash: string;
		/**
		 * Current consensus hash on the underlying burnchain. Corresponds to the last-seen sortition.
		 */
		burn_view_consensus_hash: string;
		/**
		 * (Hex string) Stacks Block hash
		 */
		previous_tenure_end: string;
		/**
		 * The number of blocks produced in the previous tenure.
		 */
		previous_tenure_blocks: number;
		/**
		 * Cause of change in mining tenure. Depending on cause, tenure can be ended or extended.
		 */
		cause: "block_found" | "extended";
		/**
		 * (Hex string) The ECDSA public key hash of the current tenure.
		 */
		pubkey_hash: string;
	};
}
