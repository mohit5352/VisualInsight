import { Card, CardContent } from "@/components/ui/card";

export function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
