import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { DollarSign } from "lucide-react";
import type { BillWithRelations } from "@shared/schema";
import { format } from "date-fns";

interface RecordPaymentModalProps {
  bill: BillWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

export function RecordPaymentModal({ bill, open, onOpenChange }: RecordPaymentModalProps) {
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
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", bill.customer.id, "purchase-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      onOpenChange(false);
      // Reset form
      setAmount("");
      setPaymentMethod("cash");
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      setNotes("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Record Payment</span>
          </DialogTitle>
          <DialogDescription>
            Record payment for bill {bill.billNumber} - {bill.customer.name}
          </DialogDescription>
        </DialogHeader>

        {/* Bill Summary */}
        <Card>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={outstandingAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFullPayment}
                disabled={outstandingAmount <= 0}
              >
                Full Payment
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: ${outstandingAmount.toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
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
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <div className="flex">
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="flex-1 w-auto pr-2 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer dark:[color-scheme:dark] cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment notes or reference number..."
              rows={3}
            />
          </div>

          {/* New Balance Preview */}
          {amount && parseFloat(amount) > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Payment:</span>
                  <span className="font-medium">${parseFloat(amount || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Paid Amount:</span>
                  <span className="font-medium text-green-600">
                    ${(paidAmount + parseFloat(amount || "0")).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground font-medium">Remaining Outstanding:</span>
                  <span className="font-bold text-orange-600">
                    ${Math.max(0, outstandingAmount - parseFloat(amount || "0")).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={recordPaymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordPaymentMutation.isPending || !amount || outstandingAmount <= 0}
            >
              {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
