import CTASection from "~/components/landing/cta-section";
import FeaturesSection from "~/components/landing/features";
import Footer from "~/components/landing/footer";
import HeroSection from "~/components/landing/hero";
import HowItWorksSection from "~/components/landing/how-it-works";
import PreviewSection from "~/components/landing/preview";
import TestimonialsSection from "~/components/landing/testimonials";
import WhyDexionSection from "~/components/landing/why-desxion";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
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
