"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
// Assuming you have a standard Modal or Dialog component
// I will simulate one for this example with a simple div
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
>>>>>>> f319e4c (Set up the Resources Page)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Play,
  Headphones,
  Download,
  Heart,
  Brain,
  Search,
  Clock,
  Star,
  Volume2,
  FileText,
  Video,
  Wind,
  Gamepad2,
  Activity,
  X, // Added for closing the modal
  ExternalLink // Added for external link icon
} from "lucide-react";

// Game Imports
import BreathingBall from "./games/BreathingBall";
import BoxBreathing from "./games/BoxBreathing";
import CalmCircle from "./games/CalmCircle";
import ZenWaterRipple from "./games/ZenWaterRipple";
import MandalaColorPicker from "./games/MandalaColorPicker";
import FallingLeavesGrounding from "./games/FallingLeavesGrounding";

// --- NEW EXERCISE IMPORTS ---
import FourSevenEightBreathing from "./exercises/FourSevenEightBreathing";
import BreathAwareness from "./exercises/BreathAwareness";
import MorningEnergizer from "./exercises/MorningEnergizer";
import AnxietyRelease from "./exercises/AnxietyRelease";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'guide' | 'exercise' | 'game';
  category: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'mindfulness' | 'academic' | 'breathing' | 'games';
  duration?: string;
  rating: number;
  downloads: number;
  thumbnail?: string;
  url?: string;
  content?: string; // Added for modal content
}

// --- NEW COMPONENT: ResourceModal (For Articles/Guides) ---
interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceModal = ({ resource, onClose }: ResourceModalProps) => {
  // Dummy content based on resource type
  const content = resource.content || `
    <h2 className="text-xl font-bold mb-4">Introduction to ${resource.title}</h2>
    <p className="mb-4">
      This is a placeholder for the full content of the ${resource.type}. 
      The core message focuses on helping students manage ${resource.category} 
      through effective strategies. For example, in this ${resource.type}, 
      we discuss the importance of **setting clear boundaries** between study 
      time and rest time, a crucial step for maintaining mental wellness.
    </p>
    <h3 className="text-lg font-semibold mb-3">Key Takeaways:</h3>
    <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
      <li>Practice the 4-7-8 breathing technique before bed.</li>
      <li>Limit screen time an hour before attempting to sleep.</li>
      <li>Break large tasks into smaller, manageable chunks to reduce overwhelm.</li>
      <li>Seek support from a counselor or peer group if symptoms persist.</li>
    </ul>
    <p>
      The goal of this resource is to equip you with actionable steps. Remember, 
      your well-being is just as important as your academic performance.
    </p>
    <div className="mt-6 p-3 bg-blue-50/50 border-l-4 border-blue-500 text-blue-800 rounded-md text-sm">
        <p className="font-semibold">Disclaimer:</p>
        <p>This resource is for informational purposes only and is not a substitute for professional medical advice.</p>
    </div>
  `;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-heading">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 inline text-blue-600" />
                {resource.title}
              </CardTitle>
              <CardDescription className="text-sm">
                Category: <Badge variant="outline" className="text-xs mt-2">{resource.category}</Badge> | Type: <Badge variant="outline" className="text-xs">{resource.type}</Badge>
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-4 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div dangerouslySetInnerHTML={{ __html: content }} className="space-y-4 prose max-w-none text-sm sm:text-base font-body" />
        </CardContent>
      </Card>
    </div>
  );
};

// --- NEW COMPONENT: VideoResourceModal (For YouTube Videos) ---
interface VideoModalProps {
  resource: Resource;
  onClose: () => void;
}

