"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function AdminLoginLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If user is already authenticated and is an admin, redirect to dashboard
    if (isAuthenticated && user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 