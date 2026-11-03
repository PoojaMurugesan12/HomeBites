import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-brand-ivory/90 backdrop-blur-md border-b border-surface-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-brand-navy">
              Home<span className="text-brand-orange">Bites</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-content-secondary font-medium -mt-1">
              Cloud Kitchen Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-content-secondary">
          <Link to="/explore" className="text-brand-orange font-bold flex items-center gap-1.5 hover:text-brand-orange-hover transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
            Kitchens & Menus
          </Link>
          <Link to="/features" className="hover:text-brand-orange transition-colors">Features</Link>
          <a href="/#how-it-works" className="hover:text-brand-orange transition-colors">How It Works</a>
          <a href="/#benefits" className="hover:text-brand-orange transition-colors">Benefits</a>
          <Link to="/pricing" className="hover:text-brand-orange transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-brand-orange transition-colors">About</Link>
          <Link to="/contact" className="hover:text-brand-orange transition-colors">Contact</Link>
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button
              variant={user.email === 'user@homebites.in' ? 'primary' : 'navy'}
              onClick={() => {
                if (user.role === 'PLATFORM_ADMIN') navigate('/admin');
                else if (user.email === 'user@homebites.in') navigate('/explore');
                else navigate('/dashboard');
              }}
            >
              {user.email === 'user@homebites.in' ? 'Explore Kitchens' : user.role === 'PLATFORM_ADMIN' ? 'Admin Console' : 'Kitchen Dashboard'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-content-primary hover:text-brand-orange px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-content-secondary hover:text-content-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-bold text-brand-orange hover:text-brand-orange-hover"
          >
            🍳 Kitchens & Menus
          </Link>
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            Features
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            How It Works
          </a>
          <a
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            Benefits
          </a>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            Pricing
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            About
          </Link>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            FAQ
          </a>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-content-primary hover:text-brand-orange"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-surface-border flex flex-col gap-2">
            {user ? (
              <Button
                variant="navy"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(user.role === 'PLATFORM_ADMIN' ? '/admin' : '/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
