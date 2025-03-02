import { createContext, useContext, useState } from 'react';

const CodeContext = createContext();

export function CodeProvider({ children }) {
    const [leftContent, setLeftContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
    const [rightContent, setRightContent] = useState('{\n  "a": "b",\n  "c": "d"\n}');
    const [selectedLanguage, setSelectedLanguage] = useState('JSON');
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [isSideBySide, setIsSideBySide] = useState(true);

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