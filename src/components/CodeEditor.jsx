import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useCallback, lazy, Suspense, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaArrowRight,
    FaCompress,
    FaColumns,
    FaExpand,
    FaFileUpload,
    FaListUl,
} from 'react-icons/fa';
import { useCode } from '../context/CodeContext';
import LoadingSpinner from './LoadingSpinner';
import Controls from './Controls';
import Button from './ui/Button';
import { getLanguageDisplayName, getMonacoLanguageId } from '../utils/monacoLanguages';
import { createOverlayToolbar } from '../utils/editorWidgets';
import ExecutionResultModal from './ExecutionResultModal';
import { formatCode, canFormatLanguage } from '../utils/codeFormatter';
import { getJsonSemanticSummary } from '../utils/jsonSemanticDiff';
import { cn } from '../utils/cn';

// Lazy load Monaco Editor for better initial bundle size
const DiffEditor = lazy(() => 
  import('@monaco-editor/react').then(module => ({ default: module.DiffEditor }))
);
const Editor = lazy(() =>
  import('@monaco-editor/react').then(module => ({ default: module.default }))
);

const API_URL = process.env.REACT_APP_API_URL;
const ACCEPTED_CODE_FILES = '.txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md';

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
        setIsSideBySide,
        isFullscreen,
        setIsFullscreen,
        supportedLanguages,
        handleLanguageChange,
        handleFileUpload,
    } = useCode();

    const { diffId } = useParams();
    const [executionResult, setExecutionResult] = useState(null);
    const [executionType, setExecutionType] = useState(null); // 'success' | 'error'
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
    const [activeEditorSide, setActiveEditorSide] = useState('after');
    const [semanticFilter, setSemanticFilter] = useState('all');
    const [semanticModalFilter, setSemanticModalFilter] = useState(null);

    const comparisonStats = useMemo(() => {
        const getLineCount = (value) => value ? value.split(/\r\n|\r|\n/).length : 0;

        return {
            beforeLines: getLineCount(leftContent),
            afterLines: getLineCount(rightContent),
            beforeChars: leftContent.length,
            afterChars: rightContent.length,
            deltaChars: rightContent.length - leftContent.length,
        };
    }, [leftContent, rightContent]);

    const jsonSemanticSummary = useMemo(() => {
        if (selectedLanguage !== 'json') return null;
        return getJsonSemanticSummary(leftContent, rightContent);
    }, [leftContent, rightContent, selectedLanguage]);

    const visibleSemanticChanges = useMemo(() => {
        if (!jsonSemanticSummary?.valid) return [];
        if (semanticFilter === 'all') return jsonSemanticSummary.changes;
        return jsonSemanticSummary.changes.filter(change => change.type === semanticFilter);
    }, [jsonSemanticSummary, semanticFilter]);

    const modalSemanticChanges = useMemo(() => {
        if (!jsonSemanticSummary?.valid || !semanticModalFilter) return [];
        if (semanticModalFilter === 'all') return jsonSemanticSummary.changes;
        return jsonSemanticSummary.changes.filter(change => change.type === semanticModalFilter);
    }, [jsonSemanticSummary, semanticModalFilter]);

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

    const plainEditorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 16,
        lineHeight: 26,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Ubuntu Mono', monospace",
        fontLigatures: true,
        lineNumbers: 'on',
        folding: true,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 14, bottom: 14, left: 8, right: 8 },
        bracketPairColorization: { enabled: true },
        guides: {
            bracketPairs: true,
            indentation: true
        },
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        smoothScrolling: true,
        scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
        },
        renderOverviewRuler: false,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        contextmenu: true,
    }), []);

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

    const uploadButtonClass = 'flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold';
    const borderClass = isDarkTheme ? 'border-[#2b211b]' : 'border-[#e5ded8]';
    const workbenchBg = isDarkTheme ? 'bg-[#100d0b]' : 'bg-[#fffaf6]';
    const panelBg = isDarkTheme ? 'bg-[#15110e]' : 'bg-white';
    const subtleBg = isDarkTheme ? 'bg-[#0c0a08]' : 'bg-[#f7f3ef]';
    const editorShellBg = isDarkTheme ? 'bg-[#090b10]' : 'bg-[#f8fafc]';
    const primaryText = isDarkTheme ? 'text-[#fff9f2]' : 'text-[#15110e]';
    const mutedText = isDarkTheme ? 'text-[#978c83]' : 'text-[#756a61]';
    const formatSemanticValue = (value) => {
        if (typeof value === 'string') return `"${value}"`;
        if (value === undefined) return 'undefined';
        return JSON.stringify(value);
    };
    const semanticFilters = jsonSemanticSummary?.valid ? [
        ['All', jsonSemanticSummary.counts.total, '#ff7a1a', 'all'],
        ['Added', jsonSemanticSummary.counts.added, '#45d483', 'added'],
        ['Removed', jsonSemanticSummary.counts.removed, '#ef4444', 'removed'],
        ['Changed', jsonSemanticSummary.counts.changed, '#ff7a1a', 'changed'],
        ['Types', jsonSemanticSummary.counts.type, '#8b5cf6', 'type'],
        ['Arrays', jsonSemanticSummary.counts.arrayLength, '#4da3ff', 'arrayLength'],
    ] : [];

    return (
        <div
            className={cn(
                'code-editor-main flex h-full w-full flex-col',
                isFullscreen ? 'fullscreen-diff' : '',
                isDarkTheme ? 'bg-[#080604]' : 'bg-[#f4eee8]'
            )}
            role="main"
            aria-label="Code Diff Editor"
            style={{
                minHeight: '500px',
                height: '100%',
                contain: 'layout style'
            }}
        >
            <div className={cn(
                'mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4',
                isFullscreen ? 'editor-focus-enter h-full max-w-none p-0 sm:p-0' : ''
            )}>
                <div className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border shadow-[0_24px_80px_rgba(0,0,0,0.28)]',
                    borderClass,
                    workbenchBg,
                    isFullscreen ? 'h-full rounded-none border-0' : ''
                )}>
                    {!isFullscreen && (
                        <div className={cn(
                            'flex flex-col gap-3 border-b px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between',
                            borderClass
                        )}>
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#7c3aed] text-sm font-black text-white shadow-[0_12px_30px_rgba(255,122,26,0.22)]">
                                    01
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className={cn('truncate text-lg font-bold tracking-normal', primaryText)}>
                                            {getLanguageDisplayName(selectedLanguage)} diff
                                        </h1>
                                        <span className="rounded-full border border-[#ff7a1a]/30 bg-[#ff7a1a]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#ff9a3d]">
                                            Live
                                        </span>
                                    </div>
                                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold', mutedText)}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#4da3ff]" />
                                        <span>Before</span>
                                        <FaArrowRight className="h-3 w-3 text-[#ff7a1a]" />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#45d483]" />
                                        <span>After</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                'flex shrink-0 flex-wrap items-center justify-start gap-1.5 rounded-xl border p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:justify-end',
                                borderClass,
                                subtleBg
                            )}>
                                <Controls compact />
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreen(true)}
                                    className="flex h-9 items-center gap-2 rounded-lg bg-[#ff7a1a] px-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(255,122,26,0.22)] transition hover:bg-[#ff8b33]"
                                    title="Open editor mode"
                                >
                                    <FaExpand className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Editor</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!isFullscreen && (
                        <div className={cn(
                            'grid gap-2 border-b p-2.5 md:grid-cols-[190px_128px_210px]',
                            borderClass
                        )}>
                            <label className="min-w-0">
                                <span className={cn('mb-1 block text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                    Language
                                </span>
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className={cn(
                                        'h-9 w-full rounded-lg border px-3 text-xs font-bold outline-none transition focus:ring-2 focus:ring-[#ff7a1a]',
                                        borderClass,
                                        subtleBg,
                                        primaryText
                                    )}
                                >
                                    {supportedLanguages.map(lang => (
                                        <option key={lang} value={lang} className={isDarkTheme ? 'bg-[#15110e]' : 'bg-white'}>
                                            {getLanguageDisplayName(lang)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div>
                                <span className={cn('mb-1 block text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                    View
                                </span>
                                <div className={cn('grid h-9 grid-cols-2 rounded-lg border p-1', borderClass, subtleBg)}>
                                    <button
                                        type="button"
                                        onClick={() => setIsSideBySide(true)}
                                        className={cn(
                                            'grid place-items-center rounded-md text-xs font-black transition',
                                            isSideBySide ? 'bg-[#ff7a1a] text-white shadow-[0_0_18px_rgba(255,122,26,0.28)]' : mutedText
                                        )}
                                        title="Split view"
                                    >
                                        <FaColumns className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSideBySide(false)}
                                        className={cn(
                                            'grid place-items-center rounded-md text-xs font-black transition',
                                            !isSideBySide ? 'bg-[#ff7a1a] text-white shadow-[0_0_18px_rgba(255,122,26,0.28)]' : mutedText
                                        )}
                                        title="Inline view"
                                    >
                                        <FaListUl className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <span className={cn('mb-1 block text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                    Import
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        id="leftFileInput"
                                        type="file"
                                        onChange={(e) => handleFileUpload('left')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="leftFileInput">
                                        <Button
                                            as="span"
                                            size="md"
                                            className={cn(uploadButtonClass, 'bg-[#7c3aed] hover:bg-[#6d28d9]')}
                                        >
                                            <FaFileUpload className="h-3.5 w-3.5" />
                                            Before
                                        </Button>
                                    </label>

                                    <input
                                        id="rightFileInput"
                                        type="file"
                                        onChange={(e) => handleFileUpload('right')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="rightFileInput">
                                        <Button
                                            as="span"
                                            size="md"
                                            className={cn(uploadButtonClass, 'bg-[#7c3aed] hover:bg-[#6d28d9]')}
                                        >
                                            <FaFileUpload className="h-3.5 w-3.5" />
                                            After
                                        </Button>
                                    </label>
                                </div>
                            </div>

                        </div>
                    )}

                    {isFullscreen && (
                        <div className={cn(
                            'flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2',
                            borderClass,
                            workbenchBg
                        )}>
                            <div className="flex min-w-0 items-center gap-2">
                                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#ff7a1a] to-[#7c3aed] text-xs font-black text-white">
                                    CD
                                </div>
                                <div className="hidden min-w-0 sm:block">
                                    <div className={cn('truncate text-sm font-bold', primaryText)}>
                                        Editor mode
                                    </div>
                                    <div className={cn('truncate text-[11px] font-semibold', mutedText)}>
                                        Editing {activeEditorSide}
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className={cn(
                                        'hidden h-8 w-36 rounded-lg border px-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-[#ff7a1a] sm:block',
                                        borderClass,
                                        subtleBg,
                                        primaryText
                                    )}
                                >
                                    {supportedLanguages.map(lang => (
                                        <option key={lang} value={lang} className={isDarkTheme ? 'bg-[#15110e]' : 'bg-white'}>
                                            {getLanguageDisplayName(lang)}
                                        </option>
                                    ))}
                                </select>

                                <div className={cn('grid h-8 grid-cols-2 rounded-lg border p-1', borderClass, subtleBg)}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveEditorSide('before')}
                                        className={cn(
                                            'flex min-w-[76px] items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold transition',
                                            activeEditorSide === 'before' ? 'bg-[#ff7a1a] text-white' : mutedText
                                        )}
                                        title="Edit before"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#4da3ff]" />
                                        Before
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveEditorSide('after')}
                                        className={cn(
                                            'flex min-w-[76px] items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold transition',
                                            activeEditorSide === 'after' ? 'bg-[#ff7a1a] text-white' : mutedText
                                        )}
                                        title="Edit after"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#45d483]" />
                                        After
                                    </button>
                                </div>

                                <div className="hidden items-center gap-2 md:flex">
                                    <input
                                        id="leftFileInputFocus"
                                        type="file"
                                        onChange={(e) => handleFileUpload('left')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="leftFileInputFocus">
                                        <Button
                                            as="span"
                                            size="sm"
                                            className="flex h-8 cursor-pointer items-center gap-2 rounded-lg bg-[#7c3aed] px-2.5 text-xs font-bold hover:bg-[#6d28d9]"
                                        >
                                            <FaFileUpload className="h-3 w-3" />
                                            Before
                                        </Button>
                                    </label>
                                    <input
                                        id="rightFileInputFocus"
                                        type="file"
                                        onChange={(e) => handleFileUpload('right')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="rightFileInputFocus">
                                        <Button
                                            as="span"
                                            size="sm"
                                            className="flex h-8 cursor-pointer items-center gap-2 rounded-lg bg-[#7c3aed] px-2.5 text-xs font-bold hover:bg-[#6d28d9]"
                                        >
                                            <FaFileUpload className="h-3 w-3" />
                                            After
                                        </Button>
                                    </label>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <div className="hidden sm:flex">
                                    <Controls compact />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreen(false)}
                                    className="flex h-8 items-center gap-2 rounded-lg bg-[#1a1511] px-3 text-xs font-bold text-[#fff9f2] transition hover:bg-[#241c16]"
                                    title="Exit editor mode"
                                >
                                    <FaCompress className="h-3.5 w-3.5 text-[#ff7a1a]" />
                                    Exit
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={cn(
                        'grid min-h-0 flex-1 gap-3 p-3',
                        isFullscreen ? 'h-full p-0' : 'xl:grid-cols-[minmax(0,1fr)_220px]'
                    )}>
                <section className={cn(
                    'flex min-h-[600px] min-w-0 flex-col overflow-hidden rounded-2xl border shadow-[0_18px_60px_rgba(0,0,0,0.24)]',
                    borderClass,
                    editorShellBg,
                    isFullscreen ? 'h-full min-h-0 rounded-none border-0 shadow-none' : ''
                )}>
                    {!isFullscreen && (
                        <div className={cn(
                            'sticky top-0 z-10 grid grid-cols-2 border-b text-xs font-black uppercase tracking-[0.18em]',
                            borderClass,
                            isDarkTheme ? 'bg-[#14100d]' : 'bg-[#faf7f4]'
                        )}>
                            <div className={cn('flex min-w-0 items-center gap-2 border-r px-4 py-3', borderClass, mutedText)}>
                                <span className="h-2.5 w-2.5 rounded-full bg-[#4da3ff] shadow-[0_0_16px_rgba(77,163,255,0.42)]" />
                                <span className="truncate">Before</span>
                            </div>
                            <div className={cn('flex min-w-0 items-center gap-2 px-4 py-3', mutedText)}>
                                <FaArrowRight className="h-3 w-3 shrink-0 text-[#ff7a1a]" />
                                <span className="h-2.5 w-2.5 rounded-full bg-[#45d483] shadow-[0_0_16px_rgba(69,212,131,0.42)]" />
                                <span className="truncate">After</span>
                            </div>
                        </div>
                    )}

                    <div className="min-h-0 flex-1">
                        <Suspense fallback={
                            <div className="flex h-full items-center justify-center" style={{ minHeight: '500px' }}>
                                <LoadingSpinner
                                    size="lg"
                                    message="Loading Monaco Editor..."
                                    className="p-8"
                                />
                            </div>
                        }>
                            {isFullscreen ? (
                                <Editor
                                    key={`editor-${activeEditorSide}-${selectedLanguage}`}
                                    height="100%"
                                    value={activeEditorSide === 'before' ? leftContent : rightContent}
                                    language={getMonacoLanguageId(selectedLanguage)}
                                    path={`codediff://editor/${activeEditorSide}.${selectedLanguage}`}
                                    theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                                    options={plainEditorOptions}
                                    keepCurrentModel
                                    loading={null}
                                    onChange={(value) => {
                                        if (activeEditorSide === 'before') {
                                            setLeftContent(value || '');
                                        } else {
                                            setRightContent(value || '');
                                        }
                                    }}
                                    onMount={(editor) => {
                                        setTimeout(() => {
                                            editor.layout();
                                            editor.focus();
                                        }, 50);
                                    }}
                                />
                            ) : (
                                <DiffEditor
                                    height="100%"
                                    original={leftContent}
                                    modified={rightContent}
                                    language={getMonacoLanguageId(selectedLanguage)}
                                    originalModelPath={`codediff://diff/before.${selectedLanguage}`}
                                    modifiedModelPath={`codediff://diff/after.${selectedLanguage}`}
                                    keepCurrentOriginalModel
                                    keepCurrentModifiedModel
                                    theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                                    options={editorOptions}
                                    loading={null}
                                    onMount={handleEditorMount}
                                    onError={(error) => {
                                        console.error('Editor error:', error);
                                        toast.error('Editor failed to load');
                                    }}
                                />
                            )}
                        </Suspense>
                    </div>
                </section>

                {!isFullscreen && (
                    <aside className={cn(
                        'hidden min-h-0 flex-col gap-2.5 xl:flex'
                    )}>
                        {jsonSemanticSummary ? (
                            <>
                                <div className={cn(
                                    'rounded-2xl p-3.5 text-white shadow-[0_18px_42px_rgba(255,122,26,0.28)]',
                                    jsonSemanticSummary.valid
                                        ? 'bg-gradient-to-br from-[#ff9a3d] via-[#ff7a1a] to-[#ef4444]'
                                        : 'bg-gradient-to-br from-[#ef4444] to-[#7f1d1d]'
                                )}>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                                        JSON Review
                                    </p>
                                    <p className="mt-2 text-4xl font-black">
                                        {jsonSemanticSummary.valid ? jsonSemanticSummary.counts.total : '!' }
                                    </p>
                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/75">
                                        {jsonSemanticSummary.valid ? 'Semantic changes' : 'Invalid JSON'}
                                    </p>
                                    {jsonSemanticSummary.valid && (
                                        <button
                                            type="button"
                                            onClick={() => setSemanticModalFilter('all')}
                                            className="mt-3 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/25"
                                        >
                                            View details
                                        </button>
                                    )}
                                </div>

                                {jsonSemanticSummary.valid ? (
                                    <>
                                        <div className={cn('rounded-2xl border p-2 shadow-sm', borderClass, panelBg)}>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {semanticFilters.map(([label, value, color, type]) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setSemanticFilter(type);
                                                            setSemanticModalFilter(type);
                                                        }}
                                                        className={cn(
                                                            'rounded-xl border px-2.5 py-2 text-left transition',
                                                            semanticFilter === type
                                                                ? 'border-[#ff7a1a]/70 bg-[#ff7a1a]/10'
                                                                : isDarkTheme ? 'border-[#2b211b] bg-[#0c0a08] hover:border-[#ff7a1a]/40' : 'border-[#e5ded8] bg-[#f7f3ef] hover:border-[#ff7a1a]/40'
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className={cn('truncate text-[9px] font-black uppercase tracking-[0.13em]', mutedText)}>
                                                                {label}
                                                            </span>
                                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                        </div>
                                                        <span className={cn('mt-1 block font-mono text-lg font-black', primaryText)}>
                                                            {value}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={cn('min-h-0 flex-1 rounded-2xl border p-3 shadow-sm', borderClass, panelBg)}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                                    {semanticFilter === 'all' ? 'Changed paths' : `${semanticFilter} paths`}
                                                </span>
                                                <span className={cn('font-mono text-xs font-black', primaryText)}>
                                                    {visibleSemanticChanges.length}
                                                </span>
                                            </div>

                                            <div className={cn(
                                                'mt-3 space-y-2 overflow-y-auto pr-1',
                                                'max-h-[28rem]'
                                            )}>
                                                {visibleSemanticChanges.length === 0 ? (
                                                    <p className={cn('text-xs font-semibold', mutedText)}>
                                                        No changes in this category.
                                                    </p>
                                                ) : (
                                                    visibleSemanticChanges.slice(0, 20).map((change, index) => (
                                                    <div
                                                        key={`${change.type}-${change.path}-${index}`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setSemanticModalFilter(change.type)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' || event.key === ' ') {
                                                                setSemanticModalFilter(change.type);
                                                            }
                                                        }}
                                                        className={cn(
                                                            'cursor-pointer rounded-xl border p-2 transition hover:border-[#ff7a1a]/45',
                                                            isDarkTheme ? 'border-[#2b211b] bg-[#0c0a08]' : 'border-[#e5ded8] bg-[#f7f3ef]'
                                                        )}
                                                    >
                                                            <div className="flex items-center justify-between gap-2">
                                                            <span className="min-w-0 truncate font-mono text-[11px] font-black text-[#ff9a3d]">
                                                                {change.path}
                                                            </span>
                                                                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase', {
                                                                    'bg-[#45d483]/15 text-[#45d483]': change.type === 'added',
                                                                    'bg-[#ef4444]/15 text-[#ef4444]': change.type === 'removed',
                                                                    'bg-[#ff7a1a]/15 text-[#ff9a3d]': change.type === 'changed',
                                                                    'bg-[#8b5cf6]/15 text-[#a78bfa]': change.type === 'type',
                                                                    'bg-[#4da3ff]/15 text-[#4da3ff]': change.type === 'arrayLength',
                                                                })}>
                                                                    {change.type}
                                                                </span>
                                                            </div>
                                                            {(change.type === 'changed' || change.type === 'type' || change.type === 'arrayLength') && (
                                                            <div className="mt-2 grid gap-1 font-mono text-[11px]">
                                                                <span className="truncate text-[#ef9a9a]">
                                                                    - {change.type === 'type' ? change.beforeType : formatSemanticValue(change.before)}
                                                                </span>
                                                                <span className="truncate text-[#8ee6ae]">
                                                                    + {change.type === 'type' ? change.afterType : formatSemanticValue(change.after)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {change.type === 'added' && (
                                                            <p className="mt-2 truncate font-mono text-[11px] text-[#8ee6ae]">
                                                                + {formatSemanticValue(change.after)}
                                                            </p>
                                                        )}
                                                        {change.type === 'removed' && (
                                                            <p className="mt-2 truncate font-mono text-[11px] text-[#ef9a9a]">
                                                                - {formatSemanticValue(change.before)}
                                                            </p>
                                                        )}
                                                        </div>
                                                    ))
                                                )}
                                                {visibleSemanticChanges.length > 20 && (
                                                    <p className={cn('text-[11px] font-semibold', mutedText)}>
                                                        +{visibleSemanticChanges.length - 20} more paths
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    [
                                        ['Before JSON', jsonSemanticSummary.beforeValid ? 'Valid' : 'Invalid', jsonSemanticSummary.beforeValid ? '#45d483' : '#ef4444'],
                                        ['After JSON', jsonSemanticSummary.afterValid ? 'Valid' : 'Invalid', jsonSemanticSummary.afterValid ? '#45d483' : '#ef4444'],
                                    ].map(([label, value, color]) => (
                                        <div key={label} className={cn('rounded-2xl border p-3 shadow-sm', borderClass, panelBg)}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>{label}</span>
                                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                            </div>
                                            <span className={cn('mt-2 block text-sm font-black', primaryText)}>{value}</span>
                                        </div>
                                    ))
                                )}
                            </>
                        ) : (
                            <>
                                <div className="rounded-2xl bg-gradient-to-br from-[#ff9a3d] via-[#ff7a1a] to-[#ef4444] p-3.5 text-white shadow-[0_18px_42px_rgba(255,122,26,0.28)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Review</p>
                                    <p className="mt-2 text-4xl font-black">{comparisonStats.deltaChars >= 0 ? '+' : ''}{comparisonStats.deltaChars}</p>
                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/75">Character delta</p>
                                </div>

                                {[
                                    ['Before lines', comparisonStats.beforeLines, '#4da3ff'],
                                    ['After lines', comparisonStats.afterLines, '#45d483'],
                                    ['Before chars', comparisonStats.beforeChars, '#ff7a1a'],
                                    ['After chars', comparisonStats.afterChars, '#8b5cf6'],
                                ].map(([label, value, color]) => (
                                    <div key={label} className={cn('rounded-2xl border p-3 shadow-sm', borderClass, panelBg)}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>{label}</span>
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                        </div>
                                        <span className={cn('mt-2 block font-mono text-2xl font-black', primaryText)}>{value}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </aside>
                )}
                    </div>
                </div>
            </div>

            <ExecutionResultModal 
                isOpen={isExecutionModalOpen}
                onClose={() => setIsExecutionModalOpen(false)}
                result={executionResult}
                type={executionType}
            />

            {semanticModalFilter && jsonSemanticSummary?.valid && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className={cn(
                        'flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-[0_30px_120px_rgba(0,0,0,0.55)]',
                        borderClass,
                        panelBg
                    )}>
                        <div className={cn('flex items-center justify-between gap-4 border-b px-5 py-4', borderClass)}>
                            <div>
                                <p className={cn('text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                    Semantic details
                                </p>
                                <h2 className={cn('mt-1 text-lg font-black', primaryText)}>
                                    {semanticModalFilter === 'all' ? 'All JSON changes' : `${semanticModalFilter} changes`}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSemanticModalFilter(null)}
                                className={cn(
                                    'grid h-9 w-9 place-items-center rounded-lg border text-lg font-bold transition',
                                    borderClass,
                                    isDarkTheme ? 'text-[#fff9f2] hover:bg-[#211812]' : 'text-[#15110e] hover:bg-[#f7f3ef]'
                                )}
                                aria-label="Close semantic details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {modalSemanticChanges.length === 0 ? (
                                    <p className={cn('text-sm font-semibold', mutedText)}>
                                        No changes in this category.
                                    </p>
                                ) : (
                                    modalSemanticChanges.map((change, index) => (
                                        <div
                                            key={`modal-${change.type}-${change.path}-${index}`}
                                            className={cn(
                                                'rounded-2xl border p-4',
                                                isDarkTheme ? 'border-[#2b211b] bg-[#0c0a08]' : 'border-[#e5ded8] bg-[#f7f3ef]'
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <span className="break-all font-mono text-sm font-black text-[#ff9a3d]">
                                                    {change.path}
                                                </span>
                                                <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]', {
                                                    'bg-[#45d483]/15 text-[#45d483]': change.type === 'added',
                                                    'bg-[#ef4444]/15 text-[#ef4444]': change.type === 'removed',
                                                    'bg-[#ff7a1a]/15 text-[#ff9a3d]': change.type === 'changed',
                                                    'bg-[#8b5cf6]/15 text-[#a78bfa]': change.type === 'type',
                                                    'bg-[#4da3ff]/15 text-[#4da3ff]': change.type === 'arrayLength',
                                                })}>
                                                    {change.type}
                                                </span>
                                            </div>

                                            {(change.type === 'changed' || change.type === 'type' || change.type === 'arrayLength') && (
                                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                    <div className="rounded-xl bg-[#ef4444]/10 p-3">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ef9a9a]">Before</p>
                                                        <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs text-[#ffd1d1]">
                                                            {change.type === 'type' ? change.beforeType : formatSemanticValue(change.before)}
                                                        </pre>
                                                    </div>
                                                    <div className="rounded-xl bg-[#45d483]/10 p-3">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8ee6ae]">After</p>
                                                        <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs text-[#c8f7d8]">
                                                            {change.type === 'type' ? change.afterType : formatSemanticValue(change.after)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}

                                            {change.type === 'added' && (
                                                <div className="mt-4 rounded-xl bg-[#45d483]/10 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8ee6ae]">Added value</p>
                                                    <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs text-[#c8f7d8]">
                                                        {formatSemanticValue(change.after)}
                                                    </pre>
                                                </div>
                                            )}

                                            {change.type === 'removed' && (
                                                <div className="mt-4 rounded-xl bg-[#ef4444]/10 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ef9a9a]">Removed value</p>
                                                    <pre className="mt-2 whitespace-pre-wrap break-all font-mono text-xs text-[#ffd1d1]">
                                                        {formatSemanticValue(change.before)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
