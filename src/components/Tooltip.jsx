import { useState } from 'react';

export default function Tooltip({ children, content, disabled }) {
    const [isVisible, setIsVisible] = useState(false);
    
    // If disabled is true or content is empty, don't show tooltip
    if (disabled || !content) {
        return children;
    }
    
    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            
            {isVisible && content && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 text-sm border border-gray-600 bg-gray-800
                text-white rounded shadow-lg whitespace-nowrap z-50">
                    {content}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                </div>
            )}
        </div>
    );
} 