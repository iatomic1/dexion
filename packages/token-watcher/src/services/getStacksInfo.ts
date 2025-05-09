import axios from "axios";

export async function getStacksInfo() {
  const url = "https://stacks-node-api.mainnet.stacks.co/v2/info";
  try {
    const { data } = await axios.get(url);

    return data;
  } catch (error) {
    console.error(error);
  }
}
