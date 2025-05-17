export interface AddressBalanceResponse {
  stx: StxBalance;
  fungible_tokens: {
    [k: string]: FtBalance;
  };
  non_fungible_tokens: {
    [k: string]: NftBalance;
  };
  token_offering_locked?: AddressTokenOfferingLocked;
}
export interface StxBalance {
  balance: string;
  estimated_balance?: string;
  pending_balance_inbound?: string;
  pending_balance_outbound?: string;
  total_sent?: string;
  total_received?: string;
  total_fees_sent?: string;
  total_miner_rewards_received: string;
  lock_tx_id: string;
  locked: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}
export interface FtBalance {
  balance: string;
  total_sent: string;
  total_received: string;
}
export interface NftBalance {
  count: string;
  total_sent: string;
  total_received: string;
}
export interface AddressTokenOfferingLocked {
  total_locked: string;
  total_unlocked: string;
  unlock_schedule: AddressUnlockSchedule[];
}

export interface AddressUnlockSchedule {
  amount: string;
  block_height: number;
}
