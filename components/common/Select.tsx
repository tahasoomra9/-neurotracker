import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor={props.name}>
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full p-3 rounded-md bg-input text-foreground border border-input focus:ring-2 focus:ring-ring focus:border-ring transition-colors appearance-none"
          {...props}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default Select;