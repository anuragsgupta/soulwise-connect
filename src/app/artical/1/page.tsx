import React from 'react';
import { Brain, Heart, Zap, Activity, Frown } from 'lucide-react';

export default function ExamAnxietyGuide() {
  const symptoms = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Racing Thoughts & Mental Overload",
      color: "from-purple-500 to-pink-500",
      description: "Ever sat down to study and suddenly felt like 50 thoughts were shouting inside your head? Or maybe you try reading a paragraph, only to realize your mind drifted into panic about the next chapter, the next subject, or the future in general.",
      details: "This is mental overload — your brain trying to juggle too many worries at once. Studies suggest that academic anxiety can significantly reduce cognitive performance, especially working memory, which is essential for learning and problem-solving. When your head feels too full to think straight, studying becomes twice as exhausting.",
      tip: `You might force yourself to work harder, study longer, or sleep less in an attempt to "catch up," but that only worsens the overload. The key is recognizing when your mind is overwhelmed and learning to pause.`
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emotional Numbness",
      color: "from-blue-500 to-cyan-500",
      description: "Exam anxiety doesn't always appear as fear or panic. Sometimes, it shows up as numbness — when you simply stop feeling anything at all.",
      details: "Achievements feel dull. Motivation disappears. Even things you love — games, music, friends — don't spark joy. This emotional flatness makes it harder to begin studying because everything seems pointless.",
      tip: "This kind of academic burnout is especially sneaky. It may develop slowly, with mild stress snowballing into complete disinterest. Many students don't notice they're slipping until they're already struggling to cope."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Trouble Remembering What You Studied",
      color: "from-yellow-500 to-orange-500",
      description: "Believe it or not, exam anxiety can impact short-term memory. Imagine your brain like a computer — it has limited RAM to store active tasks. When anxiety eats up a big chunk of that memory, the brain has fewer resources left for learning.",
      lists: [
        "forget things you just studied",
        "struggle to recall formulas",
        "blank out during tests",
        "reread the same line multiple times"
      ],
      tip: `And it's not because you're lazy or "bad at studying." Anxiety literally interferes with memory formation.`
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Physical Symptoms — Headaches, Stomach Issues, Fatigue",
      color: "from-red-500 to-pink-500",
      description: "Around 30–40% of students experience physical symptoms from exam anxiety. These can include:",
      lists: [
        "headaches or migraines",
        "stomach pain or nausea",
        "rapid heartbeat",
        "sweating",
        "fatigue",
        "shakiness"
      ],
      tip: "These symptoms can make study sessions feel unbearable. Worse, when you finally want to rest or hang out with friends, physical discomfort makes it even harder."
    },
    {
      icon: <Frown className="w-6 h-6" />,
      title: "Irritability & Sudden Mood Swings",
      color: "from-indigo-500 to-purple-500",
      description: "During exam season, even small things can set you off — a noise, a comment, a missed question, or a simple mistake. This irritability often stems from frustration, fear of failure, or the pressure to perform well.",
      tip: "Some teachers and counselors even look for irritability as a sign of academic stress. If you or someone you know has been unusually short-tempered or emotional, the underlying cause might be anxiety."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Managing Exam Anxiety
          </h1>
          <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
            A Complete Guide to Understanding and Overcoming Academic Stress
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Think about your class of twenty or even your close group of friends. Chances are, at least a few of them are struggling with some form of exam anxiety. With rising academic pressure, competitive exams, and constant expectations from family and society, it's not surprising. Millions of students experience exam-related stress every single year — and I'd wager those numbers have only gone up lately.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Why is something so common still so difficult to understand and manage? A lot of it comes down to stigma — we tend to pretend everything is fine, or believe that stress means weakness. And beyond that, many people don't even know what exam anxiety actually looks like.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Movies and shows often dramatize studying but don't portray the real symptoms or the subtler ways anxiety affects the mind and body. In reality, exam anxiety doesn't look the same for everyone — it's rarely just "being nervous." So what are the other signs and symptoms?
          </p>
        </div>

        {/* Image Section */}
        <div className="mb-16">
          <img 
            src="https://images.pexels.com/photos/8278873/pexels-photo-8278873.jpeg" 
            alt="Student experiencing exam stress"
            className="w-full h-96 object-cover rounded-2xl shadow-xl"
          />
        </div>

        {/* Symptoms Section */}
        <div className="space-y-8 mb-16">
          {symptoms.map((symptom, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className={`bg-gradient-to-r ${symptom.color} p-6`}>
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    {symptom.icon}
                  </div>
                  <h2 className="text-2xl font-bold">
                    Symptom #{index + 1}: {symptom.title}
                  </h2>
                </div>
              </div>
              
              <div className="p-8 space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {symptom.description}
                </p>
                
                {symptom.details && (
                  <p className="text-gray-700 leading-relaxed">
                    {symptom.details}
                  </p>
                )}
                
                {symptom.lists && (
                  <ul className="space-y-2 my-4">
                    {symptom.lists.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${symptom.color} flex-shrink-0`}></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {symptom.tip && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-gray-700 italic">{symptom.tip}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Takeaways Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Takeaways</h2>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Exam anxiety sucks — and dealing with it can feel like a battle you fight alone. Not everyone has support, and even when they do, explaining your stress can feel embarrassing or pointless. Many coping strategies (like study plans or meditation) take time to work, and some students don't even realize they're suffering from anxiety until it becomes overwhelming.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            But recognizing the signs is the first step. Once you understand what's happening, you can slowly start to take back control.
          </p>
          
          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Common Symptoms of Exam Anxiety:
            </h3>
            <ul className="space-y-3">
              {[
                "Racing thoughts and mental overload",
                "Emotional numbness",
                "Short-term memory issues",
                "Physical symptoms like headaches or fatigue",
                "Irritability or mood swings"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-1.5 w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0"></span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Reaching out for help — whether to a friend, teacher, or counselor — is not a weakness. It's a step toward managing your stress. And when you open up, you might realize you're far from alone.
          </p>
          
          <p className="text-xl font-semibold text-indigo-700">
            There is help, and you don't have to go through exam season by yourself.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg opacity-90">
            Remember: You're not alone in this journey. Reach out, take care of yourself, and be kind to your mind.
          </p>
        </div>
      </div>
    </div>
  );
}