import { beforeEach, vi } from "vitest";

beforeEach(() => {
	vi.resetAllMocks();
});

// mock global fetch
global.fetch = vi.fn() as unknown as typeof fetch;
