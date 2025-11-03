import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, DollarSign, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { Payment } from "@shared/schema";

interface PaymentHistoryProps {
  billId: string;
}

/**
 * Payment History Component
 * 
 * Nested expandable section showing all payments for a bill.
 * Follows inline expansion pattern for consistency.
 * 
 * @future-enhancements:
 * - Payment method icons
 * - Edit payment functionality
 * - Delete payment functionality (with confirmation)
 * - Payment receipt generation
 * - Export payment history
 * - Payment trends/visualization
 */
export function PaymentHistory({ billId }: PaymentHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch payment history for this bill
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/bills", billId, "payments"],
    queryFn: async () => {
      const response = await fetch(`/api/bills/${billId}/payments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isExpanded, // Only fetch when expanded
  });

  // Payment method labels
  const getPaymentMethodLabel = (method: string | null | undefined): string => {
    if (!method) return "Not specified";
    const methods: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      bank_transfer: "Bank Transfer",
      cheque: "Cheque",
      upi: "UPI",
      other: "Other",
    };
    return methods[method] || method;
  };

  // Format payment date
  const formatPaymentDate = (date: Date | string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return "-";
    }
  };

  return (
    <div className="mt-3 pt-3 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium">
            Payment History {payments && !isExpanded && `(${payments.length})`}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading payment history...
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment) => (
                <Card key={payment.id} className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${parseFloat(payment.amount || "0").toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatPaymentDate(payment.paymentDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-3 h-3" />
                            <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                          </div>
                          {payment.notes && (
                            <div className="text-xs italic text-muted-foreground mt-1">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Future: Edit/Delete payment actions */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No payments recorded yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

