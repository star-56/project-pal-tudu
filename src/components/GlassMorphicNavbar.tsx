import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  navItems?: NavItem[];
  showSignUp?: boolean;
  className?: string;
}

const GlassMorphicNavbar: React.FC<NavbarProps> = ({ 
  navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  showSignUp = true,
  className = ''
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 ${className}`}>
      <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/80 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Sign Up Button */}
          {showSignUp && (
            <div className="hidden md:block">
              <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-full px-6 py-2 font-medium transition-all duration-200 hover:scale-105">
                {"Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/20 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu Items - visible on small screens when menu closed */}
          <div className="md:hidden flex items-center space-x-6">
            {!mobileMenuOpen && navItems.slice(0, 2).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-white/90 hover:text-white font-medium transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 px-6 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {showSignUp && (
                <div className="pt-4 border-t border-white/20">
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-full py-2 font-medium transition-all duration-200">
                    Sign up
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlassMorphicNavbar;