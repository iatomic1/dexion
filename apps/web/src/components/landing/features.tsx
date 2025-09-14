import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
	Bell,
	BookMarked,
	Coins,
	Eye,
	Lock,
	Radio,
	Search,
	Shield,
	TrendingUp,
	Wallet,
	Zap,
} from "lucide-react";

const features = [
	{
		icon: Wallet,
		title: "Wallet Management",
		description:
			"One wallet per user with secure keys and lightning-fast transactions. Multiple wallet support coming soon.",
	},
	{
		icon: Zap,
		title: "Trading Engine",
		description:
			"Execute limit and market orders with precision and speed. Built for professional traders.",
	},
	{
		icon: TrendingUp,
		title: "Advanced Trading",
		description:
			"Auto take TP/SL, Buy/Sell on Bonding curves. Sophisticated tools for maximum efficiency.",
	},
	{
		icon: Radio,
		title: "Pulse (Real-Time DEX Data)",
		description:
			"Live token data across Stacks DEXes and Launchpads. Stay ahead with real-time insights.",
	},
	{
		icon: Shield,
		title: "Authentication",
		description:
			"Email OTP and Google login for Web2-friendly onboarding. Seamless access for everyone.",
	},
	{
		icon: Lock,
		title: "2FA Security",
		description:
			"Extra layer of protection for every user. Your funds and data stay secure, always.",
	},
	{
		icon: Coins,
		title: "Meme/CA Token Page",
		description:
			"Track and trade emerging tokens easily with our professional meme terminal.",
	},
	{
		icon: BookMarked,
		title: "Watchlists",
		description:
			"Save tokens for quick access and monitoring. Never miss a trading opportunity.",
	},
	{
		icon: Search,
		title: "Cross-DEX Search",
		description:
			"Find tokens across bonding curves and DEXes with complete history tracking.",
	},
	{
		icon: Eye,
		title: "Wallet Tracking",
		description:
			"Track the big guys' wallets and know their every move (up to 300 wallets).",
	},
	{
		icon: Bell,
		title: "Price Alerts",
		description:
			"Track price alerts, know what to do and when to do it. Smart notifications that matter.",
	},
];

const FeaturesSection = () => {
	return (
		<section className="py-24 bg-background relative">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Powerful Features for Modern Traders
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Everything you need to trade efficiently on the Stacks blockchain,
						from basic wallet management to advanced trading strategies.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group"
						>
							<CardContent className="p-8">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
											<feature.icon className="w-6 h-6 text-primary-foreground" />
										</div>
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold mb-3 text-foreground">
											{feature.title}
										</h3>
										<p className="text-muted-foreground leading-relaxed">
											{feature.description}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturesSection;
