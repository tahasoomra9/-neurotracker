import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-brand', 
  size = 'md',
  showPercentage = false,
  animated = false
}) => {
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  const getProgressColor = () => {
    if (color !== 'bg-brand') return color;
    
    // Dynamic color based on progress
    if (safeProgress >= 80) return 'bg-success';
    if (safeProgress >= 60) return 'bg-brand';
    if (safeProgress >= 30) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-muted rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`${getProgressColor()} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{Math.round(safeProgress)}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;