import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BillModal } from "@/components/billing/bill-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BillStatusBadge } from "@/components/ui/bill-status-badge";
import { FileText, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BillWithRelations } from "@shared/schema";
import { format } from "date-fns";
import { SectionHeaderSkeleton } from "@/components/ui/section-header-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bills, isLoading: billsLoading } = useQuery<BillWithRelations[]>({
    queryKey: ["/api/bills"],
    enabled: isAuthenticated,
  });

  const filteredBills = useMemo(() => {
    if (!bills) return [];
    if (!searchQuery.trim()) return bills;
    
    const query = searchQuery.toLowerCase();
    return bills.filter(bill =>
      bill.billNumber.toLowerCase().includes(query) ||
      bill.customer.name.toLowerCase().includes(query) ||
      bill.total.toLowerCase().includes(query) ||
      (bill.status && bill.status.toLowerCase().includes(query))
    );
  }, [bills, searchQuery]);
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

  // centralized badge now used via BillStatusBadge

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Billing & Invoices</h2>
            <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search bills, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-billing"
                />
              </div>
              <Button 
                onClick={() => setIsBillModalOpen(true)}
                className="hover-lift"
                data-testid="button-generate-bill"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>All Bills</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <>
                  <SectionHeaderSkeleton withBadge={false} />
                  <TableSkeleton rows={8} cols={6} />
                </>
              ) : filteredBills && filteredBills.length > 0 ? (
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
                      {filteredBills.map((bill) => (
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
                          <BillStatusBadge status={bill.status} />
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
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery ? "No bills found" : "No bills generated yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Try adjusting your search terms"
                      : "Start by creating your first invoice"
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={() => setIsBillModalOpen(true)}
                      data-testid="button-generate-first-bill"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate First Bill
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={() => setIsBillModalOpen(false)} 
      />
    </div>
  );
}
