import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "I don't feel alone anymore.",
    author: "First-year",
    location: "Delhi"
  },
  {
    quote: "Helped me through exams.",
    author: "Final-year", 
    location: "Kashmir"
  },
  {
    quote: "Quick, private and actually useful.",
    author: "Second-year",
    location: "Pune"
  }
];

export const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

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
    <section className="py-16 px-6 bg-gradient-to-r from-support-light to-wellness-light">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-12 animate-fade-up">
          Student Voices
        </h2>
        
        <div className="relative">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl animate-fade-up">
            <CardContent className="p-8 md:p-12">
              <Quote className="w-12 h-12 text-primary mx-auto mb-6 opacity-60" aria-hidden="true" />
              
              <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-6 italic">
                "{testimonials[currentIndex].quote}"
              </blockquote>
              
              <footer className="text-muted-foreground">
                <span className="font-medium">{testimonials[currentIndex].author}</span>
                <span className="mx-2">•</span>
                <span>{testimonials[currentIndex].location}</span>
              </footer>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
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