import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Brain, Users, BookOpen, MessageCircle, Calendar, Shield, TrendingUp } from "lucide-react";
import mannMitraLogo from "@/assets/mann-mitra-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky via-secondary to-support-light">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-8">
            <img 
              src={mannMitraLogo} 
              alt="MANN MITRA - Mental Health Support"
              className="h-32 w-32 object-contain animate-float"
            />
          </div>
          <h1 className="text-5xl font-bold text-primary mb-6 animate-pulse-soft">
            MANN MITRA
          </h1>
          <p className="text-xl text-primary/80 mb-8 max-w-2xl mx-auto">
            Your trusted companion for mental health and psychological well-being. 
            Empowering students with accessible, stigma-free support.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Comprehensive Mental Health Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Daily Wellness Check",
                description: "Track your emotional journey with our intuitive mood tracker",
                color: "from-wellness to-wellness-light"
              },
              {
                icon: MessageCircle,
                title: "AI Support Chat",
                description: "24/7 intelligent mental health support and coping strategies",
                color: "from-primary to-support"
              },
              {
                icon: Calendar,
                title: "Professional Counseling",
                description: "Book sessions with certified mental health professionals",
                color: "from-support to-primary"
              },
              {
                icon: Users,
                title: "Peer Community",
                description: "Connect with others in a safe, anonymous support environment",
                color: "from-secondary to-wellness"
              },
              {
                icon: BookOpen,
                title: "Wellness Resources",
                description: "Access curated mental health guides, videos, and tools",
                color: "from-wellness to-secondary"
              },
              {
                icon: Shield,
                title: "Privacy & Safety",
                description: "Your mental health journey is completely confidential",
                color: "from-primary to-sky"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-primary group-hover:text-primary/80 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Crisis Support */}
      <section className="py-16 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Need Immediate Help?
          </h2>
          <p className="text-xl text-primary/80 mb-8">
            If you're experiencing a mental health crisis, help is available 24/7
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-primary/20">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-support mr-3" />
              <span className="text-2xl font-bold text-support">KIRAN Helpline</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-2">1800-599-0019</p>
            <p className="text-muted-foreground">
              Free, confidential mental health support available 24/7 in multiple languages
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-primary/10 border-t border-primary/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            <img 
              src={mannMitraLogo} 
              alt="MANN MITRA"
              className="h-8 w-8 object-contain mr-3"
            />
            <span className="text-xl font-bold text-primary">MANN MITRA</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering students with accessible, stigma-free mental health support
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;