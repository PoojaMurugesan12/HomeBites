import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  History,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { InventoryItem, InventoryMovement } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const InventoryPage: React.FC = () => {
  const { activeKitchen, user } = useAuth();
  const isOwner = user?.role === 'KITCHEN_OWNER' || activeKitchen?.role === 'OWNER';

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [summary, setSummary] = useState({ totalItems: 0, lowStockCount: 0, totalInventoryValue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'movements'>('items');

  // Modals
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Grains',
    unit: 'kg',
    currentStock: 25,
    minStockThreshold: 10,
    unitCost: 80,
    supplierName: ''
  });

  const [restockForm, setRestockForm] = useState({
    quantity: 10,
    unitCost: 0,
    reason: 'Standard weekly procurement batch'
  });

  const [adjustForm, setAdjustForm] = useState({
    quantityChange: -1,
    reason: 'Kitchen prep wastage / spoilage'
  });

  const [search, setSearch] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, moveRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/movements')
      ]);

      if (invRes.success) {
        setItems(invRes.items || []);
        setSummary(invRes.summary || { totalItems: 0, lowStockCount: 0, totalInventoryValue: 0 });
      }
      if (moveRes.success) {
        setMovements(resToMovements(moveRes.movements));
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const resToMovements = (data: any[]) => data || [];

  useEffect(() => {
    fetchInventory();
  }, [activeKitchen?.id]);

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/inventory', newItem);
      if (res.success) {
        setAddItemModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      alert(`Error adding item: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/inventory/${selectedItem.id}/restock`, restockForm);
      if (res.success) {
        setRestockModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      alert(`Restock failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/inventory/${selectedItem.id}/adjust`, adjustForm);
      if (res.success) {
        setAdjustModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvText = await api.get('/inventory/export');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to export inventory CSV');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Inventory & Ingredient Synchronization
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Monitor raw ingredient stock levels, prevent shortages, and review atomic order deduction history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
          {isOwner && (
            <Button variant="primary" size="sm" onClick={() => setAddItemModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Ingredient
            </Button>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
            Total Inventory Valuation
          </span>
          <div className="text-2xl font-extrabold text-content-primary">
            {formatCurrency(summary.totalInventoryValue)}
          </div>
          <span className="text-[10px] text-content-muted">Weighted cost of stock on hand</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
            Stock Shortage Alerts
          </span>
          <div className={`text-2xl font-extrabold ${summary.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {summary.lowStockCount} {summary.lowStockCount === 1 ? 'Item' : 'Items'}
          </div>
          <span className="text-[10px] text-content-muted">At or below configured threshold</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
            Tracked Raw Ingredients
          </span>
          <div className="text-2xl font-extrabold text-brand-teal">
            {summary.totalItems} Ingredients
          </div>
          <span className="text-[10px] text-content-muted">Synchronized with confirmed orders</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'items'
                ? 'bg-brand-navy text-white shadow-2xs'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-muted'
            }`}
          >
            Current Stock Levels ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'movements'
                ? 'bg-brand-navy text-white shadow-2xs'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-muted'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1" />
            Stock Movements Log ({movements.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <div className="w-56 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-content-muted" />
            <input
              type="text"
              placeholder="Filter items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
        )}
      </div>

      {/* TAB 1: CURRENT STOCK TABLE */}
      {activeTab === 'items' && (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                <p className="text-xs text-content-secondary">Fetching inventory stock...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center text-xs text-content-muted">
                No inventory items found. Add ingredients to begin tracking.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/60 text-content-secondary border-b border-surface-border">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Ingredient / Item</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold text-right">Current Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Min Threshold</th>
                      <th className="py-3 px-4 font-semibold text-right">Unit Cost</th>
                      <th className="py-3 px-4 font-semibold text-right">Inventory Value</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/60">
                    {filteredItems.map((item) => {
                      const cur = Number(item.currentStock);
                      const min = Number(item.minStockThreshold);
                      const isLow = cur <= min;
                      const value = cur * Number(item.unitCost);

                      return (
                        <tr key={item.id} className="hover:bg-surface-muted/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-content-primary block">{item.name}</span>
                            {item.supplierName && (
                              <span className="text-[10px] text-content-muted">{item.supplierName}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-content-secondary">
                            {item.category || 'Pantry'}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-content-primary">
                            {cur.toFixed(2)} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-content-secondary">
                            {min.toFixed(2)} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-content-secondary">
                            {formatCurrency(item.unitCost)} / {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-content-primary">
                            {formatCurrency(value)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isLow ? (
                              <Badge variant="warning">
                                <AlertTriangle className="w-3 h-3 text-amber-600 mr-1" /> Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success">Healthy</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setRestockForm({
                                  quantity: 10,
                                  unitCost: Number(item.unitCost),
                                  reason: 'Supplier procurement'
                                });
                                setRestockModalOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> Restock
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedItem(item);
                                setAdjustForm({
                                  quantityChange: -1,
                                  reason: 'Kitchen prep wastage'
                                });
                                setAdjustModalOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: STOCK MOVEMENTS LOG */}
      {activeTab === 'movements' && (
        <Card>
          <CardContent className="p-0">
            {movements.length === 0 ? (
              <div className="py-16 text-center text-xs text-content-muted">
                No stock movements logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted/60 text-content-secondary border-b border-surface-border">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Ingredient</th>
                      <th className="py-3 px-4 font-semibold text-center">Type</th>
                      <th className="py-3 px-4 font-semibold text-right">Change</th>
                      <th className="py-3 px-4 font-semibold text-right">New Balance</th>
                      <th className="py-3 px-4 font-semibold">Reason / Order Linked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {movements.map((m) => {
                      const isPositive = Number(m.quantityChange) > 0;
                      return (
                        <tr key={m.id} className="hover:bg-surface-muted/40 transition-colors">
                          <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                            {formatDateTime(m.createdAt)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-content-primary">
                            {m.inventoryItem?.name || 'Raw Ingredient'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              m.movementType === 'RESTOCK'
                                ? 'bg-emerald-50 text-emerald-800'
                                : m.movementType === 'ORDER_DEDUCTION'
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}>
                              {m.movementType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isPositive ? '+' : ''}
                            {Number(m.quantityChange).toFixed(2)} {m.inventoryItem?.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-content-primary">
                            {Number(m.newStock).toFixed(2)} {m.inventoryItem?.unit}
                          </td>
                          <td className="py-3 px-4 text-content-secondary max-w-xs truncate">
                            {m.reason || (m.order ? `Order #${m.order.orderNumber}` : 'Operational adjustment')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: ADD INVENTORY ITEM */}
      <Modal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        title="Add New Raw Ingredient"
        description="Track raw materials, packaging, or spices."
        maxWidth="lg"
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-4">
          <Input
            label="Ingredient Name *"
            required
            placeholder="e.g. Premium Basmati Rice"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <option value="Grains">Grains & Rice</option>
              <option value="Poultry">Poultry & Eggs</option>
              <option value="Meat">Meat & Seafood</option>
              <option value="Dairy">Dairy & Cheese</option>
              <option value="Spices">Spices & Oils</option>
              <option value="Packaging">Packaging Boxes</option>
            </Select>

            <Select
              label="Unit of Measurement *"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              <option value="kg">kilograms (kg)</option>
              <option value="g">grams (g)</option>
              <option value="L">litres (L)</option>
              <option value="ml">millilitres (ml)</option>
              <option value="pcs">pieces (pcs)</option>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Opening Stock"
              type="number"
              value={newItem.currentStock}
              onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
            />
            <Input
              label="Min Alert Threshold"
              type="number"
              value={newItem.minStockThreshold}
              onChange={(e) => setNewItem({ ...newItem, minStockThreshold: Number(e.target.value) })}
            />
            <Input
              label="Cost / Unit (₹)"
              type="number"
              value={newItem.unitCost}
              onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Supplier Name (Optional)"
            placeholder="e.g. Deccan Agro Wholesalers"
            value={newItem.supplierName}
            onChange={(e) => setNewItem({ ...newItem, supplierName: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
            <Button type="button" variant="ghost" onClick={() => setAddItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Save Ingredient
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RESTOCK ITEM */}
      {selectedItem && (
        <Modal
          isOpen={restockModalOpen}
          onClose={() => setRestockModalOpen(false)}
          title={`Restock: ${selectedItem.name}`}
          description={`Current balance: ${selectedItem.currentStock} ${selectedItem.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <Input
              label={`Restock Quantity (${selectedItem.unit}) *`}
              type="number"
              min="0.1"
              step="0.1"
              required
              value={restockForm.quantity}
              onChange={(e) => setRestockForm({ ...restockForm, quantity: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Procurement Unit Cost (₹)"
              type="number"
              value={restockForm.unitCost}
              onChange={(e) => setRestockForm({ ...restockForm, unitCost: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Restock Note / Supplier Batch"
              placeholder="e.g. Weekly farm fresh delivery"
              value={restockForm.reason}
              onChange={(e) => setRestockForm({ ...restockForm, reason: e.target.value })}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
              <Button type="button" variant="ghost" onClick={() => setRestockModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={actionLoading}>
                Add to Stock
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: ADJUST STOCK */}
      {selectedItem && (
        <Modal
          isOpen={adjustModalOpen}
          onClose={() => setAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedItem.name}`}
          description="Record spoilage, wastage, or physical audit discrepancy."
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <Input
              label={`Stock Change (+ or - in ${selectedItem.unit}) *`}
              type="number"
              step="0.1"
              required
              value={adjustForm.quantityChange}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: parseFloat(e.target.value) || 0 })}
              helperText="Negative value deducts stock, positive value adds stock."
            />
            <Input
              label="Reason for Adjustment *"
              required
              placeholder="e.g. Kitchen prep waste, refrigerator power failure..."
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-surface-border">
              <Button type="button" variant="ghost" onClick={() => setAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={actionLoading}>
                Confirm Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
