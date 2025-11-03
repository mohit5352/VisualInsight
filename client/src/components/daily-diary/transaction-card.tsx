import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Eye, 
  Edit,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import type { BillWithRelations } from "@shared/schema";
import { PaymentForm } from "./payment-form";
import { PaymentHistory } from "./payment-history";
import { BillExport } from "./bill-export";
import { BillEditPanel } from "./bill-edit-panel";

interface TransactionCardProps {
  bill: BillWithRelations;
}

/**
 * Transaction Card Component
 * 
 * Displays individual transaction/bill information.
 * Supports inline expansion for details and actions.
 * 
 * @future-enhancements:
 * - Edit bill functionality (opens side panel)
 * - Record payment (inline form)
 * - Export/print bill
 * - View full bill details
 * - Payment history display
 * - Quick actions menu
 * - Status color coding
 */
export function TransactionCard({ bill }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBillExport, setShowBillExport] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const totalAmount = parseFloat(bill.total || "0");
  const paidAmount = parseFloat(bill.paidAmount || "0");
  const outstandingAmount = parseFloat(bill.outstandingAmount || "0");
  const status = bill.status || "pending";

  // Status badge configuration - easy to customize
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", className?: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      partial: { variant: "default", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
      paid: { variant: "default", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
      cancelled: { variant: "destructive" },
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge 
        variant={config.variant}
        className={config.className}
      >
        {status}
      </Badge>
    );
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        {/* Collapsed State */}
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-medium text-sm text-muted-foreground">
                    {bill.createdAt 
                      ? format(new Date(bill.createdAt), "h:mm a")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{bill.billNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {bill.customer.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-bold">${totalAmount.toFixed(2)}</div>
                  {getStatusBadge(status)}
                </div>
              </div>
            </div>

            {/* Summary Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {bill.billItems.length} item{bill.billItems.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-medium">
                  Paid: ${paidAmount.toFixed(2)}
                </span>
                {outstandingAmount > 0 && (
                  <span className="text-orange-600 font-medium">
                    Due: ${outstandingAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded State */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4 animate-in slide-in-from-top-2">
            {/* Items Breakdown */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Items:</h4>
              <div className="space-y-1">
                {bill.billItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>
                      {item.quantity}x {item.inventoryItem?.name || "Item"}
                    </span>
                    <span>
                      ${parseFloat(item.unitPrice || "0").toFixed(2)} = ${parseFloat(item.total || "0").toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Subtotal:</div>
                <div className="font-medium">${parseFloat(bill.subtotal || "0").toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tax ({bill.taxRate}%):</div>
                <div className="font-medium">${parseFloat(bill.taxAmount || "0").toFixed(2)}</div>
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Notes:</div>
                <div className="text-sm">{bill.notes}</div>
              </div>
            )}

            {/* Payment History */}
            <PaymentHistory billId={bill.id} />

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-2 pt-2 border-t">
              {outstandingAmount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPaymentForm(!showPaymentForm);
                    if (!showPaymentForm) {
                      setIsExpanded(true); // Ensure card is expanded when showing payment form
                    }
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  {showPaymentForm ? "Hide Payment Form" : "Record Payment"}
                </Button>
              )}
              {/* View Details removed to avoid duplication with Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditPanel(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBillExport(true)}
                aria-label="Export or View Invoice"
              >
                <FileText className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>

            {/* Payment Form - Inline Expansion */}
            {showPaymentForm && (
              <PaymentForm
                bill={bill}
                onSuccess={() => {
                  setShowPaymentForm(false);
                  // Card will auto-update via query invalidation
                }}
                onCancel={() => {
                  setShowPaymentForm(false);
                }}
              />
            )}
          </div>
        )}

        {/* Bill Export Dialog */}
        <BillExport
          bill={bill}
          open={showBillExport}
          onClose={() => setShowBillExport(false)}
        />

        {/* Bill Edit Panel */}
        <BillEditPanel
          bill={bill}
          open={showEditPanel}
          onClose={() => setShowEditPanel(false)}
        />
      </CardContent>
    </Card>
  );
}

