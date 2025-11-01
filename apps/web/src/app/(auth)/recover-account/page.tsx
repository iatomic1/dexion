import { FRONTEND_URL } from "@dexion/shared";
import type { Metadata } from "next";
import RecoverAccountContent from "./_components/recover-account-content";

export const metadata: Metadata = {
	title: "Recover Your Dexion Account",
	description:
		"Recover your Dexion account to regain access to your Web3 trading dashboard.",
	alternates: {
		canonical: `${FRONTEND_URL}/recover-account`,
	},
};

export default function RecoverAccountPage() {
	return <RecoverAccountContent />;
}
