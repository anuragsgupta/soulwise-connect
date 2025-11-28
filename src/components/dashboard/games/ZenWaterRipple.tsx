"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ripple {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface ZenWaterRippleProps {
  onClose: () => void;
}

const ZenWaterRipple = ({ onClose }: ZenWaterRippleProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
      timestamp: Date.now()
    };

    setRipples(prev => {
      // Limit to 20 simultaneous ripples for performance
      const updated = [...prev, newRipple];
      return updated.slice(-20);
    });

    // Remove ripple after animation completes (3s)
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🌊 Zen Water Ripple</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tap anywhere to create calming ripples. Let your worries flow away.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 min-h-[50vh] relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div
            ref={containerRef}
            className="absolute inset-0 cursor-pointer"
            onClick={createRipple}
            onTouchStart={createRipple}
          >
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                style={{
                  position: 'absolute',
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: '20px',
                  height: '20px',
                  marginLeft: '-10px',
                  marginTop: '-10px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 150, 255, 0.6), rgba(0, 200, 255, 0.4), transparent)',
                  animation: 'rippleExpand 3s ease-out forwards',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          {/* Instructions Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <p className="text-sm text-gray-700 font-medium">
              ✨ Tap or click anywhere to create ripples
            </p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-teal-600">{ripples.length}</span> active ripples
          </div>
          <div className="text-xs text-gray-500">
            Visual ASMR • Tactile Feedback • Stress Relief
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rippleExpand {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(10);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ZenWaterRipple;
