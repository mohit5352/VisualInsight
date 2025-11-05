import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, User, Menu } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Store } from "lucide-react";

export function TopHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-gradient-to-l from-headerBg-start to-headerBg-end shadow-header flex items-center justify-between px-4 z-50 relative">
      {/* Left: Logo and Shop Name */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          data-testid="button-toggle-sidebar"
        >
          <Menu className="text-muted-foreground" />
        </Button>
        <Link href="/">
          <a className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <Store className="text-primary-foreground text-lg" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ShopFlow
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Inventory Manager</p>
            </div>
          </a>
        </Link>
      </div>

      {/* Right: Notifications, Theme Toggle, Profile */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 rounded-md hover:bg-muted hover-lift transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="text-foreground w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-md hover:bg-muted hover-lift transition-colors"
          data-testid="button-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="text-foreground w-5 h-5" />
          ) : (
            <Sun className="text-foreground w-5 h-5" />
          )}
        </Button>

        {/* Profile */}
        <Link href="/settings">
          <a className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="text-primary-foreground w-4 h-4" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </p>
            </div>
          </a>
        </Link>
      </div>
    </header>
  );
}

