import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { useCode } from '../context/CodeContext';
import LoadingSpinner from './LoadingSpinner';
import { getMonacoLanguageId } from '../utils/monacoLanguages';

// Lazy load Monaco Editor for better initial bundle size
const DiffEditor = lazy(() => 
  import('@monaco-editor/react').then(module => ({ default: module.DiffEditor }))
);

const API_URL = process.env.REACT_APP_API_URL;

export default function CodeEditor() {
    const {
        isDarkTheme,
        leftContent,
        rightContent,
        selectedLanguage,
        setLeftContent,
        setRightContent,
        setSelectedLanguage,
        setShowUpdateButton,
        isSideBySide
    } = useCode();

    const { diffId } = useParams();

    // Memoize editor options to prevent unnecessary re-renders
    const editorOptions = useMemo(() => ({
        minimap: { enabled: window.innerWidth > 768, scale: 0.8 }, // Disable on mobile
        fontSize: 14, // Reduced for better performance
        lineHeight: 20,
        lineNumbers: 'on',
        folding: true,
        renderIndentGuides: false, // Disable for performance
        formatOnPaste: false, // Disable for performance
        formatOnType: false,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 8, bottom: 8 }, // Reduced padding
        suggest: {
            snippets: 'off', // Disable for performance
        },
        bracketPairColorization: { enabled: false }, // Disable for performance
        guides: {
            bracketPairs: false,
            indentation: false
        },
        hover: { enabled: false }, // Disable for performance
        parameterHints: { enabled: false },
        quickSuggestions: false,
        scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
        },
        renderValidationDecorations: 'off',
        colorDecorators: false,
        originalEditable: true,
        modifiedEditable: true,
        renderSideBySide: isSideBySide,
        ignoreTrimWhitespace: true, // Better diff performance
        renderOverviewRuler: false, // Disable for performance
        diffWordWrap: 'off',
        enableSplitViewResizing: true,
        contextmenu: false, // Disable context menu for performance
        readOnly: false,
        domReadOnly: false,
    }), [isSideBySide]);

    // Debounced content handlers for better performance
    const handleLeftContentChange = useCallback((newValue) => {
        setLeftContent(newValue);
    }, [setLeftContent]);

    const handleRightContentChange = useCallback((newValue) => {
        setRightContent(newValue);
    }, [setRightContent]);

    // Optimized fetch with AbortController and caching
    useEffect(() => {
        let abortController = new AbortController();
        const fetchData = async () => {
            try {
                // Check cache first
                const cachedData = sessionStorage.getItem(`diff-${diffId}`);
                if (cachedData) {
                    const result = JSON.parse(cachedData);
                    setLeftContent(result.data.code_before);
                    setRightContent(result.data.code_after);
                    setSelectedLanguage(result.data.language);
                    
                    if (localStorage?.access_token && result.data.access_token && 
                        localStorage?.access_token === result.data.access_token) {
                        setShowUpdateButton(true);
                    } else {
                        setShowUpdateButton(false);
                    }
                    return;
                }

                const response = await fetch(`${API_URL}/api/code-diff/${diffId}`, {
                    signal: abortController.signal,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error('Diff not found');
                        setTimeout(() => window.location.href = '/', 2000);
                        return;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                
                // Cache the result
                sessionStorage.setItem(`diff-${diffId}`, JSON.stringify(result));
                
                setLeftContent(result.data.code_before);
                setRightContent(result.data.code_after);
                setSelectedLanguage(result.data.language);

                toast.success('Diff loaded successfully');
                
                if (localStorage?.access_token && result.data.access_token && 
                    localStorage?.access_token === result.data.access_token) {
                    setShowUpdateButton(true);
                } else {
                    setShowUpdateButton(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching data:', error);
                    toast.error('Failed to load diff');
                }
            }
        };

        if (diffId) {
            fetchData();
        }

        return () => {
            abortController.abort();
        };
    }, [diffId, setLeftContent, setRightContent, setSelectedLanguage, setShowUpdateButton]);



    // Optimized editor mount handler
    const handleEditorMount = useCallback((editor) => {
        const originalEditor = editor.getOriginalEditor();
        const modifiedEditor = editor.getModifiedEditor();

        // Debounced change handlers
        let leftTimeout, rightTimeout;

        originalEditor.onDidChangeModelContent(() => {
            clearTimeout(leftTimeout);
            leftTimeout = setTimeout(() => {
                handleLeftContentChange(originalEditor.getValue());
            }, 300); // 300ms debounce
        });

        modifiedEditor.onDidChangeModelContent(() => {
            clearTimeout(rightTimeout);
            rightTimeout = setTimeout(() => {
                handleRightContentChange(modifiedEditor.getValue());
            }, 300); // 300ms debounce
        });

        // Cleanup
        return () => {
            clearTimeout(leftTimeout);
            clearTimeout(rightTimeout);
        };
    }, [handleLeftContentChange, handleRightContentChange]);

    return (
        <div className="h-full w-full flex flex-col" role="main" aria-label="Code Diff Editor">
            <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinner 
                        size="lg" 
                        message="Loading Monaco Editor..."
                        className="p-8"
                    />
                </div>
            }>
                <DiffEditor
                    height="100%"
                    original={leftContent}
                    modified={rightContent}
                    language={getMonacoLanguageId(selectedLanguage)}
                    theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                    options={editorOptions}
                    loading={null} // Handle loading with Suspense
                    onMount={handleEditorMount}
                    onError={(error) => {
                        console.error('Editor error:', error);
                        toast.error('Editor failed to load');
                    }}
                />
            </Suspense>
        </div>
    );
}