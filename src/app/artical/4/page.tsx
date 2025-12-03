import React from 'react';
import { Wind, Focus, Clock, BookOpen, Heart, Sparkles } from 'lucide-react';

export default function MindfulStudyGuide() {
  const techniques = [
    {
      icon: <Wind className="w-6 h-6" />,
      title: "Deep Breathing Before Studying",
      color: "from-cyan-500 to-blue-500",
      description: "Before opening your books, spend just 1–2 minutes taking slow, deep breaths. This reduces stress hormones and increases oxygen flow to the brain, helping you start your study session with clarity.",
      benefit: "Studies show that even short breathing exercises can improve focus, memory, and emotional regulation — all crucial for effective studying."
    },
    {
      icon: <Focus className="w-6 h-6" />,
      title: "The \"Single-Task Focus\" Method",
      color: "from-purple-500 to-pink-500",
      description: "Multitasking is one of the biggest enemies of productivity. Mindful studying encourages doing just one task at a time — no switching tabs, no checking notifications, and no background distractions.",
      benefit: "When your mind stays fully engaged with a task, your brain strengthens its neural connections, which helps with long-term retention."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "The 5-Minute Awareness Reset",
      color: "from-green-500 to-teal-500",
      description: `If you feel stuck or mentally drained while studying, take a short "awareness reset." Close your eyes and pay attention to your breathing, sounds, or sensations for five minutes.`,
      benefit: "This helps clear mental clutter and improves your learning efficiency when you return."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Mindful Note-Taking",
      color: "from-orange-500 to-red-500",
      description: "Instead of copying everything in front of you, mindful note-taking encourages processing the information intentionally. You summarize concepts in your own words, create smaller chunks, or draw quick diagrams.",
      benefit: "This approach makes your brain engage deeply with the material — which is what leads to better grades."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Gratitude Check After Studying",
      color: "from-pink-500 to-rose-500",
      description: "Before ending your study session, acknowledge one thing you learned or understood better.",
      benefit: "This simple practice reduces anxiety, boosts motivation, and helps reinforce positive study habits."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Science-Backed Learning Strategies</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            5 Mindful Study Techniques
          </h1>
          <p className="text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
            Can They Really Boost Your Grades?
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            In an academic world full of pressure, distractions, and never-ending deadlines, studying can easily become overwhelming. Many students try harder but still feel like nothing is sticking. That's where mindful study techniques come in — not just as a trend, but as powerful learning strategies backed by cognitive science.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Mindfulness isn't about sitting like a monk for hours. It's about being fully present, reducing stress, and improving how your brain absorbs information. But the big question is: <strong className="text-indigo-600">do mindful study techniques actually work?</strong> Let's explore five effective methods that can truly improve your learning and grades.
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-16 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <img 
            src="https://images.pexels.com/photos/5554266/pexels-photo-5554266.jpeg" 
            alt="Student practicing mindful studying"
            className="relative w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Techniques Section */}
        <div className="space-y-10 mb-16">
          {techniques.map((technique, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${technique.color} p-6`}>
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white bg-opacity-25 backdrop-blur-sm p-3 rounded-xl">
                    {technique.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold opacity-90 mb-1">
                      Technique #{index + 1}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {technique.title}
                    </h2>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-5">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {technique.description}
                </p>
                
                <div className={`bg-gradient-to-r ${technique.color} bg-opacity-10 rounded-xl p-5 border-l-4 border-gradient`}
                     style={{borderImage: `linear-gradient(to bottom, var(--tw-gradient-stops)) 1`}}>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-800 font-medium">
                      {technique.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Thoughts Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-50"></div>
          <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 md:p-12 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Final Thoughts</h2>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              So, can mindful study techniques really boost your grades? <strong className="text-indigo-600 text-xl">Yes — if you use them consistently.</strong> These techniques calm your mind, sharpen your focus, and improve information retention. Over time, mindfulness transforms the entire study experience from stressful to productive.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-indigo-200">
              <p className="text-lg text-gray-800 font-semibold mb-2">
                🎯 Your Next Step
              </p>
              <p className="text-gray-700">
                Try incorporating even one technique today. You might be surprised how much clearer and more confident your studying becomes.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference Card */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">Quick Reference Guide</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {techniques.map((technique, idx) => (
              <div key={idx} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 hover:bg-opacity-30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-30 p-2 rounded-lg">
                    {technique.icon}
                  </div>
                  <span className="font-semibold">{technique.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl font-semibold mb-2">
            Transform Your Study Experience
          </p>
          <p className="text-lg opacity-90">
            Start with one technique today and watch your focus improve
          </p>
        </div>
      </div>
    </div>
  );
}