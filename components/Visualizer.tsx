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

    let offset = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear with semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      // Draw Grid lines (Retro Scope effect)
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (!isActive) {
        // Idle state - flat line with static
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let i = 0; i < width; i+=5) {
             ctx.lineTo(i, centerY + (Math.random() - 0.5) * 2);
        }
        ctx.strokeStyle = '#52525b';
        ctx.stroke();
        return;
      }

      // Active State - Digital Waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      // Dynamic color based on volume intensity
      // Cyberpunk Cyan to Purple
      const r = 100 + (volume);
      const g = 100;
      const b = 255;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      
      ctx.lineWidth = 2;

      const bars = 30;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          // Create a blocky digital wave instead of sine
          const noise = Math.random() * 0.5 + 0.5;
          const barHeight = (Math.sin((i * 0.5) + offset) * volume * 1.5 * noise);
          
          ctx.moveTo(x, centerY - barHeight);
          ctx.lineTo(x + barWidth - 2, centerY - barHeight); // Top of block
          ctx.lineTo(x + barWidth - 2, centerY + barHeight); // Right side
          ctx.lineTo(x, centerY + barHeight); // Bottom
          ctx.lineTo(x, centerY - barHeight); // Close
      }
      
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += 0.2;
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
      className="w-full h-full"
    />
  );
};