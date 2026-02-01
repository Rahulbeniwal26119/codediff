import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useCallback, lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useCode } from '../context/CodeContext';
import LoadingSpinner from './LoadingSpinner';
import { getMonacoLanguageId } from '../utils/monacoLanguages';
import { createOverlayToolbar } from '../utils/editorWidgets';
import ExecutionResultModal from './ExecutionResultModal';
import { formatCode, canFormatLanguage } from '../utils/codeFormatter';

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
        isSideBySide,
        isFullscreen
    } = useCode();

    const { diffId } = useParams();
    const [executionResult, setExecutionResult] = useState(null);
    const [executionType, setExecutionType] = useState(null); // 'success' | 'error'
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Drag & Drop Handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve({
                    content: event.target.result,
                    name: file.name
                });
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
        };

        try {
            if (files.length >= 2) {
                // Handle 2 files: Left = First, Right = Second
                const [file1, file2] = await Promise.all([
                    readFile(files[0]),
                    readFile(files[1])
                ]);

                setLeftContent(file1.content);
                setRightContent(file2.content);
                toast.success(`Loaded ${file1.name} and ${file2.name}`);

                // Try to detect language from extension of first file
                const ext = file1.name.split('.').pop().toLowerCase();
                // Simple mapping (could be improved)
                if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) setSelectedLanguage('javascript');
                else if (['py'].includes(ext)) setSelectedLanguage('python');
                else if (['json'].includes(ext)) setSelectedLanguage('json');
                else if (['html'].includes(ext)) setSelectedLanguage('html');
                else if (['css'].includes(ext)) setSelectedLanguage('css');

            } else {
                // Handle 1 file: Update Right (Modified)
                const file = await readFile(files[0]);
                setRightContent(file.content);
                toast.success(`Loaded ${file.name} into Modified view`);
            }
        } catch (error) {
            console.error('Error reading files:', error);
            toast.error('Failed to read files');
        }
    }, [setLeftContent, setRightContent, setSelectedLanguage]);

    // Memoize editor options to prevent unnecessary re-renders and layout shifts
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false }, // Disable minimap for better performance
        fontSize: 16, // Larger, more comfortable font size for developers
        lineHeight: 26, // Better line spacing for readability
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Ubuntu Mono', monospace",
        fontLigatures: true, // Enable font ligatures for better code readability
        lineNumbers: 'on',
        folding: true, // Enable folding for better code navigation
        renderIndentGuides: true, // Show indent guides for better code structure
        formatOnPaste: false,
        formatOnType: false,
        tabSize: 2,
        automaticLayout: true, // Enable automatic layout to handle resizing naturally
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 12, bottom: 12, left: 8, right: 8 }, // More padding for comfort
        suggest: {
            snippets: 'off',
        },
        bracketPairColorization: { enabled: true }, // Enable bracket colorization for better code reading
        guides: {
            bracketPairs: true, // Show bracket pair guides
            indentation: true // Show indentation guides
        },
        hover: { enabled: true }, // Enable hover for better code understanding
        parameterHints: { enabled: true },
        quickSuggestions: false,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
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
        renderSideBySide: isSideBySide && window.innerWidth >= 768, // Force inline on mobile
        ignoreTrimWhitespace: true,
        renderOverviewRuler: false,
        diffWordWrap: window.innerWidth < 768 ? 'on' : 'off',
        enableSplitViewResizing: isSideBySide, // Only enable resizing in split view
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


    const handleExecute = useCallback((code, lang) => {
        if (!code) return;

        if (lang === 'javascript') {
            const logs = [];
            const mockConsole = {
                log: (...args) => logs.push(args.join(' ')),
                error: (...args) => logs.push('ERROR: ' + args.join(' ')),
                warn: (...args) => logs.push('WARN: ' + args.join(' ')),
            };

            try {
                // eslint-disable-next-line no-new-func
                new Function('console', code)(mockConsole);
                setExecutionResult(logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)');
                setExecutionType('success');
            } catch (e) {
                setExecutionResult(e.toString());
                setExecutionType('error');
            }
        } else if (lang === 'json') {
            try {
                JSON.parse(code);
                setExecutionResult('Valid JSON');
                setExecutionType('success');
            } catch (e) {
                setExecutionResult(e.message);
                setExecutionType('error');
            }
        }
        setIsExecutionModalOpen(true);
        setIsExecutionModalOpen(true);
    }, []);

    const handleFormat = useCallback(async (code, lang, setContent) => {
        try {
            const formatted = await formatCode(code, lang);
            setContent(formatted);
            toast.success('Formatted!');
        } catch (e) {
            toast.error('Format failed: ' + e.message);
        }
    }, []);


    const [editorInstance, setEditorInstance] = useState(null);

    // Optimized editor mount handler
    const handleEditorMount = useCallback((editor) => {
        setEditorInstance(editor);

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

    // Trigger layout when view mode changes - Safe now that we don't force remount
    useEffect(() => {
        if (editorInstance) {
            setTimeout(() => {
                editorInstance.layout();
            }, 50);
        }
    }, [isSideBySide, editorInstance]);

    // Manage Widgets based on Language
    useEffect(() => {
        if (!editorInstance) return;

        // Hide widgets in inline view
        if (!isSideBySide) {
            const originalEditor = editorInstance.getOriginalEditor();
            const modifiedEditor = editorInstance.getModifiedEditor();
            originalEditor.removeOverlayWidget({ getId: () => 'left-toolbar-widget' });
            modifiedEditor.removeOverlayWidget({ getId: () => 'right-toolbar-widget' });
            return;
        }

        const originalEditor = editorInstance.getOriginalEditor();
        const modifiedEditor = editorInstance.getModifiedEditor();

        // Helper to remove widgets
        const removeWidgets = () => {
            originalEditor.removeOverlayWidget({ getId: () => 'left-toolbar-widget' });
            modifiedEditor.removeOverlayWidget({ getId: () => 'right-toolbar-widget' });
        };

        // Remove existing first
        removeWidgets();

        const getButtons = (editor, setContent) => {
            const buttons = [];

            // Format Button - Purple (Primary brand color)
            if (canFormatLanguage(selectedLanguage)) {
                buttons.push({
                    label: 'Format',
                    icon: '✨',
                    color: 'purple',
                    onClick: () => handleFormat(editor.getValue(), selectedLanguage, setContent)
                });
            }

            // Execute/Validate Button
            if (selectedLanguage === 'javascript' || selectedLanguage === 'json') {
                const isJS = selectedLanguage === 'javascript';
                buttons.push({
                    label: isJS ? 'Execute' : 'Validate',
                    icon: isJS ? '▶' : '✓',
                    color: isJS ? 'emerald' : 'sky', // Emerald for execute, Sky for validate
                    onClick: () => handleExecute(editor.getValue(), selectedLanguage)
                });
            }

            return buttons;
        };

        const leftButtons = getButtons(originalEditor, setLeftContent);
        const rightButtons = getButtons(modifiedEditor, setRightContent);

        if (leftButtons.length > 0) {
            const leftWidget = createOverlayToolbar(originalEditor, 'left-toolbar-widget', leftButtons);
            originalEditor.addOverlayWidget(leftWidget);
        }

        if (rightButtons.length > 0) {
            const rightWidget = createOverlayToolbar(modifiedEditor, 'right-toolbar-widget', rightButtons);
            modifiedEditor.addOverlayWidget(rightWidget);
        }

        // Cleanup on unmount or change
        return () => {
            removeWidgets();
        };
    }, [editorInstance, selectedLanguage, handleExecute, handleFormat, setLeftContent, setRightContent, isSideBySide]);

    return (
        <div
            className={`
                code-editor-main absolute inset-0 flex flex-col
                ${isFullscreen ? 'fullscreen-diff' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="main"
            aria-label="Code Diff Editor"
            style={{
                contain: 'layout style'
            }}
        >
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

            {/* Drag & Drop Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-primary-500/20 backdrop-blur-sm border-4 border-primary-500 border-dashed rounded-lg m-4"
                    >
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl transform scale-110">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Drop files here
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Drop one file to update "Modified" <br />
                                        Drop two files to update both
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ExecutionResultModal
                isOpen={isExecutionModalOpen}
                onClose={() => setIsExecutionModalOpen(false)}
                result={executionResult}
                type={executionType}
            />
        </div>
    );
}