import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertBillSchema, insertBillItemSchema, type Customer, type InventoryItemWithRelations } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BillItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: string;
  total: string;
  inventoryItem?: InventoryItemWithRelations;
}

const billFormSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  taxRate: z.string().default("8.00"),
  notes: z.string().optional(),
});

type BillFormData = z.infer<typeof billFormSchema>;

export function BillModal({ isOpen, onClose }: BillModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: isOpen,
  });

  const { data: inventoryItems } = useQuery<InventoryItemWithRelations[]>({
    queryKey: ["/api/inventory"],
    enabled: isOpen,
  });

  const form = useForm<BillFormData>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      customerId: "",
      taxRate: "8.00",
      notes: "",
    },
  });

  const watchedCustomerId = form.watch("customerId");

  useEffect(() => {
    if (watchedCustomerId) {
      const customer = customers?.find(c => c.id === watchedCustomerId);
      setSelectedCustomer(customer || null);
    }
  }, [watchedCustomerId, customers]);

  const addBillItem = () => {
    setBillItems([...billItems, {
      inventoryItemId: "",
      quantity: 1,
      unitPrice: "0.00",
      total: "0.00",
    }]);
  };

  const removeBillItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const updateBillItem = (index: number, field: keyof BillItem, value: string | number) => {
    const updatedItems = [...billItems];
    const item = updatedItems[index];
    
    if (field === 'inventoryItemId') {
      const inventoryItem = inventoryItems?.find(inv => inv.id === value);
      item.inventoryItem = inventoryItem;
      item.unitPrice = inventoryItem?.unitPrice || "0.00";
    } else {
      item[field] = value as any;
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity?.toString() || "0");
      const unitPrice = parseFloat(item.unitPrice || "0");
      item.total = (quantity * unitPrice).toFixed(2);
    }
    
    setBillItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0);
    const taxRate = parseFloat(form.watch("taxRate") || "0") / 100;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const mutation = useMutation({
    mutationFn: async (data: BillFormData) => {
      const totals = calculateTotals();
      
      const billData = {
        customerId: data.customerId,
        subtotal: totals.subtotal,
        taxRate: data.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes: data.notes,
        status: "pending",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      const items = billItems.map(item => ({
        inventoryItemId: item.inventoryItemId,
        quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity?.toString() || "0"),
        unitPrice: item.unitPrice,
        total: item.total,
      }));

      const response = await apiRequest("POST", "/api/bills", {
        bill: billData,
        items,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      form.reset();
      setBillItems([]);
      setSelectedCustomer(null);
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
        description: "Failed to generate bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BillFormData) => {
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the bill",
        variant: "destructive",
      });
      return;
    }

    const hasInvalidItems = billItems.some(item => 
      !item.inventoryItemId || 
      !item.quantity || 
      item.quantity <= 0
    );

    if (hasInvalidItems) {
      toast({
        title: "Error",
        description: "Please ensure all items have valid quantities",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(data);
  };

  const totals = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto animate-fade-in">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bill Header */}
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">ShopFlow Materials</p>
                  <p className="text-muted-foreground">123 Business Street</p>
                  <p className="text-muted-foreground">City, State 12345</p>
                  <p className="text-muted-foreground">Phone: (555) 123-4567</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Customer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-customer">
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers?.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedCustomer && (
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                      <p>{selectedCustomer.email}</p>
                      <p>{selectedCustomer.phone}</p>
                      {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bill Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Items</CardTitle>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBillItem}
                  data-testid="button-add-bill-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {billItems.length > 0 ? (
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
                          <TableRow key={index} data-testid={`row-bill-item-${index}`}>
                            <TableCell>
                              <Select
                                value={item.inventoryItemId}
                                onValueChange={(value) => updateBillItem(index, 'inventoryItemId', value)}
                              >
                                <SelectTrigger data-testid={`select-item-${index}`}>
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
                                value={item.quantity}
                                onChange={(e) => updateBillItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                min="1"
                                max={item.inventoryItem?.quantity || 999}
                                data-testid={`input-quantity-${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateBillItem(index, 'unitPrice', e.target.value)}
                                data-testid={`input-price-${index}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              ${item.total}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBillItem(index)}
                                data-testid={`button-remove-item-${index}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added yet. Click "Add Item" to start building your invoice.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field}
                        data-testid="input-tax-rate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional notes" 
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bill Total */}
            {billItems.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="text-foreground" data-testid="text-subtotal">
                          ${totals.subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tax ({form.watch("taxRate")}%):
                        </span>
                        <span className="text-foreground" data-testid="text-tax">
                          ${totals.taxAmount}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                        <span className="text-foreground">Total:</span>
                        <span className="text-foreground" data-testid="text-total">
                          ${totals.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending || billItems.length === 0}
                data-testid="button-generate-bill"
              >
                {mutation.isPending ? "Generating..." : "Generate Bill"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
