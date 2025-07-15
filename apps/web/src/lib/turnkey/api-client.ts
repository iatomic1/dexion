import { Turnkey } from "@turnkey/sdk-server";
import { turnkeyConfig } from "~/config/turnkey";

export const turnkeyServer = new Turnkey(turnkeyConfig).apiClient();
