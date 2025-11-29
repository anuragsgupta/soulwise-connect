import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, X } from 'lucide-react';

interface BreathAwarenessMeditationProps {
  onClose: () => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const BreathAwarenessMeditation: React.FC<BreathAwarenessMeditationProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // Configuration for 'Triangle Breathing' (4-4-4)
  // Ideal for centering thoughts and basic breath awareness
  const PHASES = {
    inhale: { 
      duration: 4, 
      label: 'Inhale deeply', 
      color: 'text-emerald-600', 
      ring: 'border-emerald-500',
      bg: 'bg-emerald-50'
    },
    hold: { 
      duration: 4, 
      label: 'Retain breath', 
      color: 'text-teal-600', 
      ring: 'border-teal-500',
      bg: 'bg-teal-50'
    },
    exhale: { 
      duration: 4, 
      label: 'Release slowly', 
      color: 'text-sky-600', 
      ring: 'border-sky-500',
      bg: 'bg-sky-50'
    },
    idle: { 
      duration: 0, 
      label: 'Ready?', 
      color: 'text-slate-600', 
      ring: 'border-slate-300',
      bg: 'bg-white'
    },
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && phase !== 'idle') {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handlePhaseTransition();
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, secondsLeft]);

  const handlePhaseTransition = () => {
    switch (phase) {
      case 'inhale':
        setPhase('hold');
        setSecondsLeft(PHASES.hold.duration);
        break;
      case 'hold':
        setPhase('exhale');
        setSecondsLeft(PHASES.exhale.duration);
        break;
      case 'exhale':
        setPhase('inhale');
        setSecondsLeft(PHASES.inhale.duration);
        setCycleCount((c) => c + 1);
        break;
      default:
        break;
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      if (phase === 'idle') {
        setPhase('inhale');
        setSecondsLeft(PHASES.inhale.duration);
      }
    } else {
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('idle');
    setSecondsLeft(4);
    setCycleCount(0);
  };

  const getCircleStyles = () => {
    const base = "w-64 h-64 rounded-full border-8 flex items-center justify-center transition-all ease-in-out transform shadow-xl";
    switch (phase) {
      case 'inhale': return `${base} scale-110 duration-[4000ms] ${PHASES.inhale.ring} ${PHASES.inhale.bg}`;
      case 'hold':   return `${base} scale-110 duration-0 ${PHASES.hold.ring} ${PHASES.hold.bg}`;
      case 'exhale': return `${base} scale-95 duration-[4000ms] ${PHASES.exhale.ring} ${PHASES.exhale.bg}`;
      default:       return `${base} scale-100 ${PHASES.idle.ring} ${PHASES.idle.bg}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header Section with Close Button */}
        <div className="bg-emerald-900 p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white transition-colors p-2 rounded-full hover:bg-emerald-800"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Breath Awareness
          </h1>
          <p className="text-emerald-100 text-sm font-light leading-relaxed">
            Simple yet powerful meditation focusing on natural breathing patterns.
          </p>
        </div>

        {/* Visualizer Section */}
        <div className="p-10 flex flex-col items-center">
          <div className="relative mb-12">
            <div className={getCircleStyles()}>
              <div className="text-center">
                {phase !== 'idle' ? (
                  <>
                    <span className={`block text-6xl font-bold mb-2 ${PHASES[phase].color}`}>
                      {secondsLeft}
                    </span>
                    <span className="text-slate-400 font-medium uppercase tracking-widest text-xs">
                      Seconds
                    </span>
                  </>
                ) : (
                  <span className="text-4xl text-slate-300 font-light">Start</span>
                )}
              </div>
            </div>
            
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <h2 className={`text-xl font-semibold transition-colors duration-500 ${PHASES[phase].color}`}>
                {PHASES[phase].label}
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95
                ${isActive 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                  : 'bg-emerald-900 text-white hover:bg-emerald-800'
                }`}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? 'Pause' : 'Begin'}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              aria-label="Reset"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Stats Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 w-full flex justify-between text-slate-400 text-sm">
            <span>Cycles completed</span>
            <span className="font-bold text-slate-800">{cycleCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathAwarenessMeditation;