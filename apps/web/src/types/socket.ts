export type TriggeredAlertPayload = {
	token: {
		image: string;
		name: string;
		symbol: string;
		currentValue: number;
	};
	alert: {
		metric: "price" | "liquidity" | "marketcap" | "holders";
		operator: string;
		value: number;
		repeatable: boolean;
	};
};
