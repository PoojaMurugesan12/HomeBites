import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Inputs';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        businessName: formData.businessName,
        password: formData.password,
        acceptTerms: formData.acceptTerms
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 max-w-lg mx-auto w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">
            Home<span className="text-brand-orange">Bites</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Create Kitchen Profile</h2>
        <p className="text-xs text-content-secondary">
          Start your 14-day free trial. Guided onboarding included.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl border border-surface-border rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-status-error text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Full Name *"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Kitchen / Brand Name *"
                required
                placeholder="e.g. Biryani Box Express"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                required
                placeholder="e.g. orders@mykitchen.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password (Min 8 chars) *"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm Password *"
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="rounded border-surface-border text-brand-orange focus:ring-brand-orange"
              />
              <label htmlFor="terms" className="text-xs text-content-secondary">
                I agree to the Terms of Service and Privacy Policy. Public registration grants Kitchen Owner privileges.
              </label>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Complete Registration & Start Trial <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-content-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-orange hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
