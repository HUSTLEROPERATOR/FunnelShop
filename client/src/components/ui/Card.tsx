import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const hoverStyles = hover ? 'hover:shadow-md transition-shadow' : '';
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
