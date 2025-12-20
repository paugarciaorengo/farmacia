import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ElementType;
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  icon: Icon,
  ...props 
}: ButtonProps) {
  
  const baseStyle = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    outline: "border-2 border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 bg-transparent",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50"
  };

  return (
    <button 
      className={clsx(baseStyle, variants[variant], className)} 
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
