import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { login } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/customer/home");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setIsLoading(true);
    try {
      const user = await login("admin@restaurant.com", "admin123");
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCustomer = async () => {
    setIsLoading(true);
    try {
      const user = await login("customer@example.com", "customer123");
      navigate("/customer/home");
    } catch (err) {
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold">VenzoSmart</h1>
          <p className="text-muted-foreground mt-2">
            Admin Portal & Customer Ordering System
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restaurant.com or customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123 or customer123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Or try demo accounts
                </span>
              </div>
            </div>

            {/* Demo Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoAdmin}
                disabled={isLoading}
                className="gap-2"
              >
                👨‍💼 Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoCustomer}
                disabled={isLoading}
                className="gap-2"
              >
                👤 Customer Demo
              </Button>
            </div>

            {/* Credentials Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 space-y-2">
              <p className="font-semibold">Demo Credentials:</p>
              <p>
                <strong>Admin:</strong> admin@restaurant.com / admin123
              </p>
              <p>
                <strong>Customer:</strong> customer@example.com / customer123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="p-3 border border-border rounded-lg">
            <p className="font-semibold mb-1">👨‍💼 Admin Portal</p>
            <p className="text-muted-foreground text-xs">
              Manage menu, orders, inventory & staff
            </p>
          </div>
          <div className="p-3 border border-border rounded-lg">
            <p className="font-semibold mb-1">👤 Customer Portal</p>
            <p className="text-muted-foreground text-xs">
              Browse menu, place orders, track delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
