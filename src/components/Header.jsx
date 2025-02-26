import Controls from './Controls';
import { useParams } from 'react-router-dom';
export default function Header({ isDarkTheme, setIsDarkTheme, leftContent, rightContent, selectedLanguage, setShowUpdateButton, showUpdateButton, handleLanguageChange, handleFileUpload, supportedLanguages }) {
   const {diffId} = useParams();
    return (
        <header className="w-full px-4 py-2 bg-[#1e1e1e] border-b border-[#2d2d2d] shadow-sm relative z-50">
            <div className="flex items-center justify-between">
                {/* Logo and Language Selector */}
                <div className= "flex items-center gap-6">
                    <div className="flex items-center border-gray-600 border-2 rounded-full p-1 hover:bg-[#3d3d3d]">
                       
                        <span className="mx-2 font-semibold text-gray-200">
                            {`{ CodeDiff }`}
                        </span>
                    </div>
                    
                    <div className="language-selector flex items-center gap-4 ">
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className="px-3 py-1.5 rounded-full text-sm bg-[#2d2d2d] text-gray-200 border-gray-600 focus:border-gray-500 border focus:outline-none focus:ring-1 focus:ring-gray-500 hover:bg-[#3d3d3d] transition-colors duration-200"
                        >
                            {supportedLanguages.map(lang => (
                                <option key={lang.id} value={lang.name} className="bg-[#2d2d2d]">
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-4 border-l border-[#605d5d] pl-4">
                    <div className="file-upload flex items-center gap-2">
                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('left')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java"
                            className="hidden"
                            id="leftFileInput"
                        />
                        <label 
                            htmlFor="leftFileInput"
                            className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Left File
                        </label>

                        <input
                            type="file"
                            onChange={(e) => handleFileUpload('right')(e)}
                            accept=".txt,.js,.jsx,.ts,.tsx,.json,.html,.css,.py,.java"
                            className="hidden"
                            id="rightFileInput"
                        />
                        <label 
                            htmlFor="rightFileInput"
                            className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Right File
                        </label>
                    </div>
                </div>

                </div>

                {/* File Upload Controls */}
               
                {/* Controls */}
                <Controls
                    isDarkTheme={isDarkTheme}
                    setIsDarkTheme={setIsDarkTheme}
                    leftContent={leftContent}
                    rightContent={rightContent}
                    selectedLanguage={selectedLanguage}
                    setShowUpdateButton={setShowUpdateButton}
                    showUpdateButton={showUpdateButton}
                />
            </div>
        </header>
    );
}