import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer, Download, X } from "lucide-react";
import { format } from "date-fns";
import type { BillWithRelations, Payment } from "@shared/schema";
import "./bill-export.css";

interface BillExportProps {
  bill: BillWithRelations;
  open: boolean;
  onClose: () => void;
}

/**
 * Bill Export Component
 * 
 * Professional invoice/bill export component with print and PDF functionality.
 * Displays bill in a professional invoice format with shop details, customer info,
 * items table, payment history, and footer.
 * 
 * @future-enhancements:
 * - PDF generation with jsPDF
 * - Shop logo upload and display
 * - Multiple invoice templates
 * - Email invoice functionality
 * - Customizable invoice colors/theme
 * - Invoice number customization
 */
export function BillExport({ bill, open, onClose }: BillExportProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch payment history for this bill
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/bills", bill.id, "payments"],
    queryFn: async () => {
      const response = await fetch(`/api/bills/${bill.id}/payments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: open,
  });

  // Shop details - can be moved to settings in future
  const shopDetails = {
    name: "ShopFlow Materials",
    address: "123 Business Street",
    city: "City, State 12345",
    phone: "(555) 123-4567",
    email: "info@shopflow.com",
    // logo: null, // Future: Add logo support
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Small delay to ensure content is rendered
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDownloadPDF = () => {
    // Future: Implement PDF download using jsPDF
    // For now, trigger print dialog which can save as PDF
    // Users can choose "Save as PDF" in print dialog
    handlePrint();
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string | null | undefined): string => {
    if (!method) return "Not specified";
    const methods: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      bank_transfer: "Bank Transfer",
      cheque: "Cheque",
      upi: "UPI",
      other: "Other",
    };
    return methods[method] || method;
  };

  // Format payment date
  const formatPaymentDate = (date: Date | string | null | undefined): string => {
    if (!date) return "-";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "-";
    }
  };

  const totalAmount = parseFloat(bill.total || "0");
  const paidAmount = parseFloat(bill.paidAmount || "0");
  const outstandingAmount = parseFloat(bill.outstandingAmount || "0");
  const subtotal = parseFloat(bill.subtotal || "0");
  const taxAmount = parseFloat(bill.taxAmount || "0");

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Actions - Only visible when not printing */}
          {!isPrinting && (
            <div className="flex justify-end space-x-2 mb-4 print:hidden">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Invoice Content */}
          <div className="invoice-content bg-white p-8 print:p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 print:mb-6 border-b border-gray-300 pb-6 print:pb-4">
              <div>
                {/* Shop Logo Placeholder - Future: Add actual logo */}
                <div className="w-16 h-16 bg-primary/10 rounded-lg mb-4 print:hidden"></div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {shopDetails.name}
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{shopDetails.address}</p>
                  <p>{shopDetails.city}</p>
                  <p>Phone: {shopDetails.phone}</p>
                  <p>Email: {shopDetails.email}</p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-semibold">Invoice #: {bill.billNumber}</p>
                  <p>Date: {bill.createdAt ? format(new Date(bill.createdAt), "MMMM dd, yyyy") : "-"}</p>
                  {bill.dueDate && (
                    <p>Due Date: {format(new Date(bill.dueDate), "MMMM dd, yyyy")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8 print:mb-6 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                  Bill To:
                </h3>
                <div className="text-sm text-gray-900">
                  <p className="font-semibold text-base">{bill.customer.name}</p>
                  {bill.customer.address && <p>{bill.customer.address}</p>}
                  {(bill.customer.city || bill.customer.state) && (
                    <p>
                      {bill.customer.city && bill.customer.city}
                      {bill.customer.city && bill.customer.state && ", "}
                      {bill.customer.state && bill.customer.state}
                      {bill.customer.zipCode && ` ${bill.customer.zipCode}`}
                    </p>
                  )}
                  {bill.customer.phone && <p>Phone: {bill.customer.phone}</p>}
                  {bill.customer.email && <p>Email: {bill.customer.email}</p>}
                  {bill.customer.taxId && <p>Tax ID: {bill.customer.taxId}</p>}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                  Payment Status:
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Status: </span>
                    <span className="uppercase font-semibold">{bill.status || "pending"}</span>
                  </p>
                  <p>
                    <span className="font-medium">Total: </span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="font-medium">Paid: </span>
                    <span className="text-green-700 font-semibold">${paidAmount.toFixed(2)}</span>
                  </p>
                  {outstandingAmount > 0 && (
                    <p>
                      <span className="font-medium">Outstanding: </span>
                      <span className="text-orange-700 font-semibold">${outstandingAmount.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 print:mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Unit Price
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.billItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-white"}>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {item.inventoryItem?.name || "Item"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">
                        ${parseFloat(item.unitPrice || "0").toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ${parseFloat(item.total || "0").toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end mb-8 print:mb-6">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {bill.taxRate && parseFloat(bill.taxRate) > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax ({bill.taxRate}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-300 pt-2">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments && payments.length > 0 && (
              <div className="mb-8 print:mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Payment History:
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 print:bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Method
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-white"}>
                        <td className="border border-gray-300 px-4 py-2 text-xs text-gray-900">
                          {formatPaymentDate(payment.paymentDate)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-xs font-medium text-green-700">
                          ${parseFloat(payment.amount || "0").toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-xs text-gray-900">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">
                          {payment.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            {bill.notes && (
              <div className="mb-8 print:mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                  Notes:
                </h3>
                <p className="text-sm text-gray-600">{bill.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-300 pt-6 print:pt-4 mt-8 print:mt-6">
              <p className="text-center text-sm text-gray-600">
                Thank you for your business!
              </p>
              <p className="text-center text-xs text-gray-500 mt-2">
                If you have any questions about this invoice, please contact us.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

