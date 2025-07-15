import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface WalletSkeletonProps {
	count?: number;
}

export default function WalletIemSkeleton({ count = 5 }: WalletSkeletonProps) {
	return (
		<div className="space-y-0">
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className={`flex items-center justify-between py-3 px-4 transition-colors duration-200 ${
						index % 2 === 0 ? "bg-background" : "bg-muted/30"
					}`}
				>
					{/* Left section */}
					<div className="flex items-center gap-7">
						{/* Time skeleton */}
						<Skeleton className="h-3 w-8" />

						{/* Nickname section */}
						<div className="flex items-center gap-4">
							{/* Emoji and nickname */}
							<div className="flex items-center gap-1">
								<Skeleton className="h-4 w-4 rounded" />
								<Skeleton className="h-3 w-16" />
							</div>

							{/* Address skeleton */}
							<div className="flex items-center gap-1">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-3 w-3" />
							</div>
						</div>
					</div>

					{/* Right section - Action buttons */}
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-6 rounded" />
						<Skeleton className="h-6 w-6 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}
