/**
 * 🎨 Font Showcase Component
 * 
 * This component demonstrates all three fonts in action
 * Use this as a reference for font usage throughout the app
 */

import { fontClasses } from '@/config/fonts';

export default function FontShowcase() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      
      {/* Heading Font Examples */}
      <section className="space-y-4">
        <h1 className={`${fontClasses.heading} text-4xl font-bold text-primary`}>
          This is Poppins - Heading Font
        </h1>
        <p className="text-muted-foreground">
          Used for: h1, h2, h3, h4, h5, h6, page titles, section headers
        </p>
        
        <div className="space-y-2">
          <h1 className="font-heading text-5xl font-bold">Heading 1 - Bold 700</h1>
          <h2 className="font-heading text-4xl font-semibold">Heading 2 - Semibold 600</h2>
          <h3 className="font-heading text-3xl font-semibold">Heading 3 - Semibold 600</h3>
          <h4 className="font-heading text-2xl font-medium">Heading 4 - Medium 500</h4>
          <h5 className="font-heading text-xl font-medium">Heading 5 - Medium 500</h5>
          <h6 className="font-heading text-lg font-medium">Heading 6 - Medium 500</h6>
        </div>
      </section>

      {/* Body Font Examples */}
      <section className="space-y-4">
        <h2 className={`${fontClasses.heading} text-3xl font-semibold text-primary`}>
          This is Inter - Body Font
        </h2>
        <p className="text-muted-foreground">
          Used for: paragraphs, descriptions, chat messages, form labels, list items
        </p>
        
        <div className="space-y-4">
          <p className="font-body text-lg font-light">
            This is Inter Light (300) - Perfect for subtle text and captions.
          </p>
          
          <p className="font-body text-base font-normal leading-relaxed">
            This is Inter Regular (400) - The default body text weight. Mental health is a journey, 
            and we're here to support you every step of the way. This font is designed for maximum 
            readability on screens, with a high x-height and clear letterforms. It's perfect for 
            long-form content, chat messages, and descriptions.
          </p>
          
          <p className="font-body text-base font-medium">
            This is Inter Medium (500) - Used for emphasis within body text.
          </p>
          
          <p className="font-body text-base font-semibold">
            This is Inter Semibold (600) - Used for strong emphasis and subheadings.
          </p>

          <div className="p-4 bg-muted rounded-lg">
            <p className="font-body text-sm leading-relaxed">
              Example chat message: "I've been feeling anxious lately about my upcoming exams. 
              Can you help me with some coping strategies?" - This shows how Inter works perfectly 
              for chat interfaces with comfortable line height and spacing.
            </p>
          </div>
        </div>
      </section>

      {/* Accent Font Examples */}
      <section className="space-y-4">
        <h2 className={`${fontClasses.heading} text-3xl font-semibold text-primary`}>
          This is Quicksand - Accent Font
        </h2>
        <p className="text-muted-foreground">
          Used for: buttons, CTAs, badges, tags, interactive elements
        </p>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="font-accent px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
              Primary Button
            </button>
            
            <button className="font-accent px-6 py-3 bg-wellness text-white rounded-lg font-medium hover:bg-wellness/90 transition">
              Book Appointment
            </button>
            
            <button className="font-accent px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition">
              Secondary Button
            </button>
            
            <button className="font-accent px-4 py-2 bg-support text-white rounded-full text-sm font-medium hover:bg-support/90 transition">
              Emergency Support
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="font-accent px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Anxiety
            </span>
            <span className="font-accent px-3 py-1 bg-wellness/10 text-wellness rounded-full text-sm font-medium">
              Wellness
            </span>
            <span className="font-accent px-3 py-1 bg-support/10 text-support rounded-full text-sm font-medium">
              Support
            </span>
            <span className="font-accent px-3 py-1 bg-sky/30 text-sky-foreground rounded-full text-sm font-medium">
              Mental Health
            </span>
          </div>

          <p className="font-accent text-lg font-semibold text-primary">
            Interactive Link Text - Soft and Approachable
          </p>
        </div>
      </section>

      {/* Real-world Example */}
      <section className="space-y-4">
        <h2 className={`${fontClasses.heading} text-3xl font-semibold text-primary`}>
          Real-World Example: Card Component
        </h2>
        
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-primary">
                Mental Health Support
              </h3>
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                Connect with professional counselors and get the support you need. 
                Our AI-powered chatbot is available 24/7 to listen and guide you 
                through difficult moments.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button className="font-accent flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
              Get Started
            </button>
            <button className="font-accent flex-1 px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Font Hierarchy Guide */}
      <section className="space-y-4">
        <h2 className={`${fontClasses.heading} text-3xl font-semibold text-primary`}>
          Typography Hierarchy
        </h2>
        
        <div className="bg-gradient-to-br from-primary/5 to-wellness/5 rounded-xl p-6 space-y-3">
          <div className="space-y-1">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
              Overline • Inter 400
            </p>
            <h1 className="font-heading text-4xl font-bold text-primary">
              Hero Title • Poppins 700
            </h1>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Section Heading • Poppins 600
            </h2>
            <p className="font-body text-lg text-foreground">
              Lead Paragraph • Inter 400 • Slightly larger for introduction
            </p>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Body Text • Inter 400 • The standard readable text for most content
            </p>
            <p className="font-body text-sm text-muted-foreground">
              Small Text • Inter 400 • For captions and helper text
            </p>
            <button className="font-accent px-6 py-3 mt-4 bg-primary text-white rounded-lg font-medium">
              Call to Action • Quicksand 500
            </button>
          </div>
        </div>
      </section>

      {/* Chat Interface Example */}
      <section className="space-y-4">
        <h2 className={`${fontClasses.heading} text-3xl font-semibold text-primary`}>
          Chat Interface Example
        </h2>
        
        <div className="bg-gradient-to-b from-sky/20 to-primary/10 rounded-xl p-6 space-y-3">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
              <p className="font-body text-sm leading-relaxed">
                I've been feeling really anxious about my exams. Can you help?
              </p>
              <p className="font-body text-xs text-white/70 mt-1">
                2:30 PM
              </p>
            </div>
          </div>

          {/* Bot Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
              <p className="font-body text-sm leading-relaxed text-foreground">
                I understand exam anxiety can be overwhelming. Let's work through this together. 
                Here are some helpful strategies:
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                2:30 PM • Mann Mitra Bot
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mt-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="font-body flex-1 px-4 py-3 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="font-accent px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition">
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-primary/5 rounded-xl p-6">
        <h3 className="font-heading text-xl font-semibold text-primary mb-3">
          Quick Reference
        </h3>
        <ul className="font-body text-sm space-y-2 text-foreground">
          <li>✅ <strong className="font-semibold">Headings:</strong> Use Poppins (font-heading) for titles and headers</li>
          <li>✅ <strong className="font-semibold">Body Text:</strong> Use Inter (font-body) for paragraphs and content</li>
          <li>✅ <strong className="font-semibold">Buttons/CTAs:</strong> Use Quicksand (font-accent) for interactive elements</li>
          <li>✅ <strong className="font-semibold">Line Height:</strong> Use leading-relaxed (1.625) for body text</li>
          <li>✅ <strong className="font-semibold">Letter Spacing:</strong> Headings use negative letter spacing for modern look</li>
        </ul>
      </section>

    </div>
  );
}
