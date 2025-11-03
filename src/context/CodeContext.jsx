import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getLanguageTemplate, getSupportedLanguagesWithTemplates } from '../utils/languageTemplates';

const CodeContext = createContext();

export function CodeProvider({ children }) {
    // All supported languages - dynamically loaded from templates
    const supportedLanguages = getSupportedLanguagesWithTemplates();
    
    // State management
    const [leftContent, setLeftContent] = useState('');
    const [rightContent, setRightContent] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('json');
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    
    // Set default view mode based on screen size
    const [isSideBySide, setIsSideBySide] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    // Listen for window resize to adjust view mode
    useEffect(() => {
        let timeoutId;
        
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (window.innerWidth < 768) {
                    setIsSideBySide(false);
                }
            }, 150);
        };

        const safeHandleResize = () => {
            try {
                handleResize();
            } catch (error) {
                if (error.message.includes('ResizeObserver')) {
                    return;
                }
                console.warn('Resize handler error:', error);
            }
        };

        window.addEventListener('resize', safeHandleResize);
        safeHandleResize();

        return () => {
            window.removeEventListener('resize', safeHandleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    // Event handlers
    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setSelectedLanguage(newLanguage);
        loadLanguageTemplate(newLanguage);
    };

    const handleFileUpload = (side) => (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (side === 'left') {
                    setLeftContent(e.target.result);
                } else {
                    setRightContent(e.target.result);
                }
            };
            reader.readAsText(file);
        }
    };

    // Load language templates from centralized utility
    const loadLanguageTemplate = useCallback((language) => {
        const template = getLanguageTemplate(language);
        if (template) {
            setLeftContent(template.left);
            setRightContent(template.right);
        }
        setSelectedLanguage(language);
    }, []);

    // Load default template on initialization
    useEffect(() => {
        loadLanguageTemplate('json');
    }, [loadLanguageTemplate]);

    return (
        <CodeContext.Provider value={{
            leftContent,
            setLeftContent,
            rightContent,
            setRightContent,
            selectedLanguage,
            setSelectedLanguage,
            showUpdateButton,
            setShowUpdateButton,
            isDarkTheme,
            setIsDarkTheme,
            isSideBySide,
            setIsSideBySide,
            supportedLanguages,
            handleLanguageChange,
            handleFileUpload,
            loadLanguageTemplate
        }}>
            {children}
        </CodeContext.Provider>
    );
}

export function useCode() {
    const context = useContext(CodeContext);
    if (!context) {
        throw new Error('useCode must be used within a CodeProvider');
    }
    return context;
} 