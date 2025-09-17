import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BillModal } from "@/components/billing/bill-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BillWithRelations } from "@shared/schema";
import { format } from "date-fns";

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const { data: bills, isLoading: billsLoading } = useQuery<BillWithRelations[]>({
    queryKey: ["/api/bills"],
    enabled: isAuthenticated,
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-accent/10 text-accent';
      case 'pending':
        return 'bg-chart-4/10 text-chart-4';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Billing & Invoices" 
          action={
            <Button 
              onClick={() => setIsBillModalOpen(true)}
              className="hover-lift"
              data-testid="button-generate-bill"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Bill
            </Button>
          }
        />
        <div className="flex-1 overflow-auto p-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>All Bills</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bills && bills.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id} data-testid={`row-bill-${bill.id}`}>
                          <TableCell className="font-medium" data-testid={`text-bill-number-${bill.id}`}>
                            {bill.billNumber}
                          </TableCell>
                          <TableCell data-testid={`text-customer-${bill.id}`}>
                            {bill.customer.name}
                          </TableCell>
                          <TableCell data-testid={`text-items-count-${bill.id}`}>
                            {bill.billItems.length} items
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`text-total-${bill.id}`}>
                            ${parseFloat(bill.total).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={getStatusColor(bill.status || 'pending')}
                              data-testid={`badge-status-${bill.id}`}
                            >
                              {(bill.status || 'pending').charAt(0).toUpperCase() + (bill.status || 'pending').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-date-${bill.id}`}>
                            {format(new Date(bill.createdAt!), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No bills generated yet</h3>
                  <p className="text-muted-foreground mb-4">Start by creating your first invoice</p>
                  <Button 
                    onClick={() => setIsBillModalOpen(true)}
                    data-testid="button-generate-first-bill"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate First Bill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={() => setIsBillModalOpen(false)} 
      />
    </div>
  );
}
