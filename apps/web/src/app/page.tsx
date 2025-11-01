import { FRONTEND_URL } from "@dexion/shared";
import type { Metadata } from "next";
import CTASection from "~/components/landing/cta-section";
import FeaturesSection from "~/components/landing/features";
import Footer from "~/components/landing/footer";
import HeroSection from "~/components/landing/hero";
import HowItWorksSection from "~/components/landing/how-it-works";
import PreviewSection from "~/components/landing/preview";
import TestimonialsSection from "~/components/landing/testimonials";
import WhyDexionSection from "~/components/landing/why-dexion";

export const metadata: Metadata = {
	title: "Home",
	description:
		"The all-in-one web-based trading bot on Stacks, designed for speed, security, and simplicity. Trade smarter, not harder with our advanced features.",
	alternates: {
		canonical: FRONTEND_URL,
	},
};

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<div className="py-4 border-b flex items-center justify-center">
				<span className="text-sm">Charts are powered by</span>
				<a
					href="https://tradingview.com"
					className="underline ml-2 text-blue-300"
					target="_blank"
					rel="noopener"
				>
					TradingView
				</a>
			</div>
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<WhyDexionSection />
			<PreviewSection />
			<TestimonialsSection />
			<CTASection />
			<Footer />
		</div>
	);
}
