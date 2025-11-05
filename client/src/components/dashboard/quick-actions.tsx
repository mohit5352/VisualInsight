import { Card, CardContent } from "@/components/ui/card";
import { Plus, UserPlus, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      title: "Add Inventory",
      description: "Add new materials",
      href: "/inventory",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "button-add-inventory"
    },
    {
      icon: UserPlus,
      title: "Add Customer",
      description: "Register new customer",
      href: "/customers",
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
      testId: "button-add-customer"
    },
    {
      icon: FileText,
      title: "Generate Bill",
      description: "Create new invoice",
      href: "/billing",
      bgColor: "bg-chart-1/10",
      iconColor: "text-chart-1",
      testId: "button-generate-bill"
    },
    {
      icon: BarChart3,
      title: "View Reports",
      description: "Business analytics",
      href: "/reports",
      bgColor: "bg-chart-2/10",
      iconColor: "text-chart-2",
      testId: "button-view-reports"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <a data-testid={action.testId} className="block">
            <Card className="hover-lift transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                      <action.icon className={`${action.iconColor} w-5 h-5`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
