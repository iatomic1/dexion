import { logger } from "@/config/logger";

type BitflowPosition = {
	poolId: string;
	poolContract: string;
	coversActiveBin: boolean;
	valueUsd: number;
};

type BitflowSummaryResponse = {
	positions: BitflowPosition[];
};

export async function fetchBitflowPositions(
	stacksAddress: string,
): Promise<BitflowPosition[]> {
	try {
		const url = `https://hodlmm.bitflow.finance/api/bff-proxy/api/app/v1/users/${stacksAddress}/positions/summary`;
		const response = await fetch(url);

		if (!response.ok) {
			logger.warn(
				{ stacksAddress, status: response.status },
				"Failed to fetch Bitflow positions",
			);
			return [];
		}

		const data = (await response.json()) as BitflowSummaryResponse;
		return data.positions || [];
	} catch (err) {
		logger.error({ stacksAddress, err }, "Error fetching Bitflow positions");
		return [];
	}
}
