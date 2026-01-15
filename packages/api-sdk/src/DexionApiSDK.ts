// ============================================================================
// Core Client
// ============================================================================

import { API_BASE_URL } from "@dexion/shared";
import { AlertManager } from "./alerts";
import { HodlmmManager } from "./hodlmm";
import {
	type DexionConfig,
	DexionError,
	type FetchOptions,
	type ServiceType,
} from "./types";
import { WalletManager } from "./wallets";
import { WatchlistManager } from "./watchlists";
import { WebhookManager } from "./webhooks";

export class DexionClient {
	private config: Required<
		Omit<
			DexionConfig,
			"authToken" | "userId" | "onError" | "framework" | "baseUrls"
		>
	> & {
		authToken?: string;
		userId?: string;
		onError?: (error: DexionError) => void;
		framework?: DexionConfig["framework"];
		baseUrls: Record<ServiceType, string>;
	};

	constructor(config: DexionConfig = {}) {
		const defaultBaseUrls: Record<ServiceType, string> = {
			dexion: API_BASE_URL,
			hiro: process.env.NEXT_PUBLIC_HIRO_API_BASE_URL || "https://api.hiro.so/",
			stxwatch:
				process.env.NEXT_PUBLIC_STXWATCH_API_BASE_URL ||
				"https://api.stxwatch.com/",
		};

		this.config = {
			baseUrls: { ...defaultBaseUrls, ...config.baseUrls },
			retries: config.retries ?? 3,
			timeout: config.timeout ?? 30000,
			debug: config.debug ?? false,
			authToken: config.authToken,
			userId: config.userId,
			onError: config.onError,
			framework: config.framework,
		};
	}

	// Dynamic auth management
	setAuth(authToken: string, userId: string) {
		this.config.authToken = authToken;
		this.config.userId = userId;
		return this; // Allow chaining
	}

	clearAuth() {
		this.config.authToken = undefined;
		this.config.userId = undefined;
		return this;
	}

	getAuth(): { token?: string; userId?: string } {
		return {
			token: this.config.authToken,
			userId: this.config.userId,
		};
	}

	// Lazy-loaded managers
	private _alerts?: AlertManager;
	get alerts(): AlertManager {
		if (!this._alerts) {
			this._alerts = new AlertManager(this);
		}
		return this._alerts;
	}

	private _hodlmm?: HodlmmManager;
	get hodlmm(): HodlmmManager {
		if (!this._hodlmm) {
			this._hodlmm = new HodlmmManager(this);
		}
		return this._hodlmm;
	}

	private _wallets?: WalletManager;
	get wallets(): WalletManager {
		if (!this._wallets) {
			this._wallets = new WalletManager(this);
		}
		return this._wallets;
	}

	private _watchlists?: WatchlistManager;
	get watchlists(): WatchlistManager {
		if (!this._watchlists) {
			this._watchlists = new WatchlistManager(this);
		}
		return this._watchlists;
	}

	private _webhooks?: WebhookManager;
	get webhooks(): WebhookManager {
		if (!this._webhooks) {
			this._webhooks = new WebhookManager(this);
		}
		return this._webhooks;
	}

	// Core fetch method
	async fetch<T>(
		service: ServiceType,
		endpoint: string,
		options: {
			method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
			body?: unknown;
			requiresAuth?: boolean;
			fetchOptions?: FetchOptions;
		},
	): Promise<T> {
		const { method, body, requiresAuth = true, fetchOptions = {} } = options;

		if (requiresAuth && !this.config.authToken) {
			throw new DexionError(
				"Authentication required. Call setAuth() first.",
				"AUTH_REQUIRED",
			);
		}

		const baseUrl = this.config.baseUrls[service];
		const url = `${baseUrl}${endpoint}`;

		const shouldAddContentType =
			["POST", "PUT", "PATCH"].includes(method) && body;
		const headers: HeadersInit = {};

		if (requiresAuth && this.config.authToken) {
			headers["Authorization"] = `Bearer ${this.config.authToken}`;
		}

		if (shouldAddContentType) {
			headers["Content-Type"] = "application/json";
		}

		// Build fetch options
		const fetchInit: RequestInit = {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
			signal: fetchOptions.signal,
		};

		// Add framework-specific options
		if (this.config.framework?.type === "nextjs") {
			if (fetchOptions.cache) {
				fetchInit.cache = fetchOptions.cache;
			} else if (this.config.framework.defaultCache) {
				fetchInit.cache = this.config.framework.defaultCache;
			}

			// Handle Next.js cache tags and revalidation
			const nextOptions: { revalidate?: number | false; tags?: string[] } = {};

			if (fetchOptions.next?.revalidate !== undefined) {
				nextOptions.revalidate = fetchOptions.next.revalidate;
			} else if (this.config.framework.defaultRevalidate !== undefined) {
				nextOptions.revalidate = this.config.framework.defaultRevalidate;
			}

			if (fetchOptions.next?.tags) {
				nextOptions.tags = fetchOptions.next.tags;
			} else if (this.config.framework.defaultTags) {
				nextOptions.tags = this.config.framework.defaultTags;
			}

			if (Object.keys(nextOptions).length > 0) {
				// @ts-ignore - Next.js specific property
				fetchInit.next = nextOptions;
			}
		}

		if (this.config.debug) {
			console.log("[DexionSDK] Request:", { url, method, body, fetchInit });
		}

		try {
			const response = await fetch(url, fetchInit);

			const contentType = response.headers.get("content-type");
			let data: any;

			if (contentType?.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}

			if (!response.ok) {
				console.log(data);
				const error = new DexionError(
					data.message || data.error || "Request failed",
					data.code || "REQUEST_FAILED",
					response.status,
					data,
				);
				this.config.onError?.(error);
				throw error;
			}

			if (this.config.debug) {
				console.log("[DexionSDK] Response:", data);
			}

			return data as T;
		} catch (error) {
			if (error instanceof DexionError) throw error;

			const dexionError = new DexionError(
				error instanceof Error ? error.message : "Unknown error",
				"NETWORK_ERROR",
				undefined,
				error,
			);
			this.config.onError?.(dexionError);
			throw dexionError;
		}
	}
}

export function createServerSDK(authToken: string, userId: string) {
	return new DexionClient({
		authToken,
		userId,
		debug: false,
		framework: {
			type: "nextjs",
		},
	});
}
