
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

  const categories: (keyof EgoStats)[] = [
    'focus', 'discipline', 'skill', 'speed', 'creativity', 'mentalStrength'
  ];

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    // Apply temporary reduction if it's the target stat
    const effectiveValue = (categories[index] === targetStat) ? Math.max(0, value - reduction) : value;
    const r = (effectiveValue / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    const r = radius * 1.15;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate grid hexagons
  const gridPolygons = [20, 40, 60, 80, 100].map(level => {
    return categories.map((_, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
        const r = (level / 100) * radius;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  // Generate data polygon
  const dataPoints = categories.map((_, i) => {
    const coords = getCoordinates(i, stats[categories[i]]);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="relative flex justify-center items-center w-full max-w-sm mx-auto">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        {/* Background Grids */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="transparent"
            stroke="rgba(63, 63, 70, 0.4)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {categories.map((_, i) => {
          const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(63, 63, 70, 0.4)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Area */}
        <polygon
          points={dataPoints}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366f1"
          strokeWidth="3"
          className="transition-all duration-700 ease-out"
        />

        {/* Data Points */}
        {categories.map((_, i) => {
          const coords = getCoordinates(i, stats[categories[i]]);
          const isTarget = categories[i] === targetStat;
          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r={isTarget ? 5 : 4}
              fill={isTarget ? "#ef4444" : "#818cf8"}
              className={`${isTarget ? 'animate-pulse' : ''} transition-all duration-700`}
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat, i) => {
          const coords = getLabelCoordinates(i);
          const val = (cat === targetStat) ? Math.max(0, stats[cat] - reduction) : stats[cat];
          return (
            <text
              key={i}
              x={coords.x}
              y={coords.y}
              fill={cat === targetStat ? "#ef4444" : "#a1a1aa"}
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="uppercase tracking-widest font-mono"
            >
              {cat.substring(0, 3)} {val}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
