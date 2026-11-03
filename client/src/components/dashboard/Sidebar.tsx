import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Boxes,
  TrendingUp,
  Sparkles,
  Bike,
  FileSpreadsheet,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  ChefHat,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, activeKitchen } = useAuth();
  const isOwner = user?.role === 'KITCHEN_OWNER' || activeKitchen?.role === 'OWNER';

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', to: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Menu Management', to: '/dashboard/menu', icon: UtensilsCrossed },
    { label: 'Inventory', to: '/dashboard/inventory', icon: Boxes },
    { label: 'Analytics', to: '/dashboard/analytics', icon: TrendingUp },
    { label: 'Pricing Intelligence', to: '/dashboard/pricing', icon: Sparkles, badge: 'Smart' },
    { label: 'Delivery Performance', to: '/dashboard/delivery', icon: Bike },
    { label: 'Reports & Export', to: '/dashboard/reports', icon: FileSpreadsheet },
    ...(isOwner
      ? [
          { label: 'Team', to: '/dashboard/team', icon: Users },
          { label: 'Subscription', to: '/dashboard/subscription', icon: CreditCard },
          { label: 'Kitchen Settings', to: '/dashboard/settings', icon: Settings }
        ]
      : []),
    { label: 'Help & Support', to: '/dashboard/support', icon: HelpCircle }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-brand-navy flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Home<span className="text-brand-orange">Bites</span>
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                Growth & Intelligence
              </span>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Kitchen Header */}
        {activeKitchen && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="text-[10px] uppercase font-bold tracking-wider text-brand-teal">
              Active Cloud Kitchen
            </div>
            <div className="text-sm font-semibold text-white truncate mt-0.5">
              {activeKitchen.name}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeKitchen.city || 'Bangalore'} • {activeKitchen.role || 'OWNER'}</span>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-brand-orange text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Plan / Subscription footer tag */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Plan Tier</div>
              <div className="text-xs font-semibold text-white">
                {activeKitchen?.subscription?.plan?.name || 'Growth Prototype'}
              </div>
            </div>
            <Link
              to="/dashboard/subscription"
              className="text-xs text-brand-orange hover:underline font-semibold"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
