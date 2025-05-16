import { AddressBalanceResponse } from "~/types/balance";
import makeFetch from "../helpers/fetch";

export const getBalance = async (address: string) => {
  try {
    return makeFetch<AddressBalanceResponse>(
      "hiro",
      `address/${address}/balances?unanchored=false`,
      null,
      {
        method: "GET",
      },
    )();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
