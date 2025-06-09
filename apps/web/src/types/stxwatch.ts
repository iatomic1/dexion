export interface TokenPoints {
  total_points: number;
  price_points: number;
  volume_points: number;
  social_points: number;
  swap_points: number;
  holder_points: number;
  liquidity_rating_points: number;
  holder_concentration_points: number;
  holder_distribution_points: number;
  wallet_diversity_points: number;
  verification_points: number;
  holder_networth_points: number;
  holder_change_points: number;
  diamondHands_points: number;
  repeatBuyers_points: number;
  loyalHolders_points: number;
  paperHands_points: number;
  holdersAtProfit_points: number;
  holdersAtLoss_points: number;
  bnsHolders_points: number;
  top100_reach_points: number;
  top250_reach_points: number;
  top500_reach_points: number;
  all_reach_points: number;
  locked_liquidity_points: number;
  wallet_diversity_points_all: number;
}

export interface TokenLockedLiquidity {
  contract_id: string;
  locked_velar: number;
  locked_evil: number;
  locked_alex: number;
  total_liquidity: number;
}
// export interface {
//     "total_points": 47,
//     "price_points": 14,
//     "volume_points": 0,
//     "social_points": 0,
//     "swap_points": 5,
//     "holder_points": 2,
//     "liquidity_rating_points": 3,
//     "holder_concentration_points": 3,
//     "holder_distribution_points": 2,
//     "wallet_diversity_points": 0,
//     "verification_points": 0,
//     "holder_networth_points": 2,
//     "holder_change_points": 2,
//     "diamondHands_points": 2,
//     "repeatBuyers_points": 1,
//     "loyalHolders_points": 2,
//     "paperHands_points": 0,
//     "holdersAtProfit_points": 2,
//     "holdersAtLoss_points": 1,
//     "bnsHolders_points": 2,
//     "top100_reach_points": 0,
//     "top250_reach_points": 0,
//     "top500_reach_points": 0,
//     "all_reach_points": 0,
//     "locked_liquidity_points": 0,
//     "wallet_diversity_points_all": 4
// }
