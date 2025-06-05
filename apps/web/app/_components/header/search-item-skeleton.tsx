import { Skeleton } from "@repo/ui/components/ui/skeleton";

const SearchItemSkeleton = () => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-4">
        <div className="flex gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-11 w-11 rounded-md" />

          <div className="flex flex-col justify-between">
            <div className="flex gap-2 items-center">
              {/* Token symbol skeleton */}
              <Skeleton className="h-3 w-12" />
              {/* Token name skeleton */}
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex gap-3">
              {/* Time indicator skeleton */}
              <Skeleton className="h-3 w-6" />
            </div>
          </div>
        </div>

        {/* Market cap metric skeleton */}
        <MetricSkeleton />
      </div>

      {/* Volume metric skeleton */}
      <MetricSkeleton />

      {/* Liquidity metric skeleton */}
      <MetricSkeleton />
    </div>
  );
};

const MetricSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Label skeleton */}
      <Skeleton className="h-2 w-6" />
      {/* Value skeleton */}
      <Skeleton className="h-3 w-12" />
    </div>
  );
};

export { SearchItemSkeleton, MetricSkeleton };
