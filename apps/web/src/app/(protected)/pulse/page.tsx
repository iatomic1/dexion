import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pulse",
	robots: {
		index: false,
		follow: false,
	},
};

("use client");

import PulseContent from "./_components/pulse-content";

export default function PulsePage() {
	return <PulseContent />;
}
