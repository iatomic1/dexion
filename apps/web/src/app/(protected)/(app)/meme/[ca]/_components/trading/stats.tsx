export default function TradingStats() {
	return (
		<div className="mt-6 bg-blue-100">
			<div className="mb-2 grid grid-cols-3 gap-2 text-center text-sm">
				<div>
					<div className="text-xs text-muted-foreground">Bought</div>
					<div className="font-medium text-green-500">$31.04</div>
				</div>
				<div>
					<div className="text-xs text-muted-foreground">Sold</div>
					<div className="font-medium text-red-500">$0.4</div>
				</div>
				<div>
					<div className="text-xs text-muted-foreground">Holding</div>
					<div className="font-medium">$0</div>
				</div>
			</div>
			<div className="flex items-center justify-between text-xs">
				<span className="text-green-500">+$30.57 (+98.30%)</span>
			</div>
		</div>
	);
}
