import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  Boxes,
  Bike,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  BarChart3,
  Layers,
  ChefHat
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleExploreDemo = async () => {
    try {
      await login('rahul@biryanibox.in', 'Owner@123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="orange" size="md" className="py-1 px-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            Empowering Modern Foodpreneurs & Dark Kitchens
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-navy leading-tight">
            Turn Your Cloud Kitchen Data Into{' '}
            <span className="text-brand-orange underline decoration-brand-orange/30">Smarter Growth.</span>
          </h1>

          <p className="text-lg sm:text-xl text-content-secondary leading-relaxed">
            Manage orders, understand demand, optimize menu pricing, track delivery performance, and control inventory—all from one intelligent workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto shadow-md"
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="teal"
              size="lg"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto shadow-md"
            >
              Browse Kitchens & Menus <ChefHat className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleExploreDemo}
              className="w-full sm:w-auto bg-white/80"
            >
              Explore Live Demo Dashboard
            </Button>
          </div>

          <p className="text-xs text-content-muted">
            Zero setup fees • Realistic demonstration dataset included • No credit card required
          </p>
        </div>

        {/* Hero Interactive Dashboard Mockup Preview */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-2xl bg-white p-3 sm:p-5 shadow-2xl border border-surface-border">
          <div className="rounded-xl bg-surface p-4 sm:p-6 space-y-6 border border-surface-border/60">
            {/* Mock Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center font-bold text-xs">
                  BB
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Biryani Box Express — Indiranagar</div>
                  <div className="text-[10px] text-content-secondary">Live Operational Telemetry • Real-time Sync</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="teal">Connected Orders: Active</Badge>
                <Badge variant="success">92% On-Time</Badge>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3 rounded-xl border border-surface-border/60 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Today's Sales</div>
                <div className="text-lg font-bold text-content-primary mt-0.5">₹18,450</div>
                <div className="text-[10px] text-emerald-600 font-medium">↑ +14.2% vs last week</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-surface-border/60 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Orders Placed</div>
                <div className="text-lg font-bold text-content-primary mt-0.5">48 orders</div>
                <div className="text-[10px] text-content-secondary">4 in preparation</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-surface-border/60 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Avg Prep Time</div>
                <div className="text-lg font-bold text-brand-teal mt-0.5">14.8 mins</div>
                <div className="text-[10px] text-brand-teal font-medium">Speed benchmark met</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-surface-border/60 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">Inventory Alerts</div>
                <div className="text-lg font-bold text-amber-600 mt-0.5">1 Low Stock</div>
                <div className="text-[10px] text-amber-600 font-medium">Malai Paneer (3.2 kg)</div>
              </div>
            </div>

            {/* Recommendation Preview Snippet */}
            <div className="bg-brand-orange-light/40 border border-brand-orange/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">
                    Smart Pricing Recommendation: Royal Mutton Dum Biryani
                  </div>
                  <div className="text-[11px] text-content-secondary leading-snug">
                    Current margin is 59.2% (below 65% target). High demand elasticity allows price adjustment from ₹380 to ₹440 with estimated +₹60 contribution per unit.
                  </div>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={handleExploreDemo}>
                Review in App
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="navy">The Cloud Kitchen Reality</Badge>
          <h2 className="text-3xl font-bold text-brand-navy">Why Small Cloud Kitchens Struggle to Scale</h2>
          <p className="text-sm text-content-secondary leading-relaxed">
            Operating a food brand without dining tables shouldn't mean running your kitchen blind. Disconnected spreadsheets and fragmented aggregator tabs create costly blind spots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-status-error flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">Difficult Pricing Decisions</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Raw ingredient costs rise constantly, but kitchen owners guess menu prices without calculating exact unit contribution margins or tracking customer demand elasticity.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">Avoidable Inventory Shortages</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Running out of paneer or chicken during peak 8 PM dinner rushes causes cancelled orders, platform penalties, and frustrates loyal diners.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-content-primary">Unmonitored Delivery Delays</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                Kitchen bottlenecks go undetected. Owners cannot pinpoint whether slow delivery is caused by kitchen prep delays or delivery fleet rider availability.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="bg-brand-navy text-white py-20 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-4">
            <Badge variant="teal">Intelligent Decision Support</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              HomeBites: More Than Order Management
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We provide cloud kitchen founders with transparent, data-driven intelligence. Rather than black-box algorithms or decorative dashboards, HomeBites connects your real orders to inventory, unit costs, and delivery timestamps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-brand-orange font-bold text-lg">01</div>
              <h4 className="text-sm font-semibold text-white">Unified Order Telemetry</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log direct website orders, takeaway calls, and imported aggregator batches into one consistent operational pipeline.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-brand-teal font-bold text-lg">02</div>
              <h4 className="text-sm font-semibold text-white">Explainable Pricing Engine</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Formulas based on variable ingredient costs and target contribution margins. No unexpected automatic price changes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-amber-400 font-bold text-lg">03</div>
              <h4 className="text-sm font-semibold text-white">Recipe-Level Deductions</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect dishes to ingredients. When a biryani is confirmed, rice, chicken, and packaging deduct atomically from inventory.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-emerald-400 font-bold text-lg">04</div>
              <h4 className="text-sm font-semibold text-white">Strict Tenant Isolation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your menu costs, sales volumes, customer lists, and staff records remain completely isolated to your kitchen account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <Badge variant="teal">Simple 4-Step Process</Badge>
          <h2 className="text-3xl font-bold text-brand-navy">How HomeBites Powers Your Operations</h2>
          <p className="text-sm text-content-secondary">
            Get up and running in minutes without changing your kitchen staff's cooking workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-bold text-lg mx-auto md:mx-0 shadow-sm">
              1
            </div>
            <h4 className="text-base font-semibold text-content-primary">Create Kitchen Profile</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Register your cloud kitchen, add operating address, FSSAI compliance details, and configure your target gross margin.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold text-lg mx-auto md:mx-0 shadow-sm">
              2
            </div>
            <h4 className="text-base font-semibold text-content-primary">Log Orders or Import CSV</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Create orders in real-time or upload batch CSV files with column mapping and duplicate order prevention.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-bold text-lg mx-auto md:mx-0 shadow-sm">
              3
            </div>
            <h4 className="text-base font-semibold text-content-primary">Monitor Operations</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Track prep speed, delivery durations, ingredient movements, and low stock warnings on a responsive live dashboard.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mx-auto md:mx-0 shadow-sm">
              4
            </div>
            <h4 className="text-base font-semibold text-content-primary">Review & Optimize</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Evaluate explainable pricing recommendations, accept or adjust prices with one click, and export audit-ready CSV reports.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-brand-ivory-dark/60 rounded-3xl p-8 sm:p-12 border border-surface-border/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <Badge variant="orange">Real Tangible Outcomes</Badge>
            <h2 className="text-3xl font-bold text-brand-navy leading-tight">
              Actionable Insights Built for Daily Kitchen Operations
            </h2>
            <p className="text-sm text-content-secondary leading-relaxed">
              We do not promise unrealistic instant sales multipliers. Instead, we give you the operational clarity required to run a tighter, more profitable food business.
            </p>

            <ul className="space-y-3 text-sm text-content-primary font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                <span>Identify top-selling items and their exact contribution to revenue</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                <span>Eliminate stock shortages by setting automated min-stock thresholds</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                <span>Detect delivery delay trends across peak lunch and dinner windows</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                <span>Make confident, data-backed menu price adjustments without guesswork</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-brand-navy">Sample Kitchen Performance Snapshot</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-surface-border">
                <span className="text-content-secondary">Monthly Orders Processed</span>
                <span className="font-semibold text-content-primary">1,240 orders</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-surface-border">
                <span className="text-content-secondary">Gross Sales Tracked</span>
                <span className="font-semibold text-content-primary">₹3,48,200</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-surface-border">
                <span className="text-content-secondary">Avg Kitchen Preparation Time</span>
                <span className="font-semibold text-brand-teal">15.2 minutes</span>
              </div>
              <div className="flex justify-between text-xs py-2">
                <span className="text-content-secondary">Stock Movement Audit Trail</span>
                <span className="font-semibold text-emerald-600">100% reconciled</span>
              </div>
            </div>
            <Button variant="primary" className="w-full text-xs" onClick={handleExploreDemo}>
              Open Demo Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* 6. PRICING PROTOTYPE TIERS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="orange">Transparent Prototype Plans</Badge>
          <h2 className="text-3xl font-bold text-brand-navy">Predictable Pricing for Growing Kitchens</h2>
          <p className="text-sm text-content-secondary">
            Configurable prototype pricing tiers within the proposed ₹100–₹500/month range.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <Card className="flex flex-col justify-between hover:border-brand-orange transition-colors">
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Starter Plan</h3>
                <p className="text-xs text-content-secondary mt-1">Essential order logging & inventory for early setups.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-content-primary">₹100</span>
                <span className="text-xs text-content-secondary">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-content-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 250 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 20 menu items</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Manual order entry</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Basic inventory alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> CSV export tools</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                Select Starter Plan
              </Button>
            </div>
          </Card>

          {/* Growth Plan - Highlighted */}
          <Card className="flex flex-col justify-between border-2 border-brand-orange shadow-md relative bg-white">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
              Recommended for Cloud Kitchens
            </div>
            <CardContent className="space-y-5 pt-8">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Growth Plan</h3>
                <p className="text-xs text-content-secondary mt-1">Advanced analytics, smart pricing, and delivery metrics.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-content-primary">₹299</span>
                <span className="text-xs text-content-secondary">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-content-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Up to 1,000 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Up to 60 menu items</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Smart Pricing Engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Recipe-level ingredient deduction</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-orange" /> Delivery performance monitoring</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button variant="primary" className="w-full shadow-sm" onClick={() => navigate('/pricing')}>
                Select Growth Plan
              </Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col justify-between hover:border-brand-orange transition-colors">
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Pro Kitchen Plan</h3>
                <p className="text-xs text-content-secondary mt-1">For multi-staff kitchens requiring detailed financial reports.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-content-primary">₹500</span>
                <span className="text-xs text-content-secondary">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-content-secondary">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Up to 5,000 orders/month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Multi-user staff roles & permissions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Automated bulk CSV order sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Advanced financial reports & PDF export</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Priority support</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                Select Pro Plan
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-xs text-content-muted">
          * Note: Subscription plans in this demonstration reflect prototype tiers. Subscriptions are recorded as demonstration accounts until live payment gateway credentials are provided.
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="navy">Frequently Asked Questions</Badge>
          <h2 className="text-3xl font-bold text-brand-navy">Common Questions from Kitchen Owners</h2>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2">
              <h4 className="text-sm font-semibold text-content-primary">How does the Smart Pricing Recommendation Engine work?</h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                The engine evaluates your variable recipe costs and your configured target gross contribution margin (e.g. 65%). If historical order volume demonstrates steady demand, it suggests calibrated price adjustments. It will never change your menu prices automatically—you retain 100% control to accept, reject, or customize recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <h4 className="text-sm font-semibold text-content-primary">Can I import orders from Swiggy or Zomato CSV exports?</h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                Yes! HomeBites includes a dedicated CSV batch importer. You can upload daily order exports, review row validation, detect duplicates, and seamlessly sync order history without manual data entry.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <h4 className="text-sm font-semibold text-content-primary">How does inventory synchronization handle recipe ingredients?</h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                You can configure a recipe for each dish specifying exact ingredient weights (e.g. 200g Basmati Rice and 250g Chicken per Biryani portion). When an order is confirmed, those quantities are deducted atomically from your inventory, creating an auditable stock movement record.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <h4 className="text-sm font-semibold text-content-primary">Is my kitchen data kept private from competitors?</h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                Absolutely. HomeBites enforces strict database-level and application-level tenant isolation. Users from one kitchen cannot query, view, or modify orders, recipes, customer contacts, or financial metrics belonging to any other kitchen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl p-10 sm:p-16 text-center text-white space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Take Control of Your Cloud Kitchen Growth?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Join cloud kitchen operators turning operational data into higher contribution margins, faster delivery times, and zero food waste.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-700 text-white bg-slate-800/80 hover:bg-slate-700"
                onClick={handleExploreDemo}
              >
                Sign In with Demo Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
