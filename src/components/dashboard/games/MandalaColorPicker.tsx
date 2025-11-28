"use client";

import { useState } from "react";
import { X, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface MandalaColorPickerProps {
  onClose: () => void;
}

const MandalaColorPicker = ({ onClose }: MandalaColorPickerProps) => {
  const calmingPalette = [
    "#A8E6CF", // Mint green
    "#FFD3BA", // Peach
    "#B8E6E6", // Sky blue
    "#FFB6C1", // Light pink
    "#E6E6FA", // Lavender
    "#F0E68C", // Khaki
    "#DDA0DD", // Plum
    "#98D8C8", // Seafoam
  ];

  const totalSections = 24;
  const [filledSections, setFilledSections] = useState<{ [key: number]: string }>({});
  const progress = (Object.keys(filledSections).length / totalSections) * 100;

  const handleSectionClick = (sectionIndex: number) => {
    const randomColor = calmingPalette[Math.floor(Math.random() * calmingPalette.length)];
    setFilledSections(prev => ({
      ...prev,
      [sectionIndex]: randomColor
    }));
  };

  const resetMandala = () => {
    setFilledSections({});
  };

  const downloadMandala = () => {
    const svg = document.getElementById('mandala-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'my-mandala.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Generate mandala sections (24 petal-like sections)
  const generateMandalaSection = (index: number) => {
    const angle = (360 / totalSections) * index;
    const angleRad = (angle * Math.PI) / 180;
    const nextAngleRad = ((angle + 360 / totalSections) * Math.PI) / 180;
    
    const radius = 250;
    const innerRadius = 80;
    
    const x1 = 300 + Math.cos(angleRad) * innerRadius;
    const y1 = 300 + Math.sin(angleRad) * innerRadius;
    const x2 = 300 + Math.cos(angleRad) * radius;
    const y2 = 300 + Math.sin(angleRad) * radius;
    const x3 = 300 + Math.cos(nextAngleRad) * radius;
    const y3 = 300 + Math.sin(nextAngleRad) * radius;
    const x4 = 300 + Math.cos(nextAngleRad) * innerRadius;
    const y4 = 300 + Math.sin(nextAngleRad) * innerRadius;

    const pathData = `M ${x1},${y1} L ${x2},${y2} A ${radius},${radius} 0 0 1 ${x3},${y3} L ${x4},${y4} A ${innerRadius},${innerRadius} 0 0 0 ${x1},${y1} Z`;

    return pathData;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">🧘‍♀️ Mandala Color Therapy</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tap sections to fill with calming colors. Complete your masterpiece!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={resetMandala}
              className="rounded-full"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={downloadMandala}
              className="rounded-full"
              title="Download"
              disabled={progress < 100}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Mandala Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <svg
            id="mandala-svg"
            width="600"
            height="600"
            viewBox="0 0 600 600"
            className="max-w-full h-auto drop-shadow-lg"
          >
            {/* Background circle */}
            <circle cx="300" cy="300" r="280" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
            
            {/* Mandala sections */}
            {Array.from({ length: totalSections }, (_, i) => (
              <path
                key={i}
                d={generateMandalaSection(i)}
                fill={filledSections[i] || '#ffffff'}
                stroke="#333"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleSectionClick(i)}
              />
            ))}

            {/* Center circle */}
            <circle cx="300" cy="300" r="80" fill="#fef3c7" stroke="#333" strokeWidth="2" />
            <circle cx="300" cy="300" r="60" fill="#fde047" stroke="#333" strokeWidth="2" />
            <circle cx="300" cy="300" r="40" fill="#facc15" stroke="#333" strokeWidth="2" />
          </svg>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-purple-600">{Object.keys(filledSections).length}/{totalSections}</span> sections colored
          </div>
          <div className="text-xs text-gray-500">
            Color Therapy • Pattern Recognition • Mindfulness
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandalaColorPicker;
