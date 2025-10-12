export interface ZestAsset {
	totalSuppliedBalance: string;
	totalBorrowedBalance: string;
	maxLTV: string;
	liquidationThreshold: string;
	liquidationPenalty: string;
	supplyAPY: string;
	borrowAPR: string;
	supplyCap: string;
	borrowCap: string;
	debtCeiling: string;
	usageAsCollateralEnabled: boolean;
	eMode?: {
		maxLTV: string;
		liquidationThreshold: string;
		liquidationPenalty: string;
	};
	yields: {
		boostedAPR: {
			value: number;
			assetId: string;
		};
		protocol: number;
	};
}

export interface ZestReserveResponse {
	sBTC: ZestAsset;
	STX: ZestAsset;
	stSTX: ZestAsset;
	stSTXbtc: ZestAsset;
	aeUSDC: ZestAsset;
	USDh: ZestAsset;
	aUSD: ZestAsset;
	USDA: ZestAsset;
	ALEX: ZestAsset;
	DIKO: ZestAsset;
}

export interface ZestUserAsset {
	suppliedBalance: string;
	borrowedBalance: string;
	isUsedAsCollateral: boolean;
	principal: string;
	rewards: {
		assetId: string;
		value: number;
	}[];
}

export interface ZestUserAssetsResponse {
	eMode: {
		active: boolean;
	};
	assets: {
		sBTC: ZestUserAsset;
		STX: ZestUserAsset;
		stSTX: ZestUserAsset;
		stSTXbtc: ZestUserAsset;
		aeUSDC: ZestUserAsset;
		USDh: ZestUserAsset;
		aUSD: ZestUserAsset;
		USDA: ZestUserAsset;
		ALEX: ZestUserAsset;
		DIKO: ZestUserAsset;
	};
}

export interface ZestUserBalancesResponse {
	STX: string;
	sBTC: string;
	stSTX: string;
	stSTXbtc: string;
	aeUSDC: string;
	USDh: string;
	aUSD: string;
	USDA: string;
	ALEX: string;
	DIKO: string;
	BTCz: string;
}

export interface ZestAssetPrice {
	price: string;
	source: string;
}

export interface ZestAssetPriceResponse {
	sBTC: ZestAssetPrice;
	STX: ZestAssetPrice;
	stSTX: ZestAssetPrice;
	stSTXbtc: ZestAssetPrice;
	aeUSDC: ZestAssetPrice;
	USDh: ZestAssetPrice;
	aUSD: ZestAssetPrice;
	USDA: ZestAssetPrice;
	ALEX: ZestAssetPrice;
	DIKO: ZestAssetPrice;
}
