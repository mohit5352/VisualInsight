import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, Users, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalInventory: number;
  lowStockItems: number;
  totalCustomers: number;
  monthlyRevenue: string;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Inventory",
      value: stats?.totalInventory || 0,
      change: "+12% from last month",
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      changeColor: "text-accent"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      change: "Needs attention",
      icon: AlertTriangle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      changeColor: "text-destructive"
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      change: "+8% from last month",
      icon: Users,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      changeColor: "text-accent"
    },
    {
      title: "Monthly Revenue",
      value: `$${parseFloat(stats?.monthlyRevenue || "0").toLocaleString()}`,
      change: "+15% from last month",
      icon: DollarSign,
      iconBg: "bg-chart-1/10",
      iconColor: "text-chart-1",
      changeColor: "text-accent"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover-lift transition-all" data-testid={`card-stat-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${index}`}>
                  {card.value}
                </p>
                <p className={`text-sm ${card.changeColor}`}>
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} text-xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
