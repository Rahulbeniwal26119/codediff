import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaCheck } from 'react-icons/fa';
import Button from './ui/Button';
import { cn } from '../utils/cn';
import { useCode } from '../context/CodeContext';
import { diffLines } from 'diff';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';

const ExportModal = ({ isOpen, onClose }) => {
    const { leftContent, rightContent, selectedLanguage, isDarkTheme } = useCode();
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef(null);
    const [background, setBackground] = useState('linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)');

    // Customization State
    const [padding, setPadding] = useState(64);
    const [shadow, setShadow] = useState(50);
    const [rounding, setRounding] = useState(16);
    const [showWatermark, setShowWatermark] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [showDiff, setShowDiff] = useState(true);


    // Compute Diff and Alignment with Syntax Highlighting
    const processDiff = () => {
        // 1. Highlight both contents first to get HTML strings
        const highlight = (code) => Prism.highlight(
            code || '',
            Prism.languages[selectedLanguage] || Prism.languages.javascript,
            selectedLanguage || 'javascript'
        );

        // We need to diff the PLAIN text, but display the HIGHLIGHTED text. 
        // A simple approach: Diff line-by-line, then try to apply highlighting line-by-line.
        // Highlighting line-by-line is less accurate for multi-line comments/strings but safer for diff alignment.

        const diff = diffLines(leftContent || '', rightContent || '');
        const leftLines = [];
        const rightLines = [];

        diff.forEach(part => {
            const lines = part.value.replace(/\n$/, '').split('\n');
            if (part.added) {
                // Added lines go to Right, Left gets empty placeholders
                lines.forEach(line => {
                    const highlighted = highlight(line);
                    rightLines.push({ type: 'added', content: highlighted });
                    leftLines.push({ type: 'empty', content: ' ' });
                });
            } else if (part.removed) {
                // Removed lines go to Left, Right gets empty placeholders
                lines.forEach(line => {
                    const highlighted = highlight(line);
                    leftLines.push({ type: 'removed', content: highlighted });
                    rightLines.push({ type: 'empty', content: ' ' });
                });
            } else {
                // Unchanged lines go to both
                lines.forEach(line => {
                    const highlighted = highlight(line);
                    leftLines.push({ type: 'unchanged', content: highlighted });
                    rightLines.push({ type: 'unchanged', content: highlighted });
                });
            }
        });

        return { leftLines, rightLines };
    };

    const { leftLines, rightLines } = processDiff();

    const backgrounds = [
        'linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)', // Vibrant
        'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)', // Colorful
        'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)', // Aqua
        'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)', // Pastel
        'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Dark Simple
        'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop") center/cover', // Abstract Mesh
    ];

    const handleDownload = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `codediff-export-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Image exported successfully!');
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export image');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={cn(
                            "relative w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10",
                            isDarkTheme ? "bg-surface-900" : "bg-gray-100"
                        )}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Immersive Header Overlay - REMOVED TITLE */}
                        <div className="absolute top-6 right-6 z-50">
                            <button
                                onClick={onClose}
                                className={cn(
                                    "p-2 rounded-full transition-all pointer-events-auto backdrop-blur-md",
                                    isDarkTheme
                                        ? "bg-white/10 hover:bg-white/20 text-white"
                                        : "bg-black/5 hover:bg-black/10 text-gray-900"
                                )}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-dot-pattern">

                            {/* Floating Controls Island & Settings */}
                            <div className="absolute top-8 z-30 pointer-events-auto flex flex-col items-center gap-4">
                                {/* Background Picker */}
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-full shadow-xl backdrop-blur-xl border transition-all hover:scale-105",
                                    isDarkTheme
                                        ? "bg-surface-800/80 border-white/10"
                                        : "bg-white/80 border-black/5"
                                )}>
                                    {backgrounds.map((bg, i) => (
                                        <button
                                            key={i}
                                            className={cn(
                                                "w-6 h-6 rounded-full transition-all relative group",
                                                background === bg
                                                    ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent scale-110"
                                                    : "hover:scale-110 opacity-70 hover:opacity-100"
                                            )}
                                            style={{ background: bg }}
                                            onClick={() => setBackground(bg)}
                                            title={`Style ${i + 1}`}
                                        >
                                            {background === bg && (
                                                <motion.div
                                                    layoutId="active-check"
                                                    className="absolute inset-0 flex items-center justify-center text-white text-[10px]"
                                                >
                                                    <FaCheck />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Customization Settings Panel */}
                                <div className={cn(
                                    "flex items-center gap-6 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl border transition-all",
                                    isDarkTheme
                                        ? "bg-surface-800/90 border-white/10 text-gray-200"
                                        : "bg-white/90 border-black/5 text-gray-700"
                                )}>
                                    {/* Padding Control */}
                                    <div className="flex flex-col gap-1 w-24">
                                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Padding</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="128"
                                            value={padding}
                                            onChange={(e) => setPadding(Number(e.target.value))}
                                            className="accent-primary-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                    </div>

                                    {/* Shadow Control */}
                                    <div className="flex flex-col gap-1 w-24">
                                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Shadow</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={shadow}
                                            onChange={(e) => setShadow(Number(e.target.value))}
                                            className="accent-primary-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                    </div>

                                    {/* Rounding Control */}
                                    <div className="flex flex-col gap-1 w-24">
                                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Roundness</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="32"
                                            value={rounding}
                                            onChange={(e) => setRounding(Number(e.target.value))}
                                            className="accent-primary-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                    </div>

                                    {/* Toggles */}
                                    <div className="h-8 w-px bg-current opacity-10"></div>

                                    <button
                                        onClick={() => setShowDiff(!showDiff)}
                                        className={cn("text-xs font-medium px-2 py-1 rounded transition-colors", showDiff ? "bg-primary-500/10 text-primary-500" : "opacity-50 hover:opacity-100")}
                                    >
                                        Diff
                                    </button>

                                    <button
                                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                                        className={cn("text-xs font-medium px-2 py-1 rounded transition-colors", showLineNumbers ? "bg-primary-500/10 text-primary-500" : "opacity-50 hover:opacity-100")}
                                    >
                                        Lines
                                    </button>

                                    <button
                                        onClick={() => setShowWatermark(!showWatermark)}
                                        className={cn("text-xs font-medium px-2 py-1 rounded transition-colors", showWatermark ? "bg-primary-500/10 text-primary-500" : "opacity-50 hover:opacity-100")}
                                    >
                                        Watermark
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Preview Canvas */}
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-12 md:p-24 pt-32">
                                <div
                                    ref={exportRef}
                                    className="relative transition-all duration-300 group"
                                    style={{
                                        background,
                                        padding: `${padding}px`
                                    }}
                                >
                                    {/* Code Window Chrome */}
                                    <div
                                        className="bg-[#1e1e1e]/95 backdrop-blur-xl overflow-hidden border border-white/10 ring-1 ring-white/5 mx-auto max-w-5xl transition-all duration-300"
                                        style={{
                                            boxShadow: `0 ${shadow}px ${shadow * 2}px -${shadow / 2}px rgba(0,0,0,0.5)`,
                                            borderRadius: `${rounding}px`
                                        }}
                                    >
                                        {/* Traffic Lights */}
                                        <div className="h-10 px-4 bg-[#252526] border-b border-white/5 flex items-center justify-between select-none">
                                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner"></div>
                                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner"></div>
                                                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner"></div>
                                            </div>
                                        </div>

                                        {/* Editor Area */}
                                        {showDiff ? (
                                            /* Diff View (Grid Layout for Perfect Alignment) */
                                            <div className="grid grid-cols-2 divide-x divide-white/5 font-mono text-[13px] leading-6 bg-[#1e1e1e] relative min-h-[300px]">
                                                {/* Labels Overlay */}
                                                {/* Labels Overlay Removed */}

                                                {/* Spacer for Top Labels */}
                                                <div className="col-span-2 h-6"></div>

                                                {/* Spacer for Top Labels */}
                                                <div className="col-span-2 h-10"></div>

                                                {/* Rows */}
                                                {leftLines.map((leftLine, i) => {
                                                    const rightLine = rightLines[i];
                                                    return (
                                                        <React.Fragment key={i}>
                                                            {/* Left Cell */}
                                                            <div className={cn(
                                                                "flex w-full whitespace-pre-wrap break-all min-h-[1.5em]",
                                                                leftLine.type === 'removed' && "bg-red-500/15",
                                                                leftLine.type === 'empty' && "select-none opacity-50",
                                                                leftLine.type === 'unchanged' && "text-gray-400"
                                                            )}>
                                                                {showLineNumbers && (
                                                                    <div className="w-8 flex-shrink-0 text-right pr-3 select-none text-gray-600 border-r border-white/5 mr-3 opacity-50">
                                                                        {leftLine.type !== 'empty' ? i + 1 : ''}
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className="flex-1 py-0.5"
                                                                    dangerouslySetInnerHTML={{ __html: leftLine.content }}
                                                                />
                                                            </div>

                                                            {/* Right Cell */}
                                                            <div className={cn(
                                                                "flex w-full whitespace-pre-wrap break-all min-h-[1.5em]",
                                                                rightLine.type === 'added' && "bg-green-500/15",
                                                                rightLine.type === 'empty' && "select-none opacity-50",
                                                                rightLine.type === 'unchanged' && "text-gray-200"
                                                            )}>
                                                                {showLineNumbers && (
                                                                    <div className="w-8 flex-shrink-0 text-right pr-3 select-none text-gray-600 border-r border-white/5 mr-3 opacity-50">
                                                                        {rightLine.type !== 'empty' ? i + 1 : ''}
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className="flex-1 py-0.5"
                                                                    dangerouslySetInnerHTML={{ __html: rightLine.content }}
                                                                />
                                                            </div>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Code Snippet View (Single) */
                                            <div className="relative bg-[#1e1e1e] pt-10 pb-6 font-mono text-[13px] leading-6 min-w-[400px]">
                                                <div className="w-full px-6 flex">
                                                    {showLineNumbers && (
                                                        <div className="flex flex-col text-right pr-4 select-none text-gray-600 border-r border-white/5 mr-4 opacity-50">
                                                            {(rightContent || leftContent || '').split('\n').map((_, i) => (
                                                                <div key={i}>{i + 1}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div
                                                        className="text-gray-200 whitespace-pre-wrap break-all flex-1"
                                                        dangerouslySetInnerHTML={{
                                                            __html: Prism.highlight(
                                                                rightContent || leftContent || '',
                                                                Prism.languages[selectedLanguage] || Prism.languages.javascript,
                                                                selectedLanguage || 'javascript'
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Watermark */}
                                    {showWatermark && (
                                        <div className="absolute bottom-5 right-6 flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity mix-blend-overlay">
                                            <img src="/logo.png" alt="" className="w-5 h-5 grayscale rounded" />
                                            <span className="font-bold text-white text-xs tracking-widest uppercase">CodeDiff</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Floating Footer Toolbar */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                            <div className="pointer-events-auto shadow-2xl shadow-black/20">
                                <Button
                                    onClick={handleDownload}
                                    variant="filled"
                                    size="lg"
                                    className="rounded-full px-8 bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-none shadow-xl transform transition-all hover:scale-105 active:scale-95"
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <span className="flex items-center gap-2">Generating...</span>
                                    ) : (
                                        <span className="flex items-center gap-2 font-bold">
                                            <FaDownload className="text-sm" />
                                            Download Image
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExportModal;
