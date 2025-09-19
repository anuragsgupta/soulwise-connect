import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSpline } from './HeroSpline';
import { FeatureCard } from './FeatureCard';
import { TestimonialCarousel } from './TestimonialCarousel';
import { Navbar } from './Navbar';
import { MessageCircle, Calendar, BookOpen, Users, TrendingUp, Phone, Shield, Heart, CheckCircle, Github, Twitter, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logoMannMitra from '@/assets/logo-mann-mitra.png';
import { analytics } from '@/lib/analytics';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const LandingPage = () => {
  const [abVariant] = useState<'A' | 'B'>(Math.random() > 0.5 ? 'A' : 'B');
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollAnimation(0.2);

  const features = [
    {
      icon: MessageCircle,
      title: "AI First-Aid Chat",
      description: "Confidential check-ins + immediate coping tips.",
      gradient: "from-teal-500 to-teal-600"
    },
    {
      icon: Calendar,
      title: "Book a Counsellor",
      description: "Private sessions with campus counselors.",
      gradient: "from-coral-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "Wellness Hub",
      description: "Short videos, audio guides, and language-localized content.",
      gradient: "from-peach-400 to-mustard-500"
    },
    {
      icon: Users,
      title: "Peer Rooms",
      description: "Moderated, anonymous student spaces.",
      gradient: "from-sky-400 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Insights for Colleges",
      description: "Aggregated, anonymous trends to drive action.",
      gradient: "from-mustard-500 to-coral-500"
    }
  ];

  const steps = [
    {
      icon: Heart,
      title: "Quick self-check",
      description: "Start with a simple mood check"
    },
    {
      icon: MessageCircle,
      title: "Tailored resources & chat",
      description: "Get personalized support immediately"
    },
    {
      icon: Calendar,
      title: "Book counselor if needed",
      description: "Connect with professional help"
    }
  ];

  const handleCtaClick = (cta: 'primary' | 'secondary') => {
    if (cta === 'primary') {
      // Navigate to mood check or signup
      analytics.track('signup_started', { source: 'hero', variant: abVariant });
      window.location.href = '/login';
    } else {
      // Navigate to peer support or chat
      analytics.track('chat_opened', { source: 'hero', variant: abVariant });
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section with Spline */}
      <HeroSpline variant={abVariant} onCtaClick={handleCtaClick} />

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gradient-to-r from-primary/10 via-wellness/10 to-support/10 ">
        
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12 animate-fade-up">
            Comprehensive Mental Health Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-16 px-6" style={{ backgroundColor: '#CFEFF820' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 transition-all duration-700 ${
            howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ color: '#0F3B45' }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className={`flex flex-col items-center text-center transition-all duration-700 hover:scale-105 ${
                  howItWorksVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: howItWorksVisible ? `${index * 200 + 200}ms` : '0ms'
                }}
              >
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-full mb-6 shadow-lg border border-sky-200 hover:shadow-xl transition-shadow duration-300 group">
                  <step.icon className="w-8 h-8 text-teal-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#0F3B45' }}>
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                
                {/* Progress indicator */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-teal-300 to-transparent transform translate-x-4 translate-y-2" />
                )}
              </div>
            ))}
          </div>
          
          {/* Call-to-Action */}
          <div className={`mt-12 transition-all duration-700 ${
            howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '800ms' }}>
            <Link href="/auth/login">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Crisis Support */}
      <section id="support" className="py-16 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6 animate-fade-up">
            Need Immediate Help?
          </h2>
          <p className="text-xl text-foreground/80 mb-8 animate-fade-up [animation-delay:0.2s]">
            If you're experiencing a mental health crisis, help is available 24/7
          </p>
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-xl animate-fade-up [animation-delay:0.4s]">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-support mr-3" />
                <span className="text-2xl font-bold text-support">KIRAN Helpline</span>
              </div>
              <a 
                href="tel:1800-599-0019"
                className="text-3xl font-bold text-primary mb-2 block hover:text-primary/80 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                1800-599-0019
              </a>
              <p className="text-muted-foreground">
                Free, confidential mental health support available 24/7 in multiple languages
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-6 relative overflow-hidden" style={{ backgroundColor: '#0F3B45' }}>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-sky-400 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-20 right-20 w-12 h-12 rounded-full bg-peach-400 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-20 w-20 h-20 rounded-full bg-coral-400 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 right-10 w-14 h-14 rounded-full bg-mustard-400 animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="flex items-center mb-6 group">
              <Image 
                src={logoMannMitra} 
                alt="MANN MITRA - Mental Health Support"
                className="h-16 w-16 object-contain mr-4 transition-transform duration-300 group-hover:scale-110"
                width={64}
                height={64}
              />
              <span className="text-3xl font-bold text-white">MANN MITRA</span>
            </div>
            
            {/* Built with love message */}
            <div className="mb-8 text-center">
              <p className="text-xl text-white/90 mb-2 flex items-center justify-center gap-2">
                Built with 
                <Heart className="w-6 h-6 text-coral-400 animate-pulse" />
                for students
              </p>
              <p className="text-white/70 text-lg">
                Privacy-first • Stigma-free • Always available
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-6 mb-8">
              {[
                { icon: Github, label: 'GitHub', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: Mail, label: 'Email', href: 'mailto:support@mannmitra.com' }
              ].map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="group bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 hover:-translate-y-1 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                  aria-label={social.label}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <social.icon className="w-6 h-6 text-white group-hover:text-sky-300 transition-colors duration-300" />
                </a>
              ))}
            </div>
            
            {/* Final CTA */}
            <div className="mb-12">
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white px-12 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
                  onClick={() => analytics.track('final_cta_click')}
                >
                  Start Your Mental Health Journey
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  Help Center
                </a>
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  Contact Us
                </a>
                <a href="tel:1800-599-0019" className="block text-coral-300 hover:text-coral-200 transition-colors duration-300 focus:ring-2 focus:ring-coral-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded font-medium">
                  Crisis Help: 1800-599-0019
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  For Students
                </a>
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  For Colleges
                </a>
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  For Counselors
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  Privacy Policy
                </a>
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  Terms of Service
                </a>
                <a href="#" className="block text-white/70 hover:text-sky-300 transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded">
                  Accessibility
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/70 mb-4 max-w-2xl mx-auto">
              "You choose what counselor sees — only availability & reason." - Empowering students with complete control over their mental health journey.
            </p>
            <p className="text-white/50 text-sm">
              © 2025 MANN MITRA. Empowering students with accessible, stigma-free mental health support.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};