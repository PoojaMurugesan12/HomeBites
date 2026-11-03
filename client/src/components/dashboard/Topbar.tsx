import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, CheckCheck, Store, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Notification } from '../../types';
import { formatTime } from '../../lib/utils';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, activeKitchen, memberships, switchKitchen, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [activeKitchen?.id]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      //
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      //
    }
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white border-b border-surface-border px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Mobile toggle & breadcrumb / kitchen badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-surface-muted"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Multi-kitchen switcher dropdown if user has > 1 kitchen */}
        {memberships.length > 1 ? (
          <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-lg border border-surface-border">
            <Store className="w-4 h-4 text-brand-orange" />
            <select
              value={activeKitchen?.id || ''}
              onChange={(e) => switchKitchen(e.target.value)}
              className="bg-transparent text-xs font-semibold text-content-primary focus:outline-none cursor-pointer"
            >
              {memberships.map((m) => (
                <option key={m.kitchenId} value={m.kitchenId}>
                  {m.kitchenName || 'Kitchen'} ({m.role})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-content-secondary">
            <span>Kitchen Portal</span>
            <span>/</span>
            <span className="font-semibold text-content-primary">{activeKitchen?.name}</span>
          </div>
        )}
      </div>

      {/* Right actions: notifications, explore menu, and user profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/explore')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-orange-50 text-brand-orange border border-orange-200/80 hover:bg-orange-100/70 transition-all shadow-xs"
        >
          <Store className="w-3.5 h-3.5 text-brand-orange" />
          <span>View Live Menus</span>
        </button>

        {user?.role === 'PLATFORM_ADMIN' && (
          <button
            onClick={() => navigate('/admin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-brand-teal" />
            <span>Admin Console</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-content-secondary hover:text-content-primary rounded-lg hover:bg-surface-muted relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-surface-border py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-content-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-brand-orange/10 text-brand-orange font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-teal hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border/50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-content-secondary">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`p-3.5 hover:bg-surface-muted cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-content-primary">{n.title}</span>
                        <span className="text-[10px] text-content-muted whitespace-nowrap">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-content-secondary mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-orange text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-content-primary leading-tight truncate max-w-[120px]">
                {user?.fullName}
              </div>
              <div className="text-[10px] text-content-secondary uppercase tracking-wider font-medium">
                {user?.role === 'KITCHEN_OWNER' ? 'Kitchen Owner' : user?.role === 'PLATFORM_ADMIN' ? 'Platform Admin' : 'Staff'}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-border py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-surface-border">
                <div className="text-xs font-semibold text-content-primary">{user?.fullName}</div>
                <div className="text-[11px] text-content-secondary truncate">{user?.email}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-content-primary hover:bg-surface-muted"
                >
                  Kitchen Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/subscription');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-content-primary hover:bg-surface-muted"
                >
                  Subscription & Billing
                </button>
              </div>

              <div className="border-t border-surface-border pt-1">
                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-status-error font-medium hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
