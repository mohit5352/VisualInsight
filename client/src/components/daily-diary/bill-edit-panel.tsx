import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";
import { SidePanel } from "@/components/ui/side-panel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import type { BillWithRelations } from "@shared/schema";

interface BillEditPanelProps {
  bill: BillWithRelations;
  open: boolean;
  onClose: () => void;
}

const billEditSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(["pending", "partial", "paid", "cancelled"]).optional(),
});

type BillEditFormData = z.infer<typeof billEditSchema>;

/**
 * Bill Edit Panel Component
 * 
 * Side panel for editing bill details (notes and status).
 * Since the API only supports status updates, we focus on editable fields.
 * 
 * @future-enhancements:
 * - Full bill editing (items, quantities, prices) if API supports it
 * - Due date editing
 * - Customer change
 */
export function BillEditPanel({ bill, open, onClose }: BillEditPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BillEditFormData>({
    resolver: zodResolver(billEditSchema),
    defaultValues: {
      notes: bill.notes || "",
      status: (bill.status as "pending" | "partial" | "paid" | "cancelled") || "pending",
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest(
        "PUT",
        `/api/bills/${bill.id}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onClose();
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
        description: "Failed to update bill status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BillEditFormData) => {
    // Update status if changed
    if (data.status && data.status !== bill.status) {
      updateStatusMutation.mutate(data.status);
    } else {
      // If only notes changed, show a message (notes editing not yet supported by API)
      if (data.notes !== bill.notes) {
        toast({
          title: "Note",
          description: "Notes editing will be available in a future update.",
        });
      } else {
        onClose();
      }
    }
  };

  const totalAmount = parseFloat(bill.total || "0");
  const paidAmount = parseFloat(bill.paidAmount || "0");
  const outstandingAmount = parseFloat(bill.outstandingAmount || "0");

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Edit Bill"
      description={`Bill #${bill.billNumber}`}
      width="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col">
          {/* Bill Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{bill.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${paidAmount.toFixed(2)}
                </span>
              </div>
              {outstandingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    ${outstandingAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{bill.billItems.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields */}
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateStatusMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this bill..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={updateStatusMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Note: Notes editing will be available in a future update.
                  </p>
                </FormItem>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2 inline-block"></div>
                  Updating...
                </>
              ) : (
                "Update Bill"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </SidePanel>
  );
}

