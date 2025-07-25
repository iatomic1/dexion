"use client";
import React, { createContext, useContext } from "react";
import { authClient } from "~/lib/auth-client";

type SessionQuery = ReturnType<typeof authClient.useSession>;

const AuthContext = createContext<SessionQuery | undefined>(undefined);

export function AuthClientContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const sessionQuery = authClient.useSession();

	return (
		<AuthContext.Provider value={sessionQuery}>{children}</AuthContext.Provider>
	);
}

export function useSession() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
