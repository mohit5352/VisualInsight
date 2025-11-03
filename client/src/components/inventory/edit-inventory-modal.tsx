import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertInventoryItemSchema, type InsertInventoryItem, type Category, type Supplier, type InventoryItemWithRelations } from "@shared/schema";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionHeaderSkeleton } from "@/components/ui/section-header-skeleton";
import { FormSkeleton } from "@/components/ui/form-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
}

export function EditInventoryModal({ isOpen, onClose, itemId }: EditInventoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isOpen,
  });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    enabled: isOpen,
  });

  const { data: item, isLoading: isLoadingItem } = useQuery<InventoryItemWithRelations>({
    queryKey: [`/api/inventory/${itemId}`],
    enabled: isOpen && !!itemId,
    staleTime: 0, // Always fetch fresh data when modal opens
  });

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema.extend({
      quantity: z.number().int().min(0, "Quantity must be non-negative"),
      unitPrice: z.string().refine(
        (val) => parseFloat(val) >= 0,
        "Price must be non-negative"
      ),
    }).partial()),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      minStockLevel: 10,
      unitPrice: "0.00",
      sku: "",
    },
  });

  useEffect(() => {
    if (item && isOpen) {
      console.log("Resetting form with item data:", item);
      form.reset({
        name: item.name,
        description: item.description || "",
        categoryId: item.categoryId || "",
        supplierId: item.supplierId || "",
        quantity: item.quantity,
        minStockLevel: item.minStockLevel || 10,
        unitPrice: item.unitPrice.toString(),
        sku: item.sku || "",
      });
    }
  }, [item, isOpen, form.reset]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertInventoryItem>) => {
      console.log("Sending update data:", data);
      const response = await apiRequest("PUT", `/api/inventory/${itemId}`, data);
      console.log("Update response:", response);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
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
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventoryItem) => {
    console.log("onSubmit called with data:", data);
    // Convert string values to appropriate types
    const processedData = {
      ...data,
      quantity: data.quantity ?? 0,
      minStockLevel: data.minStockLevel ?? 10,
      unitPrice: data.unitPrice.toString(),
    };
    console.log("Processed data:", processedData);
    mutation.mutate(processedData);
  };

  if (!itemId) return null;

  const isInitialLoading = isLoadingItem || isLoadingCategories || isLoadingSuppliers;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        {isInitialLoading ? (
          <div className="space-y-4">
            <SectionHeaderSkeleton withSearch={false} />
            <FormSkeleton
              fieldGroups={[
                { columns: 1, fields: 1 },
                { columns: 1, fields: 1 },
                { columns: 1, fields: 1 },
                { columns: 2, fields: 2 },
                { columns: 2, fields: 2 },
                { columns: 1, fields: 1 },
              ]}
            />
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter item name"
                      {...field}
                      data-testid="input-edit-item-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      {...field}
                      value={field.value || ''}
                      data-testid="textarea-edit-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-edit-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || '0.00'}
                        data-testid="input-edit-unit-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      value={field.value ?? 10}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      data-testid="input-edit-min-stock"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Item SKU"
                      {...field}
                      value={field.value ?? ''}
                      data-testid="input-edit-sku"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-edit-save"
              >
                {mutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
