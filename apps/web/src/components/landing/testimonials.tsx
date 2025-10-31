import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
	{
		name: "Alex Chen",
		role: "DeFi Trader",
		content:
			"Dexion revolutionized how I trade on Stacks. The real-time data and advanced features are game-changing.",
		rating: 5,
		avatar: "AC",
	},
	{
		name: "Sarah Martinez",
		role: "Crypto Investor",
		content:
			"Finally, a trading platform that bridges Web2 and Web3 seamlessly. The onboarding was incredibly smooth.",
		rating: 5,
		avatar: "SM",
	},
	{
		name: "Michael Zhang",
		role: "Portfolio Manager",
		content:
			"The wallet tracking feature is phenomenal. Being able to monitor 300 wallets gives me a huge edge.",
		rating: 5,
		avatar: "MZ",
	},
];

const TestimonialsSection = () => {
	return (
		<section className="py-24 bg-background relative">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Trusted by Traders Worldwide
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Join thousands of traders who have made the switch to Dexion. See
						what our community is saying about their experience.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{testimonials.map((testimonial, index) => (
						<Card
							key={index}
							className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group"
						>
							<CardContent className="p-8">
								<div className="mb-6">
									<Quote className="w-8 h-8 text-accent opacity-60 mb-4" />
									<p className="text-foreground leading-relaxed italic">
										"{testimonial.content}"
									</p>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
											<span className="text-sm font-semibold text-primary-foreground">
												{testimonial.avatar}
											</span>
										</div>
										<div>
											<div className="font-semibold text-foreground">
												{testimonial.name}
											</div>
											<div className="text-sm text-muted-foreground">
												{testimonial.role}
											</div>
										</div>
									</div>

									<div className="flex space-x-1">
										{Array.from({ length: testimonial.rating }).map((_, i) => (
											<Star
												key={i}
												className="w-4 h-4 fill-accent text-accent"
											/>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/*<div className="text-center mt-16">
					<div className="inline-flex items-center space-x-8 bg-gradient-card rounded-lg p-6 border border-border/50">
						<div className="text-center">
							<div className="text-3xl font-bold text-accent mb-1">1,000+</div>
							<div className="text-sm text-muted-foreground">
								Active Traders
							</div>
						</div>
						<div className="w-px h-12 bg-border/50" />
						<div className="text-center">
							<div className="text-3xl font-bold text-accent mb-1">$50M+</div>
							<div className="text-sm text-muted-foreground">Volume Traded</div>
						</div>
						<div className="w-px h-12 bg-border/50" />
						<div className="text-center">
							<div className="text-3xl font-bold text-accent mb-1">99.9%</div>
							<div className="text-sm text-muted-foreground">Uptime</div>
						</div>
					</div>
				</div>*/}
			</div>
		</section>
	);
};

export default TestimonialsSection;
