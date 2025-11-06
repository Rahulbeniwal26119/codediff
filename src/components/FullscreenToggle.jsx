import { useCode } from '../context/CodeContext';

export default function FullscreenToggle() {
    const { isFullscreen, setIsFullscreen, isDarkTheme } = useCode();

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <button
            onClick={toggleFullscreen}
            className={`
                relative p-2 rounded-lg transition-all duration-200
                ${isDarkTheme 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }
                ${isFullscreen ? 'ring-2 ring-blue-500' : ''}
                group
            `}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F11)'}
            aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
        >
            {isFullscreen ? (
                // Exit fullscreen icon (minimize arrows)
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ) : (
                // Enter fullscreen icon (expand arrows)
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>
    );
}