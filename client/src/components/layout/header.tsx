import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, Moon, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          data-testid="button-toggle-sidebar"
        >
          <Menu className="text-muted-foreground" />
        </Button>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search inventory, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-10 pr-4 py-2"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
        
        {/* Action Button */}
        {action}
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm"
          className="relative p-2 rounded-md hover:bg-muted hover-lift transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="text-muted-foreground w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          className="p-2 rounded-md hover:bg-muted hover-lift transition-colors"
          data-testid="button-theme-toggle"
        >
          <Moon className="text-muted-foreground w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
