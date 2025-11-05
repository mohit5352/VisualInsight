import { useState } from "react";
import { DateNavigation } from "./date-navigation";
import { SummaryCards } from "./summary-cards";
import { TransactionTimeline } from "./transaction-timeline";
import { PurchaseForm } from "./purchase-form";
import { CustomerPanel } from "./customer-panel";
import type { Customer } from "@shared/schema";

interface DailyDiaryContentProps {
  isPurchaseFormOpen?: boolean;
  onPurchaseFormClose?: () => void;
  onPurchaseFormOpen?: () => void;
}

/**
 * Main content component for Daily Diary page
 * 
 * This component orchestrates all sub-components and manages shared state.
 * Designed to be easily extensible for future enhancements.
 * 
 * @future-enhancements:
 * - URL state management for date (deep linking)
 * - Keyboard shortcuts configuration
 * - View mode preferences (chronological vs grouped)
 * - Filter/search state management
 * - Customer panel state management
 */
export function DailyDiaryContent({ 
  isPurchaseFormOpen: externalIsOpen, 
  onPurchaseFormClose,
  onPurchaseFormOpen
}: DailyDiaryContentProps = {}) {
  // Date state - can be extended to sync with URL params
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Purchase form state - use external if provided, otherwise internal
  const [internalPurchaseFormOpen, setInternalPurchaseFormOpen] = useState(false);
  const isPurchaseFormOpen = externalIsOpen !== undefined ? externalIsOpen : internalPurchaseFormOpen;
  const setIsPurchaseFormOpen = onPurchaseFormOpen || onPurchaseFormClose 
    ? (open: boolean) => {
        if (open) {
          onPurchaseFormOpen?.();
        } else {
          onPurchaseFormClose?.();
        }
      }
    : setInternalPurchaseFormOpen;
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  // Customer panel state
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [customerPanelMode, setCustomerPanelMode] = useState<"create" | "edit" | "list" | "select">("select");

  return (
    <div className="space-y-6 relative">
      {/* Date Navigation - easily replaceable/swappable */}
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Summary Cards - clickable to filter (future enhancement) */}
      <SummaryCards selectedDate={selectedDate} />

      {/* Transaction Timeline - main content area */}
      <TransactionTimeline selectedDate={selectedDate} />

      {/* Purchase Form - Bottom Sheet */}
      <PurchaseForm
        open={isPurchaseFormOpen}
        onClose={() => {
          setIsPurchaseFormOpen(false);
          setSelectedCustomerId(""); // Reset selected customer
        }}
        selectedDate={selectedDate}
        selectedCustomerId={selectedCustomerId}
        onCustomerIdChange={setSelectedCustomerId}
        onCreateCustomer={() => {
          setCustomerPanelMode("create");
          setShowCustomerPanel(true);
        }}
      />

      {/* Customer Panel - Side Panel */}
      <CustomerPanel
        open={showCustomerPanel}
        onClose={() => setShowCustomerPanel(false)}
        mode={customerPanelMode}
        onCustomerCreated={(customer: Customer) => {
          // Auto-select the newly created customer in purchase form
          setSelectedCustomerId(customer.id);
          setShowCustomerPanel(false);
          // Reopen purchase form if it was closed
          if (!isPurchaseFormOpen) {
            setIsPurchaseFormOpen(true);
          }
        }}
        onCustomerSelected={(customer: Customer) => {
          // Select customer in purchase form
          setSelectedCustomerId(customer.id);
          setShowCustomerPanel(false);
          // Reopen purchase form if it was closed
          if (!isPurchaseFormOpen) {
            setIsPurchaseFormOpen(true);
          }
        }}
      />
    </div>
  );
}

