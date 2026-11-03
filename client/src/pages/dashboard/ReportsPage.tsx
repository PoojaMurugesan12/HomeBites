import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { activeKitchen } = useAuth();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const res = await api.get(`/analytics/overview?startDate=${startDate}`);
      if (res.success) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load report metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeKitchen?.id, dateRange]);

  const handleExportOrdersCsv = async () => {
    try {
      const csvText = await api.get('/orders/export');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleExportInventoryCsv = async () => {
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
      alert('Export failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Reports & Export Center
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Generate printable operational summaries and export raw order and inventory data to CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportOrdersCsv}>
            <Download className="w-3.5 h-3.5 mr-1" /> Download Orders CSV
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 bg-white border border-surface-border p-2 rounded-xl w-fit">
        <span className="text-xs font-semibold text-content-secondary px-2 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Reporting Window:
        </span>
        <button
          onClick={() => setDateRange('7d')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            dateRange === '7d' ? 'bg-brand-navy text-white' : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setDateRange('30d')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            dateRange === '30d' ? 'bg-brand-navy text-white' : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setDateRange('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            dateRange === 'all' ? 'bg-brand-navy text-white' : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Printable Executive Summary Sheet */}
      <Card className="p-8 space-y-8 bg-white border-surface-border shadow-xs print:shadow-none print:border-none">
        {/* Report Kitchen Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-surface-border gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              HomeBites Cloud Kitchen Executive Brief
            </span>
            <h2 className="text-2xl font-bold text-brand-navy">{activeKitchen?.name}</h2>
            <p className="text-xs text-content-secondary">
              {activeKitchen?.address ? `${activeKitchen.address}, ${activeKitchen.city}` : 'Indiranagar Hub, Bengaluru'}
            </p>
            {activeKitchen?.fssaiNumber && (
              <p className="text-[11px] text-content-muted">FSSAI License: {activeKitchen.fssaiNumber}</p>
            )}
          </div>

          <div className="text-right text-xs text-content-secondary space-y-1">
            <div>Report Timestamp: <span className="font-semibold text-content-primary">{formatDate(new Date())}</span></div>
            <div>Window: <span className="font-semibold text-content-primary">{dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : '90 Days'}</span></div>
            <div>Currency: <span className="font-semibold text-content-primary">INR (₹)</span></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div className="p-4 bg-surface-muted rounded-xl space-y-1">
            <span className="text-content-secondary font-medium">Gross Tracked Sales</span>
            <div className="text-2xl font-bold text-content-primary">
              {formatCurrency(metrics?.grossSales || 0)}
            </div>
          </div>

          <div className="p-4 bg-surface-muted rounded-xl space-y-1">
            <span className="text-content-secondary font-medium">Total Orders</span>
            <div className="text-2xl font-bold text-content-primary">
              {metrics?.totalOrders || 0}
            </div>
          </div>

          <div className="p-4 bg-surface-muted rounded-xl space-y-1">
            <span className="text-content-secondary font-medium">Average Order Value</span>
            <div className="text-2xl font-bold text-brand-teal">
              {formatCurrency(metrics?.averageOrderValue || 0)}
            </div>
          </div>

          <div className="p-4 bg-surface-muted rounded-xl space-y-1">
            <span className="text-content-secondary font-medium">Completed Fulfillment</span>
            <div className="text-2xl font-bold text-emerald-600">
              {metrics?.completedOrders || 0} ({metrics?.totalOrders > 0 ? (((metrics?.completedOrders || 0) / metrics.totalOrders) * 100).toFixed(0) : 100}%)
            </div>
          </div>
        </div>

        {/* Export Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-border">
          <div className="p-4 rounded-xl border border-surface-border hover:border-brand-orange transition-colors flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-brand-orange" />
                <span>Orders Full Historical Export</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Includes Order ID, Customer, Source, Line Items, Tax, and Delivery durations.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportOrdersCsv}>
              Download
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-surface-border hover:border-brand-teal transition-colors flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-brand-teal" />
                <span>Inventory Valuation Export</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Includes Ingredients, Unit costs, Current balances, Thresholds, and Valuation.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExportInventoryCsv}>
              Download
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
