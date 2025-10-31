import { Card, CardContent } from "@dexion/ui/components/ui/card";
import { BarChart3, CreditCard, UserPlus } from "lucide-react";

const steps = [
	{
		icon: UserPlus,
		number: "01",
		title: "Create Account",
		description:
			"Sign up with Google/email or continue with your Stacks wallet. Quick and secure onboarding in seconds.",
	},
	{
		icon: CreditCard,
		number: "02",
		title: "Fund Your Wallet",
		description:
			"Deposit funds into your DEX wallet. Secure, fast, and ready for trading across the Stacks ecosystem.",
	},
	{
		icon: BarChart3,
		number: "03",
		title: "Start Trading",
		description:
			"Execute trades instantly with our advanced engine. Access real-time data and professional tools.",
	},
];

const HowItWorksSection = () => {
	return (
		<section className="py-24 bg-muted/30 relative">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Get started with Dexion in three simple steps. From signup to
						trading in minutes.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{steps.map((step, index) => (
						<div key={index} className="relative">
							<Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group h-full">
								<CardContent className="p-8 text-center">
									<div className="mb-6">
										<div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
											<step.icon className="w-8 h-8 text-primary-foreground" />
										</div>
										<div className="text-4xl font-bold text-primary mb-2">
											{step.number}
										</div>
									</div>
									<h3 className="text-xl font-semibold mb-4 text-foreground">
										{step.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										{step.description}
									</p>
								</CardContent>
							</Card>

							{/* Connector line */}
							{index < steps.length - 1 && (
								<div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-accent opacity-50 transform -translate-y-1/2" />
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorksSection;
