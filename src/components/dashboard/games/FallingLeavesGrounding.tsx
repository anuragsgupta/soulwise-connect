"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Leaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  isDragging: boolean;
  color: string;
  size: number;
}

interface FallingLeavesProps {
  onClose: () => void;
}

const leafColors = ['#D2691E', '#CD853F', '#DAA520', '#B8860B', '#8B4513', '#A0522D'];

const FallingLeavesGrounding = ({ onClose }: FallingLeavesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [score, setScore] = useState(0);
  const [draggedLeaf, setDraggedLeaf] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 600 });
  const animationRef = useRef<number | undefined>(undefined);
  const leafIdRef = useRef(0);

  const basketY = canvasSize.height - 80;
  const basketX = canvasSize.width / 2 - 100;
  const basketWidth = 200;

  // Handle responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.clientWidth - 48, 800);
        const height = Math.min(containerRef.current.clientHeight - 48, 600);
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize leaves
    const initialLeaves: Leaf[] = Array.from({ length: 12 }, () => ({
      id: leafIdRef.current++,
      x: Math.random() * (canvasSize.width - 50),
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      isDragging: false,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      size: 20 + Math.random() * 15
    }));
    setLeaves(initialLeaves);

    // Animation loop
    const animate = () => {
      setLeaves(prevLeaves => {
        return prevLeaves.map(leaf => {
          if (leaf.isDragging) return leaf;

          const newY = leaf.y + leaf.vy;
          const newX = leaf.x + leaf.vx + Math.sin(newY * 0.02) * 0.5;
          const newRotation = leaf.rotation + leaf.rotationSpeed;

          // Reset leaf if it goes off screen
          if (newY > canvasSize.height) {
            return {
              ...leaf,
              x: Math.random() * (canvasSize.width - 50),
              y: -20,
              vx: (Math.random() - 0.5) * 0.5,
              vy: 0.5 + Math.random() * 0.5,
              rotation: Math.random() * 360,
            };
          }

          // Keep within bounds
          if (newX < 0 || newX > canvasSize.width) {
            return { ...leaf, vx: -leaf.vx, x: newX, y: newY, rotation: newRotation };
          }

          return {
            ...leaf,
            x: newX,
            y: newY,
            rotation: newRotation,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw basket
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(basketX, basketY);
    ctx.lineTo(basketX + basketWidth, basketY);
    ctx.lineTo(basketX + basketWidth - 20, basketY + 60);
    ctx.lineTo(basketX + 20, basketY + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw leaves
    leaves.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate((leaf.rotation * Math.PI) / 180);

      // Draw leaf shape
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.quadraticCurveTo(leaf.size / 2, -leaf.size / 4, leaf.size / 2, leaf.size / 4);
      ctx.quadraticCurveTo(leaf.size / 2, leaf.size / 2, 0, leaf.size / 2);
      ctx.quadraticCurveTo(-leaf.size / 2, leaf.size / 2, -leaf.size / 2, leaf.size / 4);
      ctx.quadraticCurveTo(-leaf.size / 2, -leaf.size / 4, 0, -leaf.size / 2);
      ctx.closePath();
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size / 2);
      ctx.lineTo(0, leaf.size / 2);
      ctx.stroke();

      ctx.restore();
    });
  }, [leaves, basketX, basketY, canvasSize]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked on a leaf
    const clickedLeafIndex = leaves.findIndex(leaf => {
      const dx = mouseX - leaf.x;
      const dy = mouseY - leaf.y;
      return Math.sqrt(dx * dx + dy * dy) < leaf.size;
    });

    if (clickedLeafIndex !== -1) {
      setDraggedLeaf(leaves[clickedLeafIndex].id);
      setLeaves(prev =>
        prev.map((leaf, idx) =>
          idx === clickedLeafIndex ? { ...leaf, isDragging: true, vy: leaf.vy * 0.3 } : leaf
        )
      );
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedLeaf === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setLeaves(prev =>
      prev.map(leaf =>
        leaf.id === draggedLeaf ? { ...leaf, x: mouseX, y: mouseY, vy: leaf.vy * 0.8 } : leaf
      )
    );
  };

  const handleCanvasMouseUp = () => {
    if (draggedLeaf === null) return;

    setLeaves(prev => {
      const updatedLeaves = prev.map(leaf => {
        if (leaf.id === draggedLeaf) {
          // Check if leaf is in basket
          if (
            leaf.x >= basketX &&
            leaf.x <= basketX + basketWidth &&
            leaf.y >= basketY &&
            leaf.y <= basketY + 60
          ) {
            setScore(s => s + 1);
            // Remove this leaf
            return null;
          }
          return { ...leaf, isDragging: false, vy: 0.5 + Math.random() * 0.5 };
        }
        return leaf;
      }).filter(Boolean) as Leaf[];

      return updatedLeaves;
    });

    setDraggedLeaf(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🍃 Falling Leaves Grounding</h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag leaves into the basket. Slow, deliberate movements calm the mind.
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
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-gray-200 rounded-lg shadow-lg bg-gradient-to-b from-sky-100 to-sky-50 cursor-grab active:cursor-grabbing max-w-full"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                currentTarget: canvasRef.current,
                preventDefault: () => {},
              } as React.MouseEvent<HTMLCanvasElement>;
              handleCanvasMouseDown(syntheticEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const syntheticEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                currentTarget: canvasRef.current,
                preventDefault: () => {},
              } as React.MouseEvent<HTMLCanvasElement>;
              handleCanvasMouseMove(syntheticEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleCanvasMouseUp();
            }}
          />
        </div>

        {/* Footer Stats */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-amber-600">{score}</span> leaves collected
          </div>
          <div className="text-xs text-gray-500">
            Grounding Technique • Slow Movement • 5-4-3-2-1 Senses
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallingLeavesGrounding;
