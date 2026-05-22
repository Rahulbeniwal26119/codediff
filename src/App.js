import { Toaster } from 'react-hot-toast';
import React, { useEffect, Suspense } from 'react';
import './App.css';
import CodeEditor from './components/CodeEditor';
import BlogPromotionModal from './components/BlogPromotionModal';
import ErrorBoundary from './components/ErrorBoundary';
import { CodeProvider, useCode } from './context/CodeContext';

// Lazy load SEO utilities to improve initial load time
const seoUtils = import('./utils/seoManager');

function App({ language }) {
    useEffect(() => {
        // Suppress ResizeObserver errors
        const handleError = (event) => {
            const message = event.message || '';
            if (
                message === 'Script error.'
                || message.includes('ResizeObserver loop completed')
                || message.includes('ResizeObserver loop limit exceeded')
            ) {
                event.preventDefault();
                return false;
            }
        };

        window.addEventListener('error', handleError, true);
        
        return () => {
            window.removeEventListener('error', handleError, true);
        };
    }, []);

    return (
        <ErrorBoundary>
            <CodeProvider>
                <AppContent language={language} />
            </CodeProvider>
        </ErrorBoundary>
    );
}

function AppContent({ language }) {
    const { isDarkTheme, setSelectedLanguage, isFullscreen, setIsFullscreen } = useCode();

    useEffect(() => {
        // Async SEO and analytics setup
        const initializeSEO = async () => {
            try {
                const { updateSEOForLanguage, trackPageView } = await seoUtils;
                
                // Set language if provided from route
                if (language) {
                    setSelectedLanguage(language);
                    updateSEOForLanguage(language);
                }
                
                // Track page view for analytics
                trackPageView();
            } catch (error) {
                console.warn('SEO utilities failed to load:', error);
                // Fallback: still set language if provided
                if (language) {
                    setSelectedLanguage(language);
                }
            }
        };

        initializeSEO();
    }, [language, setSelectedLanguage]);

    // Handle keyboard shortcuts for fullscreen
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'F11') {
                event.preventDefault();
                setIsFullscreen(!isFullscreen);
            } else if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, setIsFullscreen]);

    return (
        <div className={`
            h-screen flex flex-col
            ${isFullscreen ? 'fullscreen-diff bg-[#080604]' : ''} 
            ${!isFullscreen && (isDarkTheme ? 'bg-[#080604]' : 'bg-[#f4eee8]')} 
            transition-colors duration-200
        `}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: isDarkTheme ? 'rgba(16, 13, 11, 0.96)' : 'rgba(255, 250, 246, 0.96)',
                        color: isDarkTheme ? '#fff9f2' : '#17120f',
                        border: `1px solid ${isDarkTheme ? '#3a2a20' : '#ead8ca'}`,
                        borderRadius: '14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        lineHeight: '20px',
                        padding: '10px 12px',
                        boxShadow: isDarkTheme
                            ? '0 18px 55px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
                            : '0 18px 55px rgba(80, 45, 18, 0.14)',
                        backdropFilter: 'blur(14px)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#45d483',
                            secondary: '#08120c',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff9f2',
                        },
                    },
                }}
            />

            <main className={`
                ${isFullscreen ? 'fullscreen-main h-screen w-screen flex-1 min-h-0' : 'flex-1 min-h-0'}
            `} role="main" aria-label="Code diff editor">
                <Suspense 
                    fallback={
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Loading code editor...
                                </p>
                            </div>
                        </div>
                    }
                >
                    <CodeEditor />
                </Suspense>
            </main>
            
            {/* Blog promotion modal */}
            {!isFullscreen && (
                <Suspense fallback={null}>
                    <BlogPromotionModal />
                </Suspense>
            )}
        </div>
    );
}

export default App;
