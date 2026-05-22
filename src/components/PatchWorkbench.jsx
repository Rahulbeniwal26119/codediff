import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    FaArrowRight,
    FaClipboard,
    FaCodeBranch,
    FaFile,
    FaFileImport,
    FaGithub,
    FaLink,
    FaMinus,
    FaPaste,
    FaPlus,
    FaTimes,
} from 'react-icons/fa';
import { parseUnifiedDiff, SAMPLE_PATCH } from '../utils/unifiedDiffParser';
import { getSyntaxTokens } from '../utils/syntaxHighlight';
import { getMonacoLanguageId } from '../utils/monacoLanguages';
import { cn } from '../utils/cn';

const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const DiffEditor = lazy(() =>
    import('@monaco-editor/react').then(module => ({ default: module.DiffEditor }))
);

const languageByExtension = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    css: 'css',
    html: 'html',
    c: 'cpp',
    h: 'cpp',
    hpp: 'cpp',
    py: 'python',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    go: 'go',
    rs: 'rust',
    java: 'java',
    rb: 'ruby',
    php: 'php',
};

const getPatchLanguage = (path = '') => {
    const extension = path.split('.').pop();
    return languageByExtension[extension] || 'javascript';
};

const buildFileSide = (file, side) => {
    if (!file) return '';

    return file.hunks
        .flatMap((hunk) => hunk.lines)
        .filter((line) => {
            if (line.type === 'meta') return false;
            if (side === 'before') return line.type !== 'added';
            return line.type !== 'removed';
        })
        .map((line) => line.content)
        .join('\n');
};

const getStatusLabel = (status) => {
    const labels = {
        added: 'Added',
        deleted: 'Deleted',
        renamed: 'Renamed',
        modified: 'Modified',
    };

    return labels[status] || 'Modified';
};

const getImportUrl = (value) => {
    const trimmed = value.trim().replace(/^["']|["']$/g, '');
    const markdownMatch = trimmed.match(/\((https:\/\/github\.com\/[^)]+)\)/);
    if (markdownMatch) return markdownMatch[1];

    const urlMatch = trimmed.match(/https:\/\/[^\s)"']+/);
    return urlMatch ? urlMatch[0] : trimmed;
};

const getPatchUrlCandidates = (value) => {
    const rawUrl = getImportUrl(value);
    if (!rawUrl) return [];

    const withoutHash = rawUrl.split('#')[0];
    const withoutQuery = withoutHash.split('?')[0];

    if (/\.(diff|patch)$/.test(withoutQuery)) {
        return [withoutHash];
    }

    const pullMatch = withoutQuery.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/(?:files|commits|checks|conversation))?\/?$/);
    if (pullMatch) {
        return [
            `https://patch-diff.githubusercontent.com/raw/${pullMatch[1]}/${pullMatch[2]}/pull/${pullMatch[3]}.diff`,
            `https://github.com/${pullMatch[1]}/${pullMatch[2]}/pull/${pullMatch[3]}.diff`,
            `https://github.com/${pullMatch[1]}/${pullMatch[2]}/pull/${pullMatch[3]}.patch`,
        ];
    }

    const commitMatch = withoutQuery.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]+)\/?$/i);
    if (commitMatch) {
        return [
            `https://github.com/${commitMatch[1]}/${commitMatch[2]}/commit/${commitMatch[3]}.diff`,
            `https://github.com/${commitMatch[1]}/${commitMatch[2]}/commit/${commitMatch[3]}.patch`,
        ];
    }

    const compareMatch = withoutQuery.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/compare\/(.+)$/);
    if (compareMatch) {
        return [`${withoutQuery}.diff`, `${withoutQuery}.patch`];
    }

    return [rawUrl];
};

const readPatchResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        const data = await response.json();
        return data.patch || data.diff || data.content || data.text || '';
    }

    return response.text();
};

const getPatchImportEndpoint = () => (
    API_URL ? `${API_URL}/api/patch/import` : '/api/patch/import'
);

