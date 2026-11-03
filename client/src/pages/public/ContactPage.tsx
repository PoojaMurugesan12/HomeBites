import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Inputs';
import { api } from '../../services/api';
import { Mail, Phone, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/contact', formData);
      if (res.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          businessName: '',
          subject: '',
          message: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="orange">Get In Touch</Badge>
        <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight sm:text-5xl">
          We'd Love to Hear From Your Kitchen
        </h1>
        <p className="text-sm text-content-secondary leading-relaxed">
          Have questions regarding onboarding, batch order imports, or multi-outlet dark kitchen setups? Send us a message and our team will get back to you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-brand-navy text-white space-y-6">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We work closely with cloud kitchen partners, incubators, and academic evaluators across India.
            </p>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <span>support@homebites.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-teal shrink-0" />
                <span>+91 80 4123 4567</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>Indiranagar 100ft Road, Bengaluru, Karnataka 560038</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Average response time: &lt; 2 business hours.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-content-primary">Inquiry Received!</h3>
                  <p className="text-sm text-content-secondary max-w-md mx-auto">
                    Thank you for reaching out. Your message has been saved to our database and our cloud kitchen onboarding specialist will contact you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-rose-50 text-status-error text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name *"
                      required
                      placeholder="e.g. Vikramaditya Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      required
                      placeholder="e.g. vikram@cloudkitchen.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Kitchen / Business Name"
                      placeholder="e.g. Royal Curry Kitchen"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                    <Input
                      label="Subject *"
                      required
                      placeholder="e.g. Enterprise Setup Inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <Textarea
                    label="Message *"
                    required
                    placeholder="Tell us about your kitchen, current order volume, or features you are looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                  />

                  <div className="pt-2">
                    <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Send Message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
