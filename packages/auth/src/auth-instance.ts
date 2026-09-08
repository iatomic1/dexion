import type { Auth } from "better-auth";

// biome-ignore lint/suspicious/noExplicitAny: intentionally loose — this module only
// bridges a runtime-known instance across a package boundary before its concrete
// options type is inferred; consumers only need auth.api.*, which is generic-invariant.
type AuthInstance = Auth<any>;

let instance: AuthInstance | undefined;

export function setAuthInstance(auth: AuthInstance) {
	instance = auth;
}

export function getAuthInstance(): AuthInstance {
	if (!instance) {
		throw new Error("Auth instance accessed before initialization");
	}
	return instance;
}
