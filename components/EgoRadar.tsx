
import React from 'react';
import { EgoStats } from '../types';

interface EgoRadarProps {
  stats: EgoStats;
  targetStat?: string | null;
  reduction?: number;
}

export const EgoRadar: React.FC<EgoRadarProps> = ({ stats, targetStat, reduction = 0 }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const categories: (keyof EgoStats)[] = ['focus', 'discipline', 'skill', 'speed', 'creativity', 'mentalStrength'];

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const effectiveValue = (categories[index] === targetStat) ? Math.max(0, value - reduction) : value;
    const r = (effectiveValue / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPoints = categories.map((_, i) => {
    const coords = getCoordinates(i, stats[categories[i]]);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  const gridPolygons = [20, 40, 60, 80, 100].map(level => {
    return categories.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const r = (level / 100) * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  return (
    <div className="flex justify-center items-center w-full max-w-sm mx-auto p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridPolygons.map((points, i) => (
          <polygon key={i} points={points} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {categories.map((_, i) => {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        <polygon points={dataPoints} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2" className="transition-all duration-500" />
        {categories.map((cat, i) => {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          const labelCoords = { x: center + (radius + 20) * Math.cos(angle), y: center + (radius + 20) * Math.sin(angle) };
          return (
            <text key={i} x={labelCoords.x} y={labelCoords.y} fill={cat === targetStat ? "#ef4444" : "#a1a1aa"} fontSize="10" textAnchor="middle" className="uppercase font-bold">
              {cat.substring(0, 3)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
