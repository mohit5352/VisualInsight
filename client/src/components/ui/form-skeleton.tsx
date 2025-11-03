import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
  fieldGroups?: Array<{ columns: 1 | 2 | 3; fields: number }>; // number of fields in group
  showFooter?: boolean;
}

export function FormSkeleton({
  fieldGroups = [
    { columns: 1, fields: 1 },
    { columns: 2, fields: 2 },
    { columns: 1, fields: 1 },
  ],
  showFooter = true,
}: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      {fieldGroups.map((group, gi) => (
        <div
          key={gi}
          className={`grid grid-cols-1 ${group.columns === 2 ? "md:grid-cols-2" : group.columns === 3 ? "md:grid-cols-3" : ""} gap-4`}
        >
          {Array.from({ length: group.fields }).map((_, fi) => (
            <div key={`${gi}-${fi}`} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ))}

      {showFooter && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      )}
    </div>
  );
}


