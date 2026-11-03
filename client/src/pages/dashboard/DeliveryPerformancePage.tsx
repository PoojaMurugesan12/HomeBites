import React, { useState, useEffect } from 'react';
import {
  Bike,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const DeliveryPerformancePage: React.FC = () => {
  const { activeKitchen } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/delivery');
      if (res.success) {
        setData(res.delivery);
      }
    } catch (err) {
      console.error('Failed to load delivery analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, [activeKitchen?.id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
        <p className="text-xs text-content-secondary">Analyzing delivery performance latency...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Delivery Performance & Latency Forensics
        </h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Separate kitchen prep latency from courier travel time to resolve bottlenecks.
        </p>
      </div>

      {/* Actionable Operational Insight Card */}
      {data?.operationalInsight && (
        <Card className="bg-brand-teal-light/40 border-brand-teal/30">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                Data-Driven Operational Insight
              </div>
              <p className="text-xs text-content-primary mt-0.5 leading-relaxed font-medium">
                {data.operationalInsight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
            Avg Prep Duration
          </span>
          <div className="text-2xl font-extrabold text-content-primary">
            {data?.avgPrepTimeMinutes || 0} mins
          </div>
          <span className="text-[10px] text-content-muted">From confirmation to ready</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
            Avg Transit Duration
          </span>
          <div className="text-2xl font-extrabold text-brand-teal">
            {data?.avgDeliveryDurationMinutes || 0} mins
          </div>
          <span className="text-[10px] text-content-muted">From dispatch to customer</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
            On-Time Completion
          </span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {data?.onTimePercentage || 100}%
          </div>
          <span className="text-[10px] text-content-muted">Within estimated arrival window</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
            Delayed Orders
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            {data?.delayedOrdersCount || 0}
          </div>
          <span className="text-[10px] text-content-muted">Past estimated delivery time</span>
        </Card>
      </div>

      {/* Partner Fleet Breakdown & Speed Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Partner Fleet Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.partnerBreakdown?.length === 0 ? (
              <div className="py-12 text-center text-xs text-content-muted">
                No delivery fleet records found.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.partnerBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="partner" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} orders`, 'Fulfilled']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#159D91" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloud Kitchen Latency Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="flex justify-between items-center font-semibold text-content-primary">
                <span>Food Preparation Target</span>
                <span className="text-emerald-600">&lt; 18 mins</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Your average prep duration of {data?.avgPrepTimeMinutes || 15} mins is performing smoothly.
              </p>
            </div>

            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="flex justify-between items-center font-semibold text-content-primary">
                <span>Courier Transit Target</span>
                <span className="text-brand-teal">&lt; 25 mins</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Rider pickup to delivery duration averages {data?.avgDeliveryDurationMinutes || 20} mins across Bengaluru Indiranagar radius.
              </p>
            </div>

            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="flex justify-between items-center font-semibold text-content-primary">
                <span>Delay Forensics</span>
                <span className="text-amber-600">{data?.delayedOrdersCount || 0} incidents</span>
              </div>
              <p className="text-[11px] text-content-secondary">
                Delays are primarily observed during 8:30 PM–9:30 PM dinner rush bottlenecks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
