'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "I don't feel alone anymore.",
    author: "First-year",
    location: "Delhi",
    avatar: "🧑‍🎓"
  },
  {
    quote: "Helped me through exams.",
    author: "Final-year", 
    location: "Kashmir",
    avatar: "👩‍🎓"
  },
  {
    quote: "Quick, private and actually useful.",
    author: "Second-year",
    location: "Pune",
    avatar: "🧑‍💻"
  }
];

const TypeWriter = ({ text, isVisible }: { text: string; isVisible: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, isVisible]);

  return <span>{displayedText}</span>;
};

export const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { ref, isVisible } = useScrollAnimation(0.3);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section ref={ref} className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: '#F6D7A720' }}>
      {/* Floating Background Avatars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>
          👨‍🎓
        </div>
        <div className="absolute top-32 right-20 text-3xl opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>
          👩‍🎓
        </div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '3s' }}>
          🧑‍💻
        </div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          👩‍💼
        </div>
        <div className="absolute top-1/2 left-1/4 text-2xl opacity-10 animate-float" style={{ animationDelay: '4s' }}>
          🧑‍🎓
        </div>
        <div className="absolute top-1/3 right-1/3 text-3xl opacity-15 animate-float" style={{ animationDelay: '0.5s' }}>
          👨‍💻
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className={`text-4xl font-bold mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ color: '#0F3B45' }}>
          Student Voices
        </h2>
        
        <div className="relative">
          <Card className={`bg-white/95 backdrop-blur-sm border-0 shadow-2xl transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}>
            <CardContent className="p-8 md:p-12 relative">
              {/* Floating Avatar */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-br from-teal-400 to-teal-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-xl">{testimonials[currentIndex].avatar}</span>
                </div>
              </div>
              
              <Quote className="w-12 h-12 text-teal-600 mx-auto mb-6 opacity-60" aria-hidden="true" />
              
              <blockquote className="text-2xl md:text-3xl font-medium mb-6 italic min-h-20 flex items-center justify-center" style={{ color: '#0F3B45' }}>
                "
                <TypeWriter 
                  text={testimonials[currentIndex].quote} 
                  isVisible={isVisible}
                />
                "
              </blockquote>
              
              <footer className="text-gray-600">
                <span className="font-semibold">{testimonials[currentIndex].author}</span>
                <span className="mx-2 text-teal-600">•</span>
                <span>{testimonials[currentIndex].location}</span>
              </footer>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 opacity-20 animate-pulse" />
              <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-mustard-400 to-mustard-600 opacity-30 animate-bounce" style={{ animationDelay: '1s' }} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className={`flex items-center justify-center gap-4 mt-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '300ms' }}>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full border-teal-300 hover:bg-teal-600 hover:text-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-3 rounded-full transition-all duration-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 hover:scale-110 ${
                    index === currentIndex 
                      ? 'bg-teal-600 w-8 shadow-lg' 
                      : 'bg-teal-300 w-3 hover:bg-teal-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full border-teal-300 hover:bg-teal-600 hover:text-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};