import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

const Input: React.FC<InputProps> = ({ label, prefix, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor={props.name}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted-foreground sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          className={`w-full p-3 rounded-md bg-transparent border border-input focus:ring-2 focus:ring-ring focus:border-ring transition-colors ${prefix ? 'pl-8' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;