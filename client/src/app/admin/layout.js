"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Bell,
  LogOut
} from "lucide-react";
import { logout } from "@/redux/features/authSlice";
import { toast } from "sonner";
import Cookies from 'js-cookie';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Skip authentication check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Check for token in cookies
    const token = Cookies.get('token');
    
    // Only check authentication for non-login pages
    if (!isLoginPage && (!token || !isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router, isLoginPage]);

  // For login page, render children without the admin layout
  if (isLoginPage) {
    return children;
  }

  // For other admin pages, check authentication
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  const menuItems = [
    { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { title: "Users", path: "/admin/users", icon: Users },
    { title: "Content", path: "/admin/content", icon: FileText },
    { title: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successfully");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Art Index</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <Icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-500" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-500">{user?.email || "admin@artindex.com"}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}