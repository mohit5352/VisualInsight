import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CustomerTable } from "@/components/customers/customer-table";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function Customers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Customer Management" 
          action={
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="hover-lift"
              data-testid="button-add-customer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          }
        />
        <div className="flex-1 overflow-auto p-6 animate-fade-in">
          <CustomerTable />
        </div>
      </main>
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
