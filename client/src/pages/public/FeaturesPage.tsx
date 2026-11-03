import React from 'react';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import {
  Sparkles,
  TrendingUp,
  Boxes,
  Bike,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="orange">Capabilities Deep Dive</Badge>
        <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight sm:text-5xl">
          Everything You Need to Master Cloud Kitchen Operations
        </h1>
        <p className="text-base text-content-secondary leading-relaxed">
          From the moment an order is confirmed to final doorstep delivery and inventory reconciliation, HomeBites connects every operational link.
        </p>
      </div>

      {/* Feature 1: Real-Time Order Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <Badge variant="orange">Feature 01</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Real-Time Order Telemetry & Lifecycle Management</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Move away from missed tickets. Track every order through an immutable state machine: Pending → Confirmed → Preparing → Ready for Pickup → Out for Delivery → Delivered.
          </p>
          <ul className="space-y-2.5 text-xs text-content-secondary">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Multi-item orders with automated 5% GST tax calculation</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> WebSocket instant push updates across kitchen devices</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Cancellation audit logs with recorded operational reasons</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Single-click CSV export and batch CSV import with duplicate prevention</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-md space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold text-brand-navy">Live Order State Progression</span>
            <Badge variant="teal">Order #HB-20261028-1042</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex justify-between">
              <span>Confirmed • Auto-accepted</span>
              <span className="font-semibold">12:30 PM</span>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex justify-between">
              <span>Preparing • Chicken Biryani (2x)</span>
              <span className="font-semibold">12:35 PM</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 flex justify-between">
              <span>Ready for Pickup • Station 1</span>
              <span className="font-semibold">12:48 PM (13 min prep)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Smart Pricing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-md space-y-4 order-2 lg:order-1">
          <div className="p-4 bg-brand-orange-light/50 rounded-xl space-y-2">
            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider">Formula in Action</div>
            <div className="text-xs font-mono bg-white p-2.5 rounded border border-brand-orange/30 text-content-primary">
              Candidate Price = Cost / (1 - Target Margin)<br />
              Candidate Price = ₹155 / (1 - 0.65) = ₹442.85 → ₹440
            </div>
            <p className="text-[11px] text-content-secondary leading-snug">
              Explainable calculations based on raw cost & volume. Owner must approve price changes explicitly.
            </p>
          </div>
        </div>
        <div className="space-y-4 order-1 lg:order-2">
          <Badge variant="teal">Feature 02</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Explainable Pricing Recommendation Engine</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Stop guessing whether menu prices cover skyrocketing procurement costs. HomeBites evaluates your variable ingredients and historical order velocity to suggest data-backed price optimizations.
          </p>
          <ul className="space-y-2.5 text-xs text-content-secondary">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Transparent unit contribution calculations per menu dish</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Demand trend indicators (High, Moderate, Low, or Insufficient Data)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> 1-Click Accept, Reject, or Dismiss with full audit trail</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Never alters external aggregator prices without your consent</li>
          </ul>
        </div>
      </div>

      {/* Feature 3: Synchronized Recipe Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <Badge variant="orange">Feature 03</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Recipe-Level Inventory Synchronization</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Link recipes directly to raw ingredients. When dishes are ordered, ingredients automatically decrement and log stock movement records.
          </p>
          <ul className="space-y-2.5 text-xs text-content-secondary">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Atomic ingredient deductions prevent accidental double counting</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Automated low-stock alerts before peak dinner rushes</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Restock transactions & spoilage adjustment reason tracking</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Total inventory valuation calculated at true weighted unit cost</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-md space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold text-brand-navy">Inventory Stock Status</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Reconciled</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-surface-border/50">
              <span className="font-medium text-content-primary">Premium Basmati Rice</span>
              <span className="font-semibold text-content-primary">48.5 kg (Min: 15 kg)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-surface-border/50">
              <span className="font-medium text-content-primary">Fresh Chicken Cuts</span>
              <span className="font-semibold text-content-primary">26.0 kg (Min: 10 kg)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-amber-700 bg-amber-50/60 px-2 rounded">
              <span className="font-medium">Malai Cottage Cheese</span>
              <span className="font-bold">3.2 kg (Threshold: 5 kg) ⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Delivery Performance Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-md space-y-3 order-2 lg:order-1">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <span className="text-xs font-bold text-brand-navy">Delivery Durations</span>
            <Badge variant="teal">Indiranagar Outlet</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-surface-border">
              <div className="text-[10px] text-content-secondary uppercase font-semibold">Kitchen Prep Time</div>
              <div className="text-xl font-bold text-brand-navy mt-1">15.4 mins</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-surface-border">
              <div className="text-[10px] text-content-secondary uppercase font-semibold">Rider Transit Time</div>
              <div className="text-xl font-bold text-brand-teal mt-1">19.2 mins</div>
            </div>
          </div>
          <p className="text-xs text-content-secondary italic text-center pt-1">
            “Average preparation time is under 18 mins. Delay frequency is concentrated between 8:30 PM - 9:30 PM.”
          </p>
        </div>
        <div className="space-y-4 order-1 lg:order-2">
          <Badge variant="teal">Feature 04</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">Delivery Performance & Delay Forensics</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Separate kitchen preparation latency from delivery partner travel delays. Understand exactly why orders run late and preserve customer satisfaction.
          </p>
          <ul className="space-y-2.5 text-xs text-content-secondary">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> On-time delivery rate calculations</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Delay frequency trends broken down by hour and rider partner</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Order source comparisons (Direct vs Partner fleets)</li>
          </ul>
        </div>
      </div>

      <div className="pt-8 text-center">
        <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
          Start Free Kitchen Trial <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
