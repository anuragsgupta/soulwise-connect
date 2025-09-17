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
  const handleClick = () => {
    analytics.track('feature_card_clicked', { feature: title, index });
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm cursor-pointer animate-fade-up hover:animate-card-hover focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
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
      <CardHeader className="pb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};