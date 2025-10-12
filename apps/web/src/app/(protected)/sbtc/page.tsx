"use client";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight, Shield, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import AuthController from "~/components/auth/auth-controller";
import siteConfig from "~/config/site";

export default function LandingPage() {
	const handleConnectWallet = () => {
		// TODO: Integrate Turnkey SDK for wallet connection
		console.log("Connecting embedded wallet...");
		// For now, redirect to dashboard
		window.location.href = "/dashboard";
	};

	return (
		<div className="min-h-screen hero-gradient">
			{/* Header */}
			<header className="container mx-auto px-4 py-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
						<span className="text-xl font-bold text-primary-foreground">S</span>
					</div>
					<span className="text-2xl font-bold text-foreground">
						{siteConfig.title} | sBTC
					</span>
				</div>
				<nav className="hidden md:flex items-center gap-8">
					<Link
						href="#features"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						Features
					</Link>
					<Link
						href="#protocols"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						Protocols
					</Link>
					<Link
						href="#about"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						About
					</Link>
				</nav>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-4 py-20 md:py-32">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					{/* Animated gradient orb */}
					<div className="relative h-64 mb-12">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 blur-3xl animate-pulse" />
						</div>
						<div className="relative z-10 flex items-center justify-center h-full">
							<div className="glass-panel rounded-3xl p-8 w-48 h-48 flex items-center justify-center">
								<Wallet className="w-24 h-24 text-primary" />
							</div>
						</div>
					</div>

					<h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
						Manage your Stacks DeFi in one place
					</h1>

					<p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
						Connect your embedded wallet and manage Granite, Zest, and
						StackingDAO from one unified dashboard.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
						<AuthController from="sbtc" />
					</div>
				</div>

				<div
					className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-32"
					id="features"
				>
					<div className="glass-panel rounded-2xl p-8 space-y-4 hover:bg-secondary/30 transition-colors">
						<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
							<Shield className="w-6 h-6 text-primary" />
						</div>
						<h3 className="text-xl font-semibold text-foreground">
							Secure & Self-Custody
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							Your keys, your crypto. Powered by Turnkey's embedded wallet
							technology for maximum security.
						</p>
					</div>

					<div className="glass-panel rounded-2xl p-8 space-y-4 hover:bg-secondary/30 transition-colors">
						<div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
							<Zap className="w-6 h-6 text-accent" />
						</div>
						<h3 className="text-xl font-semibold text-foreground">
							Multi-Protocol Support
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							Access Granite, Zest, and StackingDAO all from one intuitive
							interface.
						</p>
					</div>

					<div className="glass-panel rounded-2xl p-8 space-y-4 hover:bg-secondary/30 transition-colors">
						<div className="w-12 h-12 rounded-xl bg-[var(--granite)]/20 flex items-center justify-center">
							<Wallet className="w-6 h-6 text-[var(--granite)]" />
						</div>
						<h3 className="text-xl font-semibold text-foreground">
							sBTC Native
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							Built specifically for sBTC-based DeFi on the Stacks blockchain.
						</p>
					</div>
				</div>

				{/* Protocol Badges */}
				<div
					className="flex flex-wrap items-center justify-center gap-6 mt-24"
					id="protocols"
				>
					<div className="glass-panel rounded-xl px-6 py-3 flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[var(--granite)]" />
						<span className="text-sm font-medium text-foreground">Granite</span>
					</div>
					<div className="glass-panel rounded-xl px-6 py-3 flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[var(--zest)]" />
						<span className="text-sm font-medium text-foreground">Zest</span>
					</div>
					<div className="glass-panel rounded-xl px-6 py-3 flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[var(--stacking)]" />
						<span className="text-sm font-medium text-foreground">
							StackingDAO
						</span>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="container mx-auto px-4 py-12 mt-32 border-t border-border">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-sm text-muted-foreground">
						© 2025 StackFi. All rights reserved.
					</p>
					<div className="flex items-center gap-6">
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Privacy
						</Link>
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Terms
						</Link>
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Docs
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
