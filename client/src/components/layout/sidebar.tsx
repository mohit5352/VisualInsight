import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Store,
  Home,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  User
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard", active: location === "/" },
    { href: "/inventory", icon: Package, label: "Inventory", active: location === "/inventory" },
    { href: "/customers", icon: Users, label: "Customers", active: location === "/customers" },
    { href: "/billing", icon: FileText, label: "Billing", active: location === "/billing" },
    { href: "/reports", icon: BarChart3, label: "Reports", active: location === "/reports" },
    { href: "/settings", icon: Settings, label: "Settings", active: location === "/settings" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col sidebar-transition">
      {/* Logo Section */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <Store className="text-primary-foreground text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ShopFlow
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Inventory Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
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

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <a className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted cursor-pointer hover-lift transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="text-accent-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'user@shopflow.com'}
              </p>
            </div>
          </a>
        </Link>
      </div>
    </aside>
  );
}
