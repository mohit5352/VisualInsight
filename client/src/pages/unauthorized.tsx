import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            You need to sign in to access this page.
          </p>

          <Button
            onClick={() => window.location.href = "/"}
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Home Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
