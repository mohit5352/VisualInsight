import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Calculator } from "lucide-react";
import type { Customer, InventoryItem } from "@shared/schema";
import { CustomerSelector } from "./customer-selector";

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedCustomerId?: string;
  onCustomerIdChange?: (customerId: string) => void;
  onCreateCustomer?: () => void;
}

interface BillItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

/**
 * Purchase Form Component
 * 
 * Bottom sheet form for creating new purchases/bills.
 * Includes customer selection, item management, and totals calculation.
 * 
 * @future-enhancements:
 * - Save as draft functionality
 * - Quick item selection (recent items)
 * - Barcode scanning
 * - Batch item entry
 * - Discounts/promotions
 * - Template bills
 */
export function PurchaseForm({
  open,
  onClose,
  selectedDate,
  selectedCustomerId,
  onCustomerIdChange,
  onCreateCustomer,
}: PurchaseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState<string>(selectedCustomerId || "");
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [taxRate, setTaxRate] = useState("8.00");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  // Sync with external customerId changes
  useEffect(() => {
    if (selectedCustomerId && selectedCustomerId !== customerId) {
      setCustomerId(selectedCustomerId);
    }
  }, [selectedCustomerId, customerId]);

  // Update external state when customerId changes
  const handleCustomerIdChange = (value: string) => {
    setCustomerId(value);
    onCustomerIdChange?.(value);
  };

  // Fetch inventory items
  const { data: inventoryItems } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const response = await fetch("/api/inventory", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: open,
  });

  // Calculate totals when items or tax rate change
  useEffect(() => {
    const subtotal = billItems.reduce(
      (sum, item) => sum + parseFloat(item.total || "0"),
      0
    );
    const taxAmount = subtotal * (parseFloat(taxRate) / 100);
    const total = subtotal + taxAmount;

    // Store calculated values for later use
    // (subtotal, taxAmount, total will be used in mutation)
  }, [billItems, taxRate]);

  const addBillItem = () => {
    setBillItems((prev) => [
      ...prev,
      {
        inventoryItemId: "",
        quantity: 1,
        unitPrice: "0.00",
        total: "0.00",
      },
    ]);
  };

  const updateBillItem = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    setBillItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate total if quantity or unit price changed
      if (field === "quantity" || field === "unitPrice") {
        const item = updated[index];
        const quantity =
          typeof item.quantity === "number"
            ? item.quantity
            : parseFloat(String(item.quantity)) || 0;
        const unitPrice = parseFloat(String(item.unitPrice)) || 0;
        updated[index].total = (quantity * unitPrice).toFixed(2);
      }

      return updated;
    });
  };

  const removeBillItem = (index: number) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = billItems.reduce(
      (sum, item) => sum + parseFloat(item.total || "0"),
      0
    );
    const taxAmount = subtotal * (parseFloat(taxRate) / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const createBillMutation = useMutation({
    mutationFn: async () => {
      const totals = calculateTotals();

      const billData = {
        customerId: customerId,
        subtotal: totals.subtotal,
        taxRate: taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes: notes || "",
        status: status,
      };

      const items = billItems.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity:
          typeof item.quantity === "number"
            ? item.quantity
            : parseInt(String(item.quantity)) || 0,
        unitPrice: item.unitPrice,
        total: item.total,
      }));

      // Use the customer-specific endpoint
      return apiRequest("POST", `/api/customers/${customerId}/bills`, {
        bill: billData,
        items,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase created successfully",
      });
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });

      // Reset form
      setCustomerId("");
      setBillItems([]);
      setTaxRate("8.00");
      setNotes("");
      setStatus("pending");

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
        description: "Failed to create purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }

    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the purchase.",
        variant: "destructive",
      });
      return;
    }

    // Validate all items have valid data
    for (const item of billItems) {
      if (
        !item.inventoryItemId ||
        item.quantity <= 0 ||
        parseFloat(item.unitPrice) <= 0
      ) {
        toast({
          title: "Error",
          description:
            "Please ensure all items have valid inventory selection, quantity, and price.",
          variant: "destructive",
        });
        return;
      }
    }

    createBillMutation.mutate();
  };

  const totals = calculateTotals();

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="New Purchase"
      description="Create a new purchase for the selected date"
      className="max-h-[85vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <CustomerSelector
          value={customerId}
          onValueChange={handleCustomerIdChange}
          onCreateNew={onCreateCustomer}
          disabled={createBillMutation.isPending}
        />

        {/* Bill Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Items</CardTitle>
            <Button
              type="button"
              onClick={addBillItem}
              size="sm"
              disabled={createBillMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {billItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Price</TableHead>
                      <TableHead className="w-32">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.map((item, index) => (
                      <TableRow key={index} data-testid={`row-purchase-item-${index}`}>
                        <TableCell>
                          <Select
                            value={item.inventoryItemId}
                            onValueChange={(value) => {
                              const selectedItem = inventoryItems?.find((i) => i.id === value);
                              updateBillItem(index, "inventoryItemId", value);
                              if (selectedItem) {
                                updateBillItem(index, "unitPrice", selectedItem.unitPrice);
                              }
                            }}
                            disabled={createBillMutation.isPending}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems?.map((inventoryItem) => (
                                <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                  {inventoryItem.name} (Stock: {inventoryItem.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateBillItem(index, "quantity", parseInt(e.target.value) || 1)
                            }
                            placeholder="1"
                            disabled={createBillMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateBillItem(index, "unitPrice", e.target.value)}
                            placeholder="0.00"
                            disabled={createBillMutation.isPending}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${parseFloat(item.total || "0").toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBillItem(index)}
                            disabled={createBillMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill Details and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bill Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={createBillMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    disabled={createBillMutation.isPending}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={3}
                  disabled={createBillMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Calculator className="w-4 h-4" />
                <span>Bill Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({taxRate}%):
                  </span>
                  <span className="font-medium">${totals.taxAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${totals.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t sticky bottom-0 bg-card pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createBillMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createBillMutation.isPending || billItems.length === 0 || !customerId}
          >
            {createBillMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2 inline-block"></div>
                Creating...
              </>
            ) : (
              "Create Purchase"
            )}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}

