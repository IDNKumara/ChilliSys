'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.chilli_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.quantity_kg} kg</td>
                <td className="px-6 py-4 whitespace-nowrap">Rs. {order.total_price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.role === 'supplier' && order.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="text-blue-600 hover:text-blue-900 mr-4">Accept</button>
                      <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="text-red-600 hover:text-red-900">Reject</button>
                    </>
                  )}
                  {user?.role === 'supplier' && order.status === 'confirmed' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="text-green-600 hover:text-green-900">Complete</button>
                  )}
                  {user?.role === 'buyer' && order.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-6 text-center text-gray-500">No orders found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
