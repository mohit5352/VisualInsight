import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { BillWithRelations } from "@shared/schema";
import { TransactionCard } from "./transaction-card";

interface TransactionTimelineProps {
  selectedDate: Date;
}

/**
 * Transaction Timeline Component
 * 
 * Main container for displaying all transactions for the selected date.
 * Supports multiple view modes and grouping options.
 * 
 * @future-enhancements:
 * - Toggle between chronological and grouped by customer
 * - Search/filter within transactions
 * - Sort options (time, customer, amount, status)
 * - Virtual scrolling for many transactions
 * - Empty state improvements
 * - Loading skeletons
 * - Pagination for large datasets
 */
export function TransactionTimeline({ selectedDate }: TransactionTimelineProps) {
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: dailyPurchases, isLoading, error } = useQuery<BillWithRelations[]>({
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

  // Group bills by customer for organized display
  // This can be toggled in future enhancements
  const billsByCustomer = dailyPurchases?.reduce((acc, bill) => {
    const customerId = bill.customer.id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(bill);
    return acc;
  }, {} as Record<string, BillWithRelations[]>) || {};

  const totalBills = dailyPurchases?.length || 0;

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <div className="h-5 w-40 bg-muted rounded mb-1" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-5 w-24 bg-muted rounded mb-1" />
                    <div className="h-4 w-40 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-3 pt-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-14 bg-muted/50 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-destructive mb-2">Error loading transactions</div>
            <div className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (totalBills === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No transactions found
            </h3>
            <p className="text-muted-foreground mb-4">
              No purchases were made on {format(selectedDate, "MMMM d, yyyy")}
            </p>
            {/* Future: Add "Create First Purchase" button */}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grouped view - can be toggled to chronological in future
  const viewMode: "chronological" | "grouped" = "grouped";

  if (viewMode === "grouped") {
    // Display grouped by customer
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="text-sm text-muted-foreground">
              {totalBills} transaction{totalBills !== 1 ? 's' : ''} from {Object.keys(billsByCustomer).length} customer{Object.keys(billsByCustomer).length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(billsByCustomer).map(([customerId, bills]) => {
              const customer = bills[0].customer;
              const customerTotal = bills.reduce(
                (sum, bill) => sum + parseFloat(bill.total || "0"),
                0
              );
              const customerPaid = bills.reduce(
                (sum, bill) => sum + parseFloat(bill.paidAmount || "0"),
                0
              );
              const customerOutstanding = bills.reduce(
                (sum, bill) => sum + parseFloat(bill.outstandingAmount || "0"),
                0
              );

              return (
                <div key={customerId} className="border rounded-lg p-4 space-y-4">
                  {/* Customer Header */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {customer.phone && (
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Total: ${customerTotal.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Paid: ${customerPaid.toFixed(2)} | Outstanding: ${customerOutstanding.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Customer's Bills */}
                  <div className="space-y-3">
                    {bills.map((bill) => (
                      <TransactionCard key={bill.id} bill={bill} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chronological view (future implementation)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dailyPurchases?.map((bill) => (
            <TransactionCard key={bill.id} bill={bill} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

