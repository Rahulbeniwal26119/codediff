import { Toaster } from 'react-hot-toast';
import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import BlogPromotionModal from './components/BlogPromotionModal';
import { CodeProvider, useCode } from './context/CodeContext';

function App() {
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
        <CodeProvider>
            <AppContent />
        </CodeProvider>
    );
}

function AppContent() {
    const { isDarkTheme } = useCode();

    return (
        <div className={`h-screen flex flex-col ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
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
                    },
                }}
            />

            <Header />
            <div className="flex-1 min-h-0">
                <CodeEditor />
            </div>
            
            {/* Blog promotion modal */}
            <BlogPromotionModal />
        </div>
    );
}

export default App;
