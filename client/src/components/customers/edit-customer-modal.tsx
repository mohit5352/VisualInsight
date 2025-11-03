import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

export function EditCustomerModal({ isOpen, onClose, customerId }: EditCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: [`/api/customers/${customerId}`],
    enabled: isOpen && !!customerId,
    staleTime: 0, // Always fetch fresh data when modal opens
  });

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema.partial()),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      taxId: "",
    },
  });

  useEffect(() => {
    if (customer && isOpen) {
      console.log("Resetting customer form with data:", customer);
      form.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        zipCode: customer.zipCode || "",
        taxId: customer.taxId || "",
      });
    }
  }, [customer, isOpen, form.reset]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertCustomer>) => {
      console.log("Sending customer update data:", data);
      const response = await apiRequest("PUT", `/api/customers/${customerId}`, data);
      console.log("Customer update response:", response);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
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
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    console.log("onSubmit called with customer data:", data);
    // Only include fields that have changed or are not empty
    const cleanedData: Partial<InsertCustomer> = {};
    Object.keys(data).forEach(key => {
      const value = data[key as keyof InsertCustomer];
      if (value !== "" && value !== null && value !== undefined) {
        cleanedData[key as keyof InsertCustomer] = value;
      }
    });
    console.log("Processed customer data:", cleanedData);
    mutation.mutate(cleanedData);
  };

  if (!customerId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <SectionHeaderSkeleton withSearch={false} />
            <FormSkeleton
              fieldGroups={[
                { columns: 1, fields: 1 },
                { columns: 2, fields: 2 },
                { columns: 1, fields: 1 },
                { columns: 3, fields: 3 },
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
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter customer name"
                      {...field}
                      data-testid="input-edit-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-customer-email"
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                    <Input
                      placeholder="Phone number"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-customer-phone"
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Street address"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-edit-customer-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-customer-city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="State"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-customer-state"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ZIP"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-customer-zip"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tax identification number"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-customer-tax-id"
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
                data-testid="button-edit-customer-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !customer}
                data-testid="button-edit-customer-save"
              >
                {mutation.isPending ? "Updating..." : !customer ? "Loading..." : "Update Customer"}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
