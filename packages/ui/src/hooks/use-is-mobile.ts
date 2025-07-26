import { useSyncExternalStore } from "react";

export function useIsMobile(width?: number): boolean {
	return useSyncExternalStore(
		(handleResize) => {
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		},
		() => window.innerWidth < 768,
		() => false,
	);
}