export default function PatchWorkbench({
    isDarkTheme,
    borderClass,
    panelBg,
    subtleBg,
    primaryText,
    mutedText,
    initialSourceUrl = '',
    onSourceUrlChange,
}) {
    const [patchText, setPatchText] = useState('');
    const [draftPatch, setDraftPatch] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const [fileViewMode, setFileViewMode] = useState('patch');
    const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const [importNotice, setImportNotice] = useState(null);
    const fileInputRef = useRef(null);
    const lastSyncedSourceRef = useRef('');
    const autoImportedSourceRef = useRef('');

    const parsedPatch = useMemo(() => parseUnifiedDiff(patchText), [patchText]);
    const activeFile = parsedPatch.files[selectedFileIndex] || parsedPatch.files[0] || null;
    const activeLanguage = getPatchLanguage(activeFile?.path);
    const normalizedSourceUrl = getImportUrl(sourceUrl);
    const activeBeforeContent = useMemo(() => buildFileSide(activeFile, 'before'), [activeFile]);
    const activeAfterContent = useMemo(() => buildFileSide(activeFile, 'after'), [activeFile]);
    const patchCompareOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 15,
        lineHeight: 24,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, monospace",
        fontLigatures: true,
        readOnly: true,
        originalEditable: false,
        modifiedEditable: false,
        renderSideBySide: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: isWordWrapEnabled ? 'on' : 'off',
        diffWordWrap: isWordWrapEnabled ? 'on' : 'off',
        wrappingIndent: 'same',
        renderOverviewRuler: false,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        folding: true,
        bracketPairColorization: { enabled: true },
        guides: {
            bracketPairs: true,
            indentation: true,
        },
        scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
        },
    }), [isWordWrapEnabled]);

    useEffect(() => {
        if (!initialSourceUrl) return;
        setSourceUrl(initialSourceUrl);
        lastSyncedSourceRef.current = initialSourceUrl;
    }, [initialSourceUrl]);

    const handleSourceUrlChange = (nextValue) => {
        setSourceUrl(nextValue);

        const normalizedValue = getImportUrl(nextValue);
        if (!normalizedValue) {
            lastSyncedSourceRef.current = '';
            onSourceUrlChange?.('');
            return;
        }

        const looksShareable = /^https:\/\/github\.com\//.test(normalizedValue)
            || /^https:\/\/patch-diff\.githubusercontent\.com\//.test(normalizedValue)
            || /\.(diff|patch)(?:$|[?#])/.test(normalizedValue);

        if (!onSourceUrlChange || !looksShareable || lastSyncedSourceRef.current === normalizedValue) return;

        lastSyncedSourceRef.current = normalizedValue;
        onSourceUrlChange(normalizedValue);
    };

    const handleImportPatch = () => {
        const nextPatch = draftPatch.trim();
        const parsed = parseUnifiedDiff(nextPatch);

        if (!parsed.isValid) {
            toast.error('That does not look like a unified diff');
            return;
        }

        setPatchText(nextPatch);
        setSelectedFileIndex(0);
        setFileViewMode('patch');
        setIsImportOpen(false);
    };

    const importPatchText = (nextPatch, successLabel = 'Imported patch', showError = true, showSuccess = false) => {
        const parsed = parseUnifiedDiff(nextPatch.trim());

        if (!parsed.isValid) {
            if (showError) {
                toast.error('That source did not return a unified diff');
            }
            return false;
        }

        setPatchText(nextPatch.trim());
        setDraftPatch(nextPatch.trim());
        setImportNotice(null);
        setSelectedFileIndex(0);
        setFileViewMode('patch');
        setIsImportOpen(false);
        if (showSuccess) {
            toast.success(`${successLabel}: ${parsed.stats.files} changed file${parsed.stats.files === 1 ? '' : 's'}`);
        }
        return true;
    };

    const handleImportFromUrl = async (sourceOverride) => {
        const sourceToImport = typeof sourceOverride === 'string' ? sourceOverride : sourceUrl;
        const urls = getPatchUrlCandidates(sourceToImport);
        if (urls.length === 0) {
            toast.error('Paste a GitHub PR, commit, compare, .diff, or .patch URL');
            return;
        }

        setIsFetchingUrl(true);
        setImportNotice(null);

        try {
            let message = 'The backend proxy could not fetch this patch. Upload a .patch file or paste the raw diff for now.';
            const proxyResponse = await fetch(getPatchImportEndpoint(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: sourceToImport.trim(),
                    candidates: urls,
                }),
            });

            if (proxyResponse.ok) {
                const proxyText = await readPatchResponse(proxyResponse);
                if (importPatchText(proxyText, 'Imported from link', false, false)) return;
                setImportNotice({
                    type: 'error',
                    title: 'Link returned no patch',
                    message: 'The source responded, but it was not a unified diff. Try a .diff/.patch URL or paste the patch.',
                });
                return;
            }

            if (proxyResponse.status === 404 && !API_URL) {
                message = 'The local proxy route is new. Restart npm start so /api/patch/import is available.';
            } else {
                try {
                    const errorData = await proxyResponse.json();
                    message = errorData.error || message;
                } catch {
                    // Keep fallback message.
                }
            }

            setImportNotice({
                type: 'error',
                title: 'Patch link import failed',
                message,
            });
        } catch (error) {
            console.error('Patch URL import failed:', error);
            setImportNotice({
                type: 'error',
                title: 'Patch proxy unavailable',
                message: API_URL
                    ? 'The configured backend is not reachable. Upload a .patch file or paste the raw diff for now.'
                    : 'The patch proxy is not reachable. Restart the CodeDiff server, then try the link again.',
            });
        } finally {
            setIsFetchingUrl(false);
        }
    };

    useEffect(() => {
        const normalizedInitialSource = getImportUrl(initialSourceUrl || '');
        if (!normalizedInitialSource || autoImportedSourceRef.current === normalizedInitialSource || patchText) return;

        autoImportedSourceRef.current = normalizedInitialSource;
        handleImportFromUrl(normalizedInitialSource);
        // This is intentionally keyed to the shared source URL. The import handler reads
        // current component state and reports its own notices.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSourceUrl]);

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            importPatchText(String(reader.result || ''), `Imported ${file.name}`);
            setImportNotice(null);
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleCopyFilePatch = async () => {
        if (!activeFile) return;

        const filePatch = [
            ...activeFile.metadata,
            ...activeFile.hunks.flatMap((hunk) => [
                hunk.header,
                ...hunk.lines.map((line) => {
                    if (line.type === 'added') return `+${line.content}`;
                    if (line.type === 'removed') return `-${line.content}`;
                    if (line.type === 'context') return ` ${line.content}`;
                    return line.content;
                }),
            ]),
        ].filter(Boolean).join('\n');

        try {
            await navigator.clipboard.writeText(filePatch);
            toast.success('File patch copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    const lineClass = (type) => {
        if (type === 'added') return 'bg-[#45d483]/12 text-[#d8ffe4]';
        if (type === 'removed') return 'bg-[#ef4444]/13 text-[#ffd7d7]';
        if (type === 'meta') return isDarkTheme ? 'text-[#7d7168]' : 'text-[#8b7d72]';
        return isDarkTheme ? 'text-[#d8d0c8]' : 'text-[#2a211b]';
    };

    const gutterClass = (type) => {
        if (type === 'added') return 'text-[#45d483]';
        if (type === 'removed') return 'text-[#ff7777]';
        return isDarkTheme ? 'text-[#756a61]' : 'text-[#8b7d72]';
    };

    const syntaxClass = (type) => ({
        keyword: 'text-[#c792ea]',
        string: 'text-[#f0a36b]',
        property: 'text-[#82d4ff]',
        number: 'text-[#f7d774]',
        function: 'text-[#8fd6ff]',
        type: 'text-[#ffd580]',
        decorator: 'text-[#ff9a3d]',
        comment: 'text-[#7d8b7a] italic',
        punctuation: 'text-[#b8afa6]',
        plain: '',
    }[type] || '');

    const renderHighlightedCode = (code) => (
        getSyntaxTokens(code, activeLanguage).map((token, index) => (
            <span key={`${token.type}-${index}`} className={syntaxClass(token.type)}>
                {token.text}
            </span>
        ))
    );

    return (
        <div className="flex h-full min-h-0 flex-col">
            <input
                ref={fileInputRef}
                type="file"
                accept=".patch,.diff,.txt"
                onChange={handleFileUpload}
                className="hidden"
            />

            {!parsedPatch.isValid ? (
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="mx-auto grid max-w-5xl gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <section className={cn('overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.22)]', borderClass, panelBg)}>
                            <div className="border-b border-[#ff7a1a]/15 bg-gradient-to-r from-[#ff7a1a]/12 via-[#ff7a1a]/5 to-[#7c3aed]/10 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ff7a1a] text-white shadow-[0_16px_38px_rgba(255,122,26,0.28)]">
                                        <FaGithub className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff9a3d]">
                                            Import source
                                        </p>
                                        <h2 className={cn('mt-1 text-2xl font-black tracking-normal', primaryText)}>
                                            Review a GitHub patch without cloning the repo
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                                    <div className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3', borderClass, isDarkTheme ? 'bg-[#080604]' : 'bg-white')}>
                                        <FaLink className="h-3.5 w-3.5 shrink-0 text-[#ff9a3d]" />
                                        <input
                                            value={sourceUrl}
                                            onChange={(event) => handleSourceUrlChange(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') handleImportFromUrl();
                                            }}
                                            placeholder="https://github.com/owner/repo/pull/123"
                                            className={cn(
                                                'h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#756a61]',
                                                primaryText
                                            )}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleImportFromUrl}
                                        disabled={isFetchingUrl}
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff7a1a] px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(255,122,26,0.24)] transition hover:bg-[#ff8b33] disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {isFetchingUrl ? 'Fetching...' : 'Import link'}
                                        <FaArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {importNotice && (
                                    <div className={cn(
                                        'mt-3 rounded-xl border px-3 py-2.5',
                                        importNotice.type === 'warning'
                                            ? 'border-[#ff7a1a]/30 bg-[#ff7a1a]/10'
                                            : 'border-[#ef4444]/30 bg-[#ef4444]/10'
                                    )}>
                                        <div className="flex items-start gap-2.5">
                                            <span className={cn(
                                                'mt-1 h-2 w-2 shrink-0 rounded-full',
                                                importNotice.type === 'warning' ? 'bg-[#ff9a3d]' : 'bg-[#ef4444]'
                                            )} />
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    'text-xs font-black',
                                                    importNotice.type === 'warning' ? 'text-[#ffb36b]' : 'text-[#ff9a9a]'
                                                )}>
                                                    {importNotice.title}
                                                </p>
                                                <p className={cn('mt-1 text-xs font-semibold leading-5', isDarkTheme ? 'text-[#cfc4ba]' : 'text-[#675b52]')}>
                                                    {importNotice.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-3 p-4 md:grid-cols-3">
                                {[
                                    ['GitHub PR', 'Paste a pull request URL and CodeDiff requests the .diff version.', FaGithub],
                                    ['Commit / Compare', 'Works with commit and compare URLs when GitHub exposes a diff.', FaCodeBranch],
                                    ['Raw patch URL', 'Use any direct .diff or .patch link from tools and CI systems.', FaLink],
                                ].map(([title, description, Icon]) => (
                                    <div key={title} className={cn('rounded-2xl border p-4', borderClass, subtleBg)}>
                                        <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#ff7a1a]/25 bg-[#ff7a1a]/10 text-[#ff9a3d]">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <h3 className={cn('mt-3 text-sm font-black', primaryText)}>
                                            {title}
                                        </h3>
                                        <p className={cn('mt-2 text-xs font-semibold leading-5', mutedText)}>
                                            {description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className={cn('grid gap-2 border-t p-4 sm:grid-cols-3', borderClass)}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn('flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition hover:border-[#ff7a1a]/50', borderClass, subtleBg, primaryText)}
                                >
                                    <FaFile className="h-3.5 w-3.5 text-[#8b5cf6]" />
                                    Upload .patch
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftPatch('');
                                        setImportNotice(null);
                                        setIsImportOpen(true);
                                    }}
                                    className={cn('flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition hover:border-[#ff7a1a]/50', borderClass, subtleBg, primaryText)}
                                >
                                    <FaPaste className="h-3.5 w-3.5 text-[#45d483]" />
                                    Paste raw diff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => importPatchText(SAMPLE_PATCH, 'Loaded demo patch')}
                                    className={cn('flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition hover:border-[#ff7a1a]/50', borderClass, subtleBg, primaryText)}
                                >
                                    <FaCodeBranch className="h-3.5 w-3.5 text-[#ff9a3d]" />
                                    Try demo
                                </button>
                            </div>
                        </section>

                        <aside className={cn('rounded-2xl border p-4', borderClass, panelBg)}>
                            <p className={cn('text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                Sources
                            </p>
                            <div className="mt-3 space-y-2">
                                {[
                                    ['PR URL', 'github.com/acme/app/pull/42'],
                                    ['Commit URL', 'github.com/acme/app/commit/a1b2c3'],
                                    ['Compare URL', 'github.com/acme/app/compare/main...feature'],
                                    ['Patch file', 'changes.patch or review.diff'],
                                ].map(([label, example]) => (
                                    <div key={label} className={cn('rounded-xl border p-3', borderClass, subtleBg)}>
                                        <p className={cn('text-[10px] font-black uppercase tracking-[0.14em]', mutedText)}>
                                            {label}
                                        </p>
                                        <p className={cn('mt-1 break-all font-mono text-[11px] font-bold', primaryText)}>
                                            {example}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            ) : (
            <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_220px]">
                <aside className={cn('hidden min-h-0 border-r xl:flex xl:flex-col', borderClass)}>
                    <div className="grid grid-cols-3 gap-1.5 border-b border-[#ff7a1a]/10 p-3">
                        {[
                            ['Files', parsedPatch.stats.files],
                            ['Hunks', parsedPatch.stats.hunks],
                            ['Lines', `+${parsedPatch.stats.additions}`],
                        ].map(([label, value]) => (
                            <div key={label} className={cn('rounded-xl border p-2', borderClass, subtleBg)}>
                                <p className={cn('text-[9px] font-black uppercase tracking-[0.14em]', mutedText)}>
                                    {label}
                                </p>
                                <p className={cn('mt-1 font-mono text-sm font-black', primaryText)}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        {parsedPatch.files.map((file, index) => (
                            <button
                                key={`${file.path}-${index}`}
                                type="button"
                                onClick={() => setSelectedFileIndex(index)}
                                className={cn(
                                    'mb-1.5 w-full rounded-xl border p-3 text-left transition',
                                    selectedFileIndex === index
                                        ? 'border-[#ff7a1a]/70 bg-[#ff7a1a]/10 shadow-[0_0_24px_rgba(255,122,26,0.12)]'
                                        : cn(borderClass, subtleBg, 'hover:border-[#ff7a1a]/40')
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className={cn('min-w-0 break-all font-mono text-xs font-black', primaryText)}>
                                        {file.path}
                                    </span>
                                    <span className="shrink-0 rounded-full border border-[#ff7a1a]/25 bg-[#ff7a1a]/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-[#ff9a3d]">
                                        {getStatusLabel(file.status)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-3 font-mono text-xs font-black">
                                    <span className="text-[#45d483]">+{file.additions}</span>
                                    <span className="text-[#ef7777]">-{file.deletions}</span>
                                    <span className={mutedText}>{file.hunks.length} hunks</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="min-h-0 overflow-hidden">
                    {activeFile ? (
                        <div className="flex h-full min-h-0 flex-col">
                            <div className={cn('shrink-0 border-b', borderClass, panelBg)}>
                                <div className={cn('flex flex-col gap-2 border-b px-4 py-3 lg:flex-row lg:items-center', borderClass)}>
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <FaGithub className="h-3.5 w-3.5 shrink-0 text-[#ff9a3d]" />
                                        <div className="min-w-0 flex-1">
                                            <p className={cn('mb-1 text-[9px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                                Reviewing source
                                            </p>
                                            <div className={cn('flex min-w-0 items-center gap-2 rounded-lg border px-2.5', borderClass, isDarkTheme ? 'bg-[#080604]' : 'bg-white')}>
                                                <FaLink className="h-3 w-3 shrink-0 text-[#ff9a3d]" />
                                                <input
                                                    value={sourceUrl}
                                                    onChange={(event) => handleSourceUrlChange(event.target.value)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') handleImportFromUrl();
                                                    }}
                                                    placeholder="Paste GitHub PR, commit, compare, .diff, or .patch URL"
                                                    className={cn(
                                                        'h-8 min-w-0 flex-1 bg-transparent font-mono text-xs font-bold outline-none placeholder:font-sans placeholder:text-[#756a61]',
                                                        primaryText
                                                    )}
                                                    aria-label="Patch source URL"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {normalizedSourceUrl && (
                                            <a
                                                href={normalizedSourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn('hidden h-8 items-center rounded-lg border px-2.5 text-xs font-black transition hover:border-[#ff7a1a]/50 sm:flex', borderClass, subtleBg, primaryText)}
                                            >
                                                Open
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleImportFromUrl}
                                            disabled={isFetchingUrl || !sourceUrl.trim()}
                                            className="flex h-8 items-center gap-2 rounded-lg bg-[#ff7a1a] px-3 text-xs font-black text-white transition hover:bg-[#ff8b33] disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            {isFetchingUrl ? 'Loading...' : 'Load source'}
                                            <FaArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                {importNotice && (
                                    <div className={cn(
                                        'mx-4 mt-3 rounded-xl border px-3 py-2.5',
                                        importNotice.type === 'warning'
                                            ? 'border-[#ff7a1a]/30 bg-[#ff7a1a]/10'
                                            : 'border-[#ef4444]/30 bg-[#ef4444]/10'
                                    )}>
                                        <div className="flex items-start gap-2.5">
                                            <span className={cn(
                                                'mt-1 h-2 w-2 shrink-0 rounded-full',
                                                importNotice.type === 'warning' ? 'bg-[#ff9a3d]' : 'bg-[#ef4444]'
                                            )} />
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    'text-xs font-black',
                                                    importNotice.type === 'warning' ? 'text-[#ffb36b]' : 'text-[#ff9a9a]'
                                                )}>
                                                    {importNotice.title}
                                                </p>
                                                <p className={cn('mt-1 text-xs font-semibold leading-5', isDarkTheme ? 'text-[#cfc4ba]' : 'text-[#675b52]')}>
                                                    {importNotice.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                            Current file
                                        </p>
                                        <h2 className={cn('mt-1 break-all font-mono text-sm font-black', primaryText)}>
                                            {activeFile.path}
                                        </h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className={cn('grid h-8 grid-cols-2 rounded-lg border p-1', borderClass, subtleBg)}>
                                            <button
                                                type="button"
                                                onClick={() => setFileViewMode('patch')}
                                                className={cn(
                                                    'rounded-md px-2 text-xs font-black transition',
                                                    fileViewMode === 'patch' ? 'bg-[#ff7a1a] text-white' : mutedText
                                                )}
                                            >
                                                Patch
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFileViewMode('compare')}
                                                className={cn(
                                                    'rounded-md px-2 text-xs font-black transition',
                                                    fileViewMode === 'compare' ? 'bg-[#ff7a1a] text-white' : mutedText
                                                )}
                                            >
                                                Split
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsWordWrapEnabled((currentValue) => !currentValue)}
                                            className={cn(
                                                'flex h-8 items-center rounded-lg border px-2.5 text-xs font-black transition hover:border-[#ff7a1a]/50',
                                                isWordWrapEnabled
                                                    ? 'border-[#ff7a1a]/70 bg-[#ff7a1a]/10 text-[#ff9a3d]'
                                                    : cn(borderClass, subtleBg, primaryText)
                                            )}
                                            title="Toggle word wrap"
                                        >
                                            Wrap
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDraftPatch(patchText);
                                                setImportNotice(null);
                                                setIsImportOpen(true);
                                            }}
                                            className={cn('flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-black transition hover:border-[#ff7a1a]/50', borderClass, subtleBg, primaryText)}
                                        >
                                            <FaFileImport className="h-3 w-3 text-[#ff9a3d]" />
                                            Import
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCopyFilePatch}
                                            className={cn('hidden h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-black transition hover:border-[#ff7a1a]/50 sm:flex', borderClass, subtleBg, primaryText)}
                                        >
                                            <FaClipboard className="h-3 w-3 text-[#45d483]" />
                                            Copy file patch
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {fileViewMode === 'compare' ? (
                                <div className="min-h-0 flex-1 p-3">
                                    <div className={cn('flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border shadow-[0_18px_55px_rgba(0,0,0,0.22)]', borderClass, isDarkTheme ? 'bg-[#0b0d0f]' : 'bg-white')}>
                                        <div className={cn('grid grid-cols-2 border-b text-xs font-black uppercase tracking-[0.16em]', borderClass, isDarkTheme ? 'bg-[#11100e]' : 'bg-[#fffaf6]')}>
                                            <div className={cn('flex items-center gap-2 border-r px-3 py-2.5', borderClass, mutedText)}>
                                                <span className="h-2 w-2 rounded-full bg-[#4da3ff]" />
                                                Before
                                            </div>
                                            <div className={cn('flex items-center gap-2 px-3 py-2.5', mutedText)}>
                                                <span className="h-2 w-2 rounded-full bg-[#45d483]" />
                                                After
                                            </div>
                                        </div>
                                        <div className="min-h-0 flex-1">
                                            <Suspense fallback={
                                                <div className={cn('grid h-full min-h-[520px] place-items-center text-sm font-bold', mutedText)}>
                                                    Loading split compare...
                                                </div>
                                            }>
                                                <DiffEditor
                                                    key={`patch-compare-${activeFile.path}-${selectedFileIndex}`}
                                                    height="100%"
                                                    original={activeBeforeContent}
                                                    modified={activeAfterContent}
                                                    language={getMonacoLanguageId(activeLanguage)}
                                                    originalModelPath={`codediff://patch/${selectedFileIndex}/before.${activeLanguage}`}
                                                    modifiedModelPath={`codediff://patch/${selectedFileIndex}/after.${activeLanguage}`}
                                                    theme={isDarkTheme ? 'vs-dark' : 'vs-light'}
                                                    options={patchCompareOptions}
                                                    loading={null}
                                                />
                                            </Suspense>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 overflow-auto p-3">
                                    <div className={cn('overflow-hidden rounded-2xl border shadow-[0_18px_55px_rgba(0,0,0,0.22)]', borderClass, isDarkTheme ? 'bg-[#0b0d0f]' : 'bg-white')}>
                                        {activeFile.hunks.map((hunk, hunkIndex) => (
                                                <article key={`${hunk.header}-${hunkIndex}`} className={cn('border-b last:border-b-0', borderClass)}>
                                                    <div className={cn('sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2', borderClass, isDarkTheme ? 'bg-[#11100e]/95' : 'bg-[#fffaf6]/95')}>
                                                        <div className="min-w-0">
                                                            <p className="break-all font-mono text-[11px] font-black text-[#ff9a3d]">
                                                                {hunk.header}
                                                            </p>
                                                            {hunk.section && (
                                                                <p className={cn('mt-0.5 truncate text-[10px] font-semibold', mutedText)}>
                                                                    {hunk.section}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <span className="rounded-full bg-[#ff7a1a]/12 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#ff9a3d]">
                                                                +{hunk.additions} -{hunk.deletions}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        'py-1 font-mono text-[13px] leading-[22px]',
                                                        isWordWrapEnabled ? 'overflow-x-hidden' : 'overflow-x-auto'
                                                    )}>
                                                        {hunk.lines.map((line, lineIndex) => (
                                                            <div
                                                                key={`${line.type}-${line.oldLineNumber}-${line.newLineNumber}-${lineIndex}`}
                                                                className={cn(
                                                                    'grid px-2',
                                                                    isWordWrapEnabled
                                                                        ? 'w-full grid-cols-[52px_52px_26px_minmax(0,1fr)]'
                                                                        : 'min-w-max grid-cols-[52px_52px_26px_minmax(520px,1fr)]',
                                                                    lineClass(line.type)
                                                                )}
                                                            >
                                                                <span className={cn('select-none text-right tabular-nums', gutterClass(line.type))}>
                                                                    {line.oldLineNumber || ''}
                                                                </span>
                                                                <span className={cn('select-none text-right tabular-nums', gutterClass(line.type))}>
                                                                    {line.newLineNumber || ''}
                                                                </span>
                                                                <span className={cn('select-none text-center font-black', gutterClass(line.type))}>
                                                                    {line.type === 'added' && <FaPlus className="mx-auto mt-1 h-2.5 w-2.5" />}
                                                                    {line.type === 'removed' && <FaMinus className="mx-auto mt-1 h-2.5 w-2.5" />}
                                                                </span>
                                                                <code className={cn(
                                                                    'px-2',
                                                                    isWordWrapEnabled ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                                                                )}>
                                                                    {renderHighlightedCode(line.content || ' ')}
                                                                </code>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid h-full place-items-center p-6">
                            <div className={cn('max-w-md rounded-2xl border p-6 text-center', borderClass, panelBg)}>
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#ff7a1a]/12 text-[#ff9a3d]">
                                    <FaFileImport />
                                </div>
                                <h2 className={cn('mt-4 text-lg font-black', primaryText)}>Import a patch</h2>
                                <p className={cn('mt-2 text-sm leading-6', mutedText)}>
                                    Paste a GitHub `.diff` or upload a `.patch` file to start reviewing hunks.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                <aside className={cn('hidden min-h-0 border-l p-3 xl:block', borderClass)}>
                    <div className="rounded-2xl bg-gradient-to-br from-[#ff9a3d] via-[#ff7a1a] to-[#ef4444] p-4 text-white shadow-[0_18px_42px_rgba(255,122,26,0.28)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                            Patch stats
                        </p>
                        <p className="mt-2 text-4xl font-black">
                            {parsedPatch.stats.files}
                        </p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/75">
                            Changed files
                        </p>
                    </div>

                    <div className={cn('mt-3 space-y-2 rounded-2xl border p-2', borderClass, panelBg)}>
                        {[
                            ['Hunks', parsedPatch.stats.hunks, '#ff7a1a'],
                            ['Additions', parsedPatch.stats.additions, '#45d483'],
                            ['Deletions', parsedPatch.stats.deletions, '#ef7777'],
                            ['Selected', activeFile?.hunks.length || 0, '#8b5cf6'],
                        ].map(([label, value, color]) => (
                            <div key={label} className={cn('rounded-xl border p-3', borderClass, subtleBg)}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className={cn('text-[10px] font-black uppercase tracking-[0.14em]', mutedText)}>
                                        {label}
                                    </span>
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                                </div>
                                <p className={cn('mt-1 font-mono text-xl font-black', primaryText)}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
            )}

            {isImportOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className={cn('flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-[0_30px_120px_rgba(0,0,0,0.55)]', borderClass, panelBg)}>
                        <div className={cn('flex items-center justify-between gap-4 border-b px-5 py-4', borderClass)}>
                            <div>
                                <p className={cn('text-[10px] font-black uppercase tracking-[0.18em]', mutedText)}>
                                    Import source
                                </p>
                                <h2 className={cn('mt-1 text-lg font-black', primaryText)}>
                                    Link, upload, or paste a patch
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsImportOpen(false)}
                                className={cn('grid h-9 w-9 place-items-center rounded-lg border transition', borderClass, primaryText)}
                                aria-label="Close import patch"
                            >
                                <FaTimes className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                            <div className={cn('rounded-2xl border p-3', borderClass, subtleBg)}>
                                <label className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                    GitHub or patch URL
                                </label>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                    <div className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3', borderClass, isDarkTheme ? 'bg-[#080604]' : 'bg-white')}>
                                        <FaLink className="h-3.5 w-3.5 shrink-0 text-[#ff9a3d]" />
                                        <input
                                            value={sourceUrl}
                                            onChange={(event) => handleSourceUrlChange(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') handleImportFromUrl();
                                            }}
                                            placeholder="https://github.com/owner/repo/pull/123"
                                            className={cn('h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#756a61]', primaryText)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleImportFromUrl}
                                        disabled={isFetchingUrl}
                                        className="h-10 rounded-xl bg-[#ff7a1a] px-4 text-xs font-black text-white transition hover:bg-[#ff8b33] disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {isFetchingUrl ? 'Fetching...' : 'Import link'}
                                    </button>
                                </div>
                            </div>

                            <div className={cn('flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em]', mutedText)}>
                                <span className="h-px flex-1 bg-[#ff7a1a]/15" />
                                Or paste raw diff
                                <span className="h-px flex-1 bg-[#ff7a1a]/15" />
                            </div>

                            <textarea
                                value={draftPatch}
                                onChange={(event) => setDraftPatch(event.target.value)}
                                spellCheck={false}
                                className={cn(
                                    'h-[48vh] w-full resize-none rounded-xl border p-3 font-mono text-xs leading-5 outline-none transition focus:border-[#ff7a1a]/70',
                                    borderClass,
                                    isDarkTheme ? 'bg-[#080604] text-[#fff9f2]' : 'bg-white text-[#17120f]'
                                )}
                            />
                        </div>

                        <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4', borderClass)}>
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftPatch(SAMPLE_PATCH);
                                    handleSourceUrlChange('');
                                }}
                                className={cn('h-9 rounded-lg px-3 text-xs font-black transition hover:bg-[#ff7a1a]/10', mutedText)}
                            >
                                Load demo patch
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportOpen(false)}
                                    className={cn('h-9 rounded-lg px-3 text-xs font-bold transition hover:bg-white/5', mutedText)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleImportPatch}
                                    className="h-9 rounded-lg bg-[#ff7a1a] px-4 text-xs font-black text-white transition hover:bg-[#ff8b33]"
                                >
                                    Import patch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
