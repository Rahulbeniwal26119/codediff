import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaTools, FaMagic, FaRobot, FaChevronDown } from 'react-icons/fa';
import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserHtml from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserYaml from 'prettier/plugins/yaml';
import { formatCode, canFormatLanguage } from '../utils/codeFormatter';

const ToolsDropdown = ({ 
    leftCode, 
    rightCode, 
    language, 
    onFormat, 
    onExplain,
    disabled 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFormat = async () => {
        if (!leftCode && !rightCode) return;
        
        setIsOpen(false); // Close menu immediately
        setIsFormatting(true);
        
        try {
            if (!canFormatLanguage(language)) {
                toast.error(`Formatting not supported for ${language}`);
                setIsFormatting(false);
                return;
            }

            const [formattedLeft, formattedRight] = await Promise.all([
                leftCode ? formatCode(leftCode, language) : Promise.resolve(null),
                rightCode ? formatCode(rightCode, language) : Promise.resolve(null)
            ]);

            onFormat({ 
                left: formattedLeft !== null ? formattedLeft : undefined, 
                right: formattedRight !== null ? formattedRight : undefined 
            });
            toast.success('Code formatted!');
        } catch (error) {
            console.error('Formatting failed:', error);
            toast.error('Could not format code. Check for syntax errors.');
        } finally {
            setIsFormatting(false);
        }
    };

    const canFormat = canFormatLanguage(language);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all border
                    ${disabled 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                    }
                `}
            >
                <FaTools className="text-gray-500 dark:text-gray-400" />
                <span>Tools</span>
                <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Beautify Option */}
                    {canFormat && (
                        <button
                            onClick={handleFormat}
                            disabled={isFormatting || (!leftCode && !rightCode)}
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <FaMagic className={`text-purple-500 ${isFormatting ? 'animate-pulse' : ''}`} />
                            <span>{isFormatting ? 'Formatting...' : 'Beautify Code'}</span>
                        </button>
                    )}

                    {/* Explain Option */}
                    <button
                        onClick={() => {
                            onExplain();
                            setIsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        <FaRobot className="text-blue-500" />
                        <span>Explain Diff (AI)</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ToolsDropdown;
