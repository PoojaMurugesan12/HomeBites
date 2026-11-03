import React from 'react';
import { HelpCircle, ExternalLink, MessageSquare, AlertCircle, FileSpreadsheet, Sparkles, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Help & Operational Documentation
        </h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Guides, best practices, and integration support for your cloud kitchen workspace.
        </p>
      </div>

      {/* Section 16 Compliance: Delivery Partner Integration Status */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-900">Food-Delivery Partner Integration Architecture</span>
            <p className="text-amber-800 leading-relaxed">
              Integration not connected — upload order data via CSV or enter orders manually. HomeBites does not scrape private merchant portals or display fabricated synchronization statuses. You can seamlessly batch import aggregator CSV exports anytime from the Orders page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Help Guides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-orange" />
              <CardTitle>How Recipe Deductions Work</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-content-secondary space-y-2 leading-relaxed">
            <p>
              Navigate to <strong>Menu Management</strong> and click <strong>Configure Recipe</strong> on any dish. Link ingredients from your pantry with exact portion weights (e.g., 0.25 kg Chicken).
            </p>
            <p>
              When an order reaches <strong>Confirmed</strong> or <strong>Preparing</strong>, HomeBites executes an atomic database transaction deducting those exact amounts and logging an auditable stock movement record.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <CardTitle>Smart Pricing Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-content-secondary space-y-2 leading-relaxed">
            <p>
              Our recommendation engine calculates unit contribution: <span className="font-mono">Selling Price − Variable Cost</span>.
            </p>
            <p>
              When target margin (e.g. 65%) is configured, it proposes candidate prices based on real 30-day demand velocity. Menu prices are never modified without explicit owner authorization.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-content-primary">Need Technical Assistance?</h3>
            <p className="text-xs text-content-secondary">
              Our engineering team responds to cloud kitchen operational tickets within 2 business hours.
            </p>
          </div>

          <Link to="/contact">
            <Button variant="primary" size="sm">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Open Support Inquiry
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
