import axios from "axios";
import { nanoid } from "nanoid";
import { getStacksInfo } from "./getStacksInfo";
import {
  HIRO_PLATFORM_API_BASE_URL,
  API_BASE_URL,
} from "@repo/shared-constants/constants.ts";
import { HIRO_PLATFORM_API_KEY, AUTHORIZATION_HEADER } from "../lib/env";

export const createChainhook = async (txID: string) => {
  const url = `${HIRO_PLATFORM_API_BASE_URL}v1/ext/${HIRO_PLATFORM_API_KEY}/chainhooks`;
  const stacksInfo = await getStacksInfo();
  const uuid = nanoid();

  try {
    const { data } = await axios.post(url, {
      name: `${txID}`,
      uuid: uuid,
      chain: "stacks",
      version: 1,
      networks: {
        mainnet: {
          if_this: {
            scope: "txid",
            equals: txID,
          },
          end_block: null,
          then_that: {
            http_post: {
              url: `${API_BASE_URL}/api/track`,
              authorization_header: AUTHORIZATION_HEADER,
            },
          },
          start_block: stacksInfo.stacks_tip_height,
          decode_clarity_values: true,
          expire_after_occurrence: null,
        },
      },
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    }
  }
};

export const getChainhook = async (uuid: string) => {
  const url = `${HIRO_PLATFORM_API_BASE_URL}v1/ext/${HIRO_PLATFORM_API_KEY}/chainhooks/${uuid}`;

  try {
    const { data } = await axios.get(url);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);
    }
  }
};

export const deleteChainhook = async (chainhookUuid: string) => {
  try {
    const url = `${HIRO_PLATFORM_API_BASE_URL}v1/ext/${HIRO_PLATFORM_API_KEY}/chainhooks/${chainhookUuid}`;
    const { data } = await axios.delete(url);

    return data;
  } catch (err) {
    console.error(err);
  }
};
