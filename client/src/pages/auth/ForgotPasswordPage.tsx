import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Inputs';
import { api } from '../../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">
            Home<span className="text-brand-orange">Bites</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Reset Your Password</h2>
        <p className="text-xs text-content-secondary">
          Enter your registered email address and we'll dispatch a single-use secure reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-surface-border rounded-2xl sm:px-10 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-content-primary">Check Your Inbox</h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                If an account exists for <span className="font-semibold text-content-primary">{email}</span>, a secure password reset link has been dispatched with a 1-hour expiration.
              </p>
              <div className="pt-2">
                <Link to="/reset-password">
                  <Button variant="outline" size="sm" className="w-full">
                    Proceed to Enter Reset Token
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-status-error text-xs font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Registered Email Address"
                type="email"
                required
                placeholder="e.g. rahul@biryanibox.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Dispatch Reset Link
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-brand-orange font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
