import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { OnboardingWizard } from '../components/dashboard/OnboardingWizard';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, activeKitchen, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
          <p className="text-sm text-content-secondary font-medium">Loading your cloud kitchen workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email === 'user@homebites.in' || (!activeKitchen && user.role !== 'PLATFORM_ADMIN')) {
    return <Navigate to="/explore" replace />;
  }

  const showOnboarding =
    !wizardDismissed &&
    activeKitchen !== null &&
    activeKitchen.onboardingCompleted === false &&
    user.role === 'KITCHEN_OWNER';

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Deep Navy Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content body with Topbar */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Guided Onboarding Modal if newly registered */}
      {showOnboarding && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setWizardDismissed(true)}
        />
      )}
    </div>
  );
};
