import React, { useState } from 'react';
import { ChefHat, Check, ArrowRight, Sparkles, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Inputs';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { activeKitchen, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Kitchen details
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [city, setCity] = useState(activeKitchen?.city || 'Bengaluru');
  const [targetMargin, setTargetMargin] = useState(0.65);

  // Step 2: First Menu Item
  const [itemName, setItemName] = useState('');
  const [sellingPrice, setSellingPrice] = useState(250);
  const [costPrice, setCostPrice] = useState(85);

  // Step 3: First Inventory Item
  const [invName, setInvName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [initialStock, setInitialStock] = useState(20);
  const [unitCost, setUnitCost] = useState(90);

  const handleStep1 = async () => {
    setLoading(true);
    try {
      await api.patch('/kitchens/current', {
        fssaiNumber,
        city,
        defaultTargetMargin: targetMargin
      });
      setStep(2);
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!itemName) {
      setStep(3);
      return;
    }
    setLoading(true);
    try {
      await api.post('/menu', {
        name: itemName,
        sellingPrice,
        costPrice,
        prepTimeMinutes: 15,
        isAvailable: true
      });
      setStep(3);
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (invName) {
        await api.post('/inventory', {
          name: invName,
          unit,
          currentStock: initialStock,
          minStockThreshold: 5,
          unitCost
        });
      }
      await completeOnboarding();
      onClose();
    } catch (err) {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to HomeBites! 🍳"
      description="Let's configure your cloud kitchen workspace in 3 quick steps."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-brand-orange text-white' : 'bg-surface-muted text-content-secondary'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-content-primary">Kitchen Details</span>
          </div>
          <div className="w-8 h-0.5 bg-surface-border" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-brand-orange text-white' : 'bg-surface-muted text-content-secondary'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-content-primary">Add Menu Item</span>
          </div>
          <div className="w-8 h-0.5 bg-surface-border" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-brand-orange text-white' : 'bg-surface-muted text-content-secondary'
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-content-primary">Stock Ingredients</span>
          </div>
        </div>

        {/* Step 1 Content */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-content-secondary">
              Set up your regulatory compliance information and target contribution margin for pricing intelligence.
            </p>
            <Input
              label="FSSAI License Number (14 Digits)"
              placeholder="e.g. 11223344556677"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
            />
            <Input
              label="Operating City"
              placeholder="e.g. Bengaluru, Mumbai, Delhi NCR"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Target Contribution Margin: {(targetMargin * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.30"
                max="0.85"
                step="0.05"
                value={targetMargin}
                onChange={(e) => setTargetMargin(parseFloat(e.target.value))}
                className="w-full accent-brand-orange"
              />
              <span className="text-[11px] text-content-muted">
                Typical cloud kitchens operate at 60%–70% gross contribution margins.
              </span>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="primary" loading={loading} onClick={handleStep1}>
                Next: Add First Item <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-content-secondary">
              Enter your signature cloud kitchen menu dish to begin tracking real order contribution.
            </p>
            <Input
              label="Menu Item Name"
              placeholder="e.g. Dum Chicken Biryani, Butter Paneer Masala"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Selling Price (₹)"
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
              />
              <Input
                label="Estimated Variable Cost (₹)"
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
              />
            </div>
            <div className="p-3 bg-brand-orange-light/50 rounded-lg text-xs text-content-primary">
              <span className="font-semibold text-brand-orange">Calculated Unit Contribution: </span>
              ₹{sellingPrice - costPrice} ({sellingPrice > 0 ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1) : 0}% margin)
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" loading={loading} onClick={handleStep2}>
                Next: Stock Ingredients <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-content-secondary">
              Track raw ingredients so stock deductions and low-stock alerts sync automatically with placed orders.
            </p>
            <Input
              label="Primary Ingredient / Packaging"
              placeholder="e.g. Basmati Rice, Fresh Chicken, Meal Boxes"
              value={invName}
              onChange={(e) => setInvName(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="kg">kg</option>
                <option value="g">grams (g)</option>
                <option value="L">litres (L)</option>
                <option value="pcs">pieces (pcs)</option>
              </Select>
              <Input
                label="Opening Stock"
                type="number"
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
              />
              <Input
                label="Cost / Unit (₹)"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" loading={loading} onClick={handleFinish}>
                <Check className="w-4 h-4 mr-1" /> Complete Onboarding
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
