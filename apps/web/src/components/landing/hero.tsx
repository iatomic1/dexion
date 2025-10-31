import { Button } from "@repo/ui/components/ui/button";
import Image from "next/image";
import AuthController from "../auth/auth-controller";

const HeroSection = () => {
	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-hero">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
			</div>

			{/* Grid overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

			{/* Content */}
			<div className="relative z-10 container mx-auto px-4 text-center">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 leading-tight text-balance">
						Trade Smarter with Dexion
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed text-pretty">
						The all-in-one web-based trading bot on Stacks, designed for speed,
						security, and simplicity.
					</p>

					<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
						<AuthController />
					</div>

					<div className="mt-16 text-sm text-muted-foreground">
						<p>Trusted by traders • Built on Stacks • Web3 meets Web2</p>
					</div>
				</div>
			</div>

			{/* Floating elements */}
			<div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-pulse opacity-60" />
			<div className="absolute top-40 right-20 w-6 h-6 bg-accent rounded-full animate-pulse opacity-40 animation-delay-1000" />
			<div className="absolute bottom-40 left-20 w-3 h-3 bg-primary rounded-full animate-pulse opacity-50 animation-delay-2000" />
		</section>
	);
};

export default HeroSection;
