import axios from "axios";
import { STX_CITY_API_BASE_URL } from "../lib/constants";

export async function getStxCityTokenMetadata(
  param: string,
  isContract: boolean,
) {
  try {
    const url = `${STX_CITY_API_BASE_URL}searchTokens?token_contract=${param}`;
    const { data } = await axios.get(url);
    console.log(data, "from func");

    return data.bonding_curve[0];
  } catch (err) {
    console.error(err);
  }
}

export async function searchStxCity(param: string, isContract: boolean) {
  const queryParam = isContract ? "token_contract" : "keyword";
  try {
    const url = `${STX_CITY_API_BASE_URL}searchTokens?${queryParam}=${param}`;
    const { data } = await axios.get(url);

    return data.bonding_curve.map((token: any) => ({
      ...token,
      platform: "stxcity",
    }));
  } catch (err) {
    console.error(err);
  }
}

export async function getStxCityTokenTrades(
  dexAddress: string,
  tokenContract: string,
) {
  try {
    const url = `${STX_CITY_API_BASE_URL}processBondingTX`;
    const { data } = await axios.post(url, {
      dexAddress: dexAddress,
      tokenContract: tokenContract,
    });
    // console.log(data, "from func");

    return data;
  } catch (err) {
    console.error(err);
  }
}
