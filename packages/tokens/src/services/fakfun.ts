import { FAKFUN_API_BASE_URL, FAKFUN_BEARER_TOKEN } from "@dexion/shared";
import axios from "axios";
import { transformFakFunToTokenMetadata } from "../utils";

export async function getFakFunTokenMetadata(ca: string) {
	try {
		const url = `${FAKFUN_API_BASE_URL}tokens/${ca}`;
		const { data } = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${FAKFUN_BEARER_TOKEN}`,
			},
		});
		const rawToken = data.data;
		if (!rawToken) {
			return null;
		}

		return transformFakFunToTokenMetadata(rawToken, "fakfun");
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function getFakFunTrades(contractId: string) {
	try {
		const url = `${FAKFUN_API_BASE_URL}tokens/trades/${contractId}`;
		const { data } = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${FAKFUN_BEARER_TOKEN}`,
			},
		});

		return data;
	} catch (err) {
		console.error(err);
	}
}

export async function fetchFakFunTokens() {
	const response = await axios.get(
		`${FAKFUN_API_BASE_URL}tokens?verified=true&search=&sortOrder=all&page=1&limit=1000`,
		{
			headers: {
				Authorization: `Bearer ${FAKFUN_BEARER_TOKEN}`,
			},
		},
	);
	return response.data.results;
}
