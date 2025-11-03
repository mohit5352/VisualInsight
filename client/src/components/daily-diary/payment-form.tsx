import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { BillWithRelations } from "@shared/schema";

interface PaymentFormProps {
  bill: BillWithRelations;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Payment Form Component
 * 
 * Inline expansion form for recording payments.
 * Follows existing patterns from record-payment-modal but adapted for inline use.
 * 
 * @future-enhancements:
 * - Quick payment buttons (25%, 50%, 75%, Full)
 * - Payment method icons
 * - Recent payment methods quick select
 * - Recurring payment setup
 * - Payment reminders
 */
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

export function PaymentForm({ bill, onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const totalAmount = parseFloat(bill.total || "0");
  const paidAmount = parseFloat(bill.paidAmount || "0");
  const outstandingAmount = parseFloat(bill.outstandingAmount || "0");

  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      amount: string;
      paymentDate: string;
      paymentMethod: string;
      notes: string;
    }) => {
      return apiRequest("POST", `/api/bills/${bill.id}/payments`, paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", bill.customer.id, "purchase-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills", bill.id, "payments"] });
      
      // Reset form
      setAmount("");
      setPaymentMethod("cash");
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      setNotes("");
      
      // Call success callback to close form
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (!amount || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (paymentAmount > outstandingAmount) {
      toast({
        title: "Error",
        description: `Payment amount cannot exceed outstanding amount of $${outstandingAmount.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    recordPaymentMutation.mutate({
      amount: amount,
      paymentDate: paymentDate,
      paymentMethod: paymentMethod,
      notes: notes,
    });
  };

  const handleFullPayment = () => {
    setAmount(outstandingAmount.toFixed(2));
  };

  const handleHalfPayment = () => {
    setAmount((outstandingAmount / 2).toFixed(2));
  };

  const paymentAmount = parseFloat(amount || "0");
  const newPaidAmount = paidAmount + paymentAmount;
  const newOutstanding = Math.max(0, outstandingAmount - paymentAmount);

  return (
    <div className="mt-4 pt-4 border-t animate-in slide-in-from-top-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bill Summary Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill Total:</span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-medium text-green-600">${paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground font-medium">Outstanding Amount:</span>
              <span className="font-bold text-orange-600">${outstandingAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Payment Amount *</Label>
          <div className="flex space-x-2">
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              max={outstandingAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={recordPaymentMutation.isPending || outstandingAmount <= 0}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFullPayment}
              disabled={outstandingAmount <= 0 || recordPaymentMutation.isPending}
            >
              Full
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleHalfPayment}
              disabled={outstandingAmount <= 0 || recordPaymentMutation.isPending}
            >
              Half
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum: ${outstandingAmount.toFixed(2)}
          </p>
        </div>

        {/* Payment Method and Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              disabled={recordPaymentMutation.isPending}
            >
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date">Payment Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10"
                required
                disabled={recordPaymentMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="payment-notes">Notes (Optional)</Label>
          <Textarea
            id="payment-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes or reference number..."
            rows={3}
            disabled={recordPaymentMutation.isPending}
          />
        </div>

        {/* Preview Card - shows new balances after payment */}
        {amount && paymentAmount > 0 && (
          <Card className="bg-muted/50 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Payment:</span>
                <span className="font-medium">${paymentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Paid Amount:</span>
                <span className="font-medium text-green-600">
                  ${newPaidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground font-medium">Remaining Outstanding:</span>
                <span className={`font-bold ${newOutstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  ${newOutstanding.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={recordPaymentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={recordPaymentMutation.isPending || !amount || outstandingAmount <= 0}
          >
            {recordPaymentMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2 inline-block"></div>
                Recording...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

