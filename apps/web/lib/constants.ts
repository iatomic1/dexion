export const DEV = false;
export const API_BASE_URL = DEV
  ? "http://localhost:8080/api/v1/"
  : "https://dexion-backend-production.up.railway.app/api/v1/";

export const PUBLIC_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://dexion.pro";

export const WALLET_TRACKER_SOCKET_URL = "http://localhost:3005";

export const HTTP_STATUS = {
  CONFLICT: "Conflict",
  UNAUTHORIZED: "Unauthorized",
  CREATED: "Created",
  OK: "OK",
  NOT_FOUND: "Not Found",
};
export const ACCESS_JWT_KEY = process.env.ACCESS_JWT_KEY ?? "";
export const REFRESH_JWT_KEY = process.env.REFRESH_JWT_KEY ?? "";

export const accessTokenKey = "auth-access-token";
export const refreshTokenKey = "auth-refresh-token";
export const userIdKey = "userId";

export const EXPLORER_BASE_URL = "https://explorer.hiro.so/";
export const HIRO_API_BASE_URL = "";
