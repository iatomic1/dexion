"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuthModal } from "~/contexts/AuthModalContext";

const VALID_VIEWS = new Set(["signin", "signup"]);

export function AuthViewParamListener() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { openAuthModal } = useAuthModal();

	useEffect(() => {
		const authView = searchParams.get("authView");
		if (!authView || !VALID_VIEWS.has(authView)) return;
		openAuthModal({ view: authView as "signin" | "signup" });
		const params = new URLSearchParams(searchParams);
		params.delete("authView");
		const query = params.toString();
		router.replace(query ? `/?${query}` : "/", { scroll: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	return null;
}
