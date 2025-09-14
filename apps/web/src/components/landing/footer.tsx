import { Separator } from "@repo/ui/components/ui/separator";
import {
	Book,
	FileText,
	Github,
	ScrollText,
	Send,
	Shield,
	Twitter,
} from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-background border-t border-border/50">
			<div className="container mx-auto px-4 py-16">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="col-span-1 md:col-span-2">
						<h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
							Dexion
						</h3>
						<p className="text-muted-foreground mb-6 max-w-md">
							The all-in-one web-based trading bot on Stacks, designed for
							speed, security, and simplicity. Trade smarter, not harder.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="flex items-center justify-center w-10 h-10 bg-secondary rounded-lg hover:bg-primary transition-colors duration-200 group"
								aria-label="Twitter"
							>
								<Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
							</a>
							<a
								href="#"
								className="flex items-center justify-center w-10 h-10 bg-secondary rounded-lg hover:bg-primary transition-colors duration-200 group"
								aria-label="GitHub"
							>
								<Github className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
							</a>
							<a
								href="#"
								className="flex items-center justify-center w-10 h-10 bg-secondary rounded-lg hover:bg-primary transition-colors duration-200 group"
								aria-label="Telegram"
							>
								<Send className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
							</a>
						</div>
					</div>

					{/* Resources */}
					<div>
						<h4 className="font-semibold text-foreground mb-4">Resources</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="#"
									className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
								>
									<Book className="w-4 h-4 mr-2" />
									Documentation
								</a>
							</li>
							<li>
								<a
									href="#"
									className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
								>
									<FileText className="w-4 h-4 mr-2" />
									Blog
								</a>
							</li>
							<li>
								<a
									href="#"
									className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
								>
									<Github className="w-4 h-4 mr-2" />
									GitHub
								</a>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className="font-semibold text-foreground mb-4">Legal</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="#"
									className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
								>
									<Shield className="w-4 h-4 mr-2" />
									Privacy Policy
								</a>
							</li>
							<li>
								<a
									href="#"
									className="flex items-center text-muted-foreground hover:text-accent transition-colors duration-200"
								>
									<ScrollText className="w-4 h-4 mr-2" />
									Terms of Service
								</a>
							</li>
						</ul>
					</div>
				</div>

				<Separator className="my-8 bg-border/50" />

				<div className="flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
					<div>© 2024 Dexion. All rights reserved.</div>
					<div className="mt-4 md:mt-0">Built on Stacks • Powered by Web3</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
