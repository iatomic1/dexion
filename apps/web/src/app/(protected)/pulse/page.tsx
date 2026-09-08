import type { Metadata } from "next";
import { notFound } from "next/navigation";
import siteConfig from "~/config/site";

export const metadata: Metadata = {
	title: "Pulse",
	robots: {
		index: false,
		follow: false,
	},
};

import PulseContent from "./_components/pulse-content";

export default function PulsePage() {
	if (!siteConfig.features.trading) {
		notFound();
	}

	return <PulseContent />;
}
