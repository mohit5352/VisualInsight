import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { DailyDiaryContent } from "@/components/daily-diary/daily-diary-content";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DailyDiary() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);

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
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Daily Diary</h2>
            <Button 
              onClick={() => setIsPurchaseFormOpen(true)}
              className="hover-lift"
              data-testid="button-new-purchase"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </div>
          <DailyDiaryContent 
            isPurchaseFormOpen={isPurchaseFormOpen}
            onPurchaseFormClose={() => setIsPurchaseFormOpen(false)}
            onPurchaseFormOpen={() => setIsPurchaseFormOpen(true)}
          />
        </main>
      </div>
    </div>
  );
}

