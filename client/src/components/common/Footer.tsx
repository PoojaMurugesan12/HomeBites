import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Home<span className="text-brand-orange">Bites</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time order processing, visibility enhancement, and data-driven intelligence engineered for cloud kitchens and D2C food brands.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-teal">
              <ShieldCheck className="w-4 h-4" />
              <span>Isolated Multi-Tenant Security</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/features" className="hover:text-brand-orange transition-colors">Real-Time Analytics</Link></li>
              <li><Link to="/features" className="hover:text-brand-orange transition-colors">Smart Pricing Engine</Link></li>
              <li><Link to="/features" className="hover:text-brand-orange transition-colors">Recipe Inventory Sync</Link></li>
              <li><Link to="/features" className="hover:text-brand-orange transition-colors">Delivery Monitoring</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-orange transition-colors">Subscription Plans</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/about" className="hover:text-brand-orange transition-colors">About HomeBites</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-colors">Contact Support</Link></li>
              <li><a href="/#faq" className="hover:text-brand-orange transition-colors">Frequently Asked Questions</a></li>
              <li><Link to="/login" className="hover:text-brand-orange transition-colors">Kitchen Sign In</Link></li>
            </ul>
          </div>

          {/* Positioning & Compliance */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Operational Promise</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              “Your cloud kitchen. Your data. Your growth.”
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              HomeBites provides explainable decision support and operational visibility. All pricing calculations require explicit kitchen owner authorization.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HomeBites Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
