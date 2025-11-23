'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, LogOut, TrendingUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-white shadow-md dark:bg-gray-800 hidden md:flex md:flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-6">ChilliSys</h1>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Welcome, {user.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{user.role}</p>
          </div>
        </div>
        <nav className="mt-2 px-4 space-y-2 flex-1">
          <Link href="/" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
            <Home className="mr-3 h-5 w-5" />
            Home
          </Link>
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/predict" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
            <TrendingUp className="mr-3 h-5 w-5" />
            Predictions
          </Link>
          <Link href="/dashboard/inventory" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
            <Package className="mr-3 h-5 w-5" />
            Inventory
          </Link>
          <Link href="/dashboard/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
            <ShoppingCart className="mr-3 h-5 w-5" />
            Orders
          </Link>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
