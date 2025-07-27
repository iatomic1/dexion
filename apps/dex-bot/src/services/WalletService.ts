
import { validateStacksAddress } from '@stacks/transactions';
import { AxiosError } from 'axios';
import * as api from '../api';
import * as messages from '../messages';

export class WalletService {
  public async trackWallet(chatId: string, address: string, nickname: string) {
    if (!validateStacksAddress(address)) {
      return messages.INVALID_ADDRESS_MESSAGE;
    }
    try {
      await api.trackWallet(chatId, address, nickname);
      return {
        text: messages.WALLET_TRACK_SUCCESS(address, nickname),
        options: {
          ...messages.preferenceKeyboard(address),
          parse_mode: 'Markdown',
        },
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.response?.data);
      }
      return messages.GENERIC_ERROR_MESSAGE;
    }
  }

  public async listWallets(chatId: number) {
    try {
      const response = await api.getTrackedWallets(chatId);
      const wallets = response.data.data;

      if (!wallets || wallets.length === 0) {
        return messages.NO_WALLETS_TRACKED_MESSAGE;
      }

      const message = messages.getWalletListMessage(wallets);
      return {
          text: message,
          options: messages.listKeyboard
      }
    } catch (error) {
      console.error(error);
      return messages.GENERIC_ERROR_MESSAGE;
    }
  }

  public async untrackWallet(chatId: number, walletAddress: string) {
    try {
      await api.untrackWallet(chatId, walletAddress);
      return messages.WALLET_UNTRACK_SUCCESS(walletAddress);
    } catch (error) {
      console.error(error);
      return messages.GENERIC_ERROR_MESSAGE;
    }
  }
}
