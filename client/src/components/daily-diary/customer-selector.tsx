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
      {/* Single compact field (search + select + create in row) */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        {/* Combined Search + Select */}
        <div className="w-full sm:max-w-[420px]">
          <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger id="customer-select" className="w-full h-10">
              <SelectValue placeholder="Search or select customer" />
            </SelectTrigger>
            <SelectContent>
              {/* Inline control row */}
              <div className="sticky top-0 z-10 bg-popover p-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      autoFocus
                      id="customer-search"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                      disabled={disabled}
                    />
                  </div>
                  {onCreateNew && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        onCreateNew();
                      }}
                      className="h-9 whitespace-nowrap"
                      disabled={disabled}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create
                    </Button>
                  )}
                </div>
              </div>

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
                    <div className="flex flex-row gap-2 items-center">
                      <span className="font-medium">{customer.name}</span>
                      {(customer.email || customer.phone) && (
                        <span className="text-xs text-muted-foreground">
                          ({customer.email || customer.phone})
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
        </div>

        {/* No external button to keep a single-field design */}
      </div>
    </div>
  );
}

