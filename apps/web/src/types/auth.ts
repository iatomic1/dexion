export type AuthSuccess = {
	accessToken: string;
	userId: string;
};

export type AccessPayload = {
	authenticatedUserId: string;
	expires: number;
	iat: number;
	refresh: false;
};

export type RefreshPayload = {
	expires: number;
	iat: number;
	refresh: true;
	jti: string;
};
