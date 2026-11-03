import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Store, Users, MessageSquare, FileText, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const AdminLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Console...</div>;
  }

  if (!user || user.role !== 'PLATFORM_ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center text-slate-950 font-bold">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white">HomeBites Admin</span>
            <span className="ml-2 text-[10px] bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> View Kitchen Portal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
