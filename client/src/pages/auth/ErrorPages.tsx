import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-status-error flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-brand-navy">Unauthorized Access</h1>
      <p className="text-sm text-content-secondary max-w-md">
        You do not possess the required role permissions or kitchen ownership privileges to access this resource.
      </p>
      <div className="pt-2">
        <Link to="/dashboard">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to My Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <span className="text-6xl font-extrabold text-brand-orange">404</span>
      <h1 className="text-3xl font-bold text-brand-navy">Page Not Found</h1>
      <p className="text-sm text-content-secondary max-w-md">
        The page you requested does not exist or has been moved.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
