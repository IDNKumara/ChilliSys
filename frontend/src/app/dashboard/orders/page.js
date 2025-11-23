'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
      </div>
    </DashboardLayout>
  );
}
