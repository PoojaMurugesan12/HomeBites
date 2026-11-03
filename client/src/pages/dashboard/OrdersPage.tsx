import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { Order, OrderStatus, OrderSource, MenuItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { activeKitchen } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Menu items for manual order creation
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    source: 'DIRECT_ONLINE' as OrderSource,
    paymentMethod: 'UPI',
    deliveryFee: 35,
    discountAmount: 0,
    notes: '',
    items: [{ menuItemId: '', itemName: '', unitPrice: 0, quantity: 1 }]
  });

  // CSV Import State
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(sourceFilter ? { source: sourceFilter } : {})
      });

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.success) {
        setOrders(res.orders || []);
        setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('/menu');
      if (res.success) {
        setMenuItems(res.items || []);
      }
    } catch (err) {
      //
    }
  };

  useEffect(() => {
    fetchOrders(1);
    fetchMenuItems();
  }, [activeKitchen?.id, statusFilter, sourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  // Status transition handler
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      alert(`Status transition failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel order handler
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/orders/${selectedOrder.id}/cancel`, { reason: cancelReason });
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? res.order : o)));
        setCancelModalOpen(false);
        setDetailsModalOpen(false);
        setCancelReason('');
      }
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Manual Order
  const handleAddOrderItem = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, { menuItemId: '', itemName: '', unitPrice: 0, quantity: 1 }]
    }));
  };

  const handleRemoveOrderItem = (index: number) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleMenuItemSelect = (index: number, menuItemId: string) => {
    const selected = menuItems.find((m) => m.id === menuItemId);
    if (!selected) return;

    setNewOrder((prev) => {
      const updated = [...prev.items];
      updated[index] = {
        menuItemId: selected.id,
        itemName: selected.name,
        unitPrice: Number(selected.sellingPrice),
        quantity: 1
      };
      return { ...prev, items: updated };
    });
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/orders', newOrder);
      if (res.success) {
        setCreateModalOpen(false);
        setNewOrder({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          source: 'DIRECT_ONLINE',
          paymentMethod: 'UPI',
          deliveryFee: 35,
          discountAmount: 0,
          notes: '',
          items: [{ menuItemId: '', itemName: '', unitPrice: 0, quantity: 1 }]
        });
        fetchOrders(1);
      }
    } catch (err: any) {
      alert(`Order creation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const csvText = await api.get(`/orders/export?${statusFilter ? `status=${statusFilter}` : ''}`);
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  // Process CSV batch import
  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setActionLoading(true);
    setImportResult(null);

    try {
      // Parse CSV text
      const lines = importText.trim().split('\n');
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          rows.push({
            orderNumber: parts[0] || undefined,
            customerName: parts[1],
            customerPhone: parts[2] || undefined,
            itemName: parts[3] || 'Assorted Food Order',
            totalAmount: parseFloat(parts[4] || '250'),
            source: 'CSV_IMPORT'
          });
        }
      }

      const res = await api.post('/orders/import', { rows });
      setImportResult(res);
      fetchOrders(1);
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge styling
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Accept</Badge>;
      case 'CONFIRMED':
        return <Badge variant="teal">Confirmed</Badge>;
      case 'PREPARING':
        return <Badge variant="orange">Preparing in Kitchen</Badge>;
      case 'READY_FOR_PICKUP':
        return <Badge variant="teal">Ready for Pickup</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="navy">Out for Delivery</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Order Management & Dispatch
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Process manual orders, track delivery lifecycles, and import aggregator CSV records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <Upload className="w-3.5 h-3.5 mr-1" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Order
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-content-muted" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-surface-muted border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 bg-surface-muted"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs py-2 bg-surface-muted"
          >
            <option value="">All Sources</option>
            <option value="DIRECT_ONLINE">Direct Online</option>
            <option value="PHONE_TAKEAWAY">Phone / Takeaway</option>
            <option value="SWIGGY_ADAPTER">Swiggy Fleet</option>
            <option value="ZOMATO_ADAPTER">Zomato Fleet</option>
            <option value="CSV_IMPORT">CSV Batch Import</option>
          </Select>
        </form>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
              <p className="text-xs text-content-secondary">Fetching orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-content-muted flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-content-primary">No Orders Found</h3>
              <p className="text-xs text-content-secondary max-w-sm mx-auto">
                No orders match your filter criteria. Create your first order manually or upload a CSV file.
              </p>
              <Button size="sm" variant="primary" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create Manual Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted/60 text-content-secondary">
                    <th className="py-3 px-4 font-semibold">Order ID</th>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Items Snapshot</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-semibold text-center">Source</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-navy">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-content-primary">{o.customerName}</div>
                        {o.customerPhone && (
                          <div className="text-[10px] text-content-muted">{o.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-content-secondary">
                        {o.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-content-primary">
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {o.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderStatusBadge(o.status)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(o);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-surface-border flex items-center justify-between text-xs text-content-secondary">
              <div>
                Showing page <span className="font-semibold text-content-primary">{pagination.page}</span> of{' '}
                <span className="font-semibold text-content-primary">{pagination.totalPages}</span> ({pagination.total} orders)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchOrders(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchOrders(pagination.page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: ORDER DETAILS & STATUS MACHINE */}
      {selectedOrder && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Order #${selectedOrder.orderNumber}`}
          description={`Placed on ${formatDateTime(selectedOrder.createdAt)} via ${selectedOrder.source}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Status & Next step actions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-surface-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-content-secondary font-medium">Current Status:</span>
                {renderStatusBadge(selectedOrder.status)}
              </div>

              {/* Status transition action buttons */}
              <div className="flex items-center gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="teal"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                  >
                    Accept Order
                  </Button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    variant="primary"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                  >
                    Start Cooking (Preparing)
                  </Button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <Button
                    size="sm"
                    variant="teal"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY_FOR_PICKUP')}
                  >
                    Mark Ready for Pickup
                  </Button>
                )}
                {selectedOrder.status === 'READY_FOR_PICKUP' && (
                  <Button
                    size="sm"
                    variant="navy"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'OUT_FOR_DELIVERY')}
                  >
                    Dispatch with Rider
                  </Button>
                )}
                {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                  <Button
                    size="sm"
                    variant="teal"
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  >
                    Mark Delivered
                  </Button>
                )}
                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setCancelModalOpen(true)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Line Items Snapshot */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                Line Items (Immutable Price Snapshot)
              </h4>
              <div className="border border-surface-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/60 text-content-secondary border-b border-surface-border">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {selectedOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-medium text-content-primary">
                          {it.itemName}
                        </td>
                        <td className="py-2.5 px-3 text-right text-content-secondary">
                          {formatCurrency(it.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-content-secondary font-semibold">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-content-primary">
                          {formatCurrency(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-surface-muted p-4 rounded-xl">
              <div>
                <span className="text-content-secondary block">Customer Info:</span>
                <span className="font-bold text-content-primary block">{selectedOrder.customerName}</span>
                <span className="text-content-secondary block">{selectedOrder.customerPhone || 'No phone'}</span>
                <span className="text-content-muted block">{selectedOrder.customerAddress || 'Direct Takeaway'}</span>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-content-secondary">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">GST Tax (5%):</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Delivery Fee:</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                {Number(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>- {formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-surface-border font-bold text-base text-brand-navy">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Record Information */}
            {selectedOrder.deliveryRecord && (
              <div className="p-4 rounded-xl border border-surface-border space-y-2 text-xs">
                <div className="font-bold text-brand-navy">Delivery Performance Record</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-content-secondary block text-[10px]">Partner Fleet</span>
                    <span className="font-semibold text-content-primary">{selectedOrder.deliveryRecord.deliveryPartner || 'Standard Fleet'}</span>
                  </div>
                  <div>
                    <span className="text-content-secondary block text-[10px]">Prep Duration</span>
                    <span className="font-semibold text-brand-teal">{selectedOrder.deliveryRecord.prepDurationMinutes ? `${selectedOrder.deliveryRecord.prepDurationMinutes} mins` : 'In kitchen'}</span>
                  </div>
                  <div>
                    <span className="text-content-secondary block text-[10px]">Delivery Transit</span>
                    <span className="font-semibold text-content-primary">{selectedOrder.deliveryRecord.deliveryDurationMinutes ? `${selectedOrder.deliveryRecord.deliveryDurationMinutes} mins` : 'In transit'}</span>
                  </div>
                  <div>
                    <span className="text-content-secondary block text-[10px]">On-Time Status</span>
                    <span className={`font-bold ${selectedOrder.deliveryRecord.isDelayed ? 'text-status-error' : 'text-status-success'}`}>
                      {selectedOrder.deliveryRecord.isDelayed ? 'Delayed' : 'On-Time'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: CANCEL ORDER */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        description="Please record the operational reason for order cancellation."
        maxWidth="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Cancellation Reason *"
            required
            placeholder="e.g. Extreme rain delay, delivery fleet unassigned, customer request..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              disabled={!cancelReason.trim()}
              onClick={handleCancelOrder}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: MANUAL ORDER CREATION */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Kitchen Order"
        description="Enter customer details and select line items. Recipe ingredients will deduct automatically."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateOrderSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Customer Name *"
              required
              placeholder="e.g. Aditya Verma"
              value={newOrder.customerName}
              onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
            />
            <Input
              label="Customer Phone"
              placeholder="e.g. +91 98450 11223"
              value={newOrder.customerPhone}
              onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
            />
            <Select
              label="Order Source"
              value={newOrder.source}
              onChange={(e) => setNewOrder({ ...newOrder, source: e.target.value as OrderSource })}
            >
              <option value="DIRECT_ONLINE">Direct Online</option>
              <option value="PHONE_TAKEAWAY">Phone Takeaway</option>
              <option value="SWIGGY_ADAPTER">Swiggy Fleet</option>
              <option value="ZOMATO_ADAPTER">Zomato Fleet</option>
            </Select>
          </div>

          <Input
            label="Customer Delivery Address"
            placeholder="e.g. Flat 302, Palm Meadows, Indiranagar"
            value={newOrder.customerAddress}
            onChange={(e) => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
          />

          {/* Line items section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-primary">
                Order Dishes & Portions
              </span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddOrderItem}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Dish
              </Button>
            </div>

            <div className="space-y-2">
              {newOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface-muted p-2 rounded-lg">
                  <div className="flex-1">
                    <select
                      value={item.menuItemId}
                      onChange={(e) => handleMenuItemSelect(idx, e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-surface-border rounded-md"
                    >
                      <option value="">Select dish from menu...</option>
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {formatCurrency(m.sellingPrice)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setNewOrder((prev) => {
                          const updated = [...prev.items];
                          updated[idx].quantity = val;
                          return { ...prev, items: updated };
                        });
                      }}
                      className="w-full text-xs p-2 bg-white border border-surface-border rounded-md text-center"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-24 text-xs font-semibold text-right">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                  {newOrder.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOrderItem(idx)}
                      className="p-1 text-status-error hover:bg-rose-50 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Delivery Fee (₹)"
              type="number"
              value={newOrder.deliveryFee}
              onChange={(e) => setNewOrder({ ...newOrder, deliveryFee: Number(e.target.value) })}
            />
            <Input
              label="Discount (₹)"
              type="number"
              value={newOrder.discountAmount}
              onChange={(e) => setNewOrder({ ...newOrder, discountAmount: Number(e.target.value) })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Confirm & Cook Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: CSV BATCH IMPORT */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Batch Import Orders via CSV"
        description="Paste standard CSV order lines with column headers: orderNumber, customerName, customerPhone, itemName, totalAmount"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-content-primary">Sample Format:</span>
            <pre className="font-mono text-[11px] text-content-secondary overflow-x-auto">
              orderNumber,customerName,customerPhone,itemName,totalAmount{'\n'}
              SWG-90812,Aditya Verma,+91 9845011223,Chicken Biryani Box,320{'\n'}
              ZOM-45129,Sneha Kulkarni,+91 9900122334,Royal Mutton Biryani,440
            </pre>
          </div>

          <Textarea
            label="CSV Content"
            rows={8}
            placeholder="Paste your CSV content here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />

          {importResult && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-bold">{importResult.message}</div>
              <div>Imported: {importResult.importedCount} | Duplicates Skipped: {importResult.skippedDuplicates}</div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setImportModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleImportSubmit}>
              Execute Batch Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
