import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const TeamPage: React.FC = () => {
  const { activeKitchen, user } = useAuth();
  const isOwner = user?.role === 'KITCHEN_OWNER' || activeKitchen?.role === 'OWNER';

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'STAFF'
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kitchens/staff');
      if (res.success) {
        setStaff(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [activeKitchen?.id]);

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/kitchens/staff', form);
      if (res.success) {
        setAddModalOpen(false);
        setForm({ fullName: '', email: '', phone: '', role: 'STAFF' });
        fetchStaff();
      }
    } catch (err: any) {
      alert(`Error adding staff: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Kitchen Staff & Role Access
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Manage authorized staff members, kitchen roles, and station access.
          </p>
        </div>

        {isOwner && (
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Staff Member
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
              <p className="text-xs text-content-secondary">Fetching staff roster...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted/60 text-content-secondary border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Staff Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold text-center">Kitchen Role</th>
                    <th className="py-3 px-4 font-semibold">Permitted Scopes</th>
                    <th className="py-3 px-4 font-semibold text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {staff.map((m) => (
                    <tr key={m.membershipId} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-content-primary">
                        {m.fullName}
                      </td>
                      <td className="py-3 px-4 text-content-secondary">
                        {m.email}
                      </td>
                      <td className="py-3 px-4 text-content-secondary">
                        {m.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={m.role === 'OWNER' ? 'orange' : m.role === 'MANAGER' ? 'teal' : 'default'}>
                          {m.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-content-secondary">
                        <span className="text-[11px] font-mono text-content-muted">
                          {Array.isArray(m.permissions) ? m.permissions.join(', ') : 'All Privileges'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-content-secondary">
                        {formatDate(m.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: ADD STAFF */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Kitchen Staff Member"
        description="Assign a member to your kitchen. Staff accounts can view and update orders and stock."
        maxWidth="md"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            required
            placeholder="e.g. Priya Nair"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="e.g. priya@biryanibox.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +91 98765 12345"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Select
            label="Kitchen Role *"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="STAFF">Staff (Orders & Inventory Entry)</option>
            <option value="CHEF">Chef (Kitchen Prep & Recipes)</option>
            <option value="MANAGER">Manager (Orders, Menu & Inventory)</option>
          </Select>

          <p className="text-[11px] text-content-muted">
            Initial temporary password for new accounts is set to <span className="font-mono font-semibold">Staff@123</span>.
          </p>

          <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
