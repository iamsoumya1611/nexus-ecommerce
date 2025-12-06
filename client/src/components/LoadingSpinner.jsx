import React from 'react';

const LoadingSpinner = ({ size = 'md', centered = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-t-2 border-b-2',
    md: 'h-12 w-12 border-t-4 border-b-4',
    lg: 'h-16 w-16 border-t-4 border-b-4'
  };

  const containerClasses = centered 
    ? 'flex justify-center items-center' 
    : 'inline-block';

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} rounded-full border-primary-500 animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;