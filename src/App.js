import { Toaster } from 'react-hot-toast';
import React, { useEffect, Suspense } from 'react';
import './App.css';
import Header from './components/Header';
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
            if (event.message && event.message.includes('ResizeObserver loop completed')) {
                event.preventDefault();
                return false;
            }
        };

        window.addEventListener('error', handleError);
        
        return () => {
            window.removeEventListener('error', handleError);
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
            ${isFullscreen ? 'fullscreen-diff' : 'h-screen flex flex-col'} 
            ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} 
            transition-colors duration-200
        `}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: isDarkTheme ? '#374151' : '#f9fafb',
                        color: isDarkTheme ? '#f3f4f6' : '#111827',
                        border: `1px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxShadow: isDarkTheme 
                            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                }}
            />

            {!isFullscreen && <Header />}
            <main className={`
                ${isFullscreen ? 'h-screen w-screen' : 'flex-1 min-h-0'}
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
            <Suspense fallback={null}>
                <BlogPromotionModal />
            </Suspense>
        </div>
    );
}

export default App;
