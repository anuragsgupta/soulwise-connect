import React from 'react';
import Image from 'next/image';
import { Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleNavigation } from '@/components/articles/ArticleNavigation';

export default function DepressionWarningGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hero Image */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-slate-100 to-blue-200 overflow-hidden">
          <Image 
            src="https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg" 
            alt="Understanding depression"
            fill
            className="w-full h-full object-cover opacity-90"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        </div>

        {/* Top Navigation Bar - Client Component */}
        <ArticleNavigation />
 />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Recognizing Depression Warning Signs
        </h1>
        
        {/* Author */}
        <p className="text-sm text-muted-foreground mb-3">
          by Dr. Michael Chen
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <span>12 min</span>
          <span>⭐</span>
          <span>4.8</span>
          <span className="text-xs">| 94k View</span>
        </div>

        {/* Introduction */}
        <p className="text-base text-foreground leading-relaxed mb-6">
          Understanding the symptoms and when to seek professional help is crucial for mental health. Here are the key warning signs to watch for:
        </p>

        {/* Warning Signs */}
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Persistent Sadness or Emptiness</h2>
            <p className="text-base text-foreground leading-relaxed">
              While not everyone with depression feels constantly sad, many experience a lingering sense of emptiness or hopelessness that doesn't seem to go away. This emotional heaviness may last for weeks or even months.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Loss of Interest in Activities</h2>
            <p className="text-base text-foreground leading-relaxed">
              One of the major red flags is losing interest in things you normally enjoy — hobbies, friends, music, or even food. This condition, known as anhedonia, often signals deeper emotional distress.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Sleep Disturbances</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression can disrupt sleep patterns in two ways: insomnia (difficulty sleeping) or hypersomnia (sleeping too much). Both can worsen fatigue and make daily tasks feel overwhelming.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Changes in Appetite or Weight</h2>
            <p className="text-base text-foreground leading-relaxed">
              Some people may lose their appetite, while others may overeat as a coping mechanism. Noticeable weight loss or gain over a short period can be a sign of emotional imbalance.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Difficulty Concentrating</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression affects cognitive functions, making it hard to focus, make decisions, or remember things. This is sometimes described as "brain fog."
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Physical Symptoms</h2>
            <p className="text-base text-foreground leading-relaxed">
              Depression doesn't only affect the mind. Many people experience headaches, stomach pain, fatigue, or general aches with no clear physical cause.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Irritability or Mood Swings</h2>
            <p className="text-base text-foreground leading-relaxed">
              While depression is often portrayed as sadness, irritability is also common — especially among teens and young adults. Small inconveniences may suddenly feel overwhelming or infuriating.
            </p>
          </div>
        </div>

        {/* When to Seek Help */}
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-6 border-l-4 border-red-500 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">When to Seek Professional Help</h2>
          <p className="text-base text-foreground leading-relaxed mb-3">
            If you experience several of these symptoms for more than two weeks, it's important to reach out to a mental health professional.
          </p>
          <p className="text-base text-foreground leading-relaxed font-semibold">
            If you're having thoughts of self-harm or suicide, please seek immediate help by contacting a crisis helpline or emergency services.
          </p>
        </div>

        {/* Conclusion */}
        <p className="text-base text-foreground leading-relaxed">
          Remember: Seeking help is a sign of strength, not weakness. Depression is treatable, and with proper support, recovery is possible. You don't have to face this alone.
        </p>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl flex items-center justify-center gap-2 text-base font-semibold"
            size="lg"
          >
            <Play className="w-5 h-5 fill-white" />
            Start Session
          </Button>
        </div>
      </div>
    </div>
  );
}
  const warningSigns = [
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Persistent Sadness or Emptiness",
      color: "from-slate-500 to-gray-600",
      description: "While not everyone with depression feels constantly sad, many experience a lingering sense of emptiness or hopelessness that doesn't seem to go away. This emotional heaviness may last for weeks or even months."
    },
    {
      icon: <HeartOff className="w-6 h-6" />,
      title: "Loss of Interest in Activities",
      color: "from-indigo-500 to-purple-600",
      description: "One of the major red flags is losing interest in things you normally enjoy — hobbies, friends, music, or even food. This condition, known as anhedonia, often signals deeper emotional distress."
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: "Sleep Disturbances",
      color: "from-blue-500 to-cyan-600",
      description: "Depression can disrupt sleep patterns in two ways: insomnia (difficulty sleeping) or hypersomnia (sleeping too much). Both can worsen fatigue and make daily tasks feel overwhelming."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Changes in Appetite or Weight",
      color: "from-emerald-500 to-teal-600",
      description: "Some people may lose their appetite, while others may overeat as a coping mechanism. Noticeable weight loss or gain over a short period can be a sign of emotional imbalance."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Difficulty Concentrating",
      color: "from-violet-500 to-purple-600",
      description: `Depression affects cognitive functions, making it hard to focus, make decisions, or remember things. This is sometimes described as "brain fog."`
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Physical Symptoms",
      color: "from-orange-500 to-red-600",
      description: "Depression doesn't only affect the mind. Many people experience headaches, stomach pain, fatigue, or general aches with no clear physical cause."
    },
    {
      icon: <Frown className="w-6 h-6" />,
      title: "Irritability or Mood Swings",
      color: "from-pink-500 to-rose-600",
      description: "While depression is often portrayed as sadness, irritability is also common — especially among teens and young adults. Small inconveniences may suddenly feel overwhelming or infuriating."
    }
  ];

  const seekHelpWhen = [
    "Symptoms persist for more than two weeks",
    "Your daily functioning is affected (work, school, relationships)",
    "You feel overwhelmed, trapped, or hopeless",
    "You experience thoughts of self-harm or suicide"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Mental Health Awareness</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Recognizing Depression Warning Signs
          </h1>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
            Understanding the symptoms and when to seek professional help
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-blue-100">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Depression is one of the most common mental health conditions globally, yet many people struggle to recognize its early warning signs. It doesn't always look like extreme sadness or withdrawal. Sometimes, the symptoms are subtle, gradual, and easily mistaken for everyday stress or fatigue.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Recognizing these signs early can make a huge difference. Whether it's for yourself or someone you care about, understanding what depression might look like is the first step toward getting the right support.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-16 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <img 
            src="https://images.pexels.com/photos/236151/pexels-photo-236151.jpeg" 
            alt="Understanding depression and mental health"
            className="relative w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Warning Signs Section */}
        <div className="space-y-8 mb-16">
          {warningSigns.map((sign, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${sign.color} p-6`}>
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white bg-opacity-25 backdrop-blur-sm p-3 rounded-xl">
                    {sign.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold opacity-90 mb-1">
                      Warning Sign #{index + 1}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {sign.title}
                    </h2>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {sign.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* When to Seek Help Section */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-8 md:p-12 mb-12 border-2 border-red-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-xl shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              When Should You Seek Professional Help?
            </h2>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            It's important to reach out for help if:
          </p>
          
          <div className="space-y-4">
            {seekHelpWhen.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-800 font-medium pt-1">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border-l-4 border-red-500 shadow-md">
            <p className="text-gray-700 leading-relaxed">
              Talking to a therapist, counselor, or trusted healthcare provider can provide clarity and support. Depression is treatable, and early intervention often leads to better outcomes.
            </p>
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 md:p-10 mb-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Need Immediate Support?</h3>
          </div>
          <div className="space-y-4 text-lg">
            <p className="opacity-95">
              If you're experiencing a mental health crisis or having thoughts of self-harm:
            </p>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-5 space-y-2">
              <p className="font-semibold">🌍 International Crisis Lines</p>
              <p className="opacity-90">Contact a local crisis hotline or emergency services</p>
              <p className="opacity-90">Reach out to a trusted friend, family member, or mental health professional</p>
            </div>
            <p className="text-sm opacity-90 italic mt-4">
              Remember: Reaching out is a sign of strength, not weakness.
            </p>
          </div>
        </div>

        {/* Final Thoughts Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl blur-xl opacity-40"></div>
          <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 md:p-12 border border-blue-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              Final Thoughts
            </h2>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              If you're noticing these symptoms in yourself or someone else, remember: <strong className="text-indigo-600">reaching out for help is a strength, not a weakness.</strong> Understanding the warning signs is the first step toward healing and recovery.
            </p>
            
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-lg font-semibold mb-2">💙 You Are Not Alone</p>
              <p className="opacity-95">
                Depression is treatable, and support is available. Taking the first step toward help is an act of courage and self-care.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Warning Signs to Remember
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {warningSigns.map((sign, idx) => (
              <div 
                key={idx}
                className={`bg-gradient-to-r ${sign.color} bg-opacity-10 rounded-xl p-4 border-l-4`}
                style={{borderColor: 'var(--tw-gradient-from)'}}
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-r ${sign.color} p-2 rounded-lg`}>
                    {sign.icon}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {sign.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-700 via-blue-800 to-indigo-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl font-semibold mb-2">
            Your Mental Health Matters
          </p>
          <p className="text-lg opacity-90">
            Recognizing the signs is the first step. Seeking help is a sign of strength.
          </p>
        </div>
      </div>
    </div>
  );
}