import { motion, AnimatePresence } from 'framer-motion';
import Controls from './Controls';
import { useCode } from '../context/CodeContext';
import { useState, useEffect } from 'react';
import Button from './ui/Button';
import { cn } from '../utils/cn';
import { FaShare, FaGithub, FaBars, FaTimes, FaCloudUploadAlt, FaColumns, FaRegSquare } from 'react-icons/fa';
import { getLanguageDisplayName } from '../utils/monacoLanguages';

export default function Header() {
    const {
        isDarkTheme,
        setIsExportModalOpen,
        selectedLanguage,
        handleLanguageChange,
        handleFileUpload,
        supportedLanguages,
        isSideBySide,
        setIsSideBySide
    } = useCode();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    scrolled
                        ? (isDarkTheme ? 'bg-surface-900/80 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md shadow-sm')
                        : (isDarkTheme ? 'bg-transparent' : 'bg-transparent')
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
                {/* --- TOP TIER: Global Actions --- */}
                <div className={cn(
                    "flex items-center justify-between px-4 md:px-6 h-16 border-b",
                    isDarkTheme ? "border-white/5" : "border-black/5"
                )}>

                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-3 group relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                                <img
                                    src="/logo.png"
                                    alt="CodeDiff"
                                    className="w-8 h-8 md:w-9 md:h-9 relative rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    'font-bold text-lg leading-tight tracking-tight',
                                    isDarkTheme ? 'text-surface-100' : 'text-surface-900'
                                )}>
                                    CodeDiff
                                </span>
                                <a
                                    href="https://takovibe.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        'text-[9px] md:text-[10px] font-medium tracking-wider uppercase opacity-60 hover:opacity-100 transition-opacity hover:underline',
                                        isDarkTheme ? 'text-surface-400' : 'text-surface-500'
                                    )}
                                >
                                    by TakoVibe.com
                                </a>
                            </div>
                        </a>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3 md:gap-4">

                        {/* Desktop GitHub Link */}
                        <div className="hidden md:flex items-center gap-2 mr-2">
                            <a
                                href="https://github.com/takovibe/codediff"
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isDarkTheme ? "text-surface-400 hover:bg-white/5 hover:text-white" : "text-surface-500 hover:bg-black/5 hover:text-black"
                                )}
                            >
                                <FaGithub className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Share Button (Primary) */}
                        <Button
                            onClick={() => setIsExportModalOpen(true)}
                            className={cn(
                                "flex items-center gap-2 shadow-lg shadow-indigo-500/20 md:px-5",
                                "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-none text-white"
                            )}
                        >
                            <FaShare className="w-3.5 h-3.5" />
                            <span className="font-bold text-sm hidden md:inline">Share Image</span>
                            <span className="font-bold text-sm md:hidden">Share</span>
                        </Button>

                        {/* User Profile */}
                        <div className="hidden md:block">
                            <Controls />
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-surface-500"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {/* --- BOTTOM TIER: Editor Settings (Desktop Only) --- */}
                <div className={cn(
                    "hidden md:flex items-center justify-between px-6 py-2 border-b text-sm backdrop-blur-sm h-12",
                    isDarkTheme ? "bg-surface-900/50 border-white/5" : "bg-white/50 border-black/5"
                )}>

                    {/* LEFT: Language Selector */}
                    <div className="flex items-center gap-3">
                        <span className="opacity-50 font-medium">Language:</span>
                        <div className="relative group">
                            <select
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                                className={cn(
                                    'appearance-none pl-3 pr-8 py-1 rounded-md text-sm font-medium border bg-transparent transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary-500',
                                    isDarkTheme
                                        ? 'border-surface-700 text-surface-200 hover:border-surface-500'
                                        : 'border-surface-300 text-surface-700 hover:border-surface-400'
                                )}
                            >
                                {supportedLanguages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {getLanguageDisplayName(lang)}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: View Toggle (Split/Inline) */}
                    <div className={cn(
                        "flex items-center p-1 rounded-lg border",
                        isDarkTheme ? "bg-surface-800 border-white/5" : "bg-surface-100 border-black/5"
                    )}>
                        <button
                            onClick={() => setIsSideBySide(true)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-md transition-all text-xs font-semibold",
                                isSideBySide
                                    ? (isDarkTheme ? "bg-surface-700 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <FaColumns /> Split
                        </button>
                        <button
                            onClick={() => setIsSideBySide(false)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-md transition-all text-xs font-semibold",
                                !isSideBySide
                                    ? (isDarkTheme ? "bg-surface-700 text-white shadow-sm" : "bg-white text-black shadow-sm")
                                    : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <FaRegSquare /> Inline
                        </button>
                    </div>

                    {/* RIGHT: Upload Buttons */}
                    <div className="flex items-center gap-3">
                        <label className="cursor-pointer">
                            <input type="file" onChange={(e) => handleFileUpload('left')(e)} className="hidden" />
                            <span className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                                isDarkTheme ? "border-surface-700 text-surface-300" : "border-surface-300 text-surface-600"
                            )}>
                                <FaCloudUploadAlt /> Original
                            </span>
                        </label>
                        <label className="cursor-pointer">
                            <input type="file" onChange={(e) => handleFileUpload('right')(e)} className="hidden" />
                            <span className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                                isDarkTheme ? "border-surface-700 text-surface-300" : "border-surface-300 text-surface-600"
                            )}>
                                <FaCloudUploadAlt /> Modified
                            </span>
                        </label>
                    </div>
                </div>

                {/* --- MOBILE MENU (Drawer) --- */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={cn(
                                "md:hidden overflow-hidden border-b backdrop-blur-xl",
                                isDarkTheme ? "bg-surface-900/95 border-surface-800" : "bg-white/95 border-surface-200"
                            )}
                        >
                            <div className="p-4 flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase opacity-50 px-1">Language</label>
                                    <select
                                        value={selectedLanguage}
                                        onChange={handleLanguageChange}
                                        className={cn(
                                            'w-full p-2 rounded-lg border bg-transparent',
                                            isDarkTheme ? "border-surface-700" : "border-surface-200"
                                        )}
                                    >
                                        {supportedLanguages.map(lang => (
                                            <option key={lang} value={lang}>{getLanguageDisplayName(lang)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase opacity-50 px-1">Upload Files</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed cursor-pointer hover:bg-black/5 dark:hover:bg-white/5",
                                            isDarkTheme ? "border-surface-700" : "border-surface-300"
                                        )}>
                                            <input type="file" onChange={(e) => handleFileUpload('left')(e)} className="hidden" />
                                            <FaCloudUploadAlt className="opacity-50" />
                                            <span className="text-xs font-medium">Original</span>
                                        </label>
                                        <label className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed cursor-pointer hover:bg-black/5 dark:hover:bg-white/5",
                                            isDarkTheme ? "border-surface-700" : "border-surface-300"
                                        )}>
                                            <input type="file" onChange={(e) => handleFileUpload('right')(e)} className="hidden" />
                                            <FaCloudUploadAlt className="opacity-50" />
                                            <span className="text-xs font-medium">Modified</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase opacity-50">Profile</span>
                                        <Controls />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* --- MOBILE FLOATING BUTTON (Split Toggle) --- */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={cn(
                        "flex items-center p-1.5 rounded-full shadow-2xl border backdrop-blur-lg",
                        isDarkTheme
                            ? "bg-surface-800/90 border-white/10"
                            : "bg-white/90 border-black/10"
                    )}
                >
                    <button
                        onClick={() => setIsSideBySide(true)}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            isSideBySide
                                ? "bg-primary-600 text-white shadow-md scale-105"
                                : "opacity-50 hover:opacity-100"
                        )}
                    >
                        <FaColumns className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsSideBySide(false)}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            !isSideBySide
                                ? "bg-primary-600 text-white shadow-md scale-105"
                                : "opacity-50 hover:opacity-100"
                        )}
                    >
                        <FaRegSquare className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            {/* Spacer to push content down below fixed header */}
            <div className="h-16 md:h-28" />
        </>
    );
}