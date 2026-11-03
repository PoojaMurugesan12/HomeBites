import React, { useState, useEffect } from 'react';
import {
  Shield,
  Store,
  Users,
  ShoppingBag,
  IndianRupee,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import { formatCurrency, formatDateTime, formatDate } from '../../lib/utils';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kitchens' | 'users' | 'messages' | 'logs'>('kitchens');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, kitchensRes, usersRes, messagesRes, logsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/kitchens'),
        api.get('/admin/users'),
        api.get('/admin/contact-messages'),
        api.get('/admin/audit-logs')
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (kitchensRes.success) setKitchens(kitchensRes.kitchens || []);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (messagesRes.success) setMessages(messagesRes.messages || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateMessageStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch(`/admin/contact-messages/${id}`, { status });
      if (res.success) {
        setMessages((prev) => prev.map((m) => (m.id === id ? res.message : m)));
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
        <p className="text-xs text-slate-400">Loading platform governance telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-teal" /> Platform Governance & Oversight
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Aggregate metrics across all registered food brands, accounts, support inquiries, and system audit logs.
        </p>
      </div>

      {/* 5 Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Kitchens</span>
          <div className="text-2xl font-extrabold text-white">{stats?.totalKitchens || 0}</div>
          <span className="text-[10px] text-slate-500">Registered tenants</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          <div className="text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</div>
          <span className="text-[10px] text-slate-500">Owners & kitchen staff</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Orders</span>
          <div className="text-2xl font-extrabold text-brand-teal">{stats?.totalOrders || 0}</div>
          <span className="text-[10px] text-slate-500">Across all kitchens</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Sales Volume</span>
          <div className="text-2xl font-extrabold text-brand-orange">{formatCurrency(stats?.platformGrossRevenue || 0)}</div>
          <span className="text-[10px] text-slate-500">All-time tracked</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Support Inquiries</span>
          <div className="text-2xl font-extrabold text-emerald-400">{stats?.unreadMessages || 0}</div>
          <span className="text-[10px] text-slate-500">Unread public messages</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('kitchens')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'kitchens' ? 'bg-brand-teal text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Registered Kitchens ({kitchens.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'users' ? 'bg-brand-teal text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'messages' ? 'bg-brand-teal text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Contact Messages ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'logs' ? 'bg-brand-teal text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: KITCHENS TABLE */}
      {activeTab === 'kitchens' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Kitchen Brand</th>
                <th className="py-3 px-4 font-semibold">City / Location</th>
                <th className="py-3 px-4 font-semibold">FSSAI License</th>
                <th className="py-3 px-4 font-semibold">Owner Contact</th>
                <th className="py-3 px-4 font-semibold text-center">Plan Tier</th>
                <th className="py-3 px-4 font-semibold text-right">Orders Tracked</th>
                <th className="py-3 px-4 font-semibold text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {kitchens.map((k) => (
                <tr key={k.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{k.name}</td>
                  <td className="py-3 px-4 text-slate-300">{k.city || 'Bangalore'}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{k.fssaiNumber || 'Pending Entry'}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{k.memberships[0]?.user?.fullName}</div>
                    <div className="text-[10px] text-slate-500">{k.memberships[0]?.user?.email}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-brand-orange border border-brand-orange/30">
                      {k.subscription?.plan?.name || 'Growth Prototype'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-brand-teal">{k._count?.orders || 0}</td>
                  <td className="py-3 px-4 text-right text-slate-400">{formatDate(k.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Email Address</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold text-center">Platform Role</th>
                <th className="py-3 px-4 font-semibold">Assigned Kitchen</th>
                <th className="py-3 px-4 font-semibold text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4 text-slate-400">{u.phone || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      u.role === 'PLATFORM_ADMIN'
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                        : u.role === 'KITCHEN_OWNER'
                        ? 'bg-orange-900/60 text-orange-300 border border-orange-700'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {u.memberships[0]?.kitchen?.name || 'Platform Level'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
              No public contact submissions yet.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.name}</span>
                    <span className="text-xs text-slate-400">&lt;{m.email}&gt;</span>
                    {m.businessName && (
                      <span className="text-xs text-brand-teal font-semibold">• {m.businessName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      m.status === 'UNREAD' ? 'bg-amber-900/50 text-amber-300 border border-amber-700' : 'bg-emerald-900/50 text-emerald-300'
                    }`}>
                      {m.status}
                    </span>
                    <button
                      onClick={() => handleUpdateMessageStatus(m.id, m.status === 'UNREAD' ? 'READ' : 'RESPONDED')}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Mark {m.status === 'UNREAD' ? 'Read' : 'Responded'}
                    </button>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-200">{m.subject}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{m.message}</p>
                <div className="text-[10px] text-slate-500 pt-1">{formatDateTime(m.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Actor / User</th>
                <th className="py-3 px-4 font-semibold">Kitchen Scope</th>
                <th className="py-3 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3 px-4 font-bold text-brand-orange">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-300">{log.user?.fullName || 'System Event'}</td>
                  <td className="py-3 px-4 text-slate-400">{log.kitchen?.name || 'Global'}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
