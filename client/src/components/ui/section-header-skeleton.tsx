import { Skeleton } from "@/components/ui/skeleton";

interface SectionHeaderSkeletonProps {
  withSearch?: boolean;
  withBadge?: boolean;
}

export function SectionHeaderSkeleton({ withSearch = true, withBadge = true }: SectionHeaderSkeletonProps) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
        {withBadge && <Skeleton className="h-5 w-10 rounded-full" />}
      </div>
      {withSearch && (
        <Skeleton className="h-9 w-64" />
      )}
    </div>
  );
}


