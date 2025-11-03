import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Plus,
  Search,
  DollarSign,
  Package,
  Clock,
  Eye,
  CreditCard
} from "lucide-react";
import type { BillWithRelations, Customer } from "@shared/schema";
import { format } from "date-fns";
import { AddBillModal } from "./add-bill-modal";
import { RecordPaymentModal } from "./record-payment-modal";
import { TableSkeleton } from "@/components/ui/table-skeleton";

interface PurchaseHistoryModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PurchaseHistoryFilters {
  startDate: string;
  endDate: string;
}

export function PurchaseHistoryModal({ customer, open, onOpenChange }: PurchaseHistoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PurchaseHistoryFilters>({
    startDate: "",
    endDate: "",
  });
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<BillWithRelations | null>(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  // Build query params for purchase history
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);

  const { data: purchaseHistory, isLoading } = useQuery<BillWithRelations[]>({
    queryKey: ["/api/customers", customer.id, "purchase-history", filters],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customer.id}/purchase-history${filters ? `?${queryParams}` : ""}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: open,
  });

  const handleFilterChange = (field: keyof PurchaseHistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "" });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      paid: "default",
      cancelled: "destructive",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const totalAmount = purchaseHistory?.reduce((sum, bill) => sum + parseFloat(bill.total || "0"), 0) || 0;
  const totalPaid = purchaseHistory?.reduce((sum, bill) => sum + parseFloat(bill.paidAmount || "0"), 0) || 0;
  const totalOutstanding = purchaseHistory?.reduce((sum, bill) => sum + parseFloat(bill.outstandingAmount || "0"), 0) || 0;
  const totalBills = purchaseHistory?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5" />
            <span>Purchase History - {customer.name}</span>
          </DialogTitle>
          <DialogDescription>
            View and manage purchase history for {customer.name}
          </DialogDescription>
        </DialogHeader>

        {/* Customer Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Email</div>
                <div>{customer.email || "Not provided"}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Phone</div>
                <div>{customer.phone || "Not provided"}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Location</div>
                <div>{customer.city && customer.state ? `${customer.city}, ${customer.state}` : "Not provided"}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Tax ID</div>
                <div>{customer.taxId || "Not provided"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="startDate">From:</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="endDate">To:</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={() => setAddBillOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Bill
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Bills</div>
                  <div className="text-2xl font-bold">{totalBills}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Paid</div>
                  <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Outstanding</div>
                  <div className="text-2xl font-bold text-orange-600">${totalOutstanding.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={6} cols={10} />
            ) : purchaseHistory && purchaseHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-green-600">Paid</TableHead>
                      <TableHead className="text-orange-600">Outstanding</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistory.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          {bill.billNumber}
                        </TableCell>
                    <TableCell>
                      {bill.createdAt ? format(new Date(bill.createdAt), "MMM dd, yyyy") : "-"}
                    </TableCell>
                        <TableCell>
                          {bill.billItems.length} item{bill.billItems.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(bill.status || "pending")}
                        </TableCell>
                        <TableCell>${parseFloat(bill.subtotal || "0").toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(bill.taxAmount || "0").toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(bill.total || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="text-green-600">
                          ${parseFloat(bill.paidAmount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          ${parseFloat(bill.outstandingAmount || "0").toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(bill.outstandingAmount || "0") > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBillForPayment(bill);
                                setRecordPaymentOpen(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Record Payment
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No purchase history found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filters.startDate || filters.endDate
                    ? "No bills found for the selected date range"
                    : "This customer hasn't made any purchases yet"
                  }
                </p>
                <Button onClick={() => setAddBillOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Bill
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Bill Modal */}
        <AddBillModal
          customer={customer}
          open={addBillOpen}
          onOpenChange={setAddBillOpen}
        />

        {/* Record Payment Modal */}
        {selectedBillForPayment && (
          <RecordPaymentModal
            bill={selectedBillForPayment}
            open={recordPaymentOpen}
            onOpenChange={(open) => {
              setRecordPaymentOpen(open);
              if (!open) {
                setSelectedBillForPayment(null);
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
