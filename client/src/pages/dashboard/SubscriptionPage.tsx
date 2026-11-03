import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { SubscriptionPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionPage: React.FC = () => {
  const { activeKitchen, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get('/subscriptions/current'),
        api.get('/subscriptions/plans')
      ]);

      if (subRes.success) {
        setSubscription(subRes.subscription);
        setUsage(subRes.usage);
      }
      if (plansRes.success) {
        setPlans(plansRes.plans || []);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [activeKitchen?.id]);

  const handleSelectPlan = async (planCode: string) => {
    setActionLoading(true);
    try {
      const res = await api.post('/subscriptions/select', { planCode });
      if (res.success) {
        setModalOpen(false);
        await refreshUser();
        await fetchSubscriptionData();
      }
    } catch (err: any) {
      alert(`Error updating plan: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
        <p className="text-xs text-content-secondary">Fetching billing records...</p>
      </div>
    );
  }

  const currentPlan = subscription?.plan;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Subscription & Platform Tier
        </h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Review your current cloud kitchen plan, quota usage, and available upgrades.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-brand-orange/40">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-brand-navy">
                  {currentPlan?.name || 'Growth Plan'}
                </span>
                <Badge variant="teal">
                  {subscription?.status || 'ACTIVE'}
                </Badge>
                {subscription?.isDemoSubscription && (
                  <Badge variant="orange">Demonstration Mode</Badge>
                )}
              </div>
              <p className="text-xs text-content-secondary">
                {currentPlan?.description || 'Advanced analytics, smart pricing, and delivery metrics.'}
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-content-primary">
                {formatCurrency(currentPlan?.monthlyPrice || 299)}
                <span className="text-xs font-normal text-content-secondary"> / month</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="mt-2"
                onClick={() => setModalOpen(true)}
              >
                Change Plan Tier
              </Button>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-content-secondary font-medium">Orders Processed (Month)</span>
                <span className="font-bold text-content-primary">
                  {usage?.orderCountThisMonth || 0} / {currentPlan?.maxOrdersPerMonth || 1000}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-brand-orange rounded-full"
                  style={{
                    width: `${Math.min(100, ((usage?.orderCountThisMonth || 0) / (currentPlan?.maxOrdersPerMonth || 1000)) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-content-secondary font-medium">Menu Dishes Configured</span>
                <span className="font-bold text-content-primary">
                  {usage?.menuItemsCount || 0} / {currentPlan?.maxMenuItems || 60}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-brand-teal rounded-full"
                  style={{
                    width: `${Math.min(100, ((usage?.menuItemsCount || 0) / (currentPlan?.maxMenuItems || 60)) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-content-secondary font-medium">Staff Members</span>
                <span className="font-bold text-content-primary">
                  {usage?.staffCount || 1} / {currentPlan?.maxStaffMembers || 5}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-brand-navy rounded-full"
                  style={{
                    width: `${Math.min(100, ((usage?.staffCount || 1) / (currentPlan?.maxStaffMembers || 5)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features Included in Your Current Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPlan?.features?.map((feat: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span className="text-content-primary font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demonstration Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-surface-border text-xs text-content-secondary flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-content-primary">Billing Integrity Note</div>
          <p>
            HomeBites records plan selections in the PostgreSQL database with a Demonstration status. External gateway webhook endpoints can be integrated seamlessly when live payment keys are supplied.
          </p>
        </div>
      </div>

      {/* MODAL: CHANGE PLAN */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Change Subscription Plan"
        description="Select a tier within the configurable ₹100–₹500/month prototype range."
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {plans.map((p) => {
            const isSelected = p.code === currentPlan?.code;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                  isSelected ? 'border-brand-orange bg-orange-50/30' : 'border-surface-border bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-brand-navy">{p.name}</span>
                    {isSelected && <Badge variant="orange">Active</Badge>}
                  </div>
                  <div className="text-xl font-extrabold text-content-primary mt-2">
                    {formatCurrency(p.monthlyPrice)} <span className="text-xs text-content-secondary font-normal">/mo</span>
                  </div>
                  <p className="text-[11px] text-content-secondary mt-1">{p.description}</p>
                </div>

                <Button
                  size="sm"
                  variant={isSelected ? 'outline' : 'primary'}
                  disabled={isSelected}
                  loading={actionLoading}
                  onClick={() => handleSelectPlan(p.code)}
                  className="w-full"
                >
                  {isSelected ? 'Active Tier' : 'Switch Plan'}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
