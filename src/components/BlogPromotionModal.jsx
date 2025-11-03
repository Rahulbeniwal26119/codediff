import { useState, useEffect } from 'react';
import { useCode } from '../context/CodeContext';

export default function BlogPromotionModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { isDarkTheme } = useCode();

    useEffect(() => {
        // Check if user has already seen the modal today
        const lastShown = localStorage.getItem('blogModalLastShown');
        const today = new Date().toDateString();
        
        // Only show modal if user hasn't seen it today and after significant delay
        if (lastShown !== today) {
            // Show modal only after page is completely stable to prevent performance impact
            const timer = setTimeout(() => {
                // Check if page is idle and performance metrics are good
                if (document.readyState === 'complete') {
                    // Additional check for page stability
                    requestIdleCallback(() => {
                        console.log('Showing blog modal');
                        setIsVisible(true);
                    }, { timeout: 10000 });
                } else {
                    // Wait for page to be fully loaded
                    window.addEventListener('load', () => {
                        setTimeout(() => {
                            requestIdleCallback(() => {
                                setIsVisible(true);
                            }, { timeout: 10000 });
                        }, 3000);
                    }, { once: true });
                }
            }, 10000); // Increased delay to 10 seconds to ensure page is stable
            
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
        }, 300);
        
        // Remember that user has seen the modal today
        localStorage.setItem('blogModalLastShown', new Date().toDateString());
    };

    const handleVisitBlog = () => {
        window.open('https://takovibe.com/blog', '_blank');
        handleClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={handleBackdropClick}
        >
            <div 
                className={`relative max-w-lg w-full transform transition-all duration-300 ${
                    isClosing ? 'blog-modal-exit' : 'blog-modal-enter'
                } ${
                    isDarkTheme 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                } rounded-2xl border shadow-2xl overflow-hidden`}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    type="button"
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:rotate-90 z-40 cursor-pointer ${
                        isDarkTheme 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{ pointerEvents: 'auto' }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal content */}
                <div className="p-8">
                    {/* Header with icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            🎉 My Blog is Live!
                        </h2>
                        <p className={`text-lg ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Discover amazing content on TakoVibe
                        </p>
                    </div>

                    {/* Blog preview */}
                    <div className={`rounded-xl p-4 mb-6 border ${
                        isDarkTheme 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                                    TakoVibe Blogs
                                </h3>
                                <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Tech insights & tutorials
                                </p>
                            </div>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Explore in-depth articles about web development, programming tips, and the latest tech trends. 
                            Join our growing community of developers and tech enthusiasts!
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 relative z-20">
                        <button
                            onClick={handleVisitBlog}
                            type="button"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer relative z-30"
                            style={{ pointerEvents: 'auto' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Blog
                        </button>
                        <button
                            onClick={handleClose}
                            type="button"
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer relative z-30 ${
                                isDarkTheme
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                            style={{ pointerEvents: 'auto' }}
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Bottom note */}
                    <p className={`text-xs text-center mt-4 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                        This message appears once per day
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 sparkle-animation"></div>
                <div className="absolute -top-1 -right-3 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-40 sparkle-animation" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-50 sparkle-animation" style={{ animationDelay: '1s' }}></div>
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                                         radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), 
                                         radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)` 
                    }}></div>
                </div>
            </div>
        </div>
    );
}
