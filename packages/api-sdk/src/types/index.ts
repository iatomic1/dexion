// ============================================================================
// Core Types
// ============================================================================

export type ApiResponse<T> = {
	data: T;
	errors: any;
	message: string;
	status: string;
};

export type ErrorResponse = {
	status: number;
	error: string;
	detail: string;
};

export type TimeStamp = {
	createdAt: string;
	updatedAt: string;
};

// ============================================================================
// SDK Configuration
// ============================================================================

export type ServiceType = "dexion" | "hiro" | "stxwatch";

export interface DexionConfig {
	authToken?: string;
	userId?: string;
	baseUrls?: Partial<Record<ServiceType, string>>;
	framework?: {
		type: "nextjs" | "vanilla";
		defaultCache?: RequestCache;
		defaultRevalidate?: number | false;
		defaultTags?: string[];
	};
	retries?: number;
	timeout?: number;
	onError?: (error: DexionError) => void;
	debug?: boolean;
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class DexionError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode?: number,
		public details?: unknown,
	) {
		super(message);
		this.name = "DexionError";
	}
}

export interface FetchOptions {
	next?: {
		revalidate?: number | false;
		tags?: string[];
	};
	cache?: RequestCache;
	signal?: AbortSignal;
}
