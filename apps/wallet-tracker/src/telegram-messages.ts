import {
  EXPLORER_BASE_URL,
  STX_TOOLS_API_BASE_URL,
} from "@repo/shared-constants/constants.ts";

const shortAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4,
  )}`;
};

export const generateTelegramMessage = (
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

      let title: string;
      let action: string;

      if (received.asset === "STX") {
        title = `🔴 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">SELL</a> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> on ${protocol}`;
        action = `${nicknameLink} swapped ~${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> for ~${received.amount} ${received.asset}`;
      } else if (sent.asset === "STX") {
        title = `🟢 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">BUY</a> <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a> on ${protocol}`;
        action = `${nicknameLink} swapped ~${sent.amount} ${sent.asset} for ~${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>`;
      } else {
        title = `🔄 <a href="${EXPLORER_BASE_URL}txid/${structuredMessage.txId}">SWAP</a> on ${protocol}`;
        action = `${nicknameLink} swapped ~${sent.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${sent.contractId}">${sent.asset}</a> for ~${received.amount} <a href="${STX_TOOLS_API_BASE_URL}/tokens/${received.contractId}">${received.asset}</a>`;
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