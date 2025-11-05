import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Settings
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard", active: location === "/" },
    { href: "/inventory", icon: Package, label: "Inventory", active: location === "/inventory" },
    { href: "/customers", icon: Users, label: "Customers", active: location === "/customers" },
    { href: "/billing", icon: FileText, label: "Billing", active: location === "/billing" },
    { href: "/daily-diary", icon: BookOpen, label: "Daily Diary", active: location === "/daily-diary" },
    { href: "/reports", icon: BarChart3, label: "Reports", active: location === "/reports" },
    { href: "/settings", icon: Settings, label: "Settings", active: location === "/settings" },
  ];

  return (
    <aside className="w-64 bg-card shadow-sidebar flex flex-col sidebar-transition">
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 pt-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover-lift",
                    item.active
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm"
                  )}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
}
