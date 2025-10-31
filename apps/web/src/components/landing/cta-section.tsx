import { Button } from "@dexion/ui/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

const CTASection = () => {
	return (
		<section className="py-24 bg-gradient-hero relative overflow-hidden">
			{/* Background effects */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

			{/* Floating elements */}
			<div className="absolute top-20 left-20 w-4 h-4 bg-accent rounded-full animate-pulse opacity-60" />
			<div className="absolute bottom-32 right-16 w-6 h-6 bg-primary rounded-full animate-pulse opacity-40" />
			<div className="absolute top-1/2 left-10 w-3 h-3 bg-accent rounded-full animate-pulse opacity-50" />

			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center space-x-2 bg-accent/10 rounded-full px-4 py-2 mb-8">
						<Users className="w-4 h-4 text-accent" />
						<span className="text-sm text-accent font-medium">
							Join thousands of traders
						</span>
					</div>

					<h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
						<span className="bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
							Ready to Transform
						</span>
						<br />
						<span className="text-foreground">Your Trading?</span>
					</h2>

					<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
						Join thousands of traders moving to Stacks with Dexion. Experience
						the future of decentralized trading today.
					</p>

					<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
						<Button variant="hero" size="xl" className="w-full sm:w-auto group">
							Get Started Now
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
						</Button>
						<Button
							variant="outline-accent"
							size="xl"
							className="w-full sm:w-auto"
						>
							Join Waitlist
						</Button>
					</div>

					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
						<div className="text-center">
							<div className="text-2xl font-bold text-accent mb-2">Free</div>
							<div className="text-muted-foreground">To get started</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-accent mb-2">Instant</div>
							<div className="text-muted-foreground">Account creation</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-accent mb-2">Secure</div>
							<div className="text-muted-foreground">2FA protection</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTASection;
