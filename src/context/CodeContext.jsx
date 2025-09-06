import { createContext, useContext, useState, useEffect } from 'react';

const CodeContext = createContext();

export function CodeProvider({ children }) {
    const [leftContent, setLeftContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
    const [rightContent, setRightContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
    const [selectedLanguage, setSelectedLanguage] = useState('JSON');
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    
    // Set default view mode based on screen size
    const [isSideBySide, setIsSideBySide] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024; // Default to inline on smaller screens
        }
        return true;
    });

    // Listen for window resize to adjust view mode
    useEffect(() => {
        let timeoutId;
        
        const handleResize = () => {
            // Debounce the resize handler to prevent rapid calls
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (window.innerWidth < 768) {
                    // Force inline mode on mobile devices
                    setIsSideBySide(false);
                }
            }, 150);
        };

        // Wrap in try-catch to handle ResizeObserver errors
        const safeHandleResize = () => {
            try {
                handleResize();
            } catch (error) {
                // Ignore ResizeObserver errors
                if (error.message.includes('ResizeObserver')) {
                    return;
                }
                console.warn('Resize handler error:', error);
            }
        };

        window.addEventListener('resize', safeHandleResize);
        safeHandleResize(); // Check on initial load

        return () => {
            window.removeEventListener('resize', safeHandleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const supportedLanguages = [
        { id: 'json', name: 'JSON' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'typescript', name: 'TypeScript' },
        { id: 'html', name: 'HTML' },
        { id: 'css', name: 'CSS' },
        { id: 'python', name: 'Python' },
        { id: 'java', name: 'Java' },
    ];

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
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
            handleFileUpload
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