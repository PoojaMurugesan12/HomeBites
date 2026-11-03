import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const PricingPage: React.FC = () => {
  const { user, activeKitchen, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);

  const handleSelectPlan = async (planCode: string) => {
    if (!user) {
      navigate('/register');
      return;
    }

    setLoadingCode(planCode);
    try {
      const res = await api.post('/subscriptions/select', { planCode });
      if (res.success) {
        setSelectedNotice(`Plan successfully updated to ${res.subscription.plan.name} (Demonstration Subscription).`);
        await refreshUser();
      }
    } catch (err: any) {
      setSelectedNotice(`Error: ${err.message}`);
    } finally {
      setLoadingCode(null);
    }
  };

  const currentPlanCode = activeKitchen?.subscription?.plan?.code;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="orange">Transparent Prototype Plans</Badge>
        <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight sm:text-5xl">
          Plans Designed for Cloud Kitchen Unit Economics
        </h1>
        <p className="text-sm text-content-secondary leading-relaxed">
          High-margin software without the enterprise bloat. Select a proposed tier to immediately unlock features in your kitchen workspace.
        </p>
      </div>

      {selectedNotice && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-brand-teal" />
          <span>{selectedNotice}</span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Starter Plan */}
        <Card className="flex flex-col justify-between hover:border-brand-orange transition-colors">
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-navy">Starter</h3>
                {currentPlanCode === 'starter' && <Badge variant="teal">Current Plan</Badge>}
              </div>
              <p className="text-xs text-content-secondary mt-1">
                For home kitchens and single dark bay outlets starting digital order tracking.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-content-primary">₹100</span>
              <span className="text-xs text-content-secondary">/ month</span>
            </div>

            <div className="border-t border-surface-border pt-4 space-y-3 text-xs text-content-secondary">
              <div className="font-semibold text-content-primary">Included Features:</div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 250 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 20 menu items</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Manual order entry interface</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Basic inventory alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> CSV order export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Standard email support</li>
              </ul>
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              loading={loadingCode === 'starter'}
              disabled={currentPlanCode === 'starter'}
              onClick={() => handleSelectPlan('starter')}
            >
              {currentPlanCode === 'starter' ? 'Active Plan' : 'Select Starter Plan'}
            </Button>
          </div>
        </Card>

        {/* Growth Plan - Highlighted */}
        <Card className="flex flex-col justify-between border-2 border-brand-orange shadow-lg relative bg-white">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
            Most Popular
          </div>
          <CardContent className="space-y-6 pt-8">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-navy">Growth</h3>
                {currentPlanCode === 'growth' && <Badge variant="teal">Current Plan</Badge>}
              </div>
              <p className="text-xs text-content-secondary mt-1">
                Advanced analytics, pricing recommendations, and recipe-level inventory sync.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-content-primary">₹299</span>
              <span className="text-xs text-content-secondary">/ month</span>
            </div>

            <div className="border-t border-surface-border pt-4 space-y-3 text-xs text-content-secondary">
              <div className="font-semibold text-content-primary">Everything in Starter, plus:</div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Up to 1,000 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Up to 60 menu items</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Explainable Smart Pricing Engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Recipe ingredient inventory synchronization</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Delivery duration & delay forensics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> CSV batch order import</li>
              </ul>
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Button
              variant="primary"
              className="w-full shadow-md"
              loading={loadingCode === 'growth'}
              disabled={currentPlanCode === 'growth'}
              onClick={() => handleSelectPlan('growth')}
            >
              {currentPlanCode === 'growth' ? 'Active Plan' : 'Select Growth Plan'}
            </Button>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col justify-between hover:border-brand-orange transition-colors">
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-brand-navy">Pro Kitchen</h3>
                {currentPlanCode === 'pro' && <Badge variant="teal">Current Plan</Badge>}
              </div>
              <p className="text-xs text-content-secondary mt-1">
                For established dark kitchens and multi-staff brands needing enterprise audit records.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-content-primary">₹500</span>
              <span className="text-xs text-content-secondary">/ month</span>
            </div>

            <div className="border-t border-surface-border pt-4 space-y-3 text-xs text-content-secondary">
              <div className="font-semibold text-content-primary">Everything in Growth, plus:</div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 5,000 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 200 menu items</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Multi-user staff roles & permissions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Advanced financial reports & PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Priority support & account manager</li>
              </ul>
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              loading={loadingCode === 'pro'}
              disabled={currentPlanCode === 'pro'}
              onClick={() => handleSelectPlan('pro')}
            >
              {currentPlanCode === 'pro' ? 'Active Plan' : 'Select Pro Plan'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-surface-border text-xs text-content-secondary flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-content-primary">Prototype Subscription Architecture</div>
          <p>
            Selected plans are recorded directly in PostgreSQL with a Demonstration/Trial status. Real-time billing integrations can be seamlessly attached without breaking existing schema or kitchen relationships.
          </p>
        </div>
      </div>
    </div>
  );
};
