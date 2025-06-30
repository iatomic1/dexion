import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.BACKEND_API_URL,
});

export const createUser = (chatId: string, username?: string) => {
  return apiClient.post("/wallets/telegram/users", {
    chatId,
    username,
  });
};

export const trackWallet = (
  chatId: string,
  walletAddress: string,
  nickname: string,
) => {
  return apiClient.post("/wallets/telegram", {
    chatId,
    walletAddress,
    nickname,
  });
};

export const getTrackedWallets = (chatId: number) => {
  return apiClient.get(`/wallets/telegram/${chatId}`);
};

export const untrackWallet = (chatId: number, walletAddress: string) => {
  return apiClient.delete(`/wallets/telegram/${chatId}/${walletAddress}`);
};

export const setWalletPreference = (
  chatId: number,
  preference: string,
) => {
  return apiClient.post("/wallets/telegram/preference", {
    chatId: chatId.toString(),
    preference,
  });
};
