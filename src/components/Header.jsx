import { motion, AnimatePresence } from 'framer-motion';
import Controls from './Controls';
import { useCode } from '../context/CodeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLanguageDisplayName } from '../utils/monacoLanguages';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { cn } from '../utils/cn';

export default function Header() {
    const {
        isDarkTheme,
        selectedLanguage,
        handleLanguageChange,
        handleFileUpload,
        supportedLanguages,
        isSideBySide,
        setIsSideBySide,
        loadLanguageTemplate
    } = useCode();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <motion.header 
            className={cn(
                'border-b backdrop-blur-md bg-opacity-90 sticky top-0 z-50',
                isDarkTheme 
                    ? 'bg-surface-900 border-surface-700' 
                    : 'bg-white border-surface-200'
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between max-w-full px-6 py-4">
                {/* Left section: Logo and core controls */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <motion.a 
                        href="/" 
                        className="flex items-center gap-3 group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.img 
                            src="/logo.png" 
                            alt="CodeDiff" 
                            className="w-10 h-10 rounded-2xl shadow-md" 
                            whileHover={{ rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        />
                        <span className={cn(
                            'font-bold text-xl',
                            isDarkTheme 
                                ? 'bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent' 
                                : 'text-primary-700'
                        )}>
                            CodeDiff
                        </span>
                    </motion.a>

                    {/* Language selector */}
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            'text-sm font-medium',
                            isDarkTheme ? 'text-surface-300' : 'text-surface-600'
                        )}>
                            Language
                        </span>
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className={cn(
                                'px-4 py-2 rounded-2xl text-sm border-2 font-medium',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                'transition-all cursor-pointer',
                                isDarkTheme 
                                    ? 'bg-surface-800 text-surface-200 border-surface-700 hover:border-surface-600' 
                                    : 'bg-surface-50 text-surface-900 border-surface-300 hover:border-surface-400'
                            )}
                        >
                            {supportedLanguages.map(lang => (
                                <option key={lang} value={lang} className={isDarkTheme ? 'bg-surface-800' : 'bg-white'}>
                                    {getLanguageDisplayName(lang)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Center section: File controls and view toggle */}
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <Button
                        variant="tonal"
                        size="md"
                        onClick={() => setIsSideBySide(!isSideBySide)}
                        className="flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isSideBySide ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m-6 18h6M3 12h18" />
                            )}
                        </svg>
                        {isSideBySide ? 'Inline' : 'Split'}
                    </Button>

                    {/* File upload controls */}
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('left')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                            className="hidden"
                            id="leftFileInput"
                        />
                        <label htmlFor="leftFileInput">
                            <Button
                                variant="filled"
                                size="md"
                                as="span"
                                className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                Before
                            </Button>
                        </label>

                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('right')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                            className="hidden"
                            id="rightFileInput"
                        />
                        <label htmlFor="rightFileInput">
                            <Button
                                variant="filled"
                                size="md"
                                as="span"
                                className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                After
                            </Button>
                        </label>
                    </div>
                </div>

                {/* Right section: User controls */}
                <Controls />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden px-4 py-3">
                {/* Mobile header - top row */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.a 
                        href="/" 
                        className="flex items-center gap-2"
                        whileTap={{ scale: 0.95 }}
                    >
                        <img src="/logo.png" alt="CodeDiff" className="w-8 h-8 rounded-xl shadow-md" />
                        <span className={cn(
                            'font-bold text-base',
                            isDarkTheme 
                                ? 'bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent' 
                                : 'text-primary-700'
                        )}>
                            CodeDiff
                        </span>
                    </motion.a>

                    {/* Mobile menu toggle */}
                    <IconButton
                        variant="tonal"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </IconButton>
                </div>

                {/* Mobile expanded menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className={cn(
                                'border-t mt-3 pt-3 space-y-3',
                                isDarkTheme ? 'border-surface-700' : 'border-surface-200'
                            )}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {/* Controls row */}
                            <div className="flex flex-wrap items-center justify-center gap-2 pb-3 border-b border-surface-300 dark:border-surface-600">
                                <Controls />
                            </div>

                            {/* Language selector */}
                            <div className="space-y-2">
                                <label className={cn(
                                    'text-sm font-medium block',
                                    isDarkTheme ? 'text-surface-300' : 'text-surface-600'
                                )}>
                                    Language
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className={cn(
                                        'w-full px-4 py-3 rounded-2xl text-sm border-2 font-medium',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500',
                                        isDarkTheme 
                                            ? 'bg-surface-800 text-surface-200 border-surface-700' 
                                            : 'bg-surface-50 text-surface-900 border-surface-300'
                                    )}
                                >
                                    {supportedLanguages.map(lang => (
                                        <option key={lang} value={lang} className={isDarkTheme ? 'bg-surface-800' : 'bg-white'}>
                                            {getLanguageDisplayName(lang)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* View toggle */}
                            <Button
                                variant="tonal"
                                size="md"
                                onClick={() => setIsSideBySide(!isSideBySide)}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isSideBySide ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m-6 18h6M3 12h18" />
                                    )}
                                </svg>
                                {isSideBySide ? 'Switch to Inline' : 'Switch to Split'}
                            </Button>

                            {/* File upload controls */}
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload('left')(e)}
                                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                                    className="hidden"
                                    id="leftFileInputMobile"
                                />
                                <label htmlFor="leftFileInputMobile" className="block">
                                    <Button
                                        variant="filled"
                                        size="md"
                                        as="span"
                                        className="w-full flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        Upload Before
                                    </Button>
                                </label>

                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload('right')(e)}
                                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                                    className="hidden"
                                    id="rightFileInputMobile"
                                />
                                <label htmlFor="rightFileInputMobile" className="block">
                                    <Button
                                        variant="filled"
                                        size="md"
                                        as="span"
                                        className="w-full flex items-center justify-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        Upload After
                                    </Button>
                                </label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}