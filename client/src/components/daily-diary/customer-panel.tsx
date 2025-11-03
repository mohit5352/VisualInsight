import { useState } from "react";
import { SidePanel } from "@/components/ui/side-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserPlus } from "lucide-react";
import type { Customer } from "@shared/schema";
import { CustomerForm } from "./customer-form";
import { CustomerList } from "./customer-list";

interface CustomerPanelProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit" | "list" | "select";
  customer?: Customer | null;
  onCustomerCreated?: (customer: Customer) => void;
  onCustomerSelected?: (customer: Customer) => void;
}

/**
 * Customer Panel Component
 * 
 * Side panel for all customer operations (CRUD).
 * Supports multiple modes: create, edit, list, select.
 * 
 * @future-enhancements:
 * - Customer import/export
 * - Bulk operations
 * - Customer tags/categories
 * - Customer notes/history
 */
export function CustomerPanel({
  open,
  onClose,
  mode = "list",
  customer = null,
  onCustomerCreated,
  onCustomerSelected,
}: CustomerPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(
    mode === "create" ? "create" : mode === "edit" ? "edit" : "list"
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    customer || null
  );

  const handleCustomerCreated = (newCustomer: Customer) => {
    onCustomerCreated?.(newCustomer);
    // Switch to list view after creation
    setActiveTab("list");
  };

  const handleCustomerEdited = (updatedCustomer: Customer) => {
    setEditingCustomer(null);
    setActiveTab("list");
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setActiveTab("edit");
  };

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelected?.(customer);
    onClose();
  };

  const getTitle = () => {
    if (mode === "create" || activeTab === "create") return "Create Customer";
    if (mode === "edit" || activeTab === "edit") return "Edit Customer";
    if (mode === "select") return "Select Customer";
    return "Customers";
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={getTitle()}
      width="md"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Create</span>
            </TabsTrigger>
            {editingCustomer && (
              <TabsTrigger value="edit" className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Edit</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <TabsContent value="list" className="m-0 flex-1 flex flex-col overflow-hidden">
            <CustomerList
              onEditCustomer={handleEditCustomer}
              onSelectCustomer={mode === "select" ? handleSelectCustomer : undefined}
            />
            {mode !== "select" && (
              <div className="p-4 border-t sticky bottom-0 bg-card">
                <Button
                  onClick={() => setActiveTab("create")}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Customer
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="m-0 flex-1 flex flex-col overflow-hidden">
            <CustomerForm
              onSuccess={handleCustomerCreated}
              onCancel={() => setActiveTab("list")}
            />
          </TabsContent>

          {editingCustomer && (
            <TabsContent value="edit" className="m-0 flex-1 flex flex-col overflow-hidden">
              <CustomerForm
                customer={editingCustomer}
                onSuccess={handleCustomerEdited}
                onCancel={() => {
                  setEditingCustomer(null);
                  setActiveTab("list");
                }}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </SidePanel>
  );
}

