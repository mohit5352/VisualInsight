import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Tag, Building2, Search } from "lucide-react";
import { AddCategoryModal } from "@/components/settings/add-category-modal";
import { AddSupplierModal } from "@/components/settings/add-supplier-modal";
import { CategoryTable } from "@/components/settings/category-table";
import { SupplierTable } from "@/components/settings/supplier-table";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "You have been logged out successfully",
        });
        // Redirect to landing page after successful logout
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to logout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Settings</h2>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Categories</span>
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Suppliers</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4" />
                <span>Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>User Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-accent-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email || 'User'
                        }
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <Card className="hover-lift transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Manage your notification preferences
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="hover-lift transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Security and privacy settings
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between mb-2 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Categories Management</h2>
                  <p className="text-muted-foreground">Manage your inventory categories</p>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      className="pl-10 h-10 w-full rounded-md border border-subtle bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    data-testid="button-add-category"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
              <CategoryTable searchQuery={categorySearch} />
            </TabsContent>

            {/* Suppliers Tab */}
            <TabsContent value="suppliers" className="space-y-6">
              <div className="flex items-center justify-between mb-2 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Suppliers Management</h2>
                  <p className="text-muted-foreground">Manage your suppliers and vendors</p>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      className="pl-10 h-10 w-full rounded-md border border-subtle bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Search suppliers..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => setIsAddSupplierModalOpen(true)}
                    data-testid="button-add-supplier"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Add Supplier
                  </Button>
                </div>
              </div>
              <SupplierTable searchQuery={supplierSearch} />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">Sign Out</h4>
                        <p className="text-sm text-muted-foreground">
                          Sign out of your VisualInsight account
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <AddCategoryModal 
            isOpen={isAddCategoryModalOpen} 
            onClose={() => setIsAddCategoryModalOpen(false)} 
          />
          <AddSupplierModal 
            isOpen={isAddSupplierModalOpen} 
            onClose={() => setIsAddSupplierModalOpen(false)} 
          />
        </main>
      </div>
    </div>
  );
}
