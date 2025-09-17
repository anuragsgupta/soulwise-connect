import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import heroFallbackLg from '@/assets/hero-fallback-lg.png';
import heroFallbackSm from '@/assets/hero-fallback-sm.png';
import { analytics } from '@/lib/analytics';

interface HeroSplineProps {
  variant?: 'A' | 'B';
  onCtaClick?: (cta: 'primary' | 'secondary') => void;
}

export const HeroSpline = ({ variant = 'A', onCtaClick }: HeroSplineProps) => {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const splineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    if (mediaQuery.matches) {
      analytics.track('reduced_motion_enabled');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Lazy load Spline after window load
    if (reducedMotion) return;

    const loadSpline = async () => {
      try {
        // Placeholder for Spline integration
        // const Spline = await import('@splinetool/react-spline');
        // Load your .splinecode URL here
        
        // Simulate loading
        setTimeout(() => {
          setSplineLoaded(true);
          analytics.track('spline_loaded');
        }, 1000);
      } catch (error) {
        console.error('Spline loading failed:', error);
        analytics.track('spline_failed', { error: error?.toString() });
      }
    };

    const timer = setTimeout(loadSpline, 100);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const handleCtaClick = (type: 'primary' | 'secondary') => {
    analytics.track('hero_cta_click', { cta: type, variant });
    onCtaClick?.(type);
  };

  const headlines = {
    A: {
      main: "Your Mind. Your Safe Space.",
      sub: "A stigma-free digital companion for student mental health — private, simple, and always there."
    },
    B: {
      main: "Small steps. Big relief.",
      sub: "A stigma-free digital companion for student mental health — private, simple, and always there."
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-sky to-secondary/50">
      {/* Spline or Fallback */}
      <div 
        ref={splineRef}
        className="absolute inset-0 flex items-center justify-center"
        role="img"
        aria-label="Animated illustration showing hands protecting a heart-shaped brain with floating wellness icons"
        aria-hidden={reducedMotion ? "false" : "true"}
      >
        {!reducedMotion && splineLoaded ? (
          <div className="w-full h-full">
            {/* Placeholder for Spline component */}
            {/* <Spline scene="https://prod.spline.design/your-hero-scene.splinecode" /> */}
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-wellness/10 flex items-center justify-center">
              <div className="text-primary/20 text-lg font-medium">Spline Scene Placeholder</div>
            </div>
          </div>
        ) : (
          <picture className="w-full h-full object-cover">
            <source media="(max-width: 768px)" srcSet={heroFallbackSm} />
            <img 
              src={heroFallbackLg}
              alt="Mental health support illustration with protective hands and heart-brain symbol"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
            {headlines[variant].main}
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-up [animation-delay:0.2s]">
            {headlines[variant].sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-up [animation-delay:0.4s]">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => handleCtaClick('primary')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => handleCtaClick('secondary')}
            >
              Talk to a Friend
            </Button>
          </div>

          <p className="text-sm text-foreground/60 animate-fade-up [animation-delay:0.6s]">
            Available in English + Hindi • Confidential options
          </p>

          {/* Zero-barrier CTA */}
          <div className="mt-8 p-4 bg-wellness/10 rounded-xl animate-fade-up [animation-delay:0.8s]">
            <p className="text-sm text-foreground/70 mb-2">
              Only takes 20 seconds. Anonymous option available.
            </p>
            <p className="text-xs text-foreground/60">
              It's okay to check in — start small.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};