import { Badge } from "@/components/ui/badge";

interface BillStatusBadgeProps {
  status?: string | null;
}

export function BillStatusBadge({ status }: BillStatusBadgeProps) {
  const normalized = (status || "pending").toString().trim().toLowerCase();

  const className = (() => {
    switch (normalized) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-500"; // success style
      case "partial":
        return "bg-orange-500/10 text-orange-600"; // partial payment
      case "cancelled":
        return "bg-red-500/10 text-red-600"; // cancelled/error
      case "pending":
      default:
        return "bg-amber-500/10 text-amber-600"; // pending/info
    }
  })();

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return <Badge className={className}>{label}</Badge>;
}


