import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'magic';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '',
  disabled,
  ...props 
}) => {
  
  const baseStyles = "px-6 py-2 rounded-lg font-serif font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-stone-800 text-parchment border-2 border-stone-600 hover:bg-stone-900 hover:border-stone-400 shadow-lg",
    secondary: "bg-transparent text-stone-800 border-2 border-stone-800 hover:bg-stone-800 hover:text-parchment",
    magic: "bg-purple-900 text-yellow-400 border-2 border-yellow-500 hover:bg-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Casting...
        </span>
      ) : children}
    </button>
  );
};