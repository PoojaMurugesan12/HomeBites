import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Lock, Mail, ArrowRight, Shield, UserCheck, KeyRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Inputs';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'PLATFORM_ADMIN') {
        navigate('/admin');
      } else if (!res?.activeKitchen || res?.user?.email === 'user@homebites.in' || email.toLowerCase().includes('user')) {
        navigate('/explore');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">
            Home<span className="text-brand-orange">Bites</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Sign In to HomeBites</h2>
        <p className="text-xs text-content-secondary">
          Enter your credentials to access your cloud kitchen dashboard or explore menus.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-xl border border-surface-border rounded-2xl sm:px-10 space-y-6">
          {/* Quick Demo Fill Buttons */}
          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-brand-navy flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
              <span>Quick 1-Click Demo Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fillCredentials('rahul@biryanibox.in', 'Owner@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 transition-colors shadow-xs"
              >
                <div className="font-semibold text-content-primary">Kitchen Owner</div>
                <div className="text-[10px] text-content-muted">Biryani Box Express</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('priya@biryanibox.in', 'Staff@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 transition-colors shadow-xs"
              >
                <div className="font-semibold text-content-primary">Kitchen Staff</div>
                <div className="text-[10px] text-content-muted">Staff Operations</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@homebites.in', 'Admin@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 transition-colors shadow-xs"
              >
                <div className="font-semibold text-content-primary">Platform Admin</div>
                <div className="text-[10px] text-content-muted">Super Admin</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('user@homebites.in', 'User@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 transition-colors shadow-xs"
              >
                <div className="font-semibold text-content-primary flex items-center justify-between">
                  <span>Customer / User</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-[10px] text-content-muted">Explore Kitchens & Menus</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-status-error text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. rahul@biryanibox.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-orange hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-content-secondary">
            Don't have a kitchen account?{' '}
            <Link to="/register" className="font-semibold text-brand-orange hover:underline">
              Register free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
