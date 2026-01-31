import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaTools, FaMagic } from 'react-icons/fa';
import { formatCode, canFormatLanguage } from '../utils/codeFormatter';
import { cn } from '../utils/cn';
import { useCode } from '../context/CodeContext';
import IconButton from './ui/IconButton';

const ToolsDropdown = ({
    leftCode,
    rightCode,
    language,
    onFormat,

    disabled
}) => {
    const { isDarkTheme } = useCode();
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

        setIsOpen(false);
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
            <IconButton
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                variant="tonal"
            >
                <FaTools className="w-4 h-4" />
            </IconButton>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={cn(
                            'absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50',
                            isDarkTheme
                                ? 'bg-surface-800 border-surface-700'
                                : 'bg-white border-surface-200'
                        )}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <div className="py-2">
                            <motion.button
                                onClick={handleFormat}
                                disabled={!canFormat || isFormatting}
                                className={cn(
                                    'w-full px-4 py-3 text-left flex items-center gap-3 transition-colors',
                                    canFormat && !isFormatting
                                        ? isDarkTheme
                                            ? 'text-surface-200 hover:bg-surface-700'
                                            : 'text-surface-900 hover:bg-surface-100'
                                        : 'text-surface-400 cursor-not-allowed'
                                )}
                                whileHover={canFormat && !isFormatting ? { x: 4 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                <FaMagic className={cn(
                                    'w-4 h-4',
                                    isFormatting && 'animate-spin'
                                )} />
                                <span className="font-medium">
                                    {isFormatting ? 'Formatting...' : 'Beautify Code'}
                                </span>
                            </motion.button>


                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ToolsDropdown;
