import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { ContactPage } from './pages/public/ContactPage';
import { ExploreKitchensPage } from './pages/customer/ExploreKitchensPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UnauthorizedPage, NotFoundPage } from './pages/auth/ErrorPages';

// Dashboard Pages
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { MenuPage } from './pages/dashboard/MenuPage';
import { InventoryPage } from './pages/dashboard/InventoryPage';
import { PricingIntelligencePage } from './pages/dashboard/PricingIntelligencePage';
import { DeliveryPerformancePage } from './pages/dashboard/DeliveryPerformancePage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { TeamPage } from './pages/dashboard/TeamPage';
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { SupportPage } from './pages/dashboard/SupportPage';

// Admin Page
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="explore" element={<ExploreKitchensPage />} />
            <Route path="kitchens" element={<ExploreKitchensPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Authenticated Dashboard Routes */}
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="analytics" element={<OverviewPage />} />
            <Route path="pricing" element={<PricingIntelligencePage />} />
            <Route path="delivery" element={<DeliveryPerformancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Protected Platform Administrator Routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
