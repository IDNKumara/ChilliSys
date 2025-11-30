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

  const handleBuy = async (item) => {
    const quantity = prompt(`How many kg of ${item.chilli_type} do you want to buy? (Available: ${item.quantity_kg}kg)`);
    if (!quantity) return;
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 || qty > item.quantity_kg) {
      alert('Invalid quantity');
      return;
    }

    try {
      await api.post('/orders/', {
        supplier_id: item.supplier_id,
        chilli_type: item.chilli_type,
        quantity_kg: qty,
        total_price: qty * item.price_per_kg
      });
      alert('Order placed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/${itemId}`);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ... (existing code)

  const handleSupplierClick = async (supplierId) => {
    try {
      const response = await api.get(`/users/${supplierId}`);
      setSelectedSupplier(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch supplier details');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Supplier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.chilli_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity_kg}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rs. {item.price_per_kg}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleSupplierClick(item.supplier_id)}
                    className="text-blue-600 hover:underline"
                  >
                    {item.supplier_name || `ID: ${item.supplier_id}`}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.role === 'buyer' && (
                    <button
                      onClick={() => handleBuy(item)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Buy
                    </button>
                  )}
                  {user?.role === 'supplier' && user.id === item.supplier_id && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Supplier Details</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Name:</span> {selectedSupplier.full_name}</p>
              <p><span className="font-semibold">Email:</span> {selectedSupplier.email}</p>
              <p><span className="font-semibold">Address:</span> {selectedSupplier.address || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> {selectedSupplier.phone_number || 'N/A'}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedSupplier(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
