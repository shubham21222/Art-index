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
    { title: "Artworks", path: "/admin/artworks", icon: FileText },
    { title: "Galleries", path: "/admin/galleries", icon: Users },
    // { title: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    // { title: "Settings", path: "/admin/settings", icon: Settings },
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
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 fixed h-full">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white">Art Index</h1>
          <p className="text-sm text-zinc-400">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-white text-black' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${
                  isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'
                }`} />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800 bg-black">
          <div className="flex items-center space-x-4">
            {/* <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div> */}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name || "Admin User"}</p>
              <p className="text-xs text-zinc-400">{user?.email || "admin@artindex.com"}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto bg-zinc-950">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}