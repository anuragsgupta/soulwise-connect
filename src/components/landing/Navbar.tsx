'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logoMannMitra from '@/assets/logo-mann-mitra.png';
import { analytics } from '@/lib/analytics';
import InstallButton from '@/components/InstallButton';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Support', href: '#support' },
    { label: 'Contact', href: '#contact' }
  ];

  const handleNavClick = (href: string) => {
    analytics.track('nav_item_clicked', { href });
    setIsOpen(false);
    
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    analytics.track('navbar_cta_click');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src={logoMannMitra} 
              alt="MANN MITRA - Mental Health Support"
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-foreground">MANN MITRA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <InstallButton />
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-primary"
                onClick={handleCtaClick}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleCtaClick}
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 px-2">
                  <Image 
                    src={logoMannMitra} 
                    alt="MANN MITRA"
                    className="h-8 w-8 object-contain"
                    width={32}
                    height={32}
                  />
                  <span className="text-lg font-bold text-foreground">MANN MITRA</span>
                </div>

                {/* Mobile Navigation */}
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.href)}
                      className="text-left px-2 py-3 text-foreground hover:text-primary transition-colors duration-300 font-medium border-b border-border/20 last:border-b-0"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="flex flex-col gap-3 mt-6">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleCtaClick}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                      onClick={handleCtaClick}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>

                {/* Mobile Help Text */}
                <div className="mt-8 px-2 py-4 bg-wellness/10 rounded-lg border border-wellness/20">
                  <p className="text-sm text-muted-foreground text-center">
                    Need immediate help?
                  </p>
                  <p className="text-sm font-medium text-center mt-1">
                    <a href="tel:1800-599-0019" className="text-support hover:underline">
                      KIRAN: 1800-599-0019
                    </a>
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};