import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'bg-brand' }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;