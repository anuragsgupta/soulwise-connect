import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSpline } from './HeroSpline';
import { FeatureCard } from './FeatureCard';
import { TestimonialCarousel } from './TestimonialCarousel';
import { MessageCircle, Calendar, BookOpen, Users, TrendingUp, Phone, Shield, Heart, CheckCircle } from 'lucide-react';
import logoMannMitra from '@/assets/logo-mann-mitra.png';
import { analytics } from '@/lib/analytics';

export const LandingPage = () => {
  const [abVariant] = useState<'A' | 'B'>(Math.random() > 0.5 ? 'A' : 'B');

  const features = [
    {
      icon: MessageCircle,
      title: "AI First-Aid Chat",
      description: "Confidential check-ins + immediate coping tips.",
      gradient: "from-primary to-support"
    },
    {
      icon: Calendar,
      title: "Book a Counsellor",
      description: "Private sessions with campus counselors.",
      gradient: "from-support to-wellness"
    },
    {
      icon: BookOpen,
      title: "Wellness Hub",
      description: "Short videos, audio guides, and language-localized content.",
      gradient: "from-wellness to-secondary"
    },
    {
      icon: Users,
      title: "Peer Rooms",
      description: "Moderated, anonymous student spaces.",
      gradient: "from-secondary to-sky"
    },
    {
      icon: TrendingUp,
      title: "Insights for Colleges",
      description: "Aggregated, anonymous trends to drive action.",
      gradient: "from-sky to-primary"
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
    } else {
      // Navigate to peer support or chat
      analytics.track('chat_opened', { source: 'hero', variant: abVariant });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Spline */}
      <HeroSpline variant={abVariant} onCtaClick={handleCtaClick} />

      {/* Features Section */}
      <section className="py-16 px-6">
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
      <section className="py-16 px-6 bg-sky/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12 animate-fade-up">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="flex flex-col items-center text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Crisis Support */}
      <section className="py-16 px-6 bg-primary/5">
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
      <footer className="py-12 px-6 bg-foreground/5 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center mb-4">
              <img 
                src={logoMannMitra} 
                alt="MANN MITRA - Mental Health Support"
                className="h-12 w-12 object-contain mr-3"
              />
              <span className="text-2xl font-bold text-foreground">MANN MITRA</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Built with care for students • Privacy-first
            </p>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                Support
              </a>
              <a href="tel:1800-599-0019" className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                KIRAN Help: 1800-599-0019
              </a>
            </div>
          </div>

          {/* Microcopy */}
          <div className="text-center text-xs text-muted-foreground border-t border-border pt-6">
            <p className="mb-2">
              Near booking: "You choose what counselor sees — only availability & reason."
            </p>
            <p>
              © 2025 MANN MITRA. Empowering students with accessible, stigma-free mental health support.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};