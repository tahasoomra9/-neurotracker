import React, { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number, y: number, label: string, value: number } | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">Not enough data to display chart.</p>
      </div>
    );
  }

  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;

  const getY = (value: number) => {
    if (maxValue === minValue) return padding.top + chartHeight / 2;
    const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    return Math.max(padding.top, Math.min(y, height - padding.bottom)); // clamp to chart area
  };

  const linePath = data
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.value)}`)
    .join(' ');
    
  const areaPath = `${linePath} V ${height - padding.bottom} H ${padding.left} Z`;
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;
    const cursorPoint = pt.matrixTransform(screenCTM.inverse());
    
    const index = Math.round(((cursorPoint.x - padding.left) / chartWidth) * (data.length - 1));

    if (index >= 0 && index < data.length) {
      const point = data[index];
      setTooltip({
        x: getX(index),
        y: getY(point.value),
        label: point.label,
        value: point.value
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-labelledby="chart-title"
      >
        <title id="chart-title">Weekly Savings History Chart</title>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <path d={areaPath} fill="url(#areaGradient)" aria-hidden="true" />

        <path d={linePath} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />

        <g className="text-xs" fill="var(--muted-foreground)" aria-hidden="true">
          {data.map((point, i) => {
            if (i === 0 || i === data.length - 1 || (data.length > 10 && i > 0 && i < data.length - 1 && i % Math.floor(data.length / 5) === 0)) {
              return (
                <text key={i} x={getX(i)} y={height - padding.bottom + 15} textAnchor="middle">
                  {point.label}
                </text>
              );
            }
            return null;
          })}
        </g>
        
        {tooltip && (
          <g aria-hidden="true">
            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="var(--brand)" stroke="var(--background)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {tooltip && (
         <div 
            role="tooltip"
            className="absolute p-2 text-xs rounded-md shadow-lg pointer-events-none bg-popover text-popover-foreground border border-border animate-modal-in"
            style={{
              left: `${(tooltip.x / width) * 100}%`,
              top: `${(tooltip.y / height) * 100}%`,
              transform: `translate(-50%, -120%)`,
              whiteSpace: 'nowrap'
            }}
         >
            <p className="font-semibold">{tooltip.label}</p>
            <p>£{tooltip.value.toFixed(2)}</p>
         </div>
      )}
    </div>
  );
};

export default SimpleLineChart;
