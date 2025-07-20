export const PROTOCOL_CONFIG = {
	contracts: {
		"SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4":
			"StackingDAO",
		"SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-tracking": "StackingDAO",
		"SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.multihop": "ALEX",
		"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging": "Velar",
		"SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply": "Velar",
		"SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.borrow-helper-v2-1-4": "Zest",
		"SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M.stableswap-stx-ststx-v-1-2":
			"Bitflow",
	},
	tokens: {
		STX: {
			decimals: 6,
			contractId: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx",
		},
		"sbtc-token": { decimals: 8 },
		"usda-token": { decimals: 6 },
		"token-aeusdc": { decimals: 6 },
		crystals: { decimals: 6 },
		"drones-stxcity": { decimals: 6 },
		"ststx-token": { decimals: 6 },
	},
} as const;