const VideoResourceModal = ({ resource, onClose }: VideoModalProps) => {
  // Helper to get embed URL from standard YouTube link
  const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` 
      : url;
  };

  const embedUrl = getYouTubeEmbedUrl(resource.url);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-background shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between border-b p-4 sm:p-6">
          <div className="space-y-1 pr-6">
            <CardTitle className="text-xl sm:text-2xl font-heading flex items-center">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-600" />
              {resource.title}
            </CardTitle>
            <CardDescription className="text-sm">
                 Category: <Badge variant="outline" className="text-xs mt-2">{resource.category}</Badge> | Type: <Badge variant="outline" className="text-xs">{resource.type}</Badge>
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Responsive Video Container (16:9 Aspect Ratio) */}
          <div className="relative w-full pt-[56.25%] bg-black">
            {embedUrl ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">
                <p>Video URL not found</p>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
// --- END NEW COMPONENT ---


const ResourceHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showGame, setShowGame] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);

  // New state for article/guide modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Resource | null>(null);

  // New state for video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Resource | null>(null);

  // Listen for exercise launch events from chatbot
  useEffect(() => {
    const handleLaunchExercise = (event: CustomEvent) => {
      const { exerciseId } = event.detail;
      if (exerciseId) {
        setCurrentGame(exerciseId);
        setShowGame(true);
      }
    };

    window.addEventListener('resource:launch-exercise' as any, handleLaunchExercise);
    return () => {
      window.removeEventListener('resource:launch-exercise' as any, handleLaunchExercise);
    };
  }, []);

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Exam Anxiety: A Complete Guide',
      description: 'Learn evidence-based techniques to reduce anxiety before and during exams.',
      type: 'guide',
      category: 'anxiety',
      duration: '15 min read',
      rating: 4.8,
      downloads: 1250,
      content: `<h1>Managing Exam Anxiety: A Complete Guide</h1>
        <p>Think about your class of twenty or even your close group of friends. Chances are, at least a few of them are struggling with some form of exam anxiety. With rising academic pressure, competitive exams, and constant expectations from family and society, it’s not surprising. Millions of students experience exam-related stress every single year — and I’d wager those numbers have only gone up lately.</p>

        <p>Why is something so common still so difficult to understand and manage? A lot of it comes down to stigma — we tend to pretend everything is fine, or believe that stress means weakness. And beyond that, many people don’t even know what exam anxiety actually looks like.</p>

        <p>Movies and shows often dramatize studying but don’t portray the real symptoms or the subtler ways anxiety affects the mind and body. In reality, exam anxiety doesn’t look the same for everyone — it’s rarely just “being nervous.” So what are the other signs and symptoms?</p>

        <p>Think about your class or group. Chances are, at least one person is silently battling exam anxiety.</p>

        <img src="https://images.pexels.com/photos/8278873/pexels-photo-8278873.jpeg" alt="Girl in a jacket">

        <h2>Symptom #1: Racing Thoughts & Mental Overload</h2>

        <p>Ever sat down to study and suddenly felt like 50 thoughts were shouting inside your head? Or maybe you try reading a paragraph, only to realize your mind drifted into panic about the next chapter, the next subject, or the future in general.</p>

        <p>This is mental overload — your brain trying to juggle too many worries at once.</p>

        <p>Studies suggest that academic anxiety can significantly reduce cognitive performance, especially working memory, which is essential for learning and problem-solving. When your head feels too full to think straight, studying becomes twice as exhausting.</p>

        <p>You might force yourself to work harder, study longer, or sleep less in an attempt to “catch up,” but that only worsens the overload. The key is recognizing when your mind is overwhelmed and learning to pause.</p>

        <h2>Symptom #2: Emotional Numbness</h2>

        <p>Exam anxiety doesn’t always appear as fear or panic. Sometimes, it shows up as numbness — when you simply stop feeling anything at all.</p>

        <p>Achievements feel dull. Motivation disappears. Even things you love — games, music, friends — don’t spark joy. This emotional flatness makes it harder to begin studying because everything seems pointless.</p>

        <p>This kind of academic burnout is especially sneaky. It may develop slowly, with mild stress snowballing into complete disinterest. Many students don’t notice they’re slipping until they’re already struggling to cope.</p>

        <h2>Symptom #3: Trouble Remembering What You Studied</h2>

        <p>Believe it or not, exam anxiety can impact short-term memory. Imagine your brain like a computer — it has limited RAM to store active tasks. When anxiety eats up a big chunk of that memory, the brain has fewer resources left for learning.</p>

        <p>So you may:</p>

        <ul>
            <li>forget things you just studied</li>
            <li>struggle to recall formulas</li>
            <li>blank out during tests</li>
            <li>reread the same line multiple times</li>
        </ul>

        <p>And it’s not because you’re lazy or “bad at studying.” Anxiety literally interferes with memory formation.</p>

        <h2>Symptom #4: Physical Symptoms — Headaches, Stomach Issues, Fatigue</h2>

        <p>Around 30–40% of students experience physical symptoms from exam anxiety. These can include:</p>

        <ul>
            <li>headaches or migraines</li>
            <li>stomach pain or nausea</li>
            <li>rapid heartbeat</li>
            <li>sweating</li>
            <li>fatigue</li>
            <li>shakiness</li>
        </ul>

        <p>These symptoms can make study sessions feel unbearable. Worse, when you finally want to rest or hang out with friends, physical discomfort makes it even harder.</p>

        <h2>Symptom #5: Irritability & Sudden Mood Swings</h2>

        <p>During exam season, even small things can set you off — a noise, a comment, a missed question, or a simple mistake. This irritability often stems from frustration, fear of failure, or the pressure to perform well.</p>

        <p>Some teachers and counselors even look for irritability as a sign of academic stress. If you or someone you know has been unusually short-tempered or emotional, the underlying cause might be anxiety.</p>

        <h2>Takeaways</h2>

        <p>Exam anxiety sucks — and dealing with it can feel like a battle you fight alone. Not everyone has support, and even when they do, explaining your stress can feel embarrassing or pointless. Many coping strategies (like study plans or meditation) take time to work, and some students don’t even realize they’re suffering from anxiety until it becomes overwhelming.</p>

        <p>But recognizing the signs is the first step. Once you understand what’s happening, you can slowly start to take back control.</p>

        <p>Here’s a quick guide to the common — and less talked about — symptoms of exam anxiety:</p>

        <ul>
            <li>Racing thoughts and mental overload</li>
            <li>Emotional numbness</li>
            <li>Short-term memory issues</li>
            <li>Physical symptoms like headaches or fatigue</li>
            <li>Irritability or mood swings</li>
        </ul>

        <p>Reaching out for help — whether to a friend, teacher, or counselor — is not a weakness. It’s a step toward managing your stress. And when you open up, you might realize you’re far from alone.</p>

        <p>There is help, and you don’t have to go through exam season by yourself.</p>`,
    },
    {
      id: '2',
      title: 'Deep Breathing for Instant Calm',
      description: 'Guided breathing exercises to help you find peace in stressful moments.',
      type: 'audio',
      category: 'stress',
      duration: '10 min',
      rating: 4.9,
      downloads: 2100
    },
    {
      id: '3',
      title: 'Good Habits Vs Bad Habits | Moral Stories for Kids',
      description: 'Here, we are presenting "Good Habits Vs Bad Habits for Kids" by KIDS HUT.',
      type: 'video',
      category: 'anxiety',
      duration: '3 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://www.youtube.com/embed/PiMqc1XzOHs?si=N6Yad1DVOTY56KcP&amp;start=5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin' // Added Sample YouTube URL
    },
    {
      id: '18',
      title: 'Sleep Hygiene for Students',
      description: 'Expert tips on creating healthy sleep habits that work with your schedule.',
      type: 'video',
      category: 'sleep',
      duration: '3.5 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://www.youtube.com/embed/xXGnjtLyUiI?si=NKijb3U-V2oo_JOw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin' // Added Sample YouTube URL
    },
    {
      id: '19',
      title: 'What Is Depression? || Depression Causes And Symptoms',
      description: 'What Is Depression? | Depression Causes And Symptoms | What Is Depression For Students | Depression Symptoms | Depression Simple Definition | What To Do When Someone Is In Depression .',
      type: 'video',
      category: 'depression',
      duration: '6 min',
      rating: 4.7,
      downloads: 890,
      url: 'https://youtu.be/0hxFR6tezAc?si=aeHEL0l6waNxgca7' // Added Sample YouTube URL
    },
    {
      id: '4',
      title: '5 Mindful Study Techniques',
      description: 'Combine mindfulness with studying for better focus and retention.',
      type: 'article',
      category: 'academic',
      duration: '8 min read',
      rating: 4.6,
      downloads: 1560,
      content: `<h1>5 Mindful Study Techniques: Can They Really Boost Your Grades?</h1>

        <p>In an academic world full of pressure, distractions, and never-ending deadlines, studying can easily become overwhelming. Many students try harder but still feel like nothing is sticking. That's where mindful study techniques come in — not just as a trend, but as powerful learning strategies backed by cognitive science.</p>

        <p>Mindfulness isn’t about sitting like a monk for hours. It’s about being fully present, reducing stress, and improving how your brain absorbs information. But the big question is: <strong>do mindful study techniques actually work?</strong> Let’s explore five effective methods that can truly improve your learning and grades.</p>

        <img src="https://images.pexels.com/photos/5554266/pexels-photo-5554266.jpeg" alt="Mindful Study Image" style="width:100%; margin:20px 0;">

        <h2>1. Deep Breathing Before Studying</h2>
        <p>Before opening your books, spend just 1–2 minutes taking slow, deep breaths. This reduces stress hormones and increases oxygen flow to the brain, helping you start your study session with clarity.</p>
        <p>Studies show that even short breathing exercises can improve focus, memory, and emotional regulation — all crucial for effective studying.</p>

        <h2>2. The “Single-Task Focus” Method</h2>
        <p>Multitasking is one of the biggest enemies of productivity. Mindful studying encourages doing just <strong>one task at a time</strong> — no switching tabs, no checking notifications, and no background distractions.</p>
        <p>When your mind stays fully engaged with a task, your brain strengthens its neural connections, which helps with long-term retention.</p>

        <h2>3. The 5-Minute Awareness Reset</h2>
        <p>If you feel stuck or mentally drained while studying, take a short “awareness reset.” Close your eyes and pay attention to your breathing, sounds, or sensations for five minutes. This helps clear mental clutter and improves your learning efficiency when you return.</p>

        <h2>4. Mindful Note-Taking</h2>
        <p>Instead of copying everything in front of you, mindful note-taking encourages processing the information intentionally. You summarize concepts in your own words, create smaller chunks, or draw quick diagrams.</p>
        <p>This approach makes your brain engage deeply with the material — which is what leads to better grades.</p>

        <h2>5. Gratitude Check After Studying</h2>
        <p>Before ending your study session, acknowledge one thing you learned or understood better. This simple practice reduces anxiety, boosts motivation, and helps reinforce positive study habits.</p>

        <h2>Final Thoughts</h2>
        <p>So, can mindful study techniques really boost your grades? <strong>Yes — if you use them consistently.</strong> These techniques calm your mind, sharpen your focus, and improve information retention. Over time, mindfulness transforms the entire study experience from stressful to productive.</p>

        <p>Try incorporating even one technique today. You might be surprised how much clearer and more confident your studying becomes.</p>
`,
    },
    {
      id: '5',
      title: 'Progressive Muscle Relaxation',
      description: 'A guided session to release physical tension and mental stress.',
      type: 'audio',
      category: 'mindfulness',
      duration: '20 min',
      rating: 4.9,
      downloads: 1780
    },
    {
      id: '6',
      title: 'Recognizing Depression Warning Signs',
      description: 'Understanding the symptoms and when to seek professional help.',
      type: 'guide',
      category: 'depression',
      duration: '12 min read',
      rating: 4.8,
      downloads: 945,
      content: `<h1>Recognizing Depression Warning Signs</h1>

        <p><strong>Description:</strong> Understanding the symptoms and when to seek professional help.</p>

        <p>Depression is one of the most common mental health conditions globally, yet many people struggle to recognize its early warning signs. It doesn’t always look like extreme sadness or withdrawal. Sometimes, the symptoms are subtle, gradual, and easily mistaken for everyday stress or fatigue.</p>

        <p>Recognizing these signs early can make a huge difference. Whether it’s for yourself or someone you care about, understanding what depression might look like is the first step toward getting the right support.</p>

        <img src="https://images.pexels.com/photos/236151/pexels-photo-236151.jpeg" alt="Mindful Study Image" style="width:100%; margin:20px 0;">

        <h2>1. Persistent Sadness or Emptiness</h2>
        <p>While not everyone with depression feels constantly sad, many experience a lingering sense of emptiness or hopelessness that doesn't seem to go away. This emotional heaviness may last for weeks or even months.</p>

        <h2>2. Loss of Interest in Activities</h2>
        <p>One of the major red flags is losing interest in things you normally enjoy — hobbies, friends, music, or even food. This condition, known as <strong>anhedonia</strong>, often signals deeper emotional distress.</p>

        <h2>3. Sleep Disturbances</h2>
        <p>Depression can disrupt sleep patterns in two ways: insomnia (difficulty sleeping) or hypersomnia (sleeping too much). Both can worsen fatigue and make daily tasks feel overwhelming.</p>

        <h2>4. Changes in Appetite or Weight</h2>
        <p>Some people may lose their appetite, while others may overeat as a coping mechanism. Noticeable weight loss or gain over a short period can be a sign of emotional imbalance.</p>

        <h2>5. Difficulty Concentrating</h2>
        <p>Depression affects cognitive functions, making it hard to focus, make decisions, or remember things. This is sometimes described as “brain fog.”</p>

        <h2>6. Physical Symptoms</h2>
        <p>Depression doesn’t only affect the mind. Many people experience headaches, stomach pain, fatigue, or general aches with no clear physical cause.</p>

        <h2>7. Irritability or Mood Swings</h2>
        <p>While depression is often portrayed as sadness, irritability is also common — especially among teens and young adults. Small inconveniences may suddenly feel overwhelming or infuriating.</p>

        <h2>When Should You Seek Professional Help?</h2>
        <p>It’s important to reach out for help if:</p>
        <ul>
            <li>Symptoms persist for more than two weeks</li>
            <li>Your daily functioning is affected (work, school, relationships)</li>
            <li>You feel overwhelmed, trapped, or hopeless</li>
            <li>You experience thoughts of self-harm or suicide</li>
        </ul>

        <p>Talking to a therapist, counselor, or trusted healthcare provider can provide clarity and support. Depression is treatable, and early intervention often leads to better outcomes.</p>

        <h2>Final Thoughts</h2>
        <p>If you’re noticing these symptoms in yourself or someone else, remember: reaching out for help is a strength, not a weakness. Understanding the warning signs is the first step toward healing and recovery.</p>
        `,
    },
    {
      id: '7',
      title: '4-7-8 Breathing Technique',
      description: 'Master the 4-7-8 breathing method to reduce anxiety and promote relaxation in minutes.',
      type: 'exercise',
      category: 'breathing',
      duration: '5 min',
      rating: 4.9,
      downloads: 3200,
      url: '4-7-8-breathing' // Added URL for exercise
    },
    {
      id: '9',
      title: 'Breath Awareness Meditation',
      description: 'Simple yet powerful meditation focusing on natural breathing patterns.',
      type: 'exercise',
      category: 'breathing',
      duration: '10 min',
      rating: 4.7,
      downloads: 2400,
      url: 'breath-awareness' // Added URL for exercise
    },
    {
      id: '10',
      title: 'Interactive Breathing Ball',
      description: 'Follow the expanding and contracting ball to regulate your breathing and find calm.',
      type: 'game',
      category: 'games',
      duration: '2-5 min',
      rating: 4.9,
      downloads: 5600,
      url: 'breathing-ball'
    },
    {
      id: '11',
      title: 'Calm Circle - Breath Pacer',
      description: 'Visual breathing pacer with customizable timing to help you destress instantly.',
      type: 'game',
      category: 'games',
      duration: 'Flexible',
      rating: 4.8,
      downloads: 4200,
      url: 'calm-circle'
    },
    {
      id: '12',
      title: 'Box Breathing Exercise',
      description: 'Navy SEAL technique with visual guidance - follow the box pattern for stress relief.',
      type: 'game',
      category: 'games',
      duration: '5-15 min',
      rating: 4.7,
      downloads: 3800,
      url: 'box-breathing'
    },
    {
      id: '13',
      title: 'Morning Energizer Breathing',
      description: 'Wake up your body and mind with this invigorating breathing sequence.',
      type: 'exercise',
      category: 'breathing',
      duration: '6 min',
      rating: 4.6,
      downloads: 1900,
      url: 'morning-energizer' // Added URL for exercise
    },
    {
      id: '14',
      title: 'Anxiety Release Breathing',
      description: 'Specially designed breathing pattern to quickly calm anxiety and racing thoughts.',
      type: 'exercise',
      category: 'breathing',
      duration: '7 min',
      rating: 4.9,
      downloads: 3500,
      url: 'anxiety-release' // Added URL for exercise
    },
    {
      id: '15',
      title: 'Zen Water Ripple',
      description: 'Create calming water ripples with each tap. Visual ASMR effect for instant relaxation.',
      type: 'game',
      category: 'games',
      duration: 'Unlimited',
      rating: 4.9,
      downloads: 6200,
      url: 'zen-water-ripple'
    },
    {
      id: '16',
      title: 'Mandala Color Therapy',
      description: 'Fill mandala sections with calming colors. Color therapy meets pattern recognition.',
      type: 'game',
      category: 'games',
      duration: '10-15 min',
      rating: 4.8,
      downloads: 5400,
      url: 'mandala-color-picker'
    },
    {
      id: '17',
      title: 'Falling Leaves Grounding',
      description: 'Drag autumn leaves into a basket. Grounding technique with slow deliberate movements.',
      type: 'game',
      category: 'games',
      duration: '5-10 min',
      rating: 4.7,
      downloads: 4800,
      url: 'falling-leaves'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Resources', icon: BookOpen },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'anxiety', label: 'Anxiety', icon: Brain },
    { id: 'depression', label: 'Depression', icon: Heart },
    { id: 'stress', label: 'Stress', icon: Activity },
    { id: 'sleep', label: 'Sleep', icon: Brain },
    { id: 'mindfulness', label: 'Mindfulness', icon: Heart },
    { id: 'academic', label: 'Academic', icon: BookOpen }
  ];

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'article': return FileText;
      case 'guide': return BookOpen;
      case 'exercise': return Wind;
      case 'game': return Gamepad2;
      default: return BookOpen;
    }
  };

  const getResourceColor = (type: Resource['type']) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'exercise': return 'bg-teal-100 text-teal-800';
      case 'game': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'game' && resource.url) {
      // Internal Games
      if (['breathing-ball', 'calm-circle', 'box-breathing', 'zen-water-ripple', 'mandala-color-picker', 'falling-leaves'].includes(resource.url)) {
        setCurrentGame(resource.url);
        setShowGame(true);
      } else {
        // External URL for game
        window.open(resource.url, '_blank');
      }
    } else if (resource.type === 'guide' || resource.type === 'article') {
      // Open Article/Guide Modal
      setCurrentArticle(resource);
      setIsModalOpen(true);
    } else if (resource.type === 'video') {
      // Open Video Modal
      setCurrentVideo(resource);
      setIsVideoModalOpen(true);
    } else if (resource.type === 'exercise' && resource.url) {
        // --- NEW: Handle Exercise Modal ---
        setCurrentExercise(resource.url);
        setShowExercise(true);
    } else {
      // Handle other resource types (Audio, or Exercises without URL)
      console.log(`Opening external resource: ${resource.title}`);
      if (resource.url) {
        window.open(resource.url, '_blank');
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl sm:text-2xl font-heading">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-secondary animate-pulse-soft" />
            Wellness Resource Hub
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-body">
            Access curated mental health resources, guided meditations, breathing exercises, and calming games designed for students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base font-body"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-muted rounded-lg">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              return (
                <Card
                  key={resource.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${getResourceColor(resource.type)} text-xs`}>
                        <ResourceIcon className="w-3 h-3 mr-1" />
                        {resource.type}
                      </Badge>
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1 fill-yellow-500" />
                        {resource.rating}
                      </div>
                    </div>
                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2 font-heading">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2 font-body">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="truncate">{resource.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{resource.downloads > 1000 ? `${(resource.downloads / 1000).toFixed(1)}k` : resource.downloads}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-xs sm:text-sm font-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResourceClick(resource);
                        }}
                      >
                        {resource.type === 'video' ? (
                          <>
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Watch
                          </>
                        ) : resource.type === 'audio' ? (
                          <>
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Listen
                          </>
                        ) : resource.type === 'exercise' ? (
                          <>
                            <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Start
                          </>
                        ) : resource.type === 'game' ? (
                          <>
                            <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Play
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Read
                          </>
                        )}
                      </Button>
                      
                      {/* MODIFIED: Download button only for articles and guides */}
                      {(resource.type === 'article' || resource.type === 'guide') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create a blob to download the PRD content
                            const element = document.createElement("a");
                            const contentToDownload = resource.content || resource.description;
                            const file = new Blob([contentToDownload], {type: 'text/html'});
                            element.href = URL.createObjectURL(file);
                            element.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_PRD.html`;
                            document.body.appendChild(element); 
                            element.click();
                            document.body.removeChild(element);
                          }}
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl font-heading">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500 fill-yellow-500" />
            Featured Collections
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm font-body">
            Curated resource collections for common student challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-teal-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Wind className="w-8 h-8 text-teal-600" />
                  <Badge className="bg-teal-600 text-white text-xs">New</Badge>
                </div>
                <h3 className="font-semibold text-teal-800 mb-2 text-sm sm:text-base font-heading">
                  Breathing Exercises
                </h3>
                <p className="text-xs sm:text-sm text-teal-700 mb-3 font-body">
                  Master various breathing techniques to instantly calm anxiety and improve focus.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-teal-700 font-medium">
                  <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  5 Exercises
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Gamepad2 className="w-8 h-8 text-orange-600" />
                  <Badge className="bg-orange-600 text-white text-xs">Popular</Badge>
                </div>
                <h3 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base font-heading">
                  Interactive Games
                </h3>
                <p className="text-xs sm:text-sm text-orange-700 mb-3 font-body">
                  Play calming, interactive games designed to reduce stress and improve mental wellness.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-orange-700 font-medium">
                  <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  6 Games
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-wellness/20 to-wellness-light cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-wellness/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="w-8 h-8 text-wellness" />
                  <Badge className="bg-wellness text-white text-xs">Essential</Badge>
                </div>
                <h3 className="font-semibold text-wellness-foreground mb-2 text-sm sm:text-base font-heading">
                  Exam Preparation Toolkit
                </h3>
                <p className="text-xs sm:text-sm text-wellness-foreground/80 mb-3 font-body">
                  Complete guide to managing exam stress, study techniques, and maintaining mental health during tests.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-wellness-foreground/80 font-medium">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  8 Resources
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-support/20 to-support-light cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-support/30 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Headphones className="w-8 h-8 text-support" />
                  <Badge className="bg-support text-white text-xs">Trending</Badge>
                </div>
                <h3 className="font-semibold text-support-foreground mb-2 text-sm sm:text-base font-heading">
                  Sleep & Recovery
                </h3>
                <p className="text-xs sm:text-sm text-support-foreground/80 mb-3 font-body">
                  Everything you need to establish healthy sleep patterns and recover from academic burnout.
                </p>
                <div className="flex items-center text-xs sm:text-sm text-support-foreground/80 font-medium">
                  <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  6 Resources
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Game Modals */}
      {showGame && currentGame === 'breathing-ball' && (
        <BreathingBall onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'calm-circle' && (
        <CalmCircle onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'box-breathing' && (
        <BoxBreathing onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'zen-water-ripple' && (
        <ZenWaterRipple onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'mandala-color-picker' && (
        <MandalaColorPicker onClose={() => setShowGame(false)} />
      )}
      {showGame && currentGame === 'falling-leaves' && (
        <FallingLeavesGrounding onClose={() => setShowGame(false)} />
      )}

      {/* Article/Guide Modal */}
      {isModalOpen && currentArticle && (
        <ResourceModal
          resource={currentArticle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      {/* Video Modal */}
      {isVideoModalOpen && currentVideo && (
        <VideoResourceModal
          resource={currentVideo}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* --- NEW: Exercise Modals --- */}
      {showExercise && currentExercise === '4-7-8-breathing' && (
        <FourSevenEightBreathing onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'breath-awareness' && (
        <BreathAwareness onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'morning-energizer' && (
        <MorningEnergizer onClose={() => setShowExercise(false)} />
      )}
      {showExercise && currentExercise === 'anxiety-release' && (
        <AnxietyRelease onClose={() => setShowExercise(false)} />
      )}
    </div>
  );
};

export default ResourceHub;