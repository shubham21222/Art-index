"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/features/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated and is an admin
    const token = Cookies.get('token');
    if (token && isAuthenticated && user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      // Check if the user is an admin
      if (result.user.role === "ADMIN") {
        toast.success("Welcome back, admin!");
        router.push("/admin/dashboard");
      } else {
        toast.error("Access denied. Admin privileges required.");
        // Dispatch logout if needed
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md border-2 border-black shadow-xl">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <div className="w-16 h-16 relative mb-4">
            <Image
              src="/artindex2.png"
              alt="Art Index Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-black">Admin Login</CardTitle>
          <p className="text-sm text-gray-600">Please sign in to access the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="border-2 border-black focus:border-black focus:ring-black rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="border-2 border-black focus:border-black focus:ring-black rounded-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900 transition-all duration-300 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}