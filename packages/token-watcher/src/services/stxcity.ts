import axios from "axios";
import { STX_CITY_API_BASE_URL } from "../lib/constants";

export async function getTokenMetadata(ca: string) {
  try {
    const url = `${STX_CITY_API_BASE_URL}searchTokens?token_contract=${ca}`;
    const { data } = await axios.get(url);

    return data.bonding_curve[0];
  } catch (err) {
    console.error(err);
  }
}
