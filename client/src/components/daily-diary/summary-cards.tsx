import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, DollarSign } from "lucide-react";
import type { BillWithRelations } from "@shared/schema";
import { format } from "date-fns";
import { StatCardSkeletonGrid } from "@/components/ui/stat-card-skeleton";

interface SummaryCardsProps {
  selectedDate: Date;
}

/**
 * Summary Cards Component
 * 
 * Displays key metrics for the selected date.
 * Designed to be clickable in the future for filtering.
 * 
 * @future-enhancements:
 * - Click cards to filter timeline
 * - Hover effects with additional details
 * - Comparison with previous day/week
 * - Sparkline charts
 * - Color coding based on performance
 * - Loading states with skeletons
 */
export function SummaryCards({ selectedDate }: SummaryCardsProps) {
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch daily purchases
  const { data: dailyPurchases, isLoading } = useQuery<BillWithRelations[]>({
    queryKey: ["/api/purchase-history/daily", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/purchase-history/daily?date=${dateStr}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Calculate metrics
  const totalCustomers = dailyPurchases 
    ? new Set(dailyPurchases.map(bill => bill.customer.id)).size
    : 0;

  const totalBills = dailyPurchases?.length || 0;

  const totalRevenue = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.total || "0"),
    0
  ) || 0;

  const totalPaid = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.paidAmount || "0"),
    0
  ) || 0;

  const totalOutstanding = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.outstandingAmount || "0"),
    0
  ) || 0;

  // Cards data - easy to extend with more metrics
  const cards = [
    {
      icon: Users,
      label: "Customers",
      value: totalCustomers,
      subtitle: `${totalCustomers} unique customer${totalCustomers !== 1 ? 's' : ''}`,
      // future: onClick to filter by customer
    },
    {
      icon: Package,
      label: "Total Bills",
      value: totalBills,
      subtitle: `${totalBills} transaction${totalBills !== 1 ? 's' : ''}`,
      // future: onClick to show all bills
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      subtitle: `From all transactions`,
      // future: onClick to show revenue breakdown
    },
    {
      icon: DollarSign,
      label: "Paid / Outstanding",
      value: `$${totalPaid.toFixed(2)}`,
      subtitle: `$${totalOutstanding.toFixed(2)} pending`,
      variant: totalOutstanding > 0 ? "outstanding" : "paid",
      // future: onClick to show payment details
    },
  ];

  if (isLoading) {
    return <StatCardSkeletonGrid />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className="hover-lift transition-all cursor-pointer"
            // future: onClick={card.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {card.value}
                  </div>
                  {card.subtitle && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {card.subtitle}
                    </div>
                  )}
                  {card.variant === "outstanding" && totalOutstanding > 0 && (
                    <div className="text-xs text-orange-600 font-medium mt-1">
                      ${totalOutstanding.toFixed(2)} pending
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
    </div>
  );
}

