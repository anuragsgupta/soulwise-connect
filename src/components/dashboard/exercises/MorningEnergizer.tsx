import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, X } from 'lucide-react';

interface MorningEnergizerProps {
  onClose: () => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const MorningEnergizer: React.FC<MorningEnergizerProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  // Configuration for 'Energizing Breath' (4-2-4)
  // A brisk, rhythmic cycle to stimulate the nervous system
  const PHASES = {
    inhale: { 
      duration: 4, 
      label: 'Inhale Energy', 
      color: 'text-orange-600', 
      ring: 'border-orange-500',
      bg: 'bg-orange-50'
    },
    hold: { 
      duration: 2, 
      label: 'Brief Pause', 
      color: 'text-amber-600', 
      ring: 'border-amber-500',
      bg: 'bg-amber-50'
    },
    exhale: { 
      duration: 4, 
      label: 'Exhale Tiredness', 
      color: 'text-yellow-600', 
      ring: 'border-yellow-500',
      bg: 'bg-yellow-50'
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
      case 'exhale': return `${base} scale-90 duration-[4000ms] ${PHASES.exhale.ring} ${PHASES.exhale.bg}`;
      default:       return `${base} scale-100 ${PHASES.idle.ring} ${PHASES.idle.bg}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header Section with Close Button */}
        <div className="bg-orange-500 p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-orange-100 hover:text-white transition-colors p-2 rounded-full hover:bg-orange-600"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            Morning Energizer
          </h1>
          <p className="text-orange-50 text-sm font-light leading-relaxed">
            Wake up your body and mind with this invigorating breathing sequence.
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
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? 'Pause' : 'Begin'}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-full text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-colors"
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

export default MorningEnergizer;