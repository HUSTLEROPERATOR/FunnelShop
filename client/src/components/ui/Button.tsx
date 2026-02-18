import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all border';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md disabled:bg-blue-400 disabled:border-blue-400',
    secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md disabled:bg-red-400 disabled:border-red-400',
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
