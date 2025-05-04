export const DEV = true;
export const API_BASE_URL = DEV
  ? "http://localhost:8080/api/v1/"
  : "http://localhost:8080/api/v1/";

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
