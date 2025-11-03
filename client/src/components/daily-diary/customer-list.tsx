import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Mail, Phone, User } from "lucide-react";
import type { Customer, CustomerWithStats } from "@shared/schema";

interface CustomerListProps {
  onEditCustomer?: (customer: Customer) => void;
  onSelectCustomer?: (customer: Customer) => void;
}

/**
 * Customer List Component
 * 
 * Displays searchable list of all customers with quick actions.
 * Used in customer panel for browsing and managing customers.
 * 
 * @future-enhancements:
 * - Pagination for large lists
 * - Sort options (name, last order, total spent)
 * - Filter by tags/categories
 * - Bulk actions
 * - Export customer list
 */
export function CustomerList({ onEditCustomer, onSelectCustomer }: CustomerListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch customers with stats
  const { data: customers, isLoading } = useQuery<CustomerWithStats[]>({
    queryKey: ["/api/customers", { withStats: true }],
    queryFn: async () => {
      const response = await fetch("/api/customers?withStats=true", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-history/daily"] });
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
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter customers by search query
  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b sticky top-0 bg-card z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <User className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold">{customer.name}</div>
                        {customer.taxId && (
                          <div className="text-xs text-muted-foreground">
                            Tax ID: {customer.taxId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      {customer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.city && customer.state && (
                        <div>
                          {customer.city}, {customer.state}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Orders: </span>
                        <Badge variant="secondary">{customer.totalBills}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-medium">
                          ${parseFloat(customer.totalAmount || "0").toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {onSelectCustomer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectCustomer(customer)}
                      >
                        Select
                      </Button>
                    )}
                    {onEditCustomer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCustomer(customer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(customer.id, customer.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No customers found" : "No customers yet"}
          </div>
        )}
      </div>
    </div>
  );
}

