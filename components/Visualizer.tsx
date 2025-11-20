import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number; // 0-100
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        // Idle state - slow breathing line
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.strokeStyle = '#3f3f46'; // Zinc 600
        ctx.lineWidth = 2;
        ctx.lineTo(width, centerY);
        ctx.stroke();
        return;
      }

      // Active State - Sine wave modulation based on volume
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      // Dynamic color based on volume intensity
      const r = 99 + (volume * 1.5);
      const g = 102;
      const b = 241;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`; // Indigo-ish
      
      ctx.lineWidth = 3 + (volume / 20);

      const amplitude = Math.max(5, volume * 1.5); // Min amplitude to show it's alive
      const frequency = 0.05;

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * frequency + phase) * amplitude * Math.sin(x / width * Math.PI); 
        ctx.lineTo(x, y);
      }

      ctx.stroke();
      
      // Secondary echo line
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * frequency + phase - 0.5) * (amplitude * 0.7) * Math.sin(x / width * Math.PI); 
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.2;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, volume]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full h-32 rounded-xl bg-shadow-900/50 backdrop-blur border border-shadow-800"
    />
  );
};