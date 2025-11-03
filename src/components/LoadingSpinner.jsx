import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', message = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8', 
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    return (
        <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
            <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
            {message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;