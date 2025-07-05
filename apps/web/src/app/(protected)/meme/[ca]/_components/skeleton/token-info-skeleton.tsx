import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";

export default function TokenInfoSkeleton() {
	return (
		<div className="border-b bg-background px-2 pb-1 h-fit sm:flex justify-between items-center">
			<div className="flex flex-col gap-3 md:flex-row md:gap-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Avatar skeleton */}
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								{/* Token name skeleton */}
								<Skeleton className="h-6 w-20" />
								{/* Token symbol skeleton */}
								<Skeleton className="h-4 w-12" />
								{/* Action buttons skeleton */}
								<div className="flex gap-1">
									<Skeleton className="h-6 w-6 rounded-full" />
									<Skeleton className="h-6 w-6 rounded-full" />
								</div>
							</div>
							{/* Socials skeleton */}
							<div className="flex gap-2 mt-1">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>
						</div>
					</div>
					{/* Mobile actions skeleton */}
					<div className="sm:hidden flex items-center gap-1">
						<Skeleton className="h-7 w-7 rounded-full" />
						<Skeleton className="h-7 w-7 rounded-full" />
						<Skeleton className="h-7 w-7 rounded-full" />
					</div>
				</div>
				<div className="flex items-center justify-between md:gap-3 xl:gap-6">
					{/* Market cap skeleton - desktop */}
					<Skeleton className="h-6 w-16 hidden sm:flex" />

					{/* Metrics skeletons */}
					<MetricItemSkeleton className="sm:hidden" />
					<MetricItemSkeleton />
					<MetricItemSkeleton />
					<MetricItemSkeleton />
				</div>
			</div>
			{/* Desktop actions skeleton */}
			<div className="hidden sm:flex items-center gap-1 ml-2">
				<Skeleton className="h-6 w-6 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-full" />
			</div>
		</div>
	);
}

const MetricItemSkeleton = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				"flex sm:flex-col gap-1 items-center sm:items-start",
				className,
			)}
		>
			{/* Label skeleton */}
			<Skeleton className="h-3 w-5 sm:hidden" />
			<Skeleton className="h-3 w-14 hidden sm:flex" />
			{/* Value skeleton */}
			<Skeleton className="h-5 w-14" />
		</div>
	);
};
