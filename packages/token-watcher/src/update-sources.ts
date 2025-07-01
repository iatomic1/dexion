import axios from "axios";
import { RedisClientType } from "redis";

const STXTOOLS_API = "https://api.stxtools.io/tokens?page=0&size=4000";
const STXCITY_API =
  "https://stx.city/api/fetchFrontEnd/bondingData?page=1&limit=1000";

async function fetchStxToolsTokens() {
  const response = await axios.get(STXTOOLS_API);
  return response.data.data.map((token: any) => token.contract_id);
}

async function fetchStxCityTokens() {
  const response = await axios.get(STXCITY_API);
  return response.data.all;
}

export async function updateTokenSources(redisClient: RedisClientType) {
  const stxToolsTokens = await fetchStxToolsTokens();
  const stxCityTokens = await fetchStxCityTokens();

  // Delete old keys
  const allTokenContracts = [
    ...stxToolsTokens,
    ...stxCityTokens.map((t: any) => t.token_contract),
  ];
  const uniqueTokenContracts = [...new Set(allTokenContracts)];
  if (uniqueTokenContracts.length > 0) {
    const oldKeys = uniqueTokenContracts.map((key) => `source:${key}`);
    await redisClient.del(oldKeys);
  }

  // Set new keys with prefix
  for (const token of stxToolsTokens) {
    await redisClient.set(`source:${token}`, "stxtools");
  }

  for (const token of stxCityTokens) {
    const key = `source:${token.token_contract}`;
    if (token.progress < 100) {
      await redisClient.set(key, "stxcity");
    } else {
      await redisClient.set(key, "stxtools");
    }
  }
  console.log("done");
}
