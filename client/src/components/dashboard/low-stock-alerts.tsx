import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { InventoryItemWithRelations } from "@shared/schema";

export function LowStockAlerts() {
  const { data: lowStockItems, isLoading } = useQuery<InventoryItemWithRelations[]>({
    queryKey: ["/api/dashboard/low-stock"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Low Stock Alerts
            <div className="w-6 h-6 bg-muted rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low Stock Alerts</CardTitle>
        <Badge 
          variant="destructive" 
          className="bg-destructive/10 text-destructive"
          data-testid="badge-low-stock-count"
        >
          {lowStockItems?.length || 0}
        </Badge>
      </CardHeader>
      <CardContent>
        {lowStockItems && lowStockItems.length > 0 ? (
          <div className="space-y-4">
            {lowStockItems.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                data-testid={`alert-low-stock-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Package className="text-destructive w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Only {item.quantity} units left
                    </p>
                  </div>
                </div>
                <Link href="/inventory">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm text-primary hover:text-primary/80"
                    data-testid={`button-reorder-${item.id}`}
                  >
                    Reorder
                  </Button>
                </Link>
              </div>
            ))}
            
            {lowStockItems.length > 5 && (
              <div className="pt-2">
                <Link href="/inventory">
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-primary hover:text-primary/80"
                    data-testid="button-view-all-alerts"
                  >
                    View All Alerts ({lowStockItems.length - 5} more)
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">All Stock Levels Good</h3>
            <p className="text-muted-foreground">No items are running low on stock</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
