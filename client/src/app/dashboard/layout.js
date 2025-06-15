'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const navigation = [
  // { name: 'Overview', href: '/dashboard' },
  { name: 'Gallery', href: '/dashboard/gallery' },
  // { name: 'Analytics', href: '/dashboard/analytics' },
  // { name: 'Users', href: '/dashboard/users' },
  // { name: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Simple top navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 py-4 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
} 