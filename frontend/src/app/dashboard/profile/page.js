'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilePage() {
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    address: '',
    phone_number: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', {
        full_name: user.full_name,
        address: user.address,
        phone_number: user.phone_number
      });
      alert('Profile updated successfully');
      // Update local storage user if needed, but usually we re-fetch or just rely on API
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, full_name: user.full_name }));
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email (Read-only)</label>
            <Input
              value={user.email}
              disabled
              className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role (Read-only)</label>
            <Input
              value={user.role}
              disabled
              className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed capitalize"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              value={user.full_name}
              onChange={(e) => setUser({ ...user, full_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={user.address || ''}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
              placeholder="Enter your business address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              value={user.phone_number || ''}
              onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
              placeholder="Enter your contact number"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
