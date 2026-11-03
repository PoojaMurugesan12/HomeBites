import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Boxes,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { activeKitchen } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d'>('30d');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const [overviewRes, salesRes, peakRes, itemsRes] = await Promise.all([
        api.get(`/analytics/overview?startDate=${startDate}`),
        api.get(`/analytics/sales?startDate=${startDate}`),
        api.get(`/analytics/peak-hours?startDate=${startDate}`),
        api.get(`/analytics/top-items?startDate=${startDate}`)
      ]);

      if (overviewRes.success) setMetrics(overviewRes.metrics);
      if (salesRes.success) setSalesData(salesRes.sales || []);
      if (peakRes.success) setPeakHoursData(peakRes.peakHours || []);
      if (itemsRes.success) setTopItems(itemsRes.topItems || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeKitchen?.id, dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        <p className="text-xs text-content-secondary font-medium">Aggregating live kitchen telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Kitchen Performance Overview
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Real-time analytics and demand intelligence for <span className="font-semibold text-brand-navy">{activeKitchen?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-surface-border rounded-xl p-1 flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === '7d' ? 'bg-brand-navy text-white' : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateRange === '30d' ? 'bg-brand-navy text-white' : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/dashboard/orders')}
          >
            <Plus className="w-4 h-4 mr-1" /> New Order
          </Button>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Orders */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-content-primary">
            {metrics?.totalOrders || 0}
          </div>
          {metrics?.comparisons?.ordersGrowth != null && (
            <div className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              metrics.comparisons.ordersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {metrics.comparisons.ordersGrowth >= 0 ? '↑ +' : '↓ '}
              {metrics.comparisons.ordersGrowth}% vs prev period
            </div>
          )}
        </Card>

        {/* Gross Sales */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-content-primary">
            {formatCurrency(metrics?.grossSales || 0)}
          </div>
          {metrics?.comparisons?.salesGrowth != null && (
            <div className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              metrics.comparisons.salesGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {metrics.comparisons.salesGrowth >= 0 ? '↑ +' : '↓ '}
              {metrics.comparisons.salesGrowth}% vs prev period
            </div>
          )}
        </Card>

        {/* Average Order Value */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-content-primary">
            {formatCurrency(metrics?.averageOrderValue || 0)}
          </div>
          <div className="text-[10px] text-content-secondary">
            Per fulfilled basket
          </div>
        </Card>

        {/* Completed Orders */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {metrics?.completedOrders || 0}
          </div>
          <div className="text-[10px] text-content-secondary">
            Delivered successfully
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">In-Flight / Prep</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {metrics?.pendingOrders || 0}
          </div>
          <div className="text-[10px] text-content-secondary">
            Active in kitchen
          </div>
        </Card>

        {/* Cancelled Orders */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-content-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {metrics?.cancelledOrders || 0}
          </div>
          <div className="text-[10px] text-content-secondary">
            With recorded reasons
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart & Peak Ordering Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Over Time (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales Revenue & Order Volume Over Time</CardTitle>
              <p className="text-xs text-content-secondary mt-0.5">
                Daily aggregated gross sales in Indian Rupees (₹)
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              {salesData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-content-muted">
                  No sales data recorded in the selected period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E87532" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E87532" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => val.slice(5)}
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${val}`, 'Gross Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#E87532"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Peak Ordering Hours (1 col) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Demand & Peak Hours</CardTitle>
              <p className="text-xs text-content-secondary mt-0.5">
                Order frequency across the 24-hour day
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData.filter((_, idx) => idx >= 10 && idx <= 23)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val} orders`, 'Orders']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="ordersCount" fill="#14213D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Menu Items & Operational Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Items (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Top Selling Menu Items & Unit Contribution</CardTitle>
                <p className="text-xs text-content-secondary mt-0.5">
                  Revenue and gross margin contributions derived from saved order items
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/menu')}
              >
                Manage Menu <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-content-muted">
                No menu items sold yet in this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-surface-border text-content-secondary">
                      <th className="py-2.5 font-semibold">Menu Dish</th>
                      <th className="py-2.5 font-semibold text-center">Units Sold</th>
                      <th className="py-2.5 font-semibold text-right">Revenue</th>
                      <th className="py-2.5 font-semibold text-right">Unit Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {topItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 font-medium text-content-primary">
                          {item.itemName}
                        </td>
                        <td className="py-3 text-center text-content-secondary">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right font-semibold text-content-primary">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-bold text-brand-teal">
                            {formatCurrency(item.contribution)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Decision Support Links */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/pricing')}
              className="w-full p-3 rounded-xl border border-surface-border hover:border-brand-orange bg-white hover:bg-orange-50/40 text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-brand-orange flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-content-primary">Pricing Intelligence</div>
                  <div className="text-[10px] text-content-secondary">Review explainable recommendations</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-orange transition-colors" />
            </button>

            <button
              onClick={() => navigate('/dashboard/inventory')}
              className="w-full p-3 rounded-xl border border-surface-border hover:border-brand-teal bg-white hover:bg-teal-50/40 text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-brand-teal flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-content-primary">Inventory Stock</div>
                  <div className="text-[10px] text-content-secondary">Review threshold alerts & restock</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-teal transition-colors" />
            </button>

            <button
              onClick={() => navigate('/dashboard/delivery')}
              className="w-full p-3 rounded-xl border border-surface-border hover:border-brand-navy bg-white hover:bg-slate-50 text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-navy flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-content-primary">Delivery Forensics</div>
                  <div className="text-[10px] text-content-secondary">Track prep and transit latency</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-brand-navy transition-colors" />
            </button>

            <button
              onClick={() => navigate('/dashboard/reports')}
              className="w-full p-3 rounded-xl border border-surface-border hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-content-primary">Executive Reports</div>
                  <div className="text-[10px] text-content-secondary">Export audit-ready CSV records</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-emerald-700 transition-colors" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
