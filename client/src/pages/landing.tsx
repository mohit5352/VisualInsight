import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, Users, FileText, BarChart3 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

type AuthMode = "login" | "register" | null;

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track materials, quantities, and get low stock alerts",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Store customer details and order history",
    },
    {
      icon: FileText,
      title: "Bill Generation",
      description: "Create professional invoices with your branding",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Monitor performance with detailed reports",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Store className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Shop<span className="text-primary">Flow</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete business management solution for building materials shop owners.
            Manage inventory, customers, and billing all in one place.
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => setAuthMode("login")}
              size="lg"
              className="text-lg px-8 py-3 hover-lift"
              data-testid="button-login"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setAuthMode("register")}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 hover-lift"
              data-testid="button-register"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Authentication Forms */}
        {authMode === "login" && (
          <div className="mb-16">
            <LoginForm
              onSuccess={() => setAuthMode(null)}
              onSwitchToRegister={() => setAuthMode("register")}
            />
          </div>
        )}

        {authMode === "register" && (
          <div className="mb-16">
            <RegisterForm
              onSuccess={() => setAuthMode(null)}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          </div>
        )}

        {/* Features Grid */}
        {authMode === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift transition-all duration-200 border-border/50">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Choose ShopFlow?</CardTitle>
            <CardDescription>
              Built specifically for building materials shop owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Easy Inventory Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep track of all your materials with real-time quantity updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Professional Billing</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate branded invoices with itemized details and tax calculations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Customer Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Track customer history and build stronger relationships
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Low Stock Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Never run out of stock with automated alerts and reorder suggestions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Business Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Make informed decisions with detailed analytics and reports
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-foreground text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Secure & Reliable</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is safe with enterprise-grade security and backups
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        {authMode === null && (
          <div className="text-center mt-16 text-muted-foreground">
            <p>Ready to streamline your business operations?</p>
            <Button
              onClick={() => setAuthMode("login")}
              variant="outline"
              size="lg"
              className="mt-4 hover-lift"
              data-testid="button-login-footer"
            >
              Start Managing Your Shop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
