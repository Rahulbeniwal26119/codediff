import Controls from './Controls';
import { useCode } from '../context/CodeContext';
import { useState } from 'react';

export default function Header() {
    const {
        isDarkTheme,
        selectedLanguage,
        handleLanguageChange,
        handleFileUpload,
        supportedLanguages,
        isSideBySide,
        setIsSideBySide
    } = useCode();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className={`border-b ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-4 py-3 transition-colors duration-200`}>
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between max-w-full">
                {/* Left section: Logo and core controls */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="CodeDiff" className="w-8 h-8 rounded-full" />
                        <span className={`font-semibold text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            CodeDiff
                        </span>
                    </a>

                    {/* Language selector */}
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Language:
                        </span>
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                isDarkTheme 
                                    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            {supportedLanguages.map(lang => (
                                <option key={lang.id} value={lang.name} className={isDarkTheme ? 'bg-gray-700' : 'bg-white'}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Center section: File controls and view toggle */}
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <button
                        onClick={() => setIsSideBySide(!isSideBySide)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            isDarkTheme
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                        title={isSideBySide ? 'Switch to inline view' : 'Switch to side-by-side view'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isSideBySide ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m-6 18h6M3 12h18" />
                            )}
                        </svg>
                        {isSideBySide ? 'Inline' : 'Split'}
                    </button>

                    {/* File upload controls */}
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('left')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                            className="hidden"
                            id="leftFileInput"
                        />
                        <label
                            htmlFor="leftFileInput"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${
                                isDarkTheme
                                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            title="Upload left file"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Before
                        </label>

                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('right')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                            className="hidden"
                            id="rightFileInput"
                        />
                        <label
                            htmlFor="rightFileInput"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${
                                isDarkTheme
                                    ? 'bg-green-600 text-white hover:bg-green-500'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title="Upload right file"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            After
                        </label>
                    </div>
                </div>

                {/* Right section: User controls */}
                <Controls />
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
                {/* Mobile header - top row */}
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-shrink-0">
                        <img src="/logo.png" alt="CodeDiff" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />
                        <span className={`font-semibold text-sm sm:text-base truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            CodeDiff
                        </span>
                    </a>

                    {/* Mobile controls - minimal for small screens */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Theme toggle - always visible */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                                    isDarkTheme 
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                title="Toggle menu"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile expanded menu */}
                {isMobileMenuOpen && (
                    <div className={`border-t mt-3 pt-3 space-y-3 ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                        {/* Controls row - moved to top of menu */}
                        <div className="flex items-center justify-center pb-3 border-b border-gray-300 dark:border-gray-600">
                            <Controls />
                        </div>

                        {/* Language selector */}
                        <div className="space-y-2">
                            <label className={`text-sm font-medium block ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                Language
                            </label>
                            <select
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                                className={`w-full px-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                    isDarkTheme 
                                        ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' 
                                        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {supportedLanguages.map(lang => (
                                    <option key={lang.id} value={lang.name} className={isDarkTheme ? 'bg-gray-700' : 'bg-white'}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View toggle */}
                        <div className="space-y-2">
                            <label className={`text-sm font-medium block ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                View Mode
                            </label>
                            <button
                                onClick={() => setIsSideBySide(!isSideBySide)}
                                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                    isDarkTheme
                                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isSideBySide ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6m-6 18h6M3 12h18" />
                                    )}
                                </svg>
                                {isSideBySide ? 'Switch to Inline View' : 'Switch to Split View'}
                            </button>
                        </div>

                        {/* File upload controls */}
                        <div className="space-y-2">
                            <label className={`text-sm font-medium block ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                                Upload Files
                            </label>
                            <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2">
                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload('left')(e)}
                                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                                    className="hidden"
                                    id="leftFileInputMobile"
                                />
                                <label
                                    htmlFor="leftFileInputMobile"
                                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                        isDarkTheme
                                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    <span className="truncate">Upload Before</span>
                                </label>

                                <input
                                    type="file"
                                    onChange={(e) => handleFileUpload('right')(e)}
                                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.yml,.yaml,.xml,.md"
                                    className="hidden"
                                    id="rightFileInputMobile"
                                />
                                <label
                                    htmlFor="rightFileInputMobile"
                                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                        isDarkTheme
                                            ? 'bg-green-600 text-white hover:bg-green-500'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    <span className="truncate">Upload After</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}