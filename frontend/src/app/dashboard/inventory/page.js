'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ chilli_type: '', quantity_kg: '', price_per_kg: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      setInventory(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/', newItem);
      setNewItem({ chilli_type: '', quantity_kg: '', price_per_kg: '' });
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>

      {user?.role === 'supplier' && (
        <div className="bg-white p-6 rounded-lg shadow mb-8 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
          <form onSubmit={handleAddItem} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Chilli Type</label>
              <Input
                value={newItem.chilli_type}
                onChange={(e) => setNewItem({...newItem, chilli_type: e.target.value})}
                placeholder="e.g. Green Chilli"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
              <Input
                type="number"
                value={newItem.quantity_kg}
                onChange={(e) => setNewItem({...newItem, quantity_kg: parseFloat(e.target.value)})}
                placeholder="0.0"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Price per kg (Rs)</label>
              <Input
                type="number"
                value={newItem.price_per_kg}
                onChange={(e) => setNewItem({...newItem, price_per_kg: parseFloat(e.target.value)})}
                placeholder="0.00"
                required
              />
            </div>
            <Button type="submit">Add Item</Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Quantity (kg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Price/kg</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Supplier ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.chilli_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity_kg}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rs. {item.price_per_kg}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.supplier_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
