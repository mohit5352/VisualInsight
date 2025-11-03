import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import type { Customer } from "@shared/schema";

interface CustomerSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  onCreateNew?: () => void;
  disabled?: boolean;
}

/**
 * Customer Selector Component
 * 
 * Enhanced dropdown for customer selection with search and quick create option.
 * Used in purchase form and other places where customer selection is needed.
 * 
 * @future-enhancements:
 * - Debounced search
 * - Recently used customers at top
 * - Customer stats on hover
 * - Keyboard navigation
 * - Virtual scrolling for large lists
 */
export function CustomerSelector({
  value,
  onValueChange,
  onCreateNew,
  disabled,
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch customers
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  // Filter customers by search query
  const filteredCustomers = customers?.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="customer-select">Customer *</Label>
      <div className="space-y-2">
        {/* Search Input - appears when dropdown is open or as separate field */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="customer-search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>

        {/* Customer Select Dropdown */}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger id="customer-select">
            <SelectValue placeholder="Select customer or create new" />
          </SelectTrigger>
          <SelectContent>
            {/* Create New Customer Option */}
            {onCreateNew && (
              <div className="border-b border-border p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onCreateNew();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Customer
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading customers...
              </div>
            )}

            {/* Customer List */}
            {!isLoading && filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    {(customer.email || customer.phone) && (
                      <span className="text-xs text-muted-foreground">
                        {customer.email || customer.phone}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : !isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery ? "No customers found" : "No customers available"}
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Quick Create Button (Alternative) */}
        {onCreateNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            className="w-full"
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Customer
          </Button>
        )}
      </div>
    </div>
  );
}

