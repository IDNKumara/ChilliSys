'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ inventoryCount: 0, ordersCount: 0, marketPrice: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats({
          inventoryCount: response.data.inventory_count,
          ordersCount: response.data.active_orders,
          marketPrice: response.data.market_price
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-200">Total Inventory</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">{stats.inventoryCount} Items</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-200">Active Orders</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">{stats.ordersCount} Orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-200">Market Price (Avg)</h3>
          <p className="text-3xl font-bold mt-2 dark:text-white">Rs. {stats.marketPrice}/kg</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
          <div className="p-4 border-b dark:border-gray-700">
            <p className="text-gray-500">No recent activity.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
