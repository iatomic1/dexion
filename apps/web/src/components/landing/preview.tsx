import { Card, CardContent } from "@dexion/ui/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import Image from "next/image";

const PreviewSection = () => {
	return (
		<section className="py-24 bg-muted/30 relative overflow-hidden">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						See Dexion in Action
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						Experience our professional trading interface designed for both
						beginners and experts. Clean, intuitive, and powerful.
					</p>
				</div>

				<div className="max-w-6xl mx-auto">
					{/* Main dashboard preview */}
					<Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border/50 shadow-lg mb-12 overflow-hidden">
						<CardContent className="p-0">
							<div className="relative">
								<Image
									src="/assets/dashboard-preview.png"
									alt="Dexion trading dashboard interface"
									width={1200}
									height={800}
									className="w-full h-auto rounded-lg"
									priority
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

								{/* Floating UI elements */}
								<div className="absolute top-6 left-6 bg-accent/20 backdrop-blur-sm rounded-lg p-3">
									<div className="flex items-center space-x-2">
										<div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
										<span className="text-sm font-medium text-accent-foreground">
											Live Trading
										</span>
									</div>
								</div>

								<div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-sm rounded-lg p-3">
									<div className="text-sm font-medium text-primary-foreground">
										Real-time Data
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Features highlight */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group">
							<CardContent className="p-8 text-center">
								<Monitor className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
								<h3 className="text-lg font-semibold mb-3 text-foreground">
									Desktop Optimized
								</h3>
								<p className="text-muted-foreground">
									Full-featured trading experience with advanced charts and
									order management.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group">
							<CardContent className="p-8 text-center">
								<Tablet className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
								<h3 className="text-lg font-semibold mb-3 text-foreground">
									Tablet Friendly
								</h3>
								<p className="text-muted-foreground">
									Responsive design that adapts perfectly to your tablet for
									trading on the go.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-card hover:shadow-glow group">
							<CardContent className="p-8 text-center">
								<Smartphone className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
								<h3 className="text-lg font-semibold mb-3 text-foreground">
									Mobile Ready
								</h3>
								<p className="text-muted-foreground">
									Essential trading features optimized for mobile devices with
									intuitive controls.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PreviewSection;
