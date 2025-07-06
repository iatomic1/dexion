import {
	EXPLORER_BASE_URL,
	STX_TOOLS_API_BASE_URL,
} from "@repo/shared-constants/constants.ts";
import { getTokenMetadata } from "@repo/tokens/services";
import { formatPrice } from "./utils";

const shortAddress = (address: string) => {
	return `${address.substring(0, 6)}...${address.substring(
		address.length - 4,
	)}`;
};

export const generateTelegramMessage = async (
	structuredMessage: any,
	nickname: string,
) => {
	if (!structuredMessage) {
		return "Unknown transaction.";
	}

	const nicknameLink = `<a href="${EXPLORER_BASE_URL}/address/${structuredMessage.sender}">${nickname}</a>`;

	switch (structuredMessage.action) {
		case "STX Transfer": {
			const { sent, recipient } = structuredMessage.details;
			const title = `💸 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">STX TRANSFER</a>`;
			const action = `${nicknameLink} transferred ${sent.amount} ${sent.asset} to <a href="${EXPLORER_BASE_URL}/address/${recipient}">${shortAddress(recipient)}</a>`;
			return `${title}\n\n${action}`;
		}

		case "Swap": {
			const { sent, received } = structuredMessage.details;
			const protocol = structuredMessage.protocol.toUpperCase();
			const receiveContractID = received.contractId;
			const sentContractID = sent.contractId;

			let title: string;
			let action: string;

			if (received.asset === "STX") {
				const sentTokenData = await getTokenMetadata(sentContractID);
				title = `🔴 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">SELL</a> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> on ${protocol}`;
				action = `${nicknameLink} swapped ~${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> for ~${received.amount} ${received.asset}\n
<a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> | <b>MC</b> $${formatPrice(sentTokenData?.metrics.marketcap_usd)} | <a href="https://dexion.pro/meme/${sent.contractId}">DEXION</a>
<code>${sent.contractId}</code>
				`;
			} else if (sent.asset === "STX") {
				const receivedTokenData = await getTokenMetadata(receiveContractID);
				title = `🟢 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">BUY</a> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a> on ${protocol}`;
				action = `${nicknameLink} swapped ~${sent.amount} ${sent.asset} for ~${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>\n
<a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a> | <b>MC</b> $${formatPrice(receivedTokenData?.metrics.marketcap_usd)} | <a href="https://dexion.pro/meme/${received.contractId}">DEXION</a>
<code>${received.contractId}</code>
				`;
			} else {
				// For token-to-token swaps, fetch both token metadata
				const [sentTokenData, receivedTokenData] = await Promise.all([
					getTokenMetadata(sentContractID),
					getTokenMetadata(receiveContractID),
				]);

				title = `🔄 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">SWAP</a> on ${protocol}`;
				action = `${nicknameLink} swapped ~${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> for ~${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>

				<b>Sent:</b> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> | <b>MC</b> $${sentTokenData?.metrics.marketcap_usd}
				<b>Received:</b> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a> | <b>MC</b> $${receivedTokenData?.metrics.marketcap_usd}
				`;
			}
			return `${title}\n\n${action}`;
		}

		case "Deposit": {
			const { sent } = structuredMessage.details;
			const protocol = structuredMessage.protocol;
			const title = `📥 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">DEPOSIT</a> to ${protocol}`;
			const action = `${nicknameLink} deposited ${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a>`;
			return `${title}\n\n${action}`;
		}

		case "Claim Rewards": {
			const { received } = structuredMessage.details;
			const protocol = structuredMessage.protocol;
			const title = `🎉 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">CLAIM REWARDS</a> from ${protocol}`;
			const action = `${nicknameLink} claimed ${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>`;
			return `${title}\n\n${action}`;
		}

		case "Supply": {
			const { sent } = structuredMessage.details;
			const protocol = structuredMessage.protocol;
			const title = `➕ <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">SUPPLY</a> to ${protocol}`;
			const action = `${nicknameLink} supplied ${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a>`;
			return `${title}\n\n${action}`;
		}

		case "Withdraw": {
			const { received } = structuredMessage.details;
			const protocol = structuredMessage.protocol;
			const title = `➖ <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">WITHDRAW</a> from ${protocol}`;
			const action = `${nicknameLink} withdrew ${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>`;
			return `${title}\n\n${action}`;
		}

		case "Contract Call":
			return `<a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">Contract Call</a>: ${structuredMessage.summary}`;

		default:
			return structuredMessage.summary;
	}
};
