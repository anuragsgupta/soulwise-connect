'use client';

import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import heroFallbackLg from '@/assets/hero-fallback-lg.png';
import heroFallbackSm from '@/assets/hero-fallback-sm.png';
import { analytics } from '@/lib/analytics';

// Lazy load Spline component
const Spline = lazy(() => import('@splinetool/react-spline'));

interface HeroSplineProps {
  variant?: 'A' | 'B';
  onCtaClick?: (cta: 'primary' | 'secondary') => void;
}

export const HeroSpline = ({ variant = 'B', onCtaClick }: HeroSplineProps) => {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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

    // Scroll tracking for parallax effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Lazy load Spline after window load
    if (reducedMotion) return;

    const loadSpline = async () => {
      try {
        // Placeholder for Spline integration
        const Spline = await import('@splinetool/react-spline');
        // Load your .splinecode URL here
        
        // Simulate loading
        setTimeout(() => {
          setSplineLoaded(true);
          analytics.track('spline_loaded');
        }, 4000);
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
      sub: "A stigma-free digital companion for student's mental health — private, simple, and always there"
    },
    B: {
      main: "Small steps. Big relief.",
      sub: "A stigma-free digital companion for student's mental health."
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-sky to-secondary/50 pt-24 md:pt-20">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-20 left-10 w-16 h-16 rounded-full opacity-30 ${reducedMotion ? '' : 'animate-float'}`}
          style={{ 
            backgroundColor: '#D19A3C',
            animationDelay: '0s',
            transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.2}px)`
          }}
        />
        <div 
          className={`absolute top-40 right-20 w-24 h-24 rounded-full opacity-20 ${reducedMotion ? '' : 'animate-float'}`}
          style={{ 
            backgroundColor: '#D97A7A',
            animationDelay: '1s',
            transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.15}px)`
          }}
        />
        <div 
          className={`absolute bottom-32 left-20 w-12 h-12 rounded-full opacity-25 ${reducedMotion ? '' : 'animate-float'}`}
          style={{ 
            backgroundColor: '#3E7E88',
            animationDelay: '2s',
            transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.3}px)`
          }}
        />
        <div 
          className={`absolute bottom-20 right-10 w-20 h-20 rounded-full opacity-20 ${reducedMotion ? '' : 'animate-float'}`}
          style={{ 
            backgroundColor: '#F6D7A7',
            animationDelay: '1.5s',
            transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.25}px)`
          }}
        />
        <div 
          className={`absolute top-1/2 left-1/4 w-8 h-8 rounded-full opacity-15 ${reducedMotion ? '' : 'animate-float'}`}
          style={{ 
            backgroundColor: '#CFEFF8',
            animationDelay: '3s',
            transform: reducedMotion ? 'none' : `translateY(${scrollY * 0.18}px)`
          }}
        />
      </div>

      {/* Spline or Fallback */}
      <div 
        ref={splineRef}
        className="absolute inset-0 flex items-center justify-center"
        role="img"
        aria-label="Animated illustration showing hands protecting a heart-shaped brain with floating wellness icons"
        aria-hidden={reducedMotion ? "false" : "true"}
      >
        {!reducedMotion && splineLoaded ? (
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-wellness/20 flex items-center justify-center animate-pulse">
              <div className="text-foreground/30 text-lg font-medium">Loading 3D Scene...</div>
            </div>
          }>
            <Spline
              // scene="https://prod.spline.design/FV-brkGLIlHBDVYA/scene.splinecode"
        scene="https://prod.spline.design/jKw8IAuFThD59RK9/scene.splinecode" 

            // scene="https://prod.spline.design/ub0yPCuxz8dmjMLF/scene.splinecode" 
              className="w-full h-full"
              onLoad={() => analytics.track('spline_loaded')}
              onError={(error) => analytics.track('spline_failed', { error: error.toString() })}
            />
          </Suspense>
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={heroFallbackLg}
              alt="Mental health support illustration with protective hands and heart-brain symbol"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Enhanced Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg border border-white/30 shadow-2xl">
          {/* Inner glass effect */}
          <div className="relative bg-white/20 backdrop-blur-md rounded-[22px] p-8 md:p-12 border border-white/20">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 via-peach-200/15 to-teal-200/20 rounded-[22px] pointer-events-none" />
            
            {/* Floating glass orbs */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-mustard-300/30 to-coral-300/30 rounded-full blur-xl animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-teal-300/25 to-sky-300/25 rounded-full blur-lg animate-float" style={{ animationDelay: '1.5s' }} />
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 bg-clip-text text-transparent">
                {headlines[variant].main}
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto animate-fade-up text-slate-700/90 leading-relaxed [animation-delay:0.2s]">
                {headlines[variant].sub}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-up [animation-delay:0.4s]">
                <Button 
                  size="lg" 
                  className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 border-0 px-8 py-4 text-lg font-semibold"
                  onClick={() => handleCtaClick('primary')}
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Get Started</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="relative overflow-hidden bg-white/30 backdrop-blur-md border-2 border-white/40 text-slate-700 hover:bg-white/40 hover:text-slate-800 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-semibold"
                  onClick={() => handleCtaClick('secondary')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-coral-100/30 to-peach-100/30 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Talk to a Friend</span>
                </Button>
              </div>

              <p className="text-sm text-slate-600/80 animate-fade-up [animation-delay:0.6s] mb-6">
                Available in English + Hindi • Confidential & anonymous options
              </p>

              {/* Enhanced Zero-barrier CTA with glassmorphism */}
              <div className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-r from-sky-200/30 to-peach-200/30 animate-fade-up [animation-delay:0.8s]">
                <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-100/20 to-peach-100/20 rounded-xl" />
                  <div className="relative z-10">
                    <p className="text-sm text-slate-700/90 mb-2 font-medium">
                      It's okay to check in — start small.
                    </p>
                    <p className="text-xs text-slate-600/80">
                      Only takes 20 seconds • Anonymous option available
                    </p>
                  </div>
                  
                  {/* Subtle shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};