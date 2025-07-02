export const DEV = process.env.NODE_ENV === "development";

export const API_BASE_URL = DEV
  ? "http://localhost:8080/api/v1/"
  : "https://dexion-backend-production.up.railway.app/api/v1/";

export const PUBLIC_BASE_URL = DEV
  ? "http://localhost:3001"
  : "https://dexion.pro";

export const WALLET_TRACKER_SOCKET_URL = "http://localhost:3005";
export const TOKEN_WATCHER_API_BASE_URL = "http://localhost:3008/";

export const HTTP_STATUS = {
  CONFLICT: "Conflict",
  UNAUTHORIZED: "Unauthorized",
  CREATED: "Created",
  OK: "OK",
  NOT_FOUND: "Not Found",
};

export const STXWATCH_API_BASE_URL =
  "https://alpha.stxwatch.io/supabase/rest/v1/rpc/";
export const EXPLORER_BASE_URL = "https://explorer.hiro.so/";
export const HIRO_API_BASE_URL = "https://api.hiro.so/";

export const ADDRESSES = {
  VELAR: "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging",
  CHARISMA: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.multihop",
};

export const STX_TOOLS_API_BASE_URL = "https://api.stxtools.io/";
export const STX_CITY_API_BASE_URL = "https://stx.city/api/";
export const HIRO_PLATFORM_API_BASE_URL = "https://api.platform.hiro.so/";
