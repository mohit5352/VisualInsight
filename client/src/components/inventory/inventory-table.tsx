import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, Edit, Trash2, AlertTriangle } from "lucide-react";
import type { InventoryItemWithRelations } from "@shared/schema";

export function InventoryTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items, isLoading } = useQuery<InventoryItemWithRelations[]>({
    queryKey: ["/api/inventory"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isLowStock = (item: InventoryItemWithRelations) => {
    return item.quantity <= (item.minStockLevel || 10);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Inventory Items</span>
          <Badge variant="secondary">{items?.length || 0}</Badge>
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items, categories, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-inventory"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </div>
                        {item.sku && (
                          <div className="text-sm text-muted-foreground">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-category-${item.id}`}>
                      {item.category?.name || "-"}
                    </TableCell>
                    <TableCell data-testid={`text-supplier-${item.id}`}>
                      {item.supplier?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        {isLowStock(item) && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-unit-price-${item.id}`}>
                      ${parseFloat(item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell data-testid={`text-total-value-${item.id}`}>
                      ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {isLowStock(item) ? (
                        <Badge 
                          variant="destructive" 
                          className="bg-destructive/10 text-destructive"
                          data-testid={`badge-low-stock-${item.id}`}
                        >
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge 
                          variant="secondary"
                          className="bg-accent/10 text-accent"
                          data-testid={`badge-in-stock-${item.id}`}
                        >
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No items found" : "No inventory items yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Start by adding your first inventory item"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
