'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  index: number;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient, index }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    analytics.track('feature_card_clicked', { feature: title, index });
  };

  const getAnimatedIconClass = (title: string) => {
    switch (title) {
      case "AI First-Aid Chat":
        return "animate-bounce";
      case "Book a Counsellor":
        return "animate-pulse";
      case "Wellness Hub":
        return "animate-float";
      case "Peer Rooms":
        return "animate-bounce";
      case "Insights for Colleges":
        return "animate-pulse";
      default:
        return "";
    }
  };

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm cursor-pointer animate-fade-up hover:-rotate-1 hover:scale-105 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 relative overflow-hidden"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        transform: isHovered ? 'translateY(-8px) rotate(1deg)' : 'translateY(0px) rotate(0deg)',
        boxShadow: isHovered ? '0 20px 40px rgba(62, 126, 136, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Learn more about ${title}: ${description}`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <CardHeader className="pb-4 relative z-10">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${gradient} w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg relative`}>
          <Icon 
            className={`w-7 h-7 text-white ${isHovered ? getAnimatedIconClass(title) : ''}`} 
            aria-hidden="true" 
          />
          {/* Glowing effect for calendar icon */}
          {title === "Book a Counsellor" && isHovered && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-coral-400 to-coral-600 animate-ping opacity-30" />
          )}
        </div>
        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </CardContent>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient}`} />
      </div>
    </Card>
  );
};