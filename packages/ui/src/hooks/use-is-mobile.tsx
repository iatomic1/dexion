"use client";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";

const MOBILE_BREAKPOINT = 768;
type DeviceContextProps = { isMobile: boolean | undefined };
export const DeviceContext = createContext<DeviceContextProps>({
	isMobile: undefined,
});

export const DeviceContextProvider = ({
	children,
	...props
}: DeviceContextProps & { children: ReactNode }) => {
	return (
		<DeviceContext.Provider value={props}>{children}</DeviceContext.Provider>
	);
};

export function useIsMobile(): boolean {
	const context = useContext(DeviceContext);
	const [isMobile, setIsMobile] = useState<boolean | undefined>(
		context.isMobile,
	);
	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return !!isMobile;
}

const useMobile = () => {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return !!isMobile;
};
