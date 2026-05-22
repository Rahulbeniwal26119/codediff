import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useCallback, lazy, Suspense, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaArrowRight,
    FaCheckCircle,
    FaCompress,
    FaCodeBranch,
    FaColumns,
    FaExpand,
    FaFileUpload,
    FaListUl,
} from 'react-icons/fa';
import { useCode } from '../context/CodeContext';
import LoadingSpinner from './LoadingSpinner';
import { getLanguageDisplayName, getMonacoLanguageId } from '../utils/monacoLanguages';
import ExecutionResultModal from './ExecutionResultModal';
import PatchWorkbench from './PatchWorkbench';
import Share from './Share';
import { formatCode } from '../utils/codeFormatter';
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
        isSideBySide,
        setIsSideBySide,
        isFullscreen,
        setIsFullscreen,
        supportedLanguages,
        handleLanguageChange,
        handleFileUpload,
    } = useCode();

    const { diffId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [executionResult, setExecutionResult] = useState(null);
    const [executionType, setExecutionType] = useState(null); // 'success' | 'error'
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
    const [activeEditorSide, setActiveEditorSide] = useState('after');
    const [semanticFilter, setSemanticFilter] = useState('all');
    const [semanticModalFilter, setSemanticModalFilter] = useState(null);
    const [workbenchMode, setWorkbenchMode] = useState(location.pathname === '/patch' ? 'patch' : 'compare');
    const patchSourceFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('source') || '';
    }, [location.search]);

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

    const editorViewStateRef = useRef({
        original: null,
        modified: null,
        focusedSide: null,
        shouldRestore: false,
    });

    // Debounced content handlers for better performance
    const handleLeftContentChange = useCallback((newValue) => {
        setLeftContent((currentValue) => currentValue === newValue ? currentValue : newValue);
    }, [setLeftContent]);

    const handleRightContentChange = useCallback((newValue) => {
        setRightContent((currentValue) => currentValue === newValue ? currentValue : newValue);
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
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching data:', error);
                    toast.error('Failed to load diff');
                }
            }
        };

        if (diffId && location.pathname !== '/patch') {
            fetchData();
        }

        return () => {
            abortController.abort();
        };
    }, [diffId, location.pathname, setLeftContent, setRightContent, setSelectedLanguage]);


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

    useEffect(() => {
        if (workbenchMode !== 'compare' || isFullscreen) {
            setEditorInstance(null);
        }
    }, [workbenchMode, isFullscreen]);

    // Optimized editor mount handler
    const handleEditorMount = useCallback((editor) => {
        setEditorInstance(editor);
        
        const originalEditor = editor.getOriginalEditor();
        const modifiedEditor = editor.getModifiedEditor();

        // Debounced change handlers
        let leftTimeout, rightTimeout;

        const saveViewStateForReactSync = () => {
            editorViewStateRef.current = {
                original: originalEditor.saveViewState(),
                modified: modifiedEditor.saveViewState(),
                focusedSide: originalEditor.hasTextFocus()
                    ? 'original'
                    : modifiedEditor.hasTextFocus()
                        ? 'modified'
                        : null,
                shouldRestore: true,
            };
        };

        originalEditor.onDidChangeModelContent(() => {
            clearTimeout(leftTimeout);
            leftTimeout = setTimeout(() => {
                saveViewStateForReactSync();
                handleLeftContentChange(originalEditor.getValue());
            }, 650);
        });

        modifiedEditor.onDidChangeModelContent(() => {
            clearTimeout(rightTimeout);
            rightTimeout = setTimeout(() => {
                saveViewStateForReactSync();
                handleRightContentChange(modifiedEditor.getValue());
            }, 650);
        });

        // Cleanup
        return () => {
            clearTimeout(leftTimeout);
            clearTimeout(rightTimeout);
        };
    }, [handleLeftContentChange, handleRightContentChange]);

    useEffect(() => {
        if (!editorInstance || workbenchMode !== 'compare' || isFullscreen) return;
        if (!editorViewStateRef.current.shouldRestore) return;

        const restoreViewState = () => {
            const originalEditor = editorInstance.getOriginalEditor();
            const modifiedEditor = editorInstance.getModifiedEditor();
            const { original, modified, focusedSide } = editorViewStateRef.current;

            if (original) originalEditor.restoreViewState(original);
            if (modified) modifiedEditor.restoreViewState(modified);
            if (focusedSide === 'original') originalEditor.focus();
            if (focusedSide === 'modified') modifiedEditor.focus();

            editorViewStateRef.current.shouldRestore = false;
        };

        const frameId = requestAnimationFrame(restoreViewState);
        const timeoutId = setTimeout(restoreViewState, 0);

        return () => {
            cancelAnimationFrame(frameId);
            clearTimeout(timeoutId);
        };
    }, [leftContent, rightContent, editorInstance, workbenchMode, isFullscreen]);

    // Trigger layout when view mode changes - Safe now that we don't force remount
    useEffect(() => {
        if (editorInstance && workbenchMode === 'compare' && !isFullscreen) {
            setTimeout(() => {
                editorInstance.layout();
            }, 50);
        }
    }, [isSideBySide, editorInstance, workbenchMode, isFullscreen]);

    const uploadButtonClass = cn(
        'flex h-8 min-w-[86px] cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition',
        isDarkTheme
            ? 'border-[#2f241d] bg-[#17120f] text-[#fff3e8] hover:border-[#ff7a1a]/50 hover:bg-[#1f1712]'
            : 'border-[#ead8ca] bg-white text-[#17120f] hover:border-[#ff7a1a]/50'
    );
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

    const openCompareMode = useCallback(() => {
        setWorkbenchMode('compare');
        if (location.pathname === '/patch') {
            navigate('/', { replace: false });
        }
    }, [location.pathname, navigate]);

    const openPatchMode = useCallback(() => {
        setWorkbenchMode('patch');
        if (location.pathname !== '/patch') {
            navigate(`/patch${location.search || ''}`, { replace: false });
        }
    }, [location.pathname, location.search, navigate]);

    const updatePatchSourceUrl = useCallback((nextSource) => {
        const normalizedSource = nextSource.trim();
        const params = new URLSearchParams(location.search);

        if (normalizedSource) {
            params.set('source', normalizedSource);
        } else {
            params.delete('source');
        }

        const nextSearch = params.toString();
        navigate(`/patch${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
    }, [location.search, navigate]);

    useEffect(() => {
        if (location.pathname === '/patch') {
            setWorkbenchMode('patch');
        } else if (workbenchMode === 'patch') {
            setWorkbenchMode('compare');
        }
    }, [location.pathname, workbenchMode]);

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
                'mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 flex-col px-2 py-2 sm:px-3 sm:py-3',
                isFullscreen ? 'editor-focus-enter h-full max-w-none p-0 sm:p-0' : ''
            )}>
                <div className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border shadow-[0_24px_80px_rgba(0,0,0,0.24)]',
                    borderClass,
                    workbenchBg,
                    isFullscreen ? 'h-full rounded-none border-0' : ''
                )}>
                    {!isFullscreen && (
                        <div className={cn(
                            'flex flex-col gap-2 border-b px-3 py-2 lg:flex-row lg:items-center lg:justify-between',
                            borderClass
                        )}>
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#7c3aed] text-sm font-black text-white shadow-[0_12px_30px_rgba(255,122,26,0.22)]">
                                    01
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className={cn('truncate text-lg font-bold tracking-normal', primaryText)}>
                                            {workbenchMode === 'patch' ? 'Patch review' : `${getLanguageDisplayName(selectedLanguage)} diff`}
                                        </h1>
                                        <span className="rounded-full border border-[#ff7a1a]/30 bg-[#ff7a1a]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#ff9a3d]">
                                            {workbenchMode === 'patch' ? 'Beta' : 'Live'}
                                        </span>
                                    </div>
                                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold', mutedText)}>
                                        {workbenchMode === 'patch' ? (
                                            <>
                                                <FaCodeBranch className="h-3 w-3 text-[#ff7a1a]" />
                                                <span>Import patches</span>
                                                <FaArrowRight className="h-3 w-3 text-[#ff7a1a]" />
                                                <span>Review hunks</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#4da3ff]" />
                                                <span>Before</span>
                                                <FaArrowRight className="h-3 w-3 text-[#ff7a1a]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#45d483]" />
                                                <span>After</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                'flex shrink-0 flex-wrap items-center justify-start gap-1.5 rounded-xl border p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:justify-end',
                                borderClass,
                                subtleBg
                            )}>
                                <div className={cn('grid h-9 grid-cols-2 rounded-lg border p-1', borderClass, workbenchBg)}>
                                    <button
                                        type="button"
                                        onClick={openCompareMode}
                                        className={cn(
                                            'rounded-md px-2 text-xs font-black transition',
                                            workbenchMode === 'compare' ? 'bg-[#ff7a1a] text-white shadow-[0_0_18px_rgba(255,122,26,0.22)]' : mutedText
                                        )}
                                    >
                                        Compare
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openPatchMode}
                                        className={cn(
                                            'flex items-center justify-center gap-1.5 rounded-md px-2 text-xs font-black transition',
                                            workbenchMode === 'patch' ? 'bg-[#ff7a1a] text-white shadow-[0_0_18px_rgba(255,122,26,0.22)]' : mutedText
                                        )}
                                    >
                                        <FaCodeBranch className="h-3 w-3" />
                                        Patch
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreen(true)}
                                    className="flex h-9 items-center gap-2 rounded-lg bg-[#ff7a1a] px-3 text-xs font-bold text-white shadow-[0_10px_24px_rgba(255,122,26,0.22)] transition hover:bg-[#ff8b33]"
                                    title="Open editor mode"
                                >
                                    <FaExpand className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Editor</span>
                                </button>
                                {workbenchMode === 'compare' && <Share compact />}
                            </div>
                        </div>
                    )}

                    {!isFullscreen && workbenchMode === 'compare' && (
                        <div className={cn(
                            'grid gap-2 border-b p-2 md:grid-cols-[180px_116px_196px]',
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
                                        <span className={uploadButtonClass}>
                                            <FaFileUpload className="h-3.5 w-3.5" />
                                            Before
                                        </span>
                                    </label>

                                    <input
                                        id="rightFileInput"
                                        type="file"
                                        onChange={(e) => handleFileUpload('right')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="rightFileInput">
                                        <span className={uploadButtonClass}>
                                            <FaFileUpload className="h-3.5 w-3.5" />
                                            After
                                        </span>
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

                                <div className="hidden items-center gap-1.5 lg:flex">
                                    <button
                                        type="button"
                                        onClick={() => handleFormat(
                                            activeEditorSide === 'before' ? leftContent : rightContent,
                                            selectedLanguage,
                                            activeEditorSide === 'before' ? setLeftContent : setRightContent
                                        )}
                                        className={cn(
                                            'flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-bold transition hover:border-[#ff7a1a]/50',
                                            borderClass,
                                            panelBg,
                                            primaryText
                                        )}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a1a]" />
                                        Format
                                    </button>
                                    {(selectedLanguage === 'json' || selectedLanguage === 'javascript') && (
                                        <button
                                            type="button"
                                            onClick={() => handleExecute(
                                                activeEditorSide === 'before' ? leftContent : rightContent,
                                                selectedLanguage
                                            )}
                                            className={cn(
                                                'flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-bold transition hover:border-[#45d483]/50',
                                                borderClass,
                                                panelBg,
                                                primaryText
                                            )}
                                        >
                                            <FaCheckCircle className="h-3 w-3 text-[#45d483]" />
                                            {selectedLanguage === 'javascript' ? 'Run' : 'Validate'}
                                        </button>
                                    )}
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
                                        <span className={uploadButtonClass}>
                                            <FaFileUpload className="h-3 w-3" />
                                            Before
                                        </span>
                                    </label>
                                    <input
                                        id="rightFileInputFocus"
                                        type="file"
                                        onChange={(e) => handleFileUpload('right')(e)}
                                        accept={ACCEPTED_CODE_FILES}
                                        className="hidden"
                                    />
                                    <label htmlFor="rightFileInputFocus">
                                        <span className={uploadButtonClass}>
                                            <FaFileUpload className="h-3 w-3" />
                                            After
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Share compact />
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

                    {!isFullscreen && workbenchMode === 'patch' ? (
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <PatchWorkbench
                                isDarkTheme={isDarkTheme}
                                borderClass={borderClass}
                                panelBg={panelBg}
                                subtleBg={subtleBg}
                                primaryText={primaryText}
                                mutedText={mutedText}
                                initialSourceUrl={patchSourceFromUrl}
                                onSourceUrlChange={updatePatchSourceUrl}
                            />
                        </div>
                    ) : (
                    <div className={cn(
                        'grid min-h-0 flex-1 gap-2 p-2',
                        isFullscreen ? 'h-full p-0' : 'xl:grid-cols-[minmax(0,1fr)_184px]'
                    )}>
                <section className={cn(
                    'flex min-h-[680px] min-w-0 flex-col overflow-hidden rounded-xl border shadow-[0_18px_60px_rgba(0,0,0,0.20)]',
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
                    <aside className="hidden min-h-0 flex-col gap-2 xl:flex">
                        {jsonSemanticSummary ? (
                            jsonSemanticSummary.valid ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setSemanticModalFilter('all')}
                                        className="group rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#ef4444] p-3 text-left text-white shadow-[0_14px_34px_rgba(255,122,26,0.20)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_44px_rgba(255,122,26,0.28)]"
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                                            JSON review
                                        </span>
                                        <span className="mt-2 flex items-end justify-between gap-3">
                                            <span className="font-mono text-4xl font-black leading-none">
                                                {jsonSemanticSummary.counts.total}
                                            </span>
                                            <span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] transition group-hover:bg-white/25">
                                                Details
                                            </span>
                                        </span>
                                    </button>

                                    <div className={cn('rounded-xl border p-2', borderClass, panelBg)}>
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
                                                        'min-h-[56px] rounded-lg border p-2 text-left transition hover:border-[#ff7a1a]/45',
                                                        semanticFilter === type
                                                            ? 'border-[#ff7a1a]/70 bg-[#ff7a1a]/10'
                                                            : isDarkTheme ? 'border-[#2b211b] bg-[#0b0907]' : 'border-[#e5ded8] bg-[#fffaf6]'
                                                    )}
                                                >
                                                    <span className="flex items-center justify-between gap-2">
                                                        <span className={cn('truncate text-[8px] font-black uppercase tracking-[0.13em]', mutedText)}>
                                                            {label}
                                                        </span>
                                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                                    </span>
                                                    <span className={cn('mt-1 block font-mono text-base font-black', primaryText)}>
                                                        {value}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSemanticModalFilter(semanticFilter)}
                                        className={cn(
                                            'rounded-xl border px-3 py-2.5 text-left transition hover:border-[#ff7a1a]/45',
                                            borderClass,
                                            panelBg
                                        )}
                                    >
                                        <span className={cn('text-[9px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                            {semanticFilter === 'all' ? 'Changed paths' : `${semanticFilter} paths`}
                                        </span>
                                        <span className={cn('mt-1 flex items-center justify-between font-mono text-lg font-black', primaryText)}>
                                            {visibleSemanticChanges.length}
                                            <FaArrowRight className="h-3 w-3 text-[#ff7a1a]" />
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="rounded-xl bg-gradient-to-br from-[#ef4444] to-[#7f1d1d] p-3 text-white">
                                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">JSON review</p>
                                        <p className="mt-2 text-3xl font-black">!</p>
                                        <p className="mt-1 text-[11px] font-bold text-white/80">Invalid JSON</p>
                                    </div>
                                    {[
                                        ['Before', jsonSemanticSummary.beforeValid ? 'Valid' : 'Invalid', jsonSemanticSummary.beforeValid ? '#45d483' : '#ef4444'],
                                        ['After', jsonSemanticSummary.afterValid ? 'Valid' : 'Invalid', jsonSemanticSummary.afterValid ? '#45d483' : '#ef4444'],
                                    ].map(([label, value, color]) => (
                                        <div key={label} className={cn('rounded-xl border p-3', borderClass, panelBg)}>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={cn('text-[9px] font-black uppercase tracking-[0.16em]', mutedText)}>{label}</span>
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                            </div>
                                            <span className={cn('mt-2 block text-sm font-black', primaryText)}>{value}</span>
                                        </div>
                                    ))}
                                </>
                            )
                        ) : (
                            <>
                                <div className="rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#ef4444] p-3 text-white shadow-[0_14px_34px_rgba(255,122,26,0.20)]">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Review</p>
                                    <p className="mt-2 font-mono text-4xl font-black leading-none">{comparisonStats.deltaChars >= 0 ? '+' : ''}{comparisonStats.deltaChars}</p>
                                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/75">Character delta</p>
                                </div>

                                {[
                                    ['Before', comparisonStats.beforeLines, '#4da3ff'],
                                    ['After', comparisonStats.afterLines, '#45d483'],
                                    ['Chars', comparisonStats.afterChars, '#ff7a1a'],
                                ].map(([label, value, color]) => (
                                    <div key={label} className={cn('rounded-xl border p-3', borderClass, panelBg)}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className={cn('text-[9px] font-black uppercase tracking-[0.16em]', mutedText)}>{label}</span>
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                        </div>
                                        <span className={cn('mt-2 block font-mono text-xl font-black', primaryText)}>{value}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </aside>
                )}
                    </div>
                    )}
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
