import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import type { Customer, InventoryItem } from "@shared/schema";

interface BillItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

interface AddBillFormData {
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes: string;
  status: string;
}

interface AddBillModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBillModal({ customer, open, onOpenChange }: AddBillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AddBillFormData>({
    subtotal: "0.00",
    taxRate: "8.00",
    taxAmount: "0.00",
    total: "0.00",
    notes: "",
    status: "pending",
  });

  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Get inventory items for selection
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
    const subtotal = billItems.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0);
    const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    }));
  }, [billItems, formData.taxRate]);

  const addBillItem = () => {
    setBillItems(prev => [...prev, {
      inventoryItemId: "",
      quantity: 1,
      unitPrice: "0.00",
      total: "0.00",
    }]);
  };

  const updateBillItem = (index: number, field: keyof BillItem, value: string | number) => {
    setBillItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate total if quantity or unit price changed
      if (field === 'quantity' || field === 'unitPrice') {
        const item = updated[index];
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
        const unitPrice = parseFloat(String(item.unitPrice)) || 0;
        updated[index].total = (quantity * unitPrice).toFixed(2);
      }

      return updated;
    });
  };

  const removeBillItem = (index: number) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const createBillMutation = useMutation({
    mutationFn: async (data: { bill: AddBillFormData; items: BillItem[] }) => {
      return apiRequest("POST", `/api/customers/${customer.id}/bills`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers", customer.id, "purchase-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
      onOpenChange(false);
      // Reset form
      setFormData({
        subtotal: "0.00",
        taxRate: "8.00",
        taxAmount: "0.00",
        total: "0.00",
        notes: "",
        status: "pending",
      });
      setBillItems([]);
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
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      });
      return;
    }

    // Validate all items have valid data
    for (const item of billItems) {
      if (!item.inventoryItemId || item.quantity <= 0 || parseFloat(item.unitPrice) <= 0) {
        toast({
          title: "Error",
          description: "Please ensure all items have valid inventory selection, quantity, and price.",
          variant: "destructive",
        });
        return;
      }
    }

    createBillMutation.mutate({
      bill: formData,
      items: billItems,
    });
  };

  const getInventoryItemName = (id: string) => {
    const item = inventoryItems?.find(item => item.id === id);
    return item?.name || "Select item";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Bill - {customer.name}</span>
          </DialogTitle>
          <DialogDescription>
            Create a new bill for {customer.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bill Items</CardTitle>
              <Button type="button" onClick={addBillItem} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {billItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items added yet. Click "Add Item" to get started.</p>
                </div>
              ) : (
                billItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-12 sm:col-span-4">
                      <Label>Inventory Item</Label>
                      <Select
                        value={item.inventoryItemId}
                        onValueChange={(value) => {
                          const selectedItem = inventoryItems?.find(i => i.id === value);
                          updateBillItem(index, 'inventoryItemId', value);
                          if (selectedItem) {
                            updateBillItem(index, 'unitPrice', selectedItem.unitPrice);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems?.map((inventoryItem) => (
                            <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.name} - ${inventoryItem.unitPrice} (Stock: {inventoryItem.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="1"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateBillItem(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <Label>Total</Label>
                      <div className="flex items-center h-10 px-3 py-2 border border-input bg-background text-sm">
                        ${parseFloat(item.total || "0").toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBillItem(index)}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Bill Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Details</CardTitle>
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
                      value={formData.taxRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>Bill Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${formData.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>${formData.taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${formData.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBillMutation.isPending || billItems.length === 0}
            >
              {createBillMutation.isPending ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
