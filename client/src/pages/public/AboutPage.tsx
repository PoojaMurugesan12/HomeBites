import React from 'react';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { ChefHat, Target, ShieldCheck, Compass, Eye, Database } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="orange">About HomeBites</Badge>
        <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight sm:text-5xl">
          Empowering Cloud Kitchens with Operational Visibility
        </h1>
        <p className="text-base text-content-secondary leading-relaxed">
          The concept behind HomeBites: “A Real-Time Order Processing and Visibility Enhancement System for Cloud Kitchens.”
        </p>
      </div>

      {/* The Core Challenge */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-navy">The Problem Faced by Small Cloud Kitchens</h2>
        <div className="text-sm text-content-secondary space-y-4 leading-relaxed">
          <p>
            Unlike traditional dine-in restaurants that benefit from street footfall, display signboards, and personal customer interaction, small cloud kitchens operate inside commercial hubs or shared dark spaces. Their survival depends entirely on digital visibility, efficient kitchen workflows, and tight financial margins.
          </p>
          <p>
            However, most independent cloud kitchen operators rely on fragmented aggregator portals, disconnected paper tickets, or manual spreadsheets. They lack answers to fundamental business questions: Which dishes yield the highest net contribution after ingredient costs? Exactly how many minutes are spent in food prep versus rider transit? Why are orders being cancelled during weekend peak hours?
          </p>
        </div>
      </div>

      {/* Why Visibility Matters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">Operational Clarity</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              When kitchen staff can see order preparation durations and live delivery statuses in real-time, handovers happen faster and food reaches customers hotter.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">Data-Driven Pricing</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Instead of arbitrary price hikes that risk customer volume, transparent unit contribution calculations reveal exactly which items support profitability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">Synchronized Inventory</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Deducting recipe ingredients automatically prevents painful 8 PM stock-outs, saves prep time, and eliminates unrecorded food wastage.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Long-Term Vision */}
      <div className="bg-brand-navy text-white rounded-2xl p-8 sm:p-12 space-y-4">
        <Badge variant="teal">Long-Term Vision</Badge>
        <h3 className="text-2xl font-bold tracking-tight">Leveling the Playing Field for Food Entrepreneurs</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Our vision is to provide every aspiring culinary entrepreneur—whether operating a single dark kitchen bay or building a nationwide D2C food brand—with enterprise-grade intelligence tools that were previously only accessible to massive multinational restaurant chains.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          HomeBites focuses on honest software architecture: explainable formulas, verifiable database persistence, strict tenant isolation, and tools that respect the owner's decision-making authority.
        </p>
      </div>
    </div>
  );
};
