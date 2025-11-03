import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 6, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="space-y-2 mb-3">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={`head-${c}`} className="p-3 border-b bg-muted/30">
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`row-${r}`} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={`cell-${r}-${c}`} className="p-3 border-t">
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


