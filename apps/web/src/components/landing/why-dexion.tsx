import { Card, CardContent } from "@repo/ui/components/ui/card";
import { CheckCircle, X } from "lucide-react";

const comparisons = [
	{
		feature: "Speed of execution",
		dexion: "Instant trades",
		traditional: "Slow processing",
	},
	{
		feature: "User experience",
		dexion: "Web2-friendly interface",
		traditional: "Complex setup required",
	},
	{
		feature: "Cross-DEX access",
		dexion: "All Stacks DEXes in one place",
		traditional: "Hopping from one platform to another",
	},
	{
		feature: "Real-time data",
		dexion: "Live Pulse data feed",
		traditional: "Delayed information",
	},
	{
		feature: "Security",
		dexion: "2FA + secure wallet management",
		traditional: "Basic security measures",
	},
	{
		feature: "Wallet tracking",
		dexion: "Track up to 300 wallets",
		traditional: "Limited to 1 wallet",
	},
];

const WhyDexionSection = () => {
	return (
		<section className="py-24 bg-background relative">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Why Choose Dexion?
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Experience the difference between Dexion and traditional trading
						methods. See why traders are making the switch to our platform.
					</p>
				</div>

				<div className="max-w-4xl mx-auto">
					<Card className="bg-gradient-card border-border/50 shadow-card">
						<CardContent className="p-0">
							{/* Header */}
							<div className="grid grid-cols-3 gap-4 p-6 border-b border-border/50">
								<div className="text-center">
									<h3 className="text-lg font-semibold text-muted-foreground">
										Feature
									</h3>
								</div>
								<div className="text-center">
									<h3 className="text-lg font-semibold text-accent">Dexion</h3>
								</div>
								<div className="text-center">
									<h3 className="text-lg font-semibold text-muted-foreground">
										Existing Solutions
									</h3>
								</div>
							</div>

							{/* Comparison rows */}
							{comparisons.map((comparison, index) => (
								<div
									key={index}
									className="grid grid-cols-3 gap-4 p-6 border-b border-border/30 last:border-b-0 hover:bg-muted/20 transition-colors duration-200"
								>
									<div className="flex items-center">
										<span className="font-medium text-foreground">
											{comparison.feature}
										</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
										<span className="text-foreground text-center">
											{comparison.dexion}
										</span>
									</div>
									<div className="flex items-center justify-center space-x-2">
										<X className="w-5 h-5 text-destructive flex-shrink-0" />
										<span className="text-muted-foreground text-center">
											{comparison.traditional}
										</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<div className="text-center mt-12">
						<div className="inline-flex items-center space-x-4 bg-gradient-card rounded-lg p-6 border border-border/50">
							<div className="text-center">
								<div className="text-3xl font-bold text-accent mb-1">10x</div>
								<div className="text-sm text-muted-foreground">
									Faster Execution
								</div>
							</div>
							<div className="w-px h-12 bg-border/50" />
							<div className="text-center">
								<div className="text-3xl font-bold text-accent mb-1">100%</div>
								<div className="text-sm text-muted-foreground">
									Web2 Compatible
								</div>
							</div>
							<div className="w-px h-12 bg-border/50" />
							<div className="text-center">
								<div className="text-3xl font-bold text-accent mb-1">24/7</div>
								<div className="text-sm text-muted-foreground">
									Real-time Data
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhyDexionSection;
