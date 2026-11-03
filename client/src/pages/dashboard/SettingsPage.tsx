import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield, Store, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { activeKitchen, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    fssaiNumber: '',
    gstNumber: '',
    defaultTargetMargin: 0.65
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activeKitchen) {
      setFormData({
        name: activeKitchen.name || '',
        description: activeKitchen.description || '',
        address: activeKitchen.address || '',
        city: activeKitchen.city || '',
        state: activeKitchen.state || '',
        pincode: activeKitchen.pincode || '',
        phone: activeKitchen.phone || '',
        email: activeKitchen.email || '',
        fssaiNumber: activeKitchen.fssaiNumber || '',
        gstNumber: activeKitchen.gstNumber || '',
        defaultTargetMargin: Number(activeKitchen.defaultTargetMargin) || 0.65
      });
      setLoading(false);
    }
  }, [activeKitchen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.patch('/kitchens/current', formData);
      if (res.success) {
        setSavedSuccess(true);
        await refreshUser();
      }
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
        <p className="text-xs text-content-secondary">Loading kitchen profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Kitchen Profile & Operating Settings
        </h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Configure business details, regulatory FSSAI license, and pricing intelligence targets.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-teal" />
          <span>Kitchen profile updated successfully in PostgreSQL database.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Business Identity & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kitchen Brand Name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Primary Kitchen Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Textarea
              label="Kitchen Brand Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Authentic slow-cooked dum biryanis and royal Mughlai gravies..."
              rows={2}
            />

            <Input
              label="Operating Street Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Shop 4, 12th Main Road, HAL 2nd Stage, Indiranagar"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Karnataka"
              />
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="560038"
              />
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Compliance & Licenses */}
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance (India)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="FSSAI License Number (14 Digits)"
                value={formData.fssaiNumber}
                onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                placeholder="e.g. 11223344556677"
                helperText="Required for food delivery and restaurant packaging compliance."
              />
              <Input
                label="GSTIN Number (Optional)"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="e.g. 29ABCDE1234F1Z5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Intelligence Target Margin */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Intelligence Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-content-primary">
                  Target Gross Contribution Margin: {(formData.defaultTargetMargin * 100).toFixed(0)}%
                </label>
                <span className="text-xs text-brand-orange font-bold">
                  {(formData.defaultTargetMargin * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.85"
                step="0.05"
                value={formData.defaultTargetMargin}
                onChange={(e) => setFormData({ ...formData, defaultTargetMargin: parseFloat(e.target.value) })}
                className="w-full accent-brand-orange"
              />
              <p className="text-[11px] text-content-muted mt-1 leading-snug">
                Used by the Pricing Recommendation Engine formula: <span className="font-mono">Candidate Price = Cost / (1 − Target Margin)</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Save Operating Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
