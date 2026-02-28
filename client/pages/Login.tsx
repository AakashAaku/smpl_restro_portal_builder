import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Leaf } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/30 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-600 to-green-500 text-white shadow-2xl organic-glow rotate-3 hover:rotate-0 transition-transform duration-500">
              <Leaf className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            VENZO<span className="text-primary">SMART</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary/70 mt-2">
            110% Pure Veg & Eggless
          </p>
          <p className="text-sm text-muted-foreground mt-4 font-medium">
            Bhaktapur's Premium Organic Dining
          </p>
        </div>

        {/* Login Card */}
        <Card className="premium-card shadow-2xl border-none glass overflow-hidden">
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
                className="gap-2 rounded-xl border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
              >
                👨‍💼 Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoCustomer}
                disabled={isLoading}
                className="gap-2 rounded-xl border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
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
          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-50 shadow-sm">
            <p className="font-bold text-emerald-900 mb-1">👨‍💼 Admin Portal</p>
            <p className="text-emerald-700/60 text-[10px] font-medium leading-tight">
              Precision control over menu & inventory
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-50 shadow-sm">
            <p className="font-bold text-emerald-900 mb-1">👤 Customer Express</p>
            <p className="text-emerald-700/60 text-[10px] font-medium leading-tight">
              Seamless organic ordering experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
