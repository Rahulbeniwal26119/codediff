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

    // Memoize editor options to prevent unnecessary re-renders and layout shifts
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false }, // Disable minimap for better performance
        fontSize: 14,
        lineHeight: 20,
        lineNumbers: 'on',
        folding: false, // Disable for performance
        renderIndentGuides: false,
        formatOnPaste: false,
        formatOnType: false,
        tabSize: 2,
        automaticLayout: false, // Disable to prevent forced reflows
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 8, bottom: 8 },
        suggest: {
            snippets: 'off',
        },
        bracketPairColorization: { enabled: false },
        guides: {
            bracketPairs: false,
            indentation: false
        },
        hover: { enabled: false },
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
        ignoreTrimWhitespace: true,
        renderOverviewRuler: false,
        diffWordWrap: 'off',
        enableSplitViewResizing: false, // Disable to prevent layout shifts
        contextmenu: false,
        readOnly: false,
        domReadOnly: false,
        // Performance optimizations
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        dimension: { width: 0, height: 500 }, // Fixed height to prevent layout shift
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



    // Optimized editor mount handler with manual resize to prevent forced reflows
    const handleEditorMount = useCallback((editor) => {
        const originalEditor = editor.getOriginalEditor();
        const modifiedEditor = editor.getModifiedEditor();

        // Debounced change handlers
        let leftTimeout, rightTimeout, resizeTimeout;

        // Manual resize handler to prevent forced reflows
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                try {
                    const container = editor.getContainerDomNode();
                    if (container) {
                        const rect = container.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            editor.layout({ width: rect.width, height: rect.height });
                        }
                    }
                } catch (e) {
                    console.warn('Editor resize failed:', e);
                }
            }, 100);
        };

        // Set up resize observer for better performance
        let resizeObserver;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(handleResize);
            const container = editor.getContainerDomNode();
            if (container) {
                resizeObserver.observe(container);
            }
        } else {
            // Fallback to window resize
            window.addEventListener('resize', handleResize, { passive: true });
        }

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

        // Initial layout after mount
        setTimeout(handleResize, 100);

        // Cleanup
        return () => {
            clearTimeout(leftTimeout);
            clearTimeout(rightTimeout);
            clearTimeout(resizeTimeout);
            if (resizeObserver) {
                resizeObserver.disconnect();
            } else {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, [handleLeftContentChange, handleRightContentChange]);

    return (
        <div 
            className="h-full w-full flex flex-col" 
            role="main" 
            aria-label="Code Diff Editor"
            style={{ 
                minHeight: '500px', 
                height: '100%',
                contain: 'layout style'
            }}
        >
            <Suspense fallback={
                <div className="flex items-center justify-center h-full" style={{ minHeight: '500px' }}>
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