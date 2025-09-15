import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  width = 300,
  height = 150,
  color = 'var(--brand)',
}) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ minWidth: width, height }} className="flex w-full items-center justify-center text-sm text-muted-foreground">
        Not enough data to display chart.
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const svgWidth = '100%';

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const minValue = 0;

  const getX = (index: number, dynamicWidth: number) => padding.left + (index / (data.length - 1)) * (dynamicWidth - padding.left - padding.right);
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;

  const yAxisTicks = 4;
  const tickValues = Array.from({ length: yAxisTicks + 1 }, (_, i) => 
    Math.round(minValue + (i * (maxValue - minValue)) / yAxisTicks)
  );

  return (
    <div className="w-full">
        <svg width={svgWidth} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet">
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
        </defs>
        
        {/* Y Axis Labels and Grid Lines */}
        <g>
            {tickValues.map((value, i) => (
            <g key={i} transform={`translate(0, ${getY(value)})`}>
                <line x1={padding.left - 5} x2={width - padding.right} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                <text x={padding.left - 10} y="4" textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
                 £{value}
                </text>
            </g>
            ))}
        </g>
        
        {/* X Axis Labels */}
        <g>
            {data.map((point, i) => (
                (data.length < 10 || i % Math.ceil(data.length / 5) === 0) && (
                    <text key={i} x={getX(i, width)} y={height - padding.bottom + 20} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                        {point.label}
                    </text>
                )
            ))}
        </g>

        {/* Line and Area */}
        <path 
            d={data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index, width)} ${getY(point.value)}`).join(' ')} 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d={`${data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index, width)} ${getY(point.value)}`).join(' ')} L ${getX(data.length - 1, width)} ${height - padding.bottom} L ${getX(0, width)} ${height - padding.bottom} Z`}
            fill="url(#areaGradient)" 
        />
        
        {/* Data Points */}
        <g>
            {data.map((point, index) => (
                <circle 
                    key={index} 
                    cx={getX(index, width)} 
                    cy={getY(point.value)} 
                    r="3" 
                    fill={color}
                />
            ))}
        </g>
        </svg>
    </div>
  );
};

export default SimpleLineChart;
