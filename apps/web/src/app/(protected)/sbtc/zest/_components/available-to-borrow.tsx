import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";

const availableTokens = [
	{ token: "aeUSD", apy: 6.2, available: 5000000 },
	{ token: "sUSDT", apy: 5.8, available: 3200000 },
	{ token: "xBTC", apy: 7.5, available: 125 },
	{ token: "STX", apy: 8.2, available: 850000 },
];

export default function AvailableToBorrow() {
	return (
		<Card className="glass-panel border-border">
			<CardHeader>
				<CardTitle className="text-foreground">Available to Borrow</CardTitle>
				<CardDescription className="text-muted-foreground">
					Tokens you can borrow against your collateral
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{availableTokens.map((token) => (
						<div
							key={token.token}
							className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-[var(--zest)]/20 flex items-center justify-center">
									<span className="text-xs font-bold text-[var(--zest)]">
										{token.token.slice(0, 2)}
									</span>
								</div>
								<div>
									<p className="font-semibold text-foreground">{token.token}</p>
									<p className="text-xs text-muted-foreground">
										APY: {token.apy}%
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm text-muted-foreground">Available</p>
								<p className="text-sm font-semibold text-foreground">
									{token.available.toLocaleString()}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
