import React, { useState } from 'react';

export interface BarComparisonItem {
  name: string;
  value1: number; // e.g. assigned
  value2?: number; // e.g. max
  label1?: string;
  label2?: string;
  color1?: string;
  color2?: string;
}

export const ComparisonBarChart: React.FC<{
  data: BarComparisonItem[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.value1, d.value2 || 0)),
    20
  );

  return (
    <div className="w-full space-y-3 font-sans">
      <div className="flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800" style={{ height }}>
        {data.map((item, idx) => {
          const pct1 = Math.round((item.value1 / maxValue) * 100);
          const pct2 = item.value2 ? Math.round((item.value2 / maxValue) * 100) : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] whitespace-nowrap shadow-xl font-mono animate-in fade-in zoom-in-95 pointer-events-none">
                  <div className="font-bold">{item.name}</div>
                  <div>
                    {item.label1 || 'Value'}: {item.value1} hrs
                    {item.value2 !== undefined && ` / Max: ${item.value2} hrs`}
                  </div>
                </div>
              )}

              {/* Bars side by side or stacked */}
              <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                {/* Bar 1 (Assigned) */}
                <div
                  className="w-1/2 rounded-t-md transition-all duration-300 relative shadow-2xs"
                  style={{
                    height: `${pct1}%`,
                    backgroundColor: item.color1 || '#059669',
                  }}
                >
                  {isHovered && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#059669] dark:text-[#80ED99]">
                      {item.value1}
                    </span>
                  )}
                </div>

                {/* Bar 2 (Max Limit) - Bulbasaur Pale Mint / Jungle Tint instead of dark slate-700 */}
                {item.value2 !== undefined && (
                  <div
                    className="w-1/2 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${pct2}%`,
                      backgroundColor: item.color2 || '#2A9D8F',
                    }}
                  />
                )}
              </div>

              {/* X Label */}
              <span className="text-[10px] text-[#3D6456] dark:text-[#A7F3D0] truncate max-w-[60px] text-center mt-2 group-hover:text-[#133E35] dark:group-hover:text-white group-hover:font-bold transition-colors">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-[#3D6456] dark:text-[#A7F3D0]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#059669] inline-block" />
          <span>Assigned Load (hrs)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#2A9D8F] inline-block" />
          <span>Max Allowed Quota</span>
        </div>
      </div>
    </div>
  );
};

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
}> = ({ data, size = 160, centerLabel = 'Total', centerValue }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;

  // Compute SVG arc segments
  let cumulativeAngle = 0;
  const radius = 55;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center space-y-3 font-sans">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {data.map((slice, idx) => {
            const fraction = slice.value / total;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += fraction;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-none">
            {centerValue !== undefined ? centerValue : total}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{d.name}</span>
            <span className="text-slate-400 font-mono">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
