import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CalendarDays,
  DollarSign,
  Users,
  Package,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { BillWithRelations } from "@shared/schema";
import { format, parseISO, addDays, subDays, startOfDay, isToday, isYesterday } from "date-fns";

interface DailyPurchaseRegisterProps {
  defaultDate?: Date;
}

export function DailyPurchaseRegister({ defaultDate }: DailyPurchaseRegisterProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    defaultDate || new Date()
  );

  const { data: dailyPurchases, isLoading } = useQuery<BillWithRelations[]>({
    queryKey: ["/api/purchase-history/daily", selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(`/api/purchase-history/daily?date=${dateStr}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      direction === "prev" ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      partial: "default",
      paid: "default",
      cancelled: "destructive",
    } as const;
    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={status === "partial" ? "bg-orange-500 hover:bg-orange-600" : ""}
      >
        {status}
      </Badge>
    );
  };

  // Group bills by customer for better organization
  const billsByCustomer = dailyPurchases?.reduce((acc, bill) => {
    const customerId = bill.customer.id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(bill);
    return acc;
  }, {} as Record<string, BillWithRelations[]>) || {};

  const totalRevenue = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.total || "0"),
    0
  ) || 0;

  const totalPaid = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.paidAmount || "0"),
    0
  ) || 0;

  const totalOutstanding = dailyPurchases?.reduce(
    (sum, bill) => sum + parseFloat(bill.outstandingAmount || "0"),
    0
  ) || 0;

  const totalCustomers = Object.keys(billsByCustomer).length;
  const totalBills = dailyPurchases?.length || 0;

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5" />
              <span>Daily Purchase Register</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                  className="w-40"
                />
                {!isToday(selectedDate) && (
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-muted-foreground">{getDateLabel(selectedDate)}</div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customers</div>
                <div className="text-2xl font-bold">{totalCustomers}</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Paid / Outstanding</div>
                <div className="text-lg font-bold">${totalPaid.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  ${totalOutstanding.toFixed(2)} pending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Purchases by Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Purchases for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : totalBills > 0 ? (
            <div className="space-y-6">
              {Object.entries(billsByCustomer).map(([customerId, bills]) => {
                const customer = bills[0].customer;
                const customerTotal = bills.reduce(
                  (sum, bill) => sum + parseFloat(bill.total || "0"),
                  0
                );
                const customerPaid = bills.reduce(
                  (sum, bill) => sum + parseFloat(bill.paidAmount || "0"),
                  0
                );
                const customerOutstanding = bills.reduce(
                  (sum, bill) => sum + parseFloat(bill.outstandingAmount || "0"),
                  0
                );

                return (
                  <div key={customerId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">Total: ${customerTotal.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Paid: ${customerPaid.toFixed(2)} | Outstanding: ${customerOutstanding.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill Number</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Outstanding</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium">{bill.billNumber}</TableCell>
                            <TableCell>
                              {bill.createdAt
                                ? format(new Date(bill.createdAt), "h:mm a")
                                : "-"}
                            </TableCell>
                            <TableCell>{bill.billItems.length} items</TableCell>
                            <TableCell>{getStatusBadge(bill.status || "pending")}</TableCell>
                            <TableCell>${parseFloat(bill.total || "0").toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">
                              ${parseFloat(bill.paidAmount || "0").toFixed(2)}
                            </TableCell>
                            <TableCell className="text-orange-600 font-medium">
                              ${parseFloat(bill.outstandingAmount || "0").toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No purchases found
              </h3>
              <p className="text-muted-foreground">
                No purchases were made on {format(selectedDate, "MMMM d, yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
